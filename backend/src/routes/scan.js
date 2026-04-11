import express from 'express';
import { generateFullReport } from '../services/reportService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { domain, businessName } = req.body;
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    const report = await generateFullReport(domain, businessName);
    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: 'Scan failed', message: error.message });
  }
});

router.post('/full', async (req, res) => {
  const { domain, businessName } = req.body;
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    const report = await generateFullReport(domain, businessName);
    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: 'Scan failed', message: error.message });
  }
});

export default router;
