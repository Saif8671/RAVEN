const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");

// In-memory store for demo (use DB in production)
const campaigns = new Map();

const PHISHING_TEMPLATES = [
  {
    id: "it_password_reset",
    name: "IT Password Reset",
    subject: "URGENT: Your password expires in 24 hours",
    previewText: "Action required to keep your account active",
    difficulty: "Easy",
    category: "Credential Theft",
    redFlags: [
      "Creates urgency with fake deadline",
      "Asks you to click a link to avoid account lockout",
      "Generic greeting, not personalised",
      "Sender domain doesn't match company",
    ],
  },
  {
    id: "ceo_wire_transfer",
    name: "CEO Wire Transfer Request",
    subject: "Urgent wire transfer needed - confidential",
    previewText: "Please process this payment ASAP",
    difficulty: "Hard",
    category: "Business Email Compromise",
    redFlags: [
      "Impersonates executive authority",
      "Requests urgent financial action",
      "Asks to bypass normal approval process",
      "Reply-to address differs from sender",
    ],
  },
  {
    id: "invoice_attachment",
    name: "Fake Invoice",
    subject: "Invoice #8821 — Payment overdue",
    previewText: "Please review attached invoice",
    difficulty: "Medium",
    category: "Malware / Attachment",
    redFlags: [
      "Unexpected invoice from unknown vendor",
      "Pressure to open attachment immediately",
      "Vague company name",
      "Attached file type could contain macros",
    ],
  },
  {
    id: "package_delivery",
    name: "Package Delivery",
    subject: "Your package could not be delivered",
    previewText: "Click to reschedule your delivery",
    difficulty: "Easy",
    category: "Credential Theft",
    redFlags: [
      "No package tracking number provided",
      "Link goes to non-official domain",
      "Asks for payment or personal info",
      "Generic delivery company name",
    ],
  },
];

// GET /api/phishing/templates
router.get("/templates", (req, res) => {
  res.json(PHISHING_TEMPLATES.map(({ id, name, difficulty, category }) => ({
    id, name, difficulty, category,
  })));
});

// POST /api/phishing/campaign
router.post("/campaign", async (req, res) => {
  const { templateId, targetEmails, companyName } = req.body;
  if (!templateId || !targetEmails?.length) {
    return res.status(400).json({ error: "templateId and targetEmails required" });
  }

  const template = PHISHING_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return res.status(404).json({ error: "Template not found" });

  const campaignId = uuidv4();
  const campaign = {
    id: campaignId,
    templateId,
    template,
    companyName: companyName || "Your Company",
    targetEmails,
    sentAt: new Date().toISOString(),
    status: "sent",
    stats: {
      sent: targetEmails.length,
      opened: 0,
      clicked: 0,
      reported: 0,
    },
    results: targetEmails.map((email) => ({
      email,
      trackingId: uuidv4(),
      opened: false,
      clicked: false,
      reported: false,
    })),
  };

  campaigns.set(campaignId, campaign);

  // In production: actually send emails via nodemailer
  // For demo, we simulate sending
  res.json({
    campaignId,
    message: `Phishing simulation campaign created for ${targetEmails.length} target(s)`,
    template: template.name,
    trackingUrl: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/phishing/track/${campaignId}`,
  });
});

// GET /api/phishing/campaign/:id
router.get("/campaign/:id", (req, res) => {
  const campaign = campaigns.get(req.params.id);
  if (!campaign) return res.status(404).json({ error: "Campaign not found" });

  // Simulate some results for demo
  const openRate = Math.floor(Math.random() * 40) + 20;
  const clickRate = Math.floor(Math.random() * 30) + 5;

  res.json({
    ...campaign,
    stats: {
      sent: campaign.stats.sent,
      opened: Math.floor((campaign.stats.sent * openRate) / 100),
      clicked: Math.floor((campaign.stats.sent * clickRate) / 100),
      reported: Math.floor(campaign.stats.sent * 0.1),
      openRate: `${openRate}%`,
      clickRate: `${clickRate}%`,
    },
    awareness: generateAwarenessReport(openRate, clickRate),
  });
});

// GET /api/phishing/track/:campaignId (simulates tracking pixel / link click)
router.get("/track/:campaignId", (req, res) => {
  const { type, tid } = req.query;
  const campaign = campaigns.get(req.params.campaignId);
  if (campaign) {
    const result = campaign.results.find((r) => r.trackingId === tid);
    if (result) {
      if (type === "open") result.opened = true;
      if (type === "click") result.clicked = true;
    }
  }
  res.redirect("/phishing-awareness");
});

function generateAwarenessReport(openRate, clickRate) {
  if (clickRate > 30) {
    return {
      risk: "High",
      message: "Over 30% of employees clicked the phishing link. Immediate security awareness training is recommended.",
    };
  } else if (clickRate > 15) {
    return {
      risk: "Medium",
      message: "Some employees clicked the phishing link. Schedule a training session and reinforce email safety policies.",
    };
  } else {
    return {
      risk: "Low",
      message: "Most employees resisted the phishing attempt. Keep up the awareness training!",
    };
  }
}

module.exports = router;
