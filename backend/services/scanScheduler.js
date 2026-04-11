const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const vulnerabilityService = require("./vulnerabilityService");
const mailer = require("../utils/mailer");

const DB_PATH = path.join(__dirname, "../data/schedules.json");

// In-memory scan registry synced with file
let scheduledScans = [];

function loadSchedules() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8");
      scheduledScans = JSON.parse(data);
    } else {
      scheduledScans = [];
      saveSchedules();
    }
  } catch (err) {
    console.error("[Scheduler] Failed to load schedules:", err.message);
    scheduledScans = [];
  }
}

function saveSchedules() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(scheduledScans, null, 2));
  } catch (err) {
    console.error("[Scheduler] Failed to save schedules:", err.message);
  }
}

async function runScheduledScans(frequency) {
  const scansToRun = scheduledScans.filter((s) => s.frequency === frequency);
  console.log(`[Scheduler] Running ${frequency} scans for ${scansToRun.length} domain(s)`);

  for (const config of scansToRun) {
    try {
      const result = await vulnerabilityService.scan(config.domain);
      console.log(`[Scheduler] Scan complete for ${config.domain}: Score ${result.score.value}`);

      if (config.notifyEmail) {
        await mailer.sendReportEmail(config.notifyEmail, result);
        console.log(`[Scheduler] Report sent to ${config.notifyEmail}`);
      }
    } catch (err) {
      console.error(`[Scheduler] Scan failed for ${config.domain}:`, err.message);
    }
  }
}

function init() {
  loadSchedules();

  // Daily at midnight
  cron.schedule("0 0 * * *", () => runScheduledScans("daily"));

  // Weekly on Sunday at 9 AM
  cron.schedule("0 9 * * 0", () => runScheduledScans("weekly"));

  // Monthly on 1st at midnight
  cron.schedule("0 0 1 * *", () => runScheduledScans("monthly"));

  console.log("[Scheduler] Multi-frequency scan scheduler initialized (Daily, Weekly, Monthly)");
}

function register(domain, frequency, notifyEmail) {
  // Remove existing if any for the same domain (ensure unique per domain)
  scheduledScans = scheduledScans.filter((s) => s.domain !== domain);

  const newConfig = {
    domain,
    frequency: frequency || "weekly",
    notifyEmail,
    registeredAt: new Date().toISOString(),
  };

  scheduledScans.push(newConfig);
  saveSchedules();

  return { ...newConfig, message: `${frequency} scan registered` };
}

function unregister(domain) {
  const initialLength = scheduledScans.length;
  scheduledScans = scheduledScans.filter((s) => s.domain !== domain);
  saveSchedules();

  if (scheduledScans.length < initialLength) {
    return { domain, message: "Scheduled scan removed" };
  }
  return { domain, message: "No scheduled scan found for this domain" };
}

function listScans() {
  return scheduledScans;
}

module.exports = { init, register, unregister, listScans };
