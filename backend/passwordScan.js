const https = require("https");

// HaveIBeenPwned API — free tier requires User-Agent header
function hibpRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "haveibeenpwned.com",
      path,
      method: "GET",
      headers: {
        "User-Agent": "SmallBusinessSecurityChecker",
        "hibp-api-key": process.env.HIBP_API_KEY || "", // optional paid key
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 404) return resolve([]); // no breaches
        if (res.statusCode === 401) return reject(new Error("HIBP API key required"));
        if (res.statusCode !== 200) return reject(new Error(`HIBP error: ${res.statusCode}`));
        try { resolve(JSON.parse(data)); } catch { resolve([]); }
      });
    });
    req.on("error", reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error("HIBP timeout")); });
    req.end();
  });
}

async function scanBreach(email) {
  try {
    const encoded = encodeURIComponent(email);
    const breaches = await hibpRequest(`/api/v3/breachedaccount/${encoded}?truncateResponse=false`);
    if (!breaches.length) return { breached: false, count: 0, breaches: [], message: "No breaches found for this email." };

    const summary = breaches.map((b) => ({
      name: b.Name,
      domain: b.Domain,
      date: b.BreachDate,
      dataClasses: b.DataClasses,
      pwnCount: b.PwnCount,
    }));

    return {
      breached: true,
      count: breaches.length,
      breaches: summary,
      message: `Found in ${breaches.length} breach(es). Change passwords for affected services immediately.`,
    };
  } catch (err) {
    // Fallback: domain-level check doesn't require API key
    return { breached: null, count: 0, breaches: [], message: `Breach check unavailable: ${err.message}`, error: true };
  }
}

// Check if entire domain appears in paste dumps (no API key needed)
async function scanDomainBreach(domain) {
  try {
    const pastes = await hibpRequest(`/api/v3/pasteaccount/${encodeURIComponent(domain)}`);
    return { found: pastes.length > 0, count: pastes.length, pastes };
  } catch {
    return { found: false, count: 0, pastes: [] };
  }
}

module.exports = { scanBreach, scanDomainBreach };
