import express from 'express';
import { auditPassword } from '../services/passwordChecker.js';

const router = express.Router();

router.post('/check', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const results = await auditPassword(password);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Password audit failed', message: error.message });
  }
});

export default router;
