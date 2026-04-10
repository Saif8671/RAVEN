const http = require("node:http");

const PORT = Number(process.env.PORT || 8788);
const SUPERVITY_ENDPOINT =
  process.env.SUPERVITY_API_URL ||
  "https://auto-workflow-api.supervity.ai/api/v1/workflow-runs/execute/stream";

function json(res, statusCode, body, extraHeaders = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders,
  });
  res.end(JSON.stringify(body));
}

function getAllowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function corsHeaders(origin) {
  const allowedOrigins = getAllowedOrigins();
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "*";

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function validateEnv() {
  const required = {
    SUPERVITY_WORKFLOW_ID: process.env.SUPERVITY_WORKFLOW_ID,
    SUPERVITY_BEARER_TOKEN: process.env.SUPERVITY_BEARER_TOKEN,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  return required;
}

function validateInput(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  const input = body;
  const requiredFields = ["business_name", "website_url", "email_domain", "owner_email"];

  for (const field of requiredFields) {
    if (typeof input[field] !== "string" || !input[field].trim()) {
      throw new Error(`Missing or invalid field: ${field}`);
    }
  }

  let websiteUrl = input.website_url.trim();
  if (!websiteUrl.startsWith("http://") && !websiteUrl.startsWith("https://")) {
    websiteUrl = `https://${websiteUrl}`;
  }
  websiteUrl = websiteUrl.replace(/\/+$/, "");

  const emailDomain = input.email_domain.trim().replace(/^@/, "").toLowerCase();
  const ownerEmail = input.owner_email.trim();

  if (!ownerEmail.includes("@") || !ownerEmail.includes(".")) {
    throw new Error("Invalid owner_email format");
  }

  if (!emailDomain.includes(".")) {
    throw new Error("Invalid email_domain format");
  }

  return {
    business_name: input.business_name.trim(),
    website_url: websiteUrl,
    email_domain: emailDomain,
    owner_email: ownerEmail,
  };
}

function createMockReport(input) {
  const findings = [
    {
      id: "EMAIL-001",
      category: "Email Security",
      severity: "Critical",
      plain_english:
        "Anyone on the internet can send emails pretending to be you. There is no seal on your email address, so phishing attacks can look exactly like they came from you.",
      fix_steps: [
        "Log in to your domain registrar",
        "Open DNS settings for your domain",
        "Add a TXT record for _dmarc with a DMARC policy",
        "Wait for DNS propagation",
        "Verify the record with a DNS checker",
      ],
      time_estimate: "About 15 minutes",
      detected: true,
    },
    {
      id: "WEB-001",
      category: "Web Security",
      severity: "High",
      plain_english:
        "Your website is missing a security header that helps stop injected scripts from running on your pages.",
      fix_steps: [
        "Ask your developer or host to add a Content-Security-Policy header",
        "Test the fix with a security header scanner",
      ],
      time_estimate: "30 minutes with a developer",
      detected: true,
    },
    {
      id: "WEB-002",
      category: "Web Security",
      severity: "High",
      plain_english:
        "Your website does not strictly enforce HTTPS connections, which can expose visitors on unsafe networks.",
      fix_steps: [
        "Enable force HTTPS in your hosting control panel",
        "If you use a CDN, turn on the HTTPS redirect setting there too",
      ],
      time_estimate: "About 10 minutes",
      detected: true,
    },
    {
      id: "EMAIL-002",
      category: "Email Security",
      severity: "High",
      plain_english:
        "Your email domain is missing an SPF record, which makes impersonation easier for attackers.",
      fix_steps: [
        "Open DNS settings at your registrar",
        "Add the correct SPF TXT record for your mail provider",
      ],
      time_estimate: "10 minutes",
      detected: true,
    },
    {
      id: "WEB-003",
      category: "Web Security",
      severity: "Medium",
      plain_english:
        "Your admin login page appears to be publicly reachable, which gives attackers a direct target for password attacks.",
      fix_steps: [
        "Restrict access to the admin path",
        "Enable two-factor authentication on the admin account",
      ],
      time_estimate: "20 minutes",
      detected: true,
    },
    {
      id: "EMAIL-003",
      category: "Email Security",
      severity: "Medium",
      plain_english:
        "Your email is missing DKIM signing, which weakens trust in messages that come from your domain.",
      fix_steps: [
        "Open DKIM settings in your email provider",
        "Publish the provided DNS record",
      ],
      time_estimate: "About 20 minutes",
      detected: true,
    },
    {
      id: "WEB-004",
      category: "Web Security",
      severity: "Low",
      plain_english:
        "Your site could hide a bit more of its internal stack, which reduces useful clues for attackers.",
      fix_steps: [
        "Reduce unnecessary server headers",
        "Confirm the response headers with a browser dev tool or scanner",
      ],
      time_estimate: "15 minutes with a developer",
      detected: true,
    },
  ];

  return {
    business_name: input.business_name,
    website_url: input.website_url,
    scan_date: new Date().toISOString(),
    risk_score: 38,
    risk_level: "High",
    total_issues: findings.length,
    critical_count: 1,
    high_count: 3,
    medium_count: 2,
    low_count: 1,
    findings,
    breach_detected: true,
    breach_details:
      `A breach-style exposure check flagged ${input.email_domain} in simulated breach data. This is a local fallback report until the Supervity credentials are configured.`,
    email_sent: false,
    next_scan: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    summary_message:
      "RAVEN found several security issues on your business. This local fallback report is useful for development, and the live backend will replace it when Supervity credentials are available.",
  };
}

async function readStream(response) {
  const reader = response.body && response.body.getReader ? response.body.getReader() : null;
  if (!reader) {
    throw new Error("No response body from Supervity");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let lastData = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data:")) {
        lastData = line.slice(5).trim();
      }
    }
  }

  if (!lastData) {
    throw new Error("Supervity stream ended with no data");
  }

  return lastData;
}

