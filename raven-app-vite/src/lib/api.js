function getApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
  return baseUrl.replace(/\/+$/, "");
}

export async function runScan(payload) {
  const apiBaseUrl = getApiBaseUrl();
  let response;

  try {
    response = await fetch(`${apiBaseUrl}/scan`, {
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
    throw new Error(data?.error || `Scan failed with status ${response.status}`);
  }

  return data;
}
