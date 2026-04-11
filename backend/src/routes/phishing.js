import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as mailer from '../utils/mailer.js';
import { getPhishingHTML } from '../utils/phishingTemplates.js';

const router = express.Router();

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
  const cName = companyName || "Your Company";
  
  const results = targetEmails.map((email) => ({
    email,
    trackingId: uuidv4(),
    opened: false,
    clicked: false,
    reported: false,
  }));

  const campaign = {
    id: campaignId,
    templateId,
    template,
    companyName: cName,
    targetEmails,
    sentAt: new Date().toISOString(),
    status: "sending",
    results,
  };

  campaigns.set(campaignId, campaign);

  // Send emails in background
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  
  (async () => {
    let sentCount = 0;
    for (const recipient of results) {
      const trackingUrl = `${backendUrl}/api/phishing/track/${campaignId}?tid=${recipient.trackingId}&type=click`;
      const html = getPhishingHTML(templateId, trackingUrl, cName);
      
      const res = await mailer.sendPhishingEmail(recipient.email, template.subject, html);
      if (res.success) sentCount++;
    }
    campaign.status = "sent";
    console.log(`[Phishing] Campaign ${campaignId} finished sending. ${sentCount}/${targetEmails.length} delivered.`);
  })();

  res.json({
    campaignId,
    message: `Phishing simulation campaign started for ${targetEmails.length} target(s)`,
    template: template.name,
  });
});

// GET /api/phishing/campaign/:id
router.get("/campaign/:id", (req, res) => {
  const campaign = campaigns.get(req.params.id);
  if (!campaign) return res.status(404).json({ error: "Campaign not found" });

  const total = campaign.targetEmails.length;
  const opened = campaign.results.filter(r => r.opened).length;
  const clicked = campaign.results.filter(r => r.clicked).length;
  const reported = campaign.results.filter(r => r.reported).length;

  const openRate = total > 0 ? Math.floor((opened / total) * 100) : 0;
  const clickRate = total > 0 ? Math.floor((clicked / total) * 100) : 0;

  res.json({
    ...campaign,
    stats: {
      sent: total,
      opened,
      clicked,
      reported,
      openRate: `${openRate}%`,
      clickRate: `${clickRate}%`,
    },
    awareness: generateAwarenessReport(openRate, clickRate),
  });
});

// GET /api/phishing/track/:campaignId
router.get("/track/:campaignId", (req, res) => {
  const { type, tid } = req.query;
  const campaign = campaigns.get(req.params.campaignId);
  
  if (campaign) {
    const recipient = campaign.results.find((r) => r.trackingId === tid);
    if (recipient) {
      if (type === "click") {
        recipient.clicked = true;
        recipient.opened = true; // Clicking implies opening
      } else if (type === "open") {
        recipient.opened = true;
      }
    }
  }

  // Redirect to frontend awareness page
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${frontendUrl}/phishing-awareness`);
});

export default router;