function parseSupervityJSON(raw) {
  let parsed;

  console.log("[RAVEN DEBUG] Raw response:", raw.slice(0, 5000));
  try {
    const outer = JSON.parse(raw);
    if (outer && typeof outer === "object") {
      if (typeof outer.output === "string") {
        parsed = JSON.parse(outer.output);
      } else if (typeof outer.result === "string") {
        parsed = JSON.parse(outer.result);
      } else if (outer.data && typeof outer.data === "object") {
        parsed = outer.data;
      } else {
        parsed = outer;
      }
    } else {
      parsed = outer;
    }
  } catch {
    throw new Error(`Failed to parse Supervity response as JSON: ${raw.slice(0, 200)}`);
  }

  if (!parsed || typeof parsed !== "object" || typeof parsed.risk_score !== "number") {
    throw new Error("Supervity response missing required field: risk_score");
  }

  return parsed;
}

async function callSupervityWorkflow(input, workflowId, bearerToken) {
  const formData = new FormData();
  formData.append("workflowId", workflowId);
  formData.append("inputs[business_name]", input.business_name);
  formData.append("inputs[website_url]", input.website_url);
  formData.append("inputs[email_domain]", input.email_domain);
  formData.append("inputs[owner_email]", input.owner_email);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  let response;
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
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Supervity workflow timed out after 2 minutes");
    }
    throw new Error(`Failed to reach Supervity API: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Supervity API returned ${response.status}: ${errorBody || response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("event-stream")) {
    return parseSupervityJSON(await readStream(response));
  }

  return parseSupervityJSON(await response.text());
}

async function collectRequestBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : null;
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";
  const headers = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (req.url !== "/api/scan") {
    json(res, 404, { error: "Not found" }, headers);
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" }, headers);
    return;
  }

  let env;
  try {
    env = validateEnv();
  } catch (error) {
    console.warn("[RAVEN] ENV:", error.message);
  }

  let body;
  try {
    body = await collectRequestBody(req);
  } catch {
    json(res, 400, { error: "Invalid JSON body" }, headers);
    return;
  }

  let input;
  try {
    input = validateInput(body);
  } catch (error) {
    json(res, 422, { error: error.message }, headers);
    return;
  }

  if (!env) {
    console.log("[RAVEN] Running in local fallback mode");
    json(res, 200, createMockReport(input), headers);
    return;
  }

  console.log(`[RAVEN] Starting scan for ${input.business_name} (${input.website_url})`);

  try {
    const report = await callSupervityWorkflow(
      input,
      env.SUPERVITY_WORKFLOW_ID,
      env.SUPERVITY_BEARER_TOKEN
    );

    console.log(
      `[RAVEN] Scan complete for ${input.business_name} - Risk Score: ${report.risk_score} (${report.risk_level})`
    );
    json(res, 200, report, headers);
  } catch (error) {
    console.error("[RAVEN] SUPERVITY ERROR:", error.message);
    json(res, 502, { error: `Scan failed: ${error.message}` }, headers);
  }
});

server.on("error", (error) => {
  if (error && typeof error === "object" && error.code === "EADDRINUSE") {
    console.error(
      `[RAVEN] Port ${PORT} is already in use. Another backend instance is probably already running.`
    );
    console.error(`[RAVEN] Stop the existing process or start this server with a different PORT.`);
    process.exit(1);
    return;
  }

  throw error;
});

server.listen(PORT, () => {
  console.log(`[RAVEN] Backend listening on http://127.0.0.1:${PORT}`);
});
