function getApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
  return baseUrl.replace(/\/+$/, '');
}

async function request(path, payload, method = 'POST') {
  const apiBaseUrl = getApiBaseUrl();
  let response;

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (method !== 'GET' && payload) {
      options.body = JSON.stringify(payload);
    }

    response = await fetch(`${apiBaseUrl}${path}`, options);
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
  return request('/scan/full', payload);
}

export async function sendReportEmail(payload) {
  return request('/report/email', payload);
}

export async function fetchReports() {
  return request('/reports', null, 'GET');
}

export async function fetchReport(reportId) {
  return request(`/report/${reportId}`, null, 'GET');
}

export async function runScan(payload) {
  const result = await runFullScan(payload);
  return result.report;
}

export async function fetchPhishingQuiz(payload) {
  return request('/phishing/quiz', payload);
}

export async function checkPassword(payload) {
  return request('/password/check', payload);
}
