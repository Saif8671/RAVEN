export const PHISHING_TEMPLATES = [
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
    subject: "Invoice #8821 - Payment overdue",
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

export const PHISHING_TEMPLATE_INFO = Object.fromEntries(
  PHISHING_TEMPLATES.map((template) => [template.id, template]),
);

