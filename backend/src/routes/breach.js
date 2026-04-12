import express from 'express';
import axios from 'axios';

const router = express.Router();

async function checkEmailBreaches(email) {
  const apiKey = process.env.HIBP_API_KEY;
  const isMock = process.env.HIBP_MODE === 'mock';

  if (isMock) {
    if (email.includes('pwned') || email.includes('test')) {
      return {
        breached: true,
        breachCount: 2,
        breaches: [
          {
            name: "Adobe",
            domain: "adobe.com",
            breachDate: "2013-10-04",
            dataClasses: ["Email addresses", "Password hints", "Passwords", "Usernames"],
            description: "In October 2013, Adobe was breached...",
          },
          {
            name: "LinkedIn",
            domain: "linkedin.com",
            breachDate: "2012-05-05",
            dataClasses: ["Email addresses", "Passwords"],
            description: "In May 2012, LinkedIn suffered a breach...",
          }
        ],
        note: "Using MOCK data for demonstration.",
      };
    }
    return { breached: false, breachCount: 0, breaches: [], note: "Using MOCK data (no breaches found for this email)." };
  }

  if (!apiKey) {
    return {
      breached: false,
      breachCount: 0,
      breaches: [],
      note: "Configure HIBP_API_KEY for real data or set HIBP_MODE=mock",
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
  const isMock = process.env.HIBP_MODE === 'mock';

  if (isMock) {
    return {
      breached: true,
      breachCount: 1,
      breaches: [
        {
          name: "Sample Breach",
          domain: domain,
          breachDate: "2023-01-01",
          dataClasses: ["Email addresses", "Names"],
          pwnCount: 1234,
        }
      ],
      note: "Using MOCK data for demonstration.",
    };
  }

  if (!apiKey) {
    return {
      breached: false,
      breachCount: 0,
      breaches: [],
      note: "Configure HIBP_API_KEY for real data or set HIBP_MODE=mock",
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

export default router;
