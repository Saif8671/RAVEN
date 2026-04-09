export const MOCK_REPORT = {
  business_name: "Coastal Brew Co.",
  website_url: "https://coastalbrew.co",
  scan_date: new Date().toISOString(),
  risk_score: 38,
  risk_level: "High",
  total_issues: 7,
  critical_count: 1,
  high_count: 3,
  medium_count: 2,
  low_count: 1,
  breach_detected: true,
  breach_details: "Your business email domain was found in 2 known data breaches from 2022 and 2023. This means some of your employees' login details may have been exposed. Attackers could use these to access your email, payment systems, or cloud accounts.",
  summary_message: "RAVEN found 7 security issues on your business — 1 critical and 3 high priority. The good news: all of these are fixable, usually in under an hour each. Start with the DMARC issue — it's the one most likely to be used against you right now.",
  findings: [
    {
      id: "EMAIL-001",
      category: "Email Security",
      severity: "Critical",
      plain_english: "Anyone on the internet can send emails pretending to be you. There's no 'seal' on your email address — so phishing attacks can look exactly like they came from you, tricking your customers and suppliers.",
      fix_steps: [
        "Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)",
        "Go to 'DNS Settings' or 'DNS Management' for your domain",
        "Add a new TXT record with Name/Host: _dmarc and Value: v=DMARC1; p=quarantine; rua=mailto:you@yourdomain.com",
        "Save the record and wait 24–48 hours for it to take effect",
        "Use mail-tester.com to verify it's working"
      ],
      time_estimate: "About 15 minutes"
    },
    {
      id: "WEB-001",
      category: "Web Security",
      severity: "High",
      plain_english: "Your website is missing a security layer that prevents hackers from injecting malicious scripts into your pages. This could let attackers steal your visitors' data or redirect them to a fake version of your site.",
      fix_steps: [
        "Contact your website developer or hosting provider (e.g. Shopify, WordPress, Wix)",
        "Ask them to add a Content-Security-Policy (CSP) header to your website",
        "If using WordPress, install a plugin like 'Headers and Methods Allowed HTTP' and set the CSP header",
        "Test the fix at securityheaders.com"
      ],
      time_estimate: "30 minutes with a developer"
    },
    {
      id: "WEB-002",
      category: "Web Security",
      severity: "High",
      plain_english: "Your website doesn't enforce strict HTTPS connections. Visitors on public WiFi (cafes, airports) could have their connection quietly intercepted by an attacker sitting nearby.",
      fix_steps: [
        "Log into your hosting control panel (cPanel, Plesk, or your host's dashboard)",
        "Find 'SSL/TLS' settings",
        "Enable 'Force HTTPS' or 'HTTP to HTTPS Redirect'",
        "If using Cloudflare, go to SSL/TLS → Edge Certificates → turn on 'Always Use HTTPS'"
      ],
      time_estimate: "About 10 minutes"
    },
    {
      id: "EMAIL-002",
      category: "Email Security",
      severity: "High",
      plain_english: "Your email domain is missing an SPF record, which means email servers can't verify your emails are genuine. This makes it very easy for scammers to impersonate your business in emails.",
      fix_steps: [
        "Log in to your domain registrar DNS settings",
        "Add a new TXT record with Name/Host: @ (or your domain name)",
        "Set Value to: v=spf1 include:_spf.google.com ~all (if using Gmail) or ask your email provider for the right value",
        "Save the record"
      ],
      time_estimate: "10 minutes"
    },
    {
      id: "WEB-003",
      category: "Web Security",
      severity: "Medium",
      plain_english: "Your website's admin login page (/admin) is publicly accessible. This gives attackers a direct door to try to break in to the backend of your site.",
      fix_steps: [
        "If using WordPress, install the 'WPS Hide Login' plugin to change /wp-admin to a secret URL",
        "Or contact your developer to password-protect the admin folder in your hosting settings",
        "Enable two-factor authentication (2FA) on your admin account"
      ],
      time_estimate: "20 minutes"
    },
    {
      id: "EMAIL-003",
      category: "Email Security",
      severity: "Medium",
      plain_english: "Your email is missing a DKIM signature — a digital stamp that proves your emails weren't tampered with in transit. Without it, your emails may land in spam or get modified by attackers.",
      fix_steps: [
        "Log into your email provider (Google Workspace, Microsoft 365, etc.)",
        "Find the DKIM settings — in Google Workspace: Apps → Gmail → Authenticate Email",
        "Generate a DKIM key and add the provided TXT record to your domain's DNS",
        "Click 'Start Authentication'"
      ],
      time_estimate: "About 20 minutes"
    },
    {
      id: "WEB-004",
      category: "Web Security",
      severity: "Low",
      plain_english: "Your website could do a better job of hiding what software it uses under the hood. This information can help attackers figure out which specific vulnerabilities to try.",
      fix_steps: [
        "Ask your hosting provider or developer to set X-Powered-By and Server headers to empty or a generic value",
        "In WordPress, install the 'WP Hardening' plugin which handles this automatically"
      ],
      time_estimate: "15 minutes with a developer"
    }
  ]
};

export const PLAYBOOK_STEPS = [
  { time: "0–5 min", title: "Don't panic — isolate first", desc: "Disconnect the affected device from WiFi and unplug the ethernet cable. Do not turn it off — this preserves forensic evidence." },
  { time: "5–15 min", title: "Change all critical passwords", desc: "From a different, clean device: change your email, banking, domain registrar, and hosting passwords immediately. Enable 2FA on everything." },
  { time: "15–25 min", title: "Notify your bank", desc: "Call your business bank and flag a potential breach. Ask them to monitor for suspicious transactions and temporarily freeze outgoing transfers if needed." },
  { time: "25–35 min", title: "Check for unauthorised access", desc: "Review your email sent folder and login history. In Google Workspace or Microsoft 365, check the admin panel for sign-ins from unknown locations." },
  { time: "35–50 min", title: "Preserve evidence", desc: "Take screenshots of anything suspicious. Write down the timeline of what happened. You may need this for your insurance provider or police report." },
  { time: "50–60 min", title: "Notify and report", desc: "If customer data was exposed, you are legally required to notify affected customers. Contact your local cybercrime authority (in India: cybercrime.gov.in)." }
];
