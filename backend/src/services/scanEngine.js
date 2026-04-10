import axios from 'axios';
import tls from 'tls';
import { v4 as uuidv4 } from 'uuid';

export const performScan = async (domain) => {
  const scanId = uuidv4();
  const findings = [];
  let score = 100;

  // 1. SSL Check
  try {
    const socket = tls.connect(443, domain, { servername: domain }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      if (!cert || Object.keys(cert).length === 0) {
        findings.push({ type: 'SSL', severity: 'HIGH', message: 'No SSL certificate found.' });
        score -= 25;
      }
    });

    socket.on('error', (e) => {
      findings.push({ type: 'SSL', severity: 'HIGH', message: `SSL Connection failed: ${e.message}` });
      score -= 25;
    });
  } catch (e) {
    findings.push({ type: 'SSL', severity: 'HIGH', message: `SSL Check error: ${e.message}` });
    score -= 25;
  }

  // 2. HTTP Headers Check
  try {
    const response = await axios.get(`https://${domain}`, { timeout: 5000 });
    const headers = response.headers;

    const securityHeaders = [
      { name: 'strict-transport-security', penalty: 10, msg: 'HSTS not enabled.' },
      { name: 'x-frame-options', penalty: 10, msg: 'Clickjacking protection (X-Frame-Options) missing.' },
      { name: 'x-content-type-options', penalty: 5, msg: 'X-Content-Type-Options missing.' },
      { name: 'content-security-policy', penalty: 15, msg: 'CSP (Content Security Policy) not found.' }
    ];

    securityHeaders.forEach(sh => {
      if (!headers[sh.name]) {
        findings.push({ type: 'Header', severity: 'MEDIUM', message: sh.msg });
        score -= sh.penalty;
      }
    });

  } catch (e) {
    findings.push({ type: 'HTTP', severity: 'MEDIUM', message: `Could not analyze headers: ${e.message}` });
    score -= 10;
  }

  return {
    id: scanId,
    domain,
    score: Math.max(score, 0),
    findings,
    timestamp: new Date().toISOString()
  };
};
