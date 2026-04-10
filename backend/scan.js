const express = require("express");
const { scanVulnerability } = require("./vulnScanner");
const { scanEmail } = require("./emailScan");
const { scanBreach } = require("./passwordScan");
const { calculateScore } = require("./scorer");
const { getAIFixGuide, buildFallbackGuide } = require("./aiFixGuide");

const router = express.Router();
const reports = new Map();

function normalizeDomain(domain) {
  return String(domain || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

function createReportId(domain) {
  return `${domain}-${Date.now()}`;
}

function buildBusinessSummary(domain, score, band, findings) {
  if (!findings.length) {
    return `We did not find any major issues for ${domain}. The site is in good shape right now, but security should still be checked regularly.`;
  }

  const criticalOrHigh = findings.filter((finding) => finding.severity === "CRITICAL" || finding.severity === "HIGH").length;
  return `We found ${findings.length} issue(s) for ${domain}. ${criticalOrHigh} of them are high-priority and should be fixed first. The current score is ${score}/100 (${band}).`;
}

function buildAttackNarrative(domain, findings, aiGuide) {
  if (aiGuide?.attackStory) return aiGuide.attackStory;
  if (!findings.length) {
    return `A determined attacker would have to look harder for weak points on ${domain}, which is a good sign.`;
  }
  return `An attacker would likely start with the easiest public weakness on ${domain}, such as email spoofing, exposed services, or missing security headers, and then chain the weaker signals together.`;
}

function buildSupervityAnalysis({ domain, score, band, findings, vulnerability, emailSecurity, breach, aiGuide }) {
  return {
    domain,
    score,
    band,
    assetMapper: {
      businessProfile: {
        domain,
        scanDepth: "public surface",
      },
      detectedServices: {
        ssl: !!vulnerability?.ssl,
        emailSecurity: !!emailSecurity,
        breachSignals: breach?.breached ?? null,
      },
      attackSurface: {
        exposedPaths: vulnerability?.exposedPaths || [],
        openPorts: vulnerability?.openPorts || [],
      },
    },
    vulnerabilityScorer: {
      scoredFindings: findings.map((finding) => ({
        id: finding.id,
        severity: finding.severity,
        priority: finding.priority,
        plainEnglish: finding.plainEnglish,
      })),
      topThreats: findings.slice(0, 3),
      overallRisk: band,
    },
    attackNarrator: {
      attackStory: buildAttackNarrative(domain, findings, aiGuide),
      worstCaseScenario:
        findings.some((finding) => finding.severity === "CRITICAL")
          ? "A public weakness could be chained into account takeover, phishing success, or unauthorized access."
          : "The business remains exposed to opportunistic phishing or service probing if fixes are delayed.",
      probabilityOfAttack: findings.length ? "elevated" : "low",
    },
    fixAdvisor: {
      fixes: aiGuide?.fixes || findings,
      quickWins: aiGuide?.quickWins || [],
    },
    reportBuilder: {
      summary: buildBusinessSummary(domain, score, band, findings),
      findings,
      incidentPlaybook: aiGuide?.incidentPlaybook || buildFallbackGuide(findings, domain).incidentPlaybook,
    },
  };
}

// POST /api/scan/vulnerability
router.post("/vulnerability", async (req, res) => {
  try {
    const domain = normalizeDomain(req.body.domain);
    if (!domain) return res.status(400).json({ error: "Domain is required" });
    const result = await scanVulnerability(domain);
    res.json({ status: "ok", domain, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scan/email
router.post("/email", async (req, res) => {
  try {
    const domain = normalizeDomain(req.body.domain);
    if (!domain) return res.status(400).json({ error: "Domain is required" });
    const result = await scanEmail(domain);
    res.json({ status: "ok", domain, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scan/breach
router.post("/breach", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "Email is required" });
    const result = await scanBreach(email);
    res.json({ status: "ok", email, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scan/full
router.post("/full", async (req, res) => {
  try {
    const domain = normalizeDomain(req.body.domain || req.body.website_url || req.body.email_domain);
    const email = String(req.body.email || req.body.owner_email || "").trim().toLowerCase();

    if (!domain || !email) {
      return res.status(400).json({ error: "Domain and email are required" });
    }

    const [vulnerability, emailSecurity, breach] = await Promise.all([
      scanVulnerability(domain),
      scanEmail(domain),
      scanBreach(email),
    ]);

    const scoreBundle = calculateScore({ vulnerability, email: emailSecurity, breach });
    const aiGuide = await getAIFixGuide(scoreBundle.findings, domain);

    const reportId = createReportId(domain);
    const report = {
      id: reportId,
      domain,
      email,
      business_name: req.body.business_name || domain,
      website_url: req.body.website_url || `https://${domain}`,
      scannedAt: new Date().toISOString(),
      score: scoreBundle.score,
      band: scoreBundle.band,
      deductions: scoreBundle.deductions,
      totalIssues: scoreBundle.totalIssues,
      findings: scoreBundle.findings,
      counts: scoreBundle.counts,
      scanResults: { vulnerability, email: emailSecurity, breach },
      aiGuide,
      attackStory: buildAttackNarrative(domain, scoreBundle.findings, aiGuide),
      summary_message: buildBusinessSummary(domain, scoreBundle.score, scoreBundle.band, scoreBundle.findings),
    };

    reports.set(reportId, report);

    res.json({
      status: "ok",
      report,
      supervity: buildSupervityAnalysis({
        domain,
        score: scoreBundle.score,
        band: scoreBundle.band,
        findings: scoreBundle.findings,
        vulnerability,
        emailSecurity,
        breach,
        aiGuide,
      }),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/supervity/analyze
router.post("/supervity/analyze", async (req, res) => {
  try {
    const domain = normalizeDomain(req.body.domain);
    const findings = Array.isArray(req.body.findings) ? req.body.findings : [];
    const score = Number(req.body.score) || 0;
    const band = req.body.band || "UNKNOWN";

    if (!domain) return res.status(400).json({ error: "Domain is required" });

    const aiGuide = req.body.aiGuide || buildFallbackGuide(findings, domain);
    const payload = buildSupervityAnalysis({
      domain,
      score,
      band,
      findings,
      vulnerability: req.body.vulnerability,
      emailSecurity: req.body.emailSecurity,
      breach: req.body.breach,
      aiGuide,
    });

    res.json({ status: "ok", analysis: payload });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/report/email
router.post("/report/email", async (req, res) => {
  try {
    const reportId = String(req.body.reportId || "").trim();
    const recipientEmail = String(req.body.recipientEmail || "").trim().toLowerCase();

    if (!reportId || !recipientEmail) {
      return res.status(400).json({ error: "Report ID and recipient email are required" });
    }

    const report = reports.get(reportId);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({
      status: "ok",
      delivery: "simulated",
      message: `Report sent to ${recipientEmail}.`,
      reportId,
      recipientEmail,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/report/:id
router.get("/report/:id", (req, res) => {
  const report = reports.get(req.params.id);
  if (!report) return res.status(404).json({ error: "Report not found" });
  res.json({ status: "ok", report });
});

module.exports = router;
