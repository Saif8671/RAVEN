import express from 'express';
import { performScan } from '../services/scanEngine.js';
import { getAIAdvice } from '../services/aiAdvisor.js';
import { db } from '../services/db.js';

const router = express.Router();

async function generateFullReport(domain, businessName) {
  const baseResults = await performScan(domain);
  
  // Calculate counts
  const counts = {
    criticalCount: baseResults.findings.filter(f => f.severity === 'CRITICAL').length,
    highCount: baseResults.findings.filter(f => f.severity === 'HIGH').length,
    mediumCount: baseResults.findings.filter(f => f.severity === 'MEDIUM').length,
    lowCount: baseResults.findings.filter(f => f.severity === 'LOW').length,
  };

  // Determine band
  let band = 'GOOD';
  if (baseResults.score < 40) band = 'POOR';
  else if (baseResults.score < 80) band = 'FAIR';

  // Get AI Advice
  const aiAdvice = await getAIAdvice(baseResults, { name: businessName });

  const finalReport = {
    ...baseResults,
    business_name: businessName,
    band,
    counts,
    totalIssues: baseResults.findings.length,
    summary_message: aiAdvice.summary_message,
    scannedAt: new Date().toISOString(),
    aiGuide: {
      quickWins: aiAdvice.quickWins,
      fixes: aiAdvice.fixes,
      incidentPlaybook: aiAdvice.incidentPlaybook,
      attackStory: aiAdvice.attackStory
    },
    scanMeta: {
      durationSec: 1, // Placeholder
      sslScan: { status: 'COMPLETE' },
      emailScan: { status: 'COMPLETE' },
      breachScan: { status: 'COMPLETE' }
    }
  };

  await db.insert('scans', finalReport);
  return finalReport;
}

router.post('/', async (req, res) => {
  const { domain, businessName } = req.body;
  if (!domain) return res.status(400).json({ error: 'Domain is required' });

  try {
    const report = await generateFullReport(domain, businessName);
    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: 'Scan failed', message: error.message });
  }
});

router.post('/full', async (req, res) => {
  const { domain, businessName } = req.body;
  if (!domain) return res.status(400).json({ error: 'Domain is required' });

  try {
    const report = await generateFullReport(domain, businessName);
    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: 'Scan failed', message: error.message });
  }
});

router.get('/history', async (req, res) => {
  const scans = await db.read('scans');
  res.json({ reports: scans }); // Legacy expects { reports: [] }
});

// Legacy Alias for /reports
router.get('/legacy_all', async (req, res) => {
  const scans = await db.read('scans');
  res.json({ reports: scans });
});

router.get('/:id', async (req, res) => {
  const scans = await db.read('scans');
  const report = scans.find(s => s.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json({ report });
});

export default router;
