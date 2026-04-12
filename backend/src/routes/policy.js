import express from 'express';
import { POLICY_TEMPLATES } from '../data/policyTemplates.js';

const router = express.Router();

// GET /api/policy - List all templates
router.get("/", (req, res) => {
  const list = Object.values(POLICY_TEMPLATES).map(({ id, name, description }) => ({
    id,
    name,
    description,
  }));
  res.json(list);
});

// GET /api/policy/:id - Get specific template
router.get("/:id", (req, res) => {
  const policy = POLICY_TEMPLATES[req.params.id];
  if (!policy) {
    return res.status(404).json({ error: "Policy template not found" });
  }
  res.json(policy);
});

export default router;
