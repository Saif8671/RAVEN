const express = require("express");
const router = express.Router();
const axios = require("axios");

// POST /api/breach/check
router.post("/check", async (req, res) => {
  const { email, domain } = req.body;
  if (!email && !domain) return res.status(400).json({ error: "Email or domain required" });

  try {
    const results = [];

    if (email) {
      const breaches = await checkEmailBreaches(email);
      results.push({ type: "email", target: email, ...breaches });
    }

    if (domain) {
      const domainBreaches = await checkDomainBreaches(domain);
      results.push({ type: "domain", target: domain, ...domainBreaches });
    }

    res.json({
      checkedAt: new Date().toISOString(),
      results,
      summary: generateBreachSummary(results),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function checkEmailBreaches(email) {
  const apiKey = process.env.HIBP_API_KEY;

  if (!apiKey) {
    // Mock data for demo/hackathon without API key
    return {
      breached: false,
      breachCount: 0,
      breaches: [],
      note: "Configure HIBP_API_KEY in .env for real breach data",
    };
  }

  try {
    const res = await axios.get(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
      {
        headers: {
          "hibp-api-key": apiKey,
          "User-Agent": "CyberShield-App",
        },
        validateStatus: (s) => s < 500,
      }
    );

    if (res.status === 404) return { breached: false, breachCount: 0, breaches: [] };

    const breaches = res.data.map((b) => ({
      name: b.Name,
      domain: b.Domain,
      breachDate: b.BreachDate,
      dataClasses: b.DataClasses,
      description: b.Description,
    }));

    return { breached: true, breachCount: breaches.length, breaches };
  } catch (err) {
    return { breached: null, error: "Could not check breaches", breaches: [] };
  }
}

async function checkDomainBreaches(domain) {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) {
    return {
      breached: false,
      breachCount: 0,
      breaches: [],
      note: "Configure HIBP_API_KEY for real data",
    };
  }

  try {
    const res = await axios.get(
      `https://haveibeenpwned.com/api/v3/breaches?domain=${encodeURIComponent(domain)}`,
      {
        headers: { "hibp-api-key": apiKey, "User-Agent": "CyberShield-App" },
        validateStatus: (s) => s < 500,
      }
    );

    const breaches = (res.data || []).map((b) => ({
      name: b.Name,
      domain: b.Domain,
      breachDate: b.BreachDate,
      dataClasses: b.DataClasses,
      pwnCount: b.PwnCount,
    }));

    return { breached: breaches.length > 0, breachCount: breaches.length, breaches };
  } catch {
    return { breached: null, error: "Could not check domain breaches", breaches: [] };
  }
}

function generateBreachSummary(results) {
  const totalBreaches = results.reduce((sum, r) => sum + (r.breachCount || 0), 0);
  if (totalBreaches === 0) return "No breaches found. Keep monitoring regularly.";
  return `Found ${totalBreaches} breach(es). Change your passwords immediately and enable two-factor authentication on all accounts.`;
}

module.exports = router;
