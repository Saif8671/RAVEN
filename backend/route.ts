import { NextRequest, NextResponse } from "next/server";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
interface ScanInput {
  business_name: string;
  website_url: string;
  email_domain: string;
  owner_email: string;
}

interface SupervityFinding {
  id: string;
  category: string;
  issue: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  plain_english?: string;
  fix_steps?: string[];
  time_estimate?: string;
  detected: boolean;
}

interface SupervityResponse {
  business_name: string;
  website_url: string;
  scan_date: string;
  risk_score: number;
  risk_level: "Critical" | "High" | "Medium" | "Low";
  total_issues: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  findings: SupervityFinding[];
  breach_detected: boolean;
  breach_details: string;
  email_sent: boolean;
  next_scan: string;
  summary_message: string;
}

// ─── ENV VALIDATION ─────────────────────────────────────────────────────────────
function validateEnv() {
  const required = {
    SUPERVITY_WORKFLOW_ID: process.env.SUPERVITY_WORKFLOW_ID,
    SUPERVITY_BEARER_TOKEN: process.env.SUPERVITY_BEARER_TOKEN,
  };

  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  return required as Record<string, string>;
}

// ─── INPUT VALIDATION ───────────────────────────────────────────────────────────
function validateInput(body: unknown): ScanInput {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  const b = body as Record<string, unknown>;

  const required = ["business_name", "website_url", "email_domain", "owner_email"];
  for (const field of required) {
    if (!b[field] || typeof b[field] !== "string" || !(b[field] as string).trim()) {
      throw new Error(`Missing or invalid field: ${field}`);
    }
  }

  // Normalise URL
  let url = (b.website_url as string).trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  url = url.replace(/\/+$/, "");

  // Normalise email domain
  let domain = (b.email_domain as string).trim().replace(/^@/, "").toLowerCase();

  // Basic email validation
  const email = (b.owner_email as string).trim();
  if (!email.includes("@") || !email.includes(".")) {
    throw new Error("Invalid owner_email format");
  }

  // Basic domain validation
  if (!domain.includes(".")) {
    throw new Error("Invalid email_domain format");
  }

  return {
    business_name: (b.business_name as string).trim(),
    website_url: url,
    email_domain: domain,
    owner_email: email,
  };
}

// ─── SUPERVITY CALL ─────────────────────────────────────────────────────────────
async function callSupervityWorkflow(
  input: ScanInput,
  workflowId: string,
  bearerToken: string
): Promise<SupervityResponse> {
  const SUPERVITY_ENDPOINT =
    "https://auto-workflow-api.supervity.ai/api/v1/workflow-runs/execute/stream";

  // Build multipart/form-data
  const formData = new FormData();
  formData.append("workflowId", workflowId);
  formData.append("inputs[business_name]", input.business_name);
  formData.append("inputs[website_url]", input.website_url);
  formData.append("inputs[email_domain]", input.email_domain);
  formData.append("inputs[owner_email]", input.owner_email);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000); // 2 min timeout

  let response: Response;
  try {
    response = await fetch(SUPERVITY_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        Accept: "application/json, text/event-stream",
      },
      body: formData,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Supervity workflow timed out after 2 minutes");
    }
    throw new Error(`Failed to reach Supervity API: ${(err as Error).message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Supervity API returned ${response.status}: ${errorBody || response.statusText}`
    );
  }

  const contentType = response.headers.get("content-type") || "";

  // ── Handle streaming (text/event-stream) ──
  if (contentType.includes("event-stream")) {
    return await parseStreamingResponse(response);
  }

  // ── Handle plain JSON ──
  const raw = await response.text();
  return parseSupervityJSON(raw, input);
}

// ─── STREAM PARSER ──────────────────────────────────────────────────────────────
async function parseStreamingResponse(response: Response): Promise<SupervityResponse> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body from Supervity");

  const decoder = new TextDecoder();
  let buffer = "";
  let lastData = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data:")) {
        lastData = line.slice(5).trim();
      }
    }
  }

  if (!lastData) throw new Error("Supervity stream ended with no data");
  return parseSupervityJSON(lastData, null);
}

// ─── JSON PARSER ────────────────────────────────────────────────────────────────
function parseSupervityJSON(raw: string, input: ScanInput | null): SupervityResponse {
  let parsed: unknown;
  try {
    // Strip SSE wrapper if present: { "output": "..." } or { "result": "..." }
    const outer = JSON.parse(raw);

    if (typeof outer === "object" && outer !== null) {
      const o = outer as Record<string, unknown>;
      // Common Supervity response wrappers
      if (typeof o.output === "string") {
        parsed = JSON.parse(o.output);
      } else if (typeof o.result === "string") {
        parsed = JSON.parse(o.result);
      } else if (typeof o.data === "object") {
        parsed = o.data;
      } else {
        parsed = outer;
      }
    } else {
      parsed = outer;
    }
  } catch {
    throw new Error(`Failed to parse Supervity response as JSON: ${raw.slice(0, 200)}`);
  }

  // Validate essential fields
  const r = parsed as Record<string, unknown>;
  if (typeof r.risk_score !== "number") {
    throw new Error("Supervity response missing required field: risk_score");
  }

  return parsed as SupervityResponse;
}

// ─── ROUTE HANDLER ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── CORS preflight ──
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // ── Validate env ──
  let env: Record<string, string>;
  try {
    env = validateEnv();
  } catch (err) {
    console.error("[RAVEN] ENV ERROR:", (err as Error).message);
    return NextResponse.json(
      { error: "Server misconfiguration. Contact support." },
      { status: 500, headers: corsHeaders }
    );
  }

  // ── Parse body ──
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders }
    );
  }

  // ── Validate input ──
  let input: ScanInput;
  try {
    input = validateInput(body);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 422, headers: corsHeaders }
    );
  }

  // ── Call Supervity ──
  console.log(`[RAVEN] Starting scan for ${input.business_name} (${input.website_url})`);

  let report: SupervityResponse;
  try {
    report = await callSupervityWorkflow(
      input,
      env.SUPERVITY_WORKFLOW_ID,
      env.SUPERVITY_BEARER_TOKEN
    );
  } catch (err) {
    console.error("[RAVEN] SUPERVITY ERROR:", (err as Error).message);
    return NextResponse.json(
      { error: `Scan failed: ${(err as Error).message}` },
      { status: 502, headers: corsHeaders }
    );
  }

  console.log(
    `[RAVEN] Scan complete for ${input.business_name} — Risk Score: ${report.risk_score} (${report.risk_level})`
  );

  return NextResponse.json(report, { status: 200, headers: corsHeaders });
}

// ── OPTIONS (CORS preflight) ──
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
