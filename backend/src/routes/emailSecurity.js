import express from 'express';
import { promises as dns } from 'dns';

const router = express.Router();

async function checkSPF(domain) {
  try {
    const records = await dns.resolveTxt(domain);
    const spf = records.flat().find((r) => r.startsWith("v=spf1"));
    return { found: !!spf, record: spf || null };
  } catch {
    return { found: false, record: null };
  }
}

async function checkDMARC(domain) {
  try {
    const records = await dns.resolveTxt(`_dmarc.${domain}`);
    const dmarc = records.flat().find((r) => r.startsWith("v=DMARC1"));
    return { found: !!dmarc, record: dmarc || null };
  } catch {
    return { found: false, record: null };
  }
}

async function checkDKIM(domain) {
  const selectors = ["default", "google", "mail", "smtp", "dkim", "k1"];
  for (const selector of selectors) {
    try {
      const records = await dns.resolveTxt(`${selector}._domainkey.${domain}`);
      const dkim = records.flat().find((r) => r.includes("v=DKIM1"));
      if (dkim) return { found: true, selector, record: dkim };
    } catch {}
  }
  return { found: false, selector: null, record: null };
}

function generateEmailFixSteps(spf, dkim, dmarc) {
  const steps = [];
  if (!spf.found) {
    steps.push({
      priority: 1,
      title: "Add an SPF record",
      description: 'Add a TXT record to your DNS: v=spf1 include:_spf.google.com ~all (adjust for your email provider)',
      effort: "Low",
    });
  }
  if (!dkim.found) {
    steps.push({
      priority: 2,
      title: "Enable DKIM signing",
      description: "Log into your email provider (Google Workspace, Microsoft 365, etc.) and enable DKIM. They will give you a DNS record to add.",
      effort: "Low",
    });
  }
  if (!dmarc.found) {
    steps.push({
      priority: 3,
      title: "Add a DMARC policy",
      description: 'Add a TXT record for _dmarc.yourdomain.com: v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com',
      effort: "Low",
    });
  }
  return steps;
}

// POST /api/email-security/check
router.post("/check", async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: "Domain is required" });

  try {
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    const [spf, dmarc, dkim] = await Promise.all([
      checkSPF(cleanDomain),
      checkDMARC(cleanDomain),
      checkDKIM(cleanDomain),
    ]);

    const issues = [];
    if (!spf.found) issues.push("No SPF record — attackers can send emails pretending to be from your domain.");
    if (!dmarc.found) issues.push("No DMARC record — you have no policy for handling spoofed emails.");
    if (!dkim.found) issues.push("DKIM not detected — emails from your domain may not be verified.");

    res.json({
      domain: cleanDomain,
      spf,
      dkim,
      dmarc,
      issues,
      plainEnglish:
        issues.length === 0
          ? "Your email security is properly configured. Attackers cannot easily spoof your domain."
          : `Your email is not fully protected: ${issues.join(" ")}`,
      fixSteps: generateEmailFixSteps(spf, dkim, dmarc),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
