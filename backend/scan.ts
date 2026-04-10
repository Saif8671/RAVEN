import type { NextApiRequest, NextApiResponse } from "next";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
interface ScanInput {
  business_name: string;
  website_url: string;
  email_domain: string;
  owner_email: string;
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
  findings: Array<{
    id: string;
    category: string;
    severity: string;
    plain_english: string;
    fix_steps: string[];
    time_estimate: string;
  }>;
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
  const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length > 0) throw new Error(`Missing env vars: ${missing.join(", ")}`);
  return required as Record<string, string>;
}

// ─── INPUT VALIDATION ───────────────────────────────────────────────────────────
function validateInput(body: unknown): ScanInput {
  if (!body || typeof body !== "object") throw new Error("Body must be a JSON object");
  const b = body as Record<string, unknown>;
  for (const f of ["business_name", "website_url", "email_domain", "owner_email"]) {
    if (!b[f] || typeof b[f] !== "string" || !(b[f] as string).trim())
      throw new Error(`Missing or invalid field: ${f}`);
  }
  let url = (b.website_url as string).trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
  url = url.replace(/\/+$/, "");

  const domain = (b.email_domain as string).trim().replace(/^@/, "").toLowerCase();
  const email = (b.owner_email as string).trim();
  if (!email.includes("@") || !email.includes(".")) throw new Error("Invalid owner_email");
  if (!domain.includes(".")) throw new Error("Invalid email_domain");

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
  const ENDPOINT =
    "https://auto-workflow-api.supervity.ai/api/v1/workflow-runs/execute/stream";

  const formData = new FormData();
  formData.append("workflowId", workflowId);
  formData.append("inputs[business_name]", input.business_name);
  formData.append("inputs[website_url]", input.website_url);
  formData.append("inputs[email_domain]", input.email_domain);
  formData.append("inputs[owner_email]", input.owner_email);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        Accept: "application/json, text/event-stream",
      },
      body: formData,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError")
      throw new Error("Supervity timed out after 2 minutes");
    throw new Error(`Cannot reach Supervity: ${(err as Error).message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const msg = await response.text().catch(() => "");
    throw new Error(`Supervity ${response.status}: ${msg || response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const raw = contentType.includes("event-stream")
    ? await readStream(response)
    : await response.text();

  return parseJSON(raw);
}

// ─── STREAM READER ──────────────────────────────────────────────────────────────
async function readStream(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");
  const dec = new TextDecoder();
  let buf = "", last = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() || "";
    for (const l of lines) {
      if (l.startsWith("data:")) last = l.slice(5).trim();
    }
  }
  if (!last) throw new Error("Empty stream response from Supervity");
  return last;
}

// ─── JSON PARSER ────────────────────────────────────────────────────────────────
function parseJSON(raw: string): SupervityResponse {
  let parsed: unknown;
  try {
    const outer = JSON.parse(raw);
    if (typeof outer === "object" && outer !== null) {
      const o = outer as Record<string, unknown>;
      if (typeof o.output === "string") parsed = JSON.parse(o.output);
      else if (typeof o.result === "string") parsed = JSON.parse(o.result);
      else if (typeof o.data === "object") parsed = o.data;
      else parsed = outer;
    } else parsed = outer;
  } catch {
    throw new Error(`Cannot parse Supervity response: ${raw.slice(0, 200)}`);
  }
  const r = parsed as Record<string, unknown>;
  if (typeof r.risk_score !== "number")
    throw new Error("Supervity response missing risk_score");
  return parsed as SupervityResponse;
}

// ─── API HANDLER ────────────────────────────────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ── CORS ──
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
  const origin = req.headers.origin || "";
  if (allowedOrigins.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ── Env ──
  let env: Record<string, string>;
  try {
    env = validateEnv();
  } catch (err) {
    console.error("[RAVEN] ENV:", (err as Error).message);
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  // ── Input ──
  let input: ScanInput;
  try {
    input = validateInput(req.body);
  } catch (err) {
    return res.status(422).json({ error: (err as Error).message });
  }

  // ── Scan ──
  console.log(`[RAVEN] Scanning ${input.business_name} (${input.website_url})`);
  let report: SupervityResponse;
  try {
    report = await callSupervityWorkflow(
      input,
      env.SUPERVITY_WORKFLOW_ID,
      env.SUPERVITY_BEARER_TOKEN
    );
  } catch (err) {
    console.error("[RAVEN] SUPERVITY:", (err as Error).message);
    return res.status(502).json({ error: `Scan failed: ${(err as Error).message}` });
  }

  console.log(`[RAVEN] Done — Score: ${report.risk_score} (${report.risk_level})`);
  return res.status(200).json(report);
}

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };
