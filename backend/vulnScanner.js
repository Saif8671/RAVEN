const https = require("https");
const http = require("http");
const tls = require("tls");
const net = require("net");

const COMMON_PORTS = [21, 22, 23, 80, 443, 3306, 5432, 6379, 8080, 8443, 27017];
const EXPOSED_PATHS = ["/.env", "/admin", "/wp-admin", "/backup", "/config", "/.git/config", "/phpinfo.php", "/server-status"];
const RISKY_HEADERS = ["x-powered-by", "server", "x-aspnet-version", "x-aspnetmvc-version"];

// Check SSL certificate
async function checkSSL(domain) {
  return new Promise((resolve) => {
    const options = { host: domain, port: 443, servername: domain, rejectUnauthorized: false };
    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate();
      socket.destroy();
      if (!cert || !cert.valid_to) return resolve({ valid: false, error: "No cert found" });
      const expiry = new Date(cert.valid_to);
      const daysLeft = Math.floor((expiry - Date.now()) / (1000 * 60 * 60 * 24));
      resolve({
        valid: socket.authorized,
        expiry: cert.valid_to,
        daysLeft,
        issuer: cert.issuer?.O || "Unknown",
        expired: daysLeft < 0,
        expiringSoon: daysLeft < 30,
      });
    });
    socket.on("error", (e) => resolve({ valid: false, error: e.message }));
    socket.setTimeout(5000, () => { socket.destroy(); resolve({ valid: false, error: "Timeout" }); });
  });
}

// Check response headers for info leakage
async function checkHeaders(domain) {
  return new Promise((resolve) => {
    const req = https.request({ host: domain, path: "/", method: "GET", rejectUnauthorized: false }, (res) => {
      const found = {};
      RISKY_HEADERS.forEach((h) => { if (res.headers[h]) found[h] = res.headers[h]; });
      const securityHeaders = {
        "strict-transport-security": !!res.headers["strict-transport-security"],
        "x-frame-options": !!res.headers["x-frame-options"],
        "x-content-type-options": !!res.headers["x-content-type-options"],
        "content-security-policy": !!res.headers["content-security-policy"],
      };
      resolve({ leakedHeaders: found, securityHeaders });
    });
    req.on("error", () => resolve({ leakedHeaders: {}, securityHeaders: {}, error: "Could not connect" }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ leakedHeaders: {}, securityHeaders: {}, error: "Timeout" }); });
    req.end();
  });
}

// Check if exposed sensitive paths are accessible
async function checkExposedPaths(domain) {
  const results = [];
  for (const path of EXPOSED_PATHS) {
    await new Promise((resolve) => {
      const req = https.request({ host: domain, path, method: "GET", rejectUnauthorized: false }, (res) => {
        if (res.statusCode === 200) results.push({ path, status: res.statusCode, risk: "HIGH" });
        resolve();
      });
      req.on("error", () => resolve());
      req.setTimeout(4000, () => { req.destroy(); resolve(); });
      req.end();
    });
  }
  return results;
}

// Port scan (top common ports)
async function checkPorts(domain) {
  const open = [];
  await Promise.all(
    COMMON_PORTS.map((port) =>
      new Promise((resolve) => {
        const sock = new net.Socket();
        sock.setTimeout(2000);
        sock.connect(port, domain, () => { open.push(port); sock.destroy(); resolve(); });
        sock.on("error", () => resolve());
        sock.on("timeout", () => { sock.destroy(); resolve(); });
      })
    )
  );
  return open;
}

async function scanVulnerability(domain) {
  const [ssl, headers, exposedPaths, openPorts] = await Promise.all([
    checkSSL(domain),
    checkHeaders(domain),
    checkExposedPaths(domain),
    checkPorts(domain),
  ]);
  return { ssl, headers, exposedPaths, openPorts };
}

module.exports = { scanVulnerability };
