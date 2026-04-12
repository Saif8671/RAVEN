import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as mailer from '../utils/mailer.js';
import { getPhishingHTML } from '../utils/phishingTemplates.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../data/campaigns.json');

// Helper to load campaigns from JSON
function loadCampaigns() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Phishing] Failed to load campaigns:', err.message);
  }
  return [];
}

// Helper to save campaigns to JSON
function saveCampaigns(campaigns) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(campaigns, null, 2));
  } catch (err) {
    console.error('[Phishing] Failed to save campaigns:', err.message);
  }
}

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

// GET /api/phishing/campaigns - List all campaigns
router.get("/campaigns", (req, res) => {
  const campaigns = loadCampaigns();
  // Return summarized list for dashboard
  res.json(campaigns.map(c => {
    const total = c.targetEmails.length;
    const clicked = c.results.filter(r => r.clicked).length;
    return {
      id: c.id,
      name: c.companyName,
      template: c.template.name,
      sentAt: c.sentAt,
      status: c.status,
      targets: total,
      clicks: clicked,
      clickRate: total > 0 ? Math.floor((clicked / total) * 100) : 0
    };
  }).sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)));
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

  const campaigns = loadCampaigns();
  campaigns.push(campaign);
  saveCampaigns(campaigns);

  // Send emails in background
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  
  (async () => {
    let sentCount = 0;
    let failedCount = 0;
    for (const recipient of results) {
      const trackingUrl = `${backendUrl}/api/phishing/track/${campaignId}?tid=${recipient.trackingId}&type=click`;
      const html = getPhishingHTML(templateId, trackingUrl, cName);
      
      const emailRes = await mailer.sendPhishingEmail(recipient.email, template.subject, html);
      if (emailRes.success) {
        sentCount++;
      } else {
        failedCount++;
        console.warn(`[Phishing] Delivery failed for ${recipient.email}: ${emailRes.reason || emailRes.error || "unknown error"}`);
      }
    }
    
    // Update status to reflect the actual delivery result.
    const activeCampaigns = loadCampaigns();
    const cIdx = activeCampaigns.findIndex(c => c.id === campaignId);
    if (cIdx !== -1) {
      activeCampaigns[cIdx].status =
        sentCount === targetEmails.length ? "sent" : sentCount > 0 ? "partial" : "failed";
      activeCampaigns[cIdx].delivery = {
        sent: sentCount,
        failed: failedCount,
        total: targetEmails.length,
      };
      saveCampaigns(activeCampaigns);
    }
    console.log(`[Phishing] Campaign ${campaignId} finished sending. ${sentCount}/${targetEmails.length} delivered.`);
  })().catch((err) => {
    console.error(`[Phishing] Campaign ${campaignId} background send failed:`, err.message);
  });

  res.json({
    campaignId,
    message: `Phishing simulation campaign started for ${targetEmails.length} target(s)`,
    template: template.name,
    delivery: process.env.EMAIL_USER && process.env.EMAIL_PASS
      ? { mode: "smtp" }
      : {
          mode: "disabled",
          note: "Email credentials are not configured, so no real phishing email will be delivered.",
        },
  });
});

// GET /api/phishing/campaign/:id
router.get("/campaign/:id", (req, res) => {
  const campaigns = loadCampaigns();
  const campaign = campaigns.find(c => c.id === req.params.id);
  
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
  const campaigns = loadCampaigns();
  const cIdx = campaigns.findIndex(c => c.id === req.params.campaignId);
  
  let templateId = 'it_password_reset';

  if (cIdx !== -1) {
    const campaign = campaigns[cIdx];
    templateId = campaign.templateId;
    const recipient = campaign.results.find((r) => r.trackingId === tid);
    if (recipient) {
      if (type === "click") {
        recipient.clicked = true;
        recipient.opened = true; // Clicking implies opening
      } else if (type === "open") {
        recipient.opened = true;
      }
      saveCampaigns(campaigns);
    }
  }

  // Redirect to frontend awareness page
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  // Pass templateId so awareness page can show right red flags
  res.redirect(`${frontendUrl}/?page=phishing-awareness&templateId=${templateId}`);
});

export default router;
