const express = require("express");
const router = express.Router();
// Email utility logic removed in favor of utils/mailer.js

const mailer = require("../utils/mailer");

// POST /api/report/email
router.post("/email", async (req, res) => {
  const { to, reportData } = req.body;
  if (!to || !reportData) return res.status(400).json({ error: "to and reportData are required" });

  try {
    const result = await mailer.sendReportEmail(to, reportData);
    if (result.success) {
      res.json({ success: true, message: `Report sent to ${to}` });
    } else if (result.reason === "No credentials") {
      res.json({
        success: true,
        note: "Email not configured. Set EMAIL_USER and EMAIL_PASS in .env to send real emails.",
        reportData,
      });
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    res.status(500).json({ error: `Failed to send email: ${err.message}` });
  }
});

// POST /api/report/generate
router.post("/generate", (req, res) => {
  const { reportData } = req.body;
  if (!reportData) return res.status(400).json({ error: "reportData required" });

  res.json({
    html: buildReportHTML(reportData),
    generatedAt: new Date().toISOString(),
  });
});

module.exports = router;
