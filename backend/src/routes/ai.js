import express from 'express';
import { getAIAdvice } from '../services/aiAdvisor.js';
import { db } from '../services/db.js';

const router = express.Router();

router.post('/advice', async (req, res) => {
  const { scanId, businessProfile } = req.body;

  if (!scanId || !businessProfile) {
    return res.status(400).json({ error: 'Scan ID and Business Profile are required' });
  }

  try {
    const scanData = await db.findById('scans', scanId);
    if (!scanData) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const advice = await getAIAdvice(scanData, businessProfile);
    res.json({ advice });
  } catch (error) {
    res.status(500).json({ error: 'AI advice generation failed', message: error.message });
  }
});

export default router;
