const cron = require("node-cron");
const vulnerabilityService = require("./vulnerabilityService");

// In-memory scan registry (use a DB in production)
const scheduledScans = new Map();

function init() {
  // Run every Monday at 9:00 AM
  cron.schedule("0 9 * * 1", async () => {
    console.log(`[Scheduler] Running weekly scans for ${scheduledScans.size} domain(s)`);
    for (const [domain, config] of scheduledScans.entries()) {
      try {
        const result = await vulnerabilityService.scan(domain);
        console.log(`[Scheduler] Scan complete for ${domain}: Score ${result.score.value}`);
        // In production: save to DB, send email notification
        if (config.notifyEmail) {
          console.log(`[Scheduler] Would notify ${config.notifyEmail}`);
        }
      } catch (err) {
        console.error(`[Scheduler] Scan failed for ${domain}:`, err.message);
      }
    }
  });

  console.log("[Scheduler] Weekly scan scheduler initialized (every Monday 9 AM)");
}

function register(domain, notifyEmail) {
  scheduledScans.set(domain, { notifyEmail, registeredAt: new Date().toISOString() });
  return { domain, notifyEmail, message: "Weekly scan registered" };
}

function unregister(domain) {
  scheduledScans.delete(domain);
  return { domain, message: "Weekly scan removed" };
}

function listScans() {
  return Array.from(scheduledScans.entries()).map(([domain, config]) => ({
    domain,
    ...config,
  }));
}

module.exports = { init, register, unregister, listScans };
