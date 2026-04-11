import express from 'express';
import { db } from '../services/db.js';
import { sendReportEmail } from '../services/emailService.js';

const router = express.Router();

router.get('/reports', async (req, res) => {
  const scans = await db.read('scans');
  res.json({ reports: scans });
});

router.get('/report/:id', async (req, res) => {
  const scans = await db.read('scans');
  const report = scans.find((scan) => scan.id === req.params.id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  res.json({ report });
});

router.post('/report/email', async (req, res) => {
  const { reportId, recipientEmail } = req.body;

  if (!reportId || !recipientEmail) {
    return res.status(400).json({ error: 'Report ID and recipient email are required' });
  }

  const report = await db.findById('scans', reportId);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  try {
    const result = await sendReportEmail(report, recipientEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send report email', message: error.message });
  }
});

export default router;
