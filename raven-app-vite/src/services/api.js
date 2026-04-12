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
      headers: { 'Content-Type': 'application/json' },
    };
    if (method !== 'GET' && payload) options.body = JSON.stringify(payload);
    response = await fetch(`${apiBaseUrl}${path}`, options);
  } catch {
    throw new Error(`Unable to reach the backend at ${apiBaseUrl}.`);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || `Request failed with status ${response.status}`);
  return data;
}

// ── Existing ─────────────────────────────────────────────────
export async function checkPassword(payload) {
  return request('/password/check', payload);
}

export async function sendReportEmail(payload) {
  return request('/report/email', payload);
}

// ── Vulnerability Scanner ─────────────────────────────────────
export async function scanVulnerability(domain) {
  return request('/vulnerability/scan', { domain });
}

export async function getScheduledScans() {
  return request('/vulnerability/schedules', null, 'GET');
}

export async function scheduleScan(domain, frequency, notifyEmail) {
  return request('/vulnerability/schedule', { domain, frequency, notifyEmail });
}

export async function deleteScheduledScan(domain) {
  return request(`/vulnerability/schedule/${domain}`, null, 'DELETE');
}

// ── Email Security ────────────────────────────────────────────
export async function checkEmailSecurity(domain) {
  return request('/email-security/check', { domain });
}

// ── Breach Detection ──────────────────────────────────────────
export async function checkBreach({ email, domain }) {
  return request('/breach/check', { email, domain });
}

// ── Phishing Simulation ───────────────────────────────────────
export async function getPhishingTemplates() {
  return request('/phishing/templates', null, 'GET');
}

export async function getPhishingCampaigns() {
  return request('/phishing/campaigns', null, 'GET');
}

export async function createPhishingCampaign({ templateId, targetEmails, companyName }) {
  return request('/phishing/campaign', { templateId, targetEmails, companyName });
}

export async function getCampaignResults(campaignId) {
  return request(`/phishing/campaign/${campaignId}`, null, 'GET');
}

// ── Incident Response ─────────────────────────────────────────
export async function getIncidentTypes() {
  return request('/incident/types', null, 'GET');
}

export async function getIncidentPlaybook(type) {
  return request(`/incident/playbook/${type}`, null, 'GET');
}

export async function diagnoseIncident(symptoms) {
  return request('/incident/diagnose', { symptoms });
}

export async function chatWithAI(message, history) {
  return request('/incident/chat', { message, history });
}

// ── Report Generator ──────────────────────────────────────────
export async function generateReport(reportData) {
  return request('/report/generate', { reportData });
}

export async function emailReport(to, reportData) {
  return request('/report/email', { to, reportData });
}

// ── Policy Generator ──────────────────────────────────────────
export async function getPolicies() {
  return request('/policy', null, 'GET');
}

export async function getPolicy(id) {
  return request(`/policy/${id}`, null, 'GET');
}
