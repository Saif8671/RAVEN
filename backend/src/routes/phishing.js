import express from 'express';
import { generatePhishingQuiz } from '../services/phishingSim.js';

const router = express.Router();

router.post('/quiz', async (req, res) => {
  const { industry } = req.body;
  if (!industry) return res.status(400).json({ error: 'Industry is required' });

  try {
    const quiz = await generatePhishingQuiz(industry);
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

export default router;
