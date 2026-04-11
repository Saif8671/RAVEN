const express = require("express");
const router = express.Router();

const INCIDENT_TYPES = {
  ransomware: {
    name: "Ransomware Attack",
    severity: "Critical",
    steps: [
      {
        phase: "Immediate (0-30 min)",
        actions: [
          "DISCONNECT infected computers from the network immediately — unplug ethernet, disable WiFi",
          "DO NOT pay the ransom without consulting a security professional",
          "Take photos of the ransom note and any error screens for documentation",
          "Call your IT provider or managed security service immediately",
          "Preserve all logs — do not restart affected machines",
        ],
      },
      {
        phase: "Short-term (1-24 hours)",
        actions: [
          "Identify which systems are affected and isolate them",
          "Check if you have clean backups from before the attack",
          "Report to law enforcement (FBI IC3: ic3.gov, or local cyber crime unit)",
          "Notify your cyber insurance provider if you have one",
          "Begin assessing the scope — what data may have been accessed?",
        ],
      },
      {
        phase: "Recovery (1-7 days)",
        actions: [
          "Restore from clean backups only — do not trust infected systems",
          "Rebuild affected machines from scratch if backups are unavailable",
          "Reset all passwords across the organisation",
          "Enable multi-factor authentication everywhere",
          "Conduct a full security audit before going back online",
        ],
      },
    ],
    contacts: ["Local police cyber crime unit", "FBI IC3 (ic3.gov)", "CISA (cisa.gov/report)", "Your cyber insurance provider"],
  },
  data_breach: {
    name: "Data Breach",
    severity: "High",
    steps: [
      {
        phase: "Immediate (0-2 hours)",
        actions: [
          "Identify what data was accessed or stolen",
          "Contain the breach — revoke compromised credentials immediately",
          "Preserve evidence — do not delete logs or modify systems",
          "Engage your IT team or security provider",
          "Begin documenting everything with timestamps",
        ],
      },
      {
        phase: "Short-term (2-72 hours)",
        actions: [
          "Determine if personal data was involved (names, emails, payment info, health data)",
          "If personal data was exposed, you may have legal notification obligations",
          "In the EU/UK: report to data protection authority within 72 hours if required",
          "In the US: check state breach notification laws",
          "Prepare customer/employee notification if needed",
        ],
      },
      {
        phase: "Recovery",
        actions: [
          "Notify affected individuals with clear, honest communication",
          "Offer credit monitoring if financial data was exposed",
          "Patch the vulnerability that caused the breach",
          "Conduct a post-incident review to prevent recurrence",
          "Update your incident response plan",
        ],
      },
    ],
    contacts: ["FTC (reportfraud.ftc.gov)", "State Attorney General (US)", "ICO (ico.org.uk) (UK)", "CISA (cisa.gov)"],
  },
  phishing_attack: {
    name: "Phishing Attack / Account Compromise",
    severity: "High",
    steps: [
      {
        phase: "Immediate",
        actions: [
          "Change the compromised password immediately from a clean device",
          "Enable two-factor authentication on the affected account",
          "Check for any emails sent, rules created, or forwarding set up by the attacker",
          "Warn colleagues if the attacker may have sent phishing emails from your account",
          "Check if any other accounts use the same password and change them too",
        ],
      },
      {
        phase: "Investigation",
        actions: [
          "Review login history for the compromised account",
          "Look for any data that may have been accessed or downloaded",
          "Check connected apps — revoke anything suspicious",
          "Scan your device for malware if you clicked a link",
        ],
      },
      {
        phase: "Prevention",
        actions: [
          "Enable multi-factor authentication across all accounts",
          "Use a password manager to generate and store unique passwords",
          "Train staff to recognise phishing emails",
          "Consider email filtering solutions",
        ],
      },
    ],
    contacts: ["Your email provider support", "Microsoft Security (if M365)", "Google Workspace Admin"],
  },
  malware: {
    name: "Malware / Virus Infection",
    severity: "High",
    steps: [
      {
        phase: "Immediate",
        actions: [
          "Isolate the infected machine from the network",
          "Do not use it for any sensitive work",
          "Run a full antivirus/antimalware scan",
          "Document when you noticed the infection and what happened",
        ],
      },
      {
        phase: "Remediation",
        actions: [
          "If malware is found, follow your antivirus software instructions to quarantine/remove it",
          "If the machine cannot be cleaned, wipe and reinstall the operating system",
          "Restore files from a clean backup taken before the infection",
          "Change all passwords that were entered on the infected machine",
        ],
      },
      {
        phase: "Prevention",
        actions: [
          "Keep operating system and software up to date",
          "Never download software from untrusted sources",
          "Use a reputable antivirus solution",
          "Train staff not to open unexpected email attachments",
        ],
      },
    ],
    contacts: ["Your IT support provider", "Antivirus vendor support"],
  },
};

// GET /api/incident/types
router.get("/types", (req, res) => {
  res.json(
    Object.entries(INCIDENT_TYPES).map(([id, { name, severity }]) => ({
      id,
      name,
      severity,
    }))
  );
});

// GET /api/incident/playbook/:type
router.get("/playbook/:type", (req, res) => {
  const playbook = INCIDENT_TYPES[req.params.type];
  if (!playbook) return res.status(404).json({ error: "Incident type not found" });
  res.json(playbook);
});

// POST /api/incident/diagnose
router.post("/diagnose", (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms?.length) return res.status(400).json({ error: "Symptoms required" });

  const symptomMap = {
    files_encrypted: "ransomware",
    ransom_note: "ransomware",
    data_stolen: "data_breach",
    unusual_login: "phishing_attack",
    account_compromised: "phishing_attack",
    slow_computer: "malware",
    pop_ups: "malware",
    unknown_emails_sent: "phishing_attack",
  };

  const scores = {};
  symptoms.forEach((s) => {
    const type = symptomMap[s];
    if (type) scores[type] = (scores[type] || 0) + 1;
  });

  const mostLikely = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  const incidentType = mostLikely ? mostLikely[0] : "malware";

  res.json({
    diagnosedType: incidentType,
    confidence: mostLikely ? `${Math.min(95, mostLikely[1] * 30 + 40)}%` : "40%",
    playbook: INCIDENT_TYPES[incidentType],
  });
});

module.exports = router;
