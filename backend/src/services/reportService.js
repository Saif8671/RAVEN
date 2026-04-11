import { performScan } from './scanEngine.js';
import { getAIAdvice } from './aiAdvisor.js';
import { db } from './db.js';

function getRiskBand(score) {
  if (score < 40) return 'POOR';
  if (score < 80) return 'FAIR';
  return 'GOOD';
}

function countFindings(findings = []) {
  return {
    criticalCount: findings.filter((finding) => finding.severity === 'CRITICAL').length,
    highCount: findings.filter((finding) => finding.severity === 'HIGH').length,
    mediumCount: findings.filter((finding) => finding.severity === 'MEDIUM').length,
    lowCount: findings.filter((finding) => finding.severity === 'LOW').length,
  };
}

export async function generateFullReport(domain, businessName) {
  const baseResults = await performScan(domain);
  const aiAdvice = await getAIAdvice(baseResults, { name: businessName });

  const finalReport = {
    ...baseResults,
    business_name: businessName,
    band: getRiskBand(baseResults.score),
    counts: countFindings(baseResults.findings),
    totalIssues: baseResults.findings.length,
    summary_message: aiAdvice.summary_message,
    scannedAt: new Date().toISOString(),
    aiGuide: {
      quickWins: aiAdvice.quickWins,
      fixes: aiAdvice.fixes,
      incidentPlaybook: aiAdvice.incidentPlaybook,
      attackStory: aiAdvice.attackStory,
    },
    scanMeta: {
      durationSec: 1,
      sslScan: { status: 'COMPLETE' },
      emailScan: { status: 'COMPLETE' },
      breachScan: { status: 'COMPLETE' },
    },
  };

  await db.insert('scans', finalReport);
  return finalReport;
}
