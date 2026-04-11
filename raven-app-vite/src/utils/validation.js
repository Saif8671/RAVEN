const DOMAIN_PATTERN = /^[a-z0-9.-]+\.[a-z]{2,}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeInput(value) {
  return String(value || '').trim().toLowerCase();
}

export function isValidDomain(value) {
  return DOMAIN_PATTERN.test(normalizeInput(value));
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value || '').trim());
}
