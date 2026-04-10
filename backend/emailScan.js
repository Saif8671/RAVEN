const dns = require("dns").promises;

function joinTxtRecord(record) {
  if (Array.isArray(record)) return record.join("");
  return record || "";
}

async function checkSPF(domain) {
  try {
    const records = await dns.resolveTxt(domain);
    const spf = records.map(joinTxtRecord).find((r) => r.startsWith("v=spf1"));
    if (!spf) {
      return {
        exists: false,
        record: null,
        risk: "HIGH",
        message: "No SPF record found. Attackers can spoof your domain.",
      };
    }

    return {
      exists: true,
      record: spf,
      strict: spf.includes("-all"),
      risk: spf.includes("-all") ? "LOW" : spf.includes("~all") ? "MEDIUM" : "HIGH",
      message: spf.includes("-all") ? "SPF is strict - good." : "SPF exists but not strict. Use -all for full protection.",
    };
  } catch {
    return { exists: false, record: null, risk: "HIGH", message: "Could not retrieve SPF record." };
  }
}

async function checkDMARC(domain) {
  try {
    const records = await dns.resolveTxt(`_dmarc.${domain}`);
    const dmarc = records.map(joinTxtRecord).find((r) => r.startsWith("v=DMARC1"));
    if (!dmarc) {
      return {
        exists: false,
        record: null,
        risk: "HIGH",
        message: "No DMARC record. Email spoofing is easy.",
      };
    }

    const policy = dmarc.match(/p=(none|quarantine|reject)/)?.[1] || "none";
    const riskMap = { reject: "LOW", quarantine: "MEDIUM", none: "HIGH" };
    return {
      exists: true,
      record: dmarc,
      policy,
      risk: riskMap[policy],
      message:
        policy === "reject"
          ? "DMARC is enforced - excellent."
          : policy === "quarantine"
            ? "DMARC quarantine mode. Upgrade to reject for full protection."
            : "DMARC policy is none - no enforcement. Change to quarantine or reject.",
    };
  } catch {
    return { exists: false, record: null, risk: "HIGH", message: "Could not retrieve DMARC record." };
  }
}

async function checkDKIM(domain) {
  const selectors = ["default", "google", "mail", "dkim", "k1", "smtp"];
  for (const sel of selectors) {
    try {
      const records = await dns.resolveTxt(`${sel}._domainkey.${domain}`);
      const dkim = records.map(joinTxtRecord).find((r) => r.includes("v=DKIM1"));
      if (dkim) {
        return {
          exists: true,
          selector: sel,
          record: dkim,
          risk: "LOW",
          message: `DKIM found with selector "${sel}".`,
        };
      }
    } catch {
      // Continue to the next selector.
    }
  }

  return {
    exists: false,
    record: null,
    risk: "MEDIUM",
    message: "DKIM not detected with common selectors. May still exist with a custom selector.",
  };
}

async function scanEmail(domain) {
  const [spf, dmarc, dkim] = await Promise.all([checkSPF(domain), checkDMARC(domain), checkDKIM(domain)]);
  return { spf, dmarc, dkim };
}

module.exports = { scanEmail };
