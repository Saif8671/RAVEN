function calculateRiskScore(findings) {
  let deductions = 0;

  // SSL (max 30 points)
  if (findings.ssl) {
    if (!findings.ssl.valid || findings.ssl.severity === "critical") deductions += 30;
    else if (findings.ssl.severity === "high") deductions += 15;
    else if (findings.ssl.severity === "medium") deductions += 5;
  }

  // Security Headers (max 30 points)
  if (findings.headers) {
    const missingCount = findings.headers.missing?.length || 0;
    deductions += Math.min(30, missingCount * 5);
  }

  // Exposed Pages (max 25 points)
  if (findings.exposedPages) {
    const exposedCount = findings.exposedPages.exposed?.length || 0;
    deductions += Math.min(25, exposedCount * 8);
  }

  // Email Security (max 15 points)
  if (findings.emailSecurity) {
    if (!findings.emailSecurity.spf) deductions += 5;
    if (!findings.emailSecurity.dkim) deductions += 5;
    if (!findings.emailSecurity.dmarc) deductions += 5;
  }

  const score = Math.max(0, 100 - deductions);

  return {
    value: score,
    band:
      score >= 80
        ? "Good"
        : score >= 60
        ? "Fair"
        : score >= 40
        ? "Poor"
        : "Critical",
    color:
      score >= 80
        ? "#22c55e"
        : score >= 60
        ? "#eab308"
        : score >= 40
        ? "#f97316"
        : "#ef4444",
  };
}

module.exports = { calculateRiskScore };
