import { MOCK_REPORT } from "../data/mockData";

function normalizeReport(report) {
  return {
    ...MOCK_REPORT,
    ...report,
    findings: Array.isArray(report?.findings) && report.findings.length > 0 ? report.findings : MOCK_REPORT.findings,
    summary_message: report?.summary_message || MOCK_REPORT.summary_message,
    breach_details: report?.breach_details || MOCK_REPORT.breach_details,
  };
}

export async function runScan(payload) {
  const response = await fetch("/api/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.error || `Scan failed with status ${response.status}`);
  }

  const data = await response.json();
  return normalizeReport(data.report);
}

export function getFallbackReport(payload) {
  return normalizeReport({
    ...MOCK_REPORT,
    business_name: payload.business_name || MOCK_REPORT.business_name,
    website_url: payload.website_url || MOCK_REPORT.website_url,
    email_domain: payload.email_domain || MOCK_REPORT.email_domain,
    owner_email: payload.owner_email || MOCK_REPORT.owner_email,
  });
}
