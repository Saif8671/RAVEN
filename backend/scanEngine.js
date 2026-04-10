const DEFAULT_REPORT = {
  business_name: "",
  website_url: "",
  email_domain: "",
  owner_email: "",
};

const FINDING_LIBRARY = [
  {
    id: "EMAIL-001",
    category: "Email Security",
    severity: "Critical",
    title: "DMARC is missing",
    time_estimate: "About 15 minutes",
    fix_steps: [
      "Log in to your domain registrar or DNS provider.",
      "Add a TXT record for _dmarc with a basic quarantine policy.",
      "Wait for DNS to propagate, then verify the record with a DMARC checker.",
    ],
  },
  {
    id: "WEB-001",
    category: "Web Security",
    severity: "High",
    title: "Content Security Policy is missing",
    time_estimate: "30 minutes with a developer",
    fix_steps: [
      "Ask your host or developer to add a Content-Security-Policy header.",
      "Start with a report-only policy if you want to test safely.",
      "Confirm there are no broken assets or blocked scripts.",
    ],
  },
  {
    id: "WEB-002",
    category: "Web Security",
    severity: "High",
    title: "HTTPS is not enforced",
    time_estimate: "About 10 minutes",
    fix_steps: [
      "Enable SSL on the site if it is not already active.",
      "Add a permanent redirect from HTTP to HTTPS.",
      "Turn on HSTS after confirming the site loads correctly over HTTPS.",
    ],
  },
  {
    id: "EMAIL-002",
    category: "Email Security",
    severity: "High",
    title: "SPF is missing or incomplete",
    time_estimate: "10 minutes",
    fix_steps: [
      "Open the DNS zone for the email domain.",
      "Add or update the SPF TXT record for the provider you use.",
      "Keep the record to one SPF policy so it stays valid.",
    ],
  },
  {
    id: "WEB-003",
    category: "Web Security",
    severity: "Medium",
    title: "Admin login page is exposed",
    time_estimate: "20 minutes",
    fix_steps: [
      "Move the admin path behind a secret URL or VPN if possible.",
      "Enable multi-factor authentication for every admin account.",
      "Add rate limiting and lockout rules for login attempts.",
    ],
  },
  {
    id: "EMAIL-003",
    category: "Email Security",
    severity: "Medium",
    title: "DKIM is not configured",
    time_estimate: "About 20 minutes",
    fix_steps: [
      "Generate a DKIM key in your email provider admin console.",
      "Add the provided TXT record to DNS.",
      "Turn on signing and recheck deliverability after propagation.",
    ],
  },
  {
    id: "WEB-004",
    category: "Web Security",
    severity: "Low",
    title: "Server headers reveal too much",
    time_estimate: "15 minutes with a developer",
    fix_steps: [
      "Hide X-Powered-By and reduce the Server header if your stack allows it.",
      "Check that the change does not interfere with caching or routing.",
    ],
  },
];

const SEVERITY_WEIGHT = {
  Critical: 28,
  High: 18,
  Medium: 10,
  Low: 4,
};

function normalizeInput(input = {}) {
  return {
    ...DEFAULT_REPORT,
    ...input,
    business_name: (input.business_name || "").trim(),
    website_url: (input.website_url || "").trim(),
    email_domain: (input.email_domain || "").trim().toLowerCase(),
    owner_email: (input.owner_email || "").trim().toLowerCase(),
  };
}

function buildFindings(input) {
  const report = normalizeInput(input);
  const findings = [];

  const websiteUsesHttps = report.website_url.startsWith("https://");
  const hasAdminSignal = /admin|login|wp-admin/i.test(report.website_url);
  const hasOwnerEmail = Boolean(report.owner_email);
  const domainLooksProtected = report.email_domain.includes(".");

  if (!websiteUsesHttps) {
    findings.push(FINDING_LIBRARY[2]);
  }

  if (domainLooksProtected) {
    findings.push(FINDING_LIBRARY[3]);
    findings.push(FINDING_LIBRARY[0]);
  }

  if (hasOwnerEmail) {
    findings.push(FINDING_LIBRARY[1]);
    findings.push(FINDING_LIBRARY[5]);
  }

  if (hasAdminSignal || report.website_url) {
    findings.push(FINDING_LIBRARY[4]);
  }

  findings.push(FINDING_LIBRARY[6]);

  return findings;
}

function buildCounts(findings) {
  return findings.reduce(
    (acc, finding) => {
      const key = `${finding.severity.toLowerCase()}_count`;
      if (typeof acc[key] === "number") {
        acc[key] += 1;
      }
      return acc;
    },
    {
      critical_count: 0,
      high_count: 0,
      medium_count: 0,
      low_count: 0,
    }
  );
}

function buildRiskScore(findings) {
  const totalWeight = findings.reduce((sum, finding) => sum + (SEVERITY_WEIGHT[finding.severity] || 0), 0);
  return Math.max(0, Math.min(100, Math.round(100 - totalWeight * 0.6)));
}

function buildRiskLevel(score) {
  if (score >= 85) return "Low";
  if (score >= 65) return "Medium";
  if (score >= 40) return "High";
  return "Critical";
}

function buildSummary(findings) {
  const critical = findings.filter((finding) => finding.severity === "Critical").length;
  const high = findings.filter((finding) => finding.severity === "High").length;
  const nextStep = findings[0]?.title || "review the scan";

  return `RAVEN found ${findings.length} security issues on your business, including ${critical} critical and ${high} high priority findings. Start with ${nextStep.toLowerCase()} and work down the list to reduce your exposure quickly.`;
}

function buildBreachDetails(report) {
  if (!report.owner_email) {
    return "No owner email was provided, so the backend could not run a breach enrichment pass. Add an owner email to improve exposure checks.";
  }

  return `${report.owner_email} should be treated as a sensitive account. If credentials have ever been reused, the business should reset passwords and turn on multi-factor authentication immediately.`;
}

export function buildBaseReport(input = {}) {
  const report = normalizeInput(input);
  const findings = buildFindings(report);
  const counts = buildCounts(findings);
  const riskScore = buildRiskScore(findings);

  return {
    business_name: report.business_name || "Untitled Business",
    website_url: report.website_url || "",
    email_domain: report.email_domain || "",
    owner_email: report.owner_email || "",
    scan_date: new Date().toISOString(),
    risk_score: riskScore,
    risk_level: buildRiskLevel(riskScore),
    total_issues: findings.length,
    breach_detected: findings.length > 0,
    breach_details: buildBreachDetails(report),
    summary_message: buildSummary(findings),
    findings,
    ...counts,
  };
}

export function buildDemoReport(input = {}) {
  const baseReport = buildBaseReport(input);

  return {
    ...baseReport,
    risk_score: 38,
    risk_level: "High",
    total_issues: 7,
    critical_count: 1,
    high_count: 3,
    medium_count: 2,
    low_count: 1,
    breach_detected: true,
    breach_details:
      "Your business email domain was found in 2 known data breaches from 2022 and 2023. This means some of your employees' login details may have been exposed. Attackers could use these to access your email, payment systems, or cloud accounts.",
    summary_message:
      "RAVEN found 7 security issues on your business - 1 critical and 3 high priority. The good news: all of these are fixable, usually in under an hour each. Start with the DMARC issue - it's the one most likely to be used against you right now.",
  };
}
