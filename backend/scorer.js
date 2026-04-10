const SEVERITY_ORDER = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const WEIGHTS = {
  ssl_invalid: 20,
  ssl_expired: 20,
  ssl_expiring_soon: 8,
  header_leaked: 5,
  missing_hsts: 10,
  missing_xframe: 5,
  missing_xcto: 5,
  missing_csp: 8,
  spf_missing: 15,
  spf_weak: 8,
  dmarc_missing: 15,
  dmarc_weak: 8,
  dkim_missing: 5,
  breached: 20,
  exposed_path: 10,
  risky_port_open: 5,
};

const RISKY_PORTS = [21, 22, 23, 3306, 5432, 6379, 27017];

function pushFinding(findings, finding) {
  findings.push({
    id: finding.type,
    type: finding.type,
    severity: finding.severity,
    category: finding.category,
    plainEnglish: finding.message,
    steps: finding.steps || [],
    codeSnippet: finding.codeSnippet || null,
    estimatedTime: finding.estimatedTime || "5 minutes",
    priority: finding.priority || finding.severity,
  });
}

function calculateScore(scanResults) {
  let deductions = 0;
  const findings = [];

  const vulnerability = scanResults.vulnerability || {};
  const email = scanResults.email || {};
  const breach = scanResults.breach || {};

  const { ssl, headers, exposedPaths = [], openPorts = [] } = vulnerability;
  const { spf, dmarc, dkim } = email;
  const { breached, count: breachCount = 0 } = breach;

  if (ssl) {
    if (!ssl.valid || ssl.error) {
      deductions += WEIGHTS.ssl_invalid;
      pushFinding(findings, {
        type: "ssl_invalid",
        severity: "CRITICAL",
        category: "vulnerability",
        message: "SSL certificate is invalid or missing. Visitors may be exposed to interception.",
        steps: ["Install a valid TLS certificate", "Force HTTPS redirects", "Test the certificate chain after renewal"],
        codeSnippet: "server {\n  return 301 https://$host$request_uri;\n}",
        estimatedTime: "15 minutes",
      });
    } else if (ssl.expired) {
      deductions += WEIGHTS.ssl_expired;
      pushFinding(findings, {
        type: "ssl_expired",
        severity: "CRITICAL",
        category: "vulnerability",
        message: "SSL certificate has expired. Browsers will warn users and trust will drop immediately.",
        steps: ["Renew the certificate right away", "Confirm the new certificate is deployed on every host", "Recheck the site in a private browser window"],
        estimatedTime: "10 minutes",
      });
    } else if (ssl.expiringSoon) {
      deductions += WEIGHTS.ssl_expiring_soon;
      pushFinding(findings, {
        type: "ssl_expiring_soon",
        severity: "HIGH",
        category: "vulnerability",
        message: `SSL expires in ${ssl.daysLeft} days. Renew now to avoid outages.`,
        steps: ["Schedule renewal before the expiry date", "Enable auto-renew if your provider supports it"],
        estimatedTime: "10 minutes",
      });
    }
  }

  if (headers) {
    const leaked = Object.keys(headers.leakedHeaders || {});
    if (leaked.length) {
      const leakDeduction = Math.min(leaked.length * WEIGHTS.header_leaked, 15);
      deductions += leakDeduction;
      pushFinding(findings, {
        type: "header_leaked",
        severity: "MEDIUM",
        category: "vulnerability",
        message: `Server leaks information through response headers: ${leaked.join(", ")}.`,
        steps: ["Remove unnecessary server disclosure headers", "Verify the response with curl or browser dev tools"],
        estimatedTime: "10 minutes",
      });
    }

    const securityHeaders = headers.securityHeaders || {};
    if (!securityHeaders["strict-transport-security"]) {
      deductions += WEIGHTS.missing_hsts;
      pushFinding(findings, {
        type: "missing_hsts",
        severity: "HIGH",
        category: "vulnerability",
        message: "Missing HSTS header. Attackers can try to downgrade traffic to insecure HTTP.",
        steps: ["Add Strict-Transport-Security", "Use a long max-age", "Include subdomains only after testing"],
        codeSnippet: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
        estimatedTime: "10 minutes",
      });
    }
    if (!securityHeaders["x-frame-options"]) {
      deductions += WEIGHTS.missing_xframe;
      pushFinding(findings, {
        type: "missing_xframe",
        severity: "MEDIUM",
        category: "vulnerability",
        message: "Missing X-Frame-Options. Your site may be vulnerable to clickjacking.",
        steps: ["Set X-Frame-Options to DENY or SAMEORIGIN", "Test critical pages after the change"],
        codeSnippet: "X-Frame-Options: SAMEORIGIN",
        estimatedTime: "5 minutes",
      });
    }
    if (!securityHeaders["x-content-type-options"]) {
      deductions += WEIGHTS.missing_xcto;
      pushFinding(findings, {
        type: "missing_xcto",
        severity: "MEDIUM",
        category: "vulnerability",
        message: "Missing X-Content-Type-Options. Browsers may sniff content types incorrectly.",
        steps: ["Add X-Content-Type-Options: nosniff", "Retest file downloads and static assets"],
        codeSnippet: "X-Content-Type-Options: nosniff",
        estimatedTime: "5 minutes",
      });
    }
    if (!securityHeaders["content-security-policy"]) {
      deductions += WEIGHTS.missing_csp;
      pushFinding(findings, {
        type: "missing_csp",
        severity: "HIGH",
        category: "vulnerability",
        message: "Missing Content-Security-Policy. This makes cross-site scripting easier.",
        steps: ["Start with a report-only policy", "Tighten sources for scripts, styles, and frames", "Roll out enforcement after validation"],
        codeSnippet: "Content-Security-Policy: default-src 'self'; object-src 'none'; frame-ancestors 'none'",
        estimatedTime: "20 minutes",
      });
    }
  }

  if (spf) {
    if (!spf.exists) {
      deductions += WEIGHTS.spf_missing;
      pushFinding(findings, {
        type: "spf_missing",
        severity: "CRITICAL",
        category: "email",
        message: spf.message,
        steps: ["Publish an SPF record for your mail provider", "Start with a conservative policy", "Recheck after DNS propagation"],
        estimatedTime: "15 minutes",
      });
    } else if (spf.risk === "MEDIUM" || spf.risk === "HIGH") {
      deductions += WEIGHTS.spf_weak;
      pushFinding(findings, {
        type: "spf_weak",
        severity: "MEDIUM",
        category: "email",
        message: spf.message,
        steps: ["Tighten the SPF record", "Use -all when you are confident in the allowed senders", "Keep the record under the DNS lookup limit"],
        estimatedTime: "10 minutes",
        codeSnippet: "v=spf1 include:YOUR_PROVIDER -all",
      });
    }
  }

  if (dmarc) {
    if (!dmarc.exists) {
      deductions += WEIGHTS.dmarc_missing;
      pushFinding(findings, {
        type: "dmarc_missing",
        severity: "CRITICAL",
        category: "email",
        message: dmarc.message,
        steps: ["Add a DMARC record", "Start with reporting if you need to monitor before enforcing", "Move to quarantine or reject"],
        estimatedTime: "15 minutes",
      });
    } else if (dmarc.risk !== "LOW") {
      deductions += WEIGHTS.dmarc_weak;
      pushFinding(findings, {
        type: "dmarc_weak",
        severity: "MEDIUM",
        category: "email",
        message: dmarc.message,
        steps: ["Move policy from none to quarantine", "Then upgrade to reject after validation", "Add reporting addresses for visibility"],
        estimatedTime: "15 minutes",
      });
    }
  }

  if (dkim && !dkim.exists) {
    deductions += WEIGHTS.dkim_missing;
    pushFinding(findings, {
      type: "dkim_missing",
      severity: "MEDIUM",
      category: "email",
      message: dkim.message,
      steps: ["Enable DKIM in your mail service", "Publish the public key in DNS", "Verify signing after DNS propagation"],
      estimatedTime: "20 minutes",
    });
  }

  if (breached) {
    deductions += WEIGHTS.breached;
    pushFinding(findings, {
      type: "breached",
      severity: "CRITICAL",
      category: "breach",
      message: `Email found in ${breachCount} breach(es). Password rotation is urgent.`,
      steps: ["Change the password immediately", "Revoke active sessions", "Turn on MFA", "Check for reuse across other services"],
      estimatedTime: "10 minutes",
    });
  }

  if (Array.isArray(exposedPaths) && exposedPaths.length) {
    const pathDeduction = Math.min(exposedPaths.length * WEIGHTS.exposed_path, 20);
    deductions += pathDeduction;
    pushFinding(findings, {
      type: "exposed_path",
      severity: "CRITICAL",
      category: "vulnerability",
      message: `Sensitive paths are accessible: ${exposedPaths.map((item) => item.path).join(", ")}.`,
      steps: ["Remove or protect exposed admin and backup paths", "Require authentication for sensitive interfaces", "Block public access to secret files"],
      estimatedTime: "30 minutes",
    });
  }

  if (Array.isArray(openPorts) && openPorts.length) {
    const riskyOpen = openPorts.filter((port) => RISKY_PORTS.includes(port));
    if (riskyOpen.length) {
      const portDeduction = Math.min(riskyOpen.length * WEIGHTS.risky_port_open, 15);
      deductions += portDeduction;
      pushFinding(findings, {
        type: "risky_port_open",
        severity: "HIGH",
        category: "vulnerability",
        message: `Risky ports are open: ${riskyOpen.join(", ")}.`,
        steps: ["Close unnecessary ports", "Restrict access by firewall or security group", "Confirm only the required services remain public"],
        estimatedTime: "20 minutes",
      });
    }
  }

  findings.sort((a, b) => {
    const severityDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return a.id.localeCompare(b.id);
  });

  const score = Math.max(0, 100 - deductions);
  const band = score >= 80 ? "GOOD" : score >= 60 ? "FAIR" : score >= 40 ? "POOR" : "CRITICAL";
  const counts = findings.reduce(
    (acc, item) => {
      const key = `${item.severity.toLowerCase()}Count`;
      acc[key] += 1;
      return acc;
    },
    { criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0 }
  );

  return {
    score,
    band,
    deductions,
    findings,
    counts,
    totalIssues: findings.length,
  };
}

module.exports = { calculateScore };
