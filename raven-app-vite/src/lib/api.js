function getApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api";
  return baseUrl.replace(/\/+$/, "");
}

async function request(path, payload) {
  const apiBaseUrl = getApiBaseUrl();
  let response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(`Unable to reach the scan backend at ${apiBaseUrl}.`);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function runFullScan(payload) {
  return request("/scan/full", payload);
}

export async function sendReportEmail(payload) {
  return request("/report/email", payload);
}

export async function runScan(payload) {
  const result = await runFullScan(payload);
  return result.report;
}
