const https = require("https");

const SYSTEM_PROMPT = `You are a cybersecurity expert helping small business owners fix security issues.
Your job is to take scan findings and generate:
1. Plain English explanation of each issue
2. Step-by-step fix instructions with copy-paste ready examples where possible
3. Priority order, with the most important items first

Rules:
- No jargon. Write like explaining to a non-technical business owner.
- Be specific. Include actual DNS records, config snippets, or commands when useful.
- Keep each fix concise but actionable.
- Return JSON only.`;

function buildPrompt(findings, domain) {
  return `Domain: ${domain}

Security scan findings (${findings.length} issues found):
${JSON.stringify(findings, null, 2)}

Return a JSON object with this exact structure:
{
  "summary": "2-3 sentence plain English summary of the overall security situation",
  "fixes": [
    {
      "issue": "issue name",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "plainEnglish": "what this means for the business in simple terms",
      "steps": ["step 1", "step 2", "step 3"],
      "codeSnippet": "optional copy-paste fix (DNS record, config, etc)",
      "estimatedTime": "e.g. 5 minutes"
    }
  ],
  "quickWins": ["top 3 fastest fixes to do right now"],
  "incidentPlaybook": ["step 1", "step 2", "step 3", "step 4"],
  "attackStory": "plain-English story of how a hacker would likely target this business"
}`;
}

function buildFallbackGuide(findings, domain) {
  const quickWins = findings.slice(0, 3).map((finding) => finding.plainEnglish);
  return {
    summary: findings.length
      ? `We found ${findings.length} issue(s) on ${domain}. The biggest risks are the items marked critical or high, and those should be fixed first.`
      : `No major issues were detected for ${domain}. Keep monitoring and rerun scans regularly.`,
    fixes: findings.map((finding) => ({
      issue: finding.id,
      severity: finding.severity,
      plainEnglish: finding.plainEnglish,
      steps: finding.steps || [],
      codeSnippet: finding.codeSnippet || null,
      estimatedTime: finding.estimatedTime || "5 minutes",
    })),
    quickWins: quickWins.length
      ? quickWins
      : ["Turn on multi-factor authentication", "Review DNS records", "Confirm HTTPS is enforced"],
    incidentPlaybook: [
      "Disconnect any systems you think might be compromised.",
      "Change passwords for privileged accounts.",
      "Turn on multi-factor authentication everywhere you can.",
      "Review logs and recent account activity for suspicious access.",
      "Restore only after you understand what was touched.",
    ],
    attackStory: findings.length
      ? `A likely attacker would start with the weakest public signals on ${domain}, then move toward email spoofing, exposed services, or old credentials.`
      : `A likely attacker would have little obvious surface area to exploit, but would still probe for phishing and stale credentials on ${domain}.`,
    source: "fallback",
  };
}

async function getAIFixGuide(findings, domain) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return buildFallbackGuide(findings, domain);
  }

  const body = JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(findings, domain) }],
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            const text = parsed.content?.[0]?.text || "";
            const clean = text.replace(/```json|```/g, "").trim();
            resolve({
              ...JSON.parse(clean),
              source: "anthropic",
            });
          } catch (error) {
            resolve({
              ...buildFallbackGuide(findings, domain),
              error: `Failed to parse Claude response: ${error.message}`,
            });
          }
        });
      }
    );

    req.on("error", (error) => {
      resolve({
        ...buildFallbackGuide(findings, domain),
        error: error.message,
      });
    });
    req.setTimeout(30000, () => {
      req.destroy();
      resolve({
        ...buildFallbackGuide(findings, domain),
        error: "Claude API timeout",
      });
    });
    req.write(body);
    req.end();
  });
}

module.exports = { getAIFixGuide, buildFallbackGuide };
