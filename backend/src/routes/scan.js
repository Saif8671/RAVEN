import express from 'express';
import { performScan } from '../services/scanEngine.js';
import { db } from '../services/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { domain, businessName } = req.body;

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    const results = await performScan(domain);
    const enrichedResults = { ...results, businessName };
    
    await db.insert('scans', enrichedResults);
    res.json(enrichedResults);
  } catch (error) {
    res.status(500).json({ error: 'Scan failed', message: error.message });
  }
});

router.get('/history', async (req, res) => {
  const scans = await db.read('scans');
  res.json(scans);
});

export default router;
