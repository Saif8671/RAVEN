import { loadBackendEnv } from "./env.js";

loadBackendEnv();

const SUPERVITY_EXECUTE_URL =
  process.env.SUPERVITY_API_URL || "https://auto-workflow-api.supervity.ai/api/v1/workflow-runs/execute/stream";

const SUPERVITY_WORKFLOW_ID = process.env.SUPERVITY_WORKFLOW_ID || "019d7346-f98a-7000-a581-69800c48e7a1";

function hasSupervityConfig() {
  return Boolean(process.env.SUPERVITY_AUTHORIZATION || process.env.SUPERVITY_API_KEY);
}

function buildAuthorizationHeader() {
  const token = process.env.SUPERVITY_AUTHORIZATION || process.env.SUPERVITY_API_KEY;
  return token ? `Bearer ${token.replace(/^Bearer\s+/i, "")}` : "";
}

function buildPayload(report) {
  const formData = new FormData();
  formData.append("workflowId", SUPERVITY_WORKFLOW_ID);
  formData.append("inputs[business_name]", report.business_name || "");
  formData.append("inputs[website_url]", report.website_url || "");
  formData.append("inputs[email_domain]", report.email_domain || "");
  formData.append("inputs[owner_email]", report.owner_email || "");
  return formData;
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractLatestObject(text) {
  const matches = text.match(/\{[\s\S]*\}/g);
  if (!matches || matches.length === 0) {
    return null;
  }

  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const parsed = tryParseJson(matches[i]);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

async function readStreamResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();

  if (contentType.includes("application/json")) {
    return tryParseJson(rawText) || {};
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const dataLines = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.replace(/^data:\s?/, ""))
    .filter(Boolean);

  for (let i = dataLines.length - 1; i >= 0; i -= 1) {
    const parsed = tryParseJson(dataLines[i]);
    if (parsed) {
      return parsed;
    }
  }

  const parsedRaw = tryParseJson(rawText);
  if (parsedRaw) {
    return parsedRaw;
  }

  const extracted = extractLatestObject(rawText);
  return extracted || { raw: rawText };
}

function normalizeSupervityPayload(payload, fallbackReport) {
  const candidate = payload?.report && typeof payload.report === "object" ? payload.report : payload;

  return {
    ...fallbackReport,
    summary_message: candidate?.summary_message || fallbackReport.summary_message,
    breach_details: candidate?.breach_details || fallbackReport.breach_details,
    findings: Array.isArray(candidate?.findings) && candidate.findings.length > 0 ? candidate.findings : fallbackReport.findings,
    risk_score: typeof candidate?.risk_score === "number" ? candidate.risk_score : fallbackReport.risk_score,
    risk_level: candidate?.risk_level || fallbackReport.risk_level,
    total_issues: typeof candidate?.total_issues === "number" ? candidate.total_issues : fallbackReport.total_issues,
    critical_count: typeof candidate?.critical_count === "number" ? candidate.critical_count : fallbackReport.critical_count,
    high_count: typeof candidate?.high_count === "number" ? candidate.high_count : fallbackReport.high_count,
    medium_count: typeof candidate?.medium_count === "number" ? candidate.medium_count : fallbackReport.medium_count,
    low_count: typeof candidate?.low_count === "number" ? candidate.low_count : fallbackReport.low_count,
  };
}

export async function enrichWithSupervity(report) {
  if (!hasSupervityConfig()) {
    return { report, source: "local" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(SUPERVITY_EXECUTE_URL, {
      method: "POST",
      headers: {
        Authorization: buildAuthorizationHeader(),
        "x-source": "v1",
      },
      body: buildPayload(report),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Supervity request failed with status ${response.status}`);
    }

    const payload = await readStreamResponse(response);

    return {
      report: normalizeSupervityPayload(payload, report),
      source: "supervity",
    };
  } catch (error) {
    return { report, source: "local", error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}
