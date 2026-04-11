/**
 * RAVEN Backend — Full Smoke Test
 * Tests all 6 new feature endpoints.
 * Usage: node scripts/smoke-test-all.js
 * (make sure backend is running on port 5000 first)
 */

const BASE = "http://localhost:5000/api";

let passed = 0;
let failed = 0;

async function test(label, fn) {
  try {
    process.stdout.write(`  ⏳ ${label}...`);
    const result = await fn();
    console.log(` ✅ PASS ${result ? `(${result})` : ""}`);
    passed++;
  } catch (err) {
    console.log(` ❌ FAIL — ${err.message}`);
    failed++;
  }
}

async function req(path, body, method = "POST") {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body && method !== "GET") opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

async function run() {
  console.log("\n══════════════════════════════════════════");
  console.log("  RAVEN Backend — Smoke Test Suite");
  console.log("══════════════════════════════════════════\n");

  // ── Health ─────────────────────────────────
  console.log("[ Health ]");
  await test("GET /api/health", async () => {
    const d = await req("/health", null, "GET");
    if (d.status !== "ok") throw new Error("Status not ok");
    return `status=${d.status}`;
  });

  // ── Vulnerability Scanner ──────────────────
  console.log("\n[ Vulnerability Scanner ]");
  await test("POST /api/vulnerability/scan (example.com)", async () => {
    const d = await req("/vulnerability/scan", { domain: "example.com" });
    if (!d.domain) throw new Error("Missing domain in response");
    return `score=${d.score?.value}, ssl=${d.findings?.ssl?.valid}`;
  });

  await test("POST /api/vulnerability/scan — missing domain → 400", async () => {
    try {
      await req("/vulnerability/scan", {});
      throw new Error("Should have returned 400");
    } catch (e) {
      if (e.message.includes("Should have")) throw e;
      return "correctly rejected";
    }
  });

  // ── Email Security ─────────────────────────
  console.log("\n[ Email Security ]");
  await test("POST /api/email-security/check (google.com)", async () => {
    const d = await req("/email-security/check", { domain: "google.com" });
    if (!("spf" in d)) throw new Error("Missing spf in response");
    return `spf=${d.spf?.found}, dmarc=${d.dmarc?.found}`;
  });

  await test("POST /api/email-security/check — missing domain → 400", async () => {
    try {
      await req("/email-security/check", {});
      throw new Error("Should have returned 400");
    } catch (e) {
      if (e.message.includes("Should have")) throw e;
      return "correctly rejected";
    }
  });

  // ── Breach Detection ─────────────────────
  console.log("\n[ Breach Detection ]");
  await test("POST /api/breach/check (demo email)", async () => {
    const d = await req("/breach/check", { email: "test@example.com" });
    if (!d.results) throw new Error("Missing results in response");
    return `checks=${d.results.length}, summary="${d.summary?.slice(0, 40)}..."`;
  });

  await test("POST /api/breach/check (domain)", async () => {
    const d = await req("/breach/check", { domain: "example.com" });
    if (!d.results) throw new Error("Missing results in response");
    return `results=${d.results.length}`;
  });

  await test("POST /api/breach/check — no email/domain → 400", async () => {
    try {
      await req("/breach/check", {});
      throw new Error("Should have returned 400");
    } catch (e) {
      if (e.message.includes("Should have")) throw e;
      return "correctly rejected";
    }
  });

  // ── Phishing Simulation ───────────────────
  console.log("\n[ Phishing Simulation ]");
  let campaignId;
  await test("GET /api/phishing/templates", async () => {
    const d = await req("/phishing/templates", null, "GET");
    if (!Array.isArray(d) || d.length === 0) throw new Error("No templates returned");
    return `${d.length} templates`;
  });

  await test("POST /api/phishing/campaign", async () => {
    const d = await req("/phishing/campaign", {
      templateId: "it_password_reset",
      targetEmails: ["alice@acme.com", "bob@acme.com"],
      companyName: "Acme Corp",
    });
    if (!d.campaignId) throw new Error("Missing campaignId");
    campaignId = d.campaignId;
    return `id=${campaignId.slice(0, 8)}...`;
  });

  await test("GET /api/phishing/campaign/:id", async () => {
    if (!campaignId) throw new Error("No campaignId from previous test");
    const d = await req(`/phishing/campaign/${campaignId}`, null, "GET");
    if (!d.stats) throw new Error("Missing stats");
    return `sent=${d.stats.sent}, clickRate=${d.stats.clickRate}`;
  });

  await test("POST /api/phishing/campaign — missing fields → 400", async () => {
    try {
      await req("/phishing/campaign", { templateId: "it_password_reset" });
      throw new Error("Should have returned 400");
    } catch (e) {
      if (e.message.includes("Should have")) throw e;
      return "correctly rejected";
    }
  });

  // ── Incident Response ─────────────────────
  console.log("\n[ Incident Response ]");
  await test("GET /api/incident/types", async () => {
    const d = await req("/incident/types", null, "GET");
    if (!Array.isArray(d) || d.length === 0) throw new Error("No types returned");
    return `${d.length} types: ${d.map(t => t.id).join(", ")}`;
  });

  await test("GET /api/incident/playbook/ransomware", async () => {
    const d = await req("/incident/playbook/ransomware", null, "GET");
    if (!d.steps) throw new Error("Missing steps");
    return `${d.steps.length} phases`;
  });

  await test("GET /api/incident/playbook/:invalid → 404", async () => {
    try {
      await req("/incident/playbook/aliens", null, "GET");
      throw new Error("Should have returned 404");
    } catch (e) {
      if (e.message.includes("Should have")) throw e;
      return "correctly 404'd";
    }
  });

  await test("POST /api/incident/diagnose", async () => {
    const d = await req("/incident/diagnose", {
      symptoms: ["files_encrypted", "ransom_note"],
    });
    if (!d.diagnosedType) throw new Error("Missing diagnosedType");
    return `type=${d.diagnosedType}, confidence=${d.confidence}`;
  });

  await test("POST /api/incident/diagnose — no symptoms → 400", async () => {
    try {
      await req("/incident/diagnose", { symptoms: [] });
      throw new Error("Should have returned 400");
    } catch (e) {
      if (e.message.includes("Should have")) throw e;
      return "correctly rejected";
    }
  });

  // ── Report Generator ──────────────────────
  console.log("\n[ Report Generator ]");
  const sampleReport = {
    domain: "example.com",
    score: { value: 72, band: "Fair", color: "#eab308" },
    findings: {
      ssl: { valid: true, severity: "ok" },
      headers: { missing: ["X-Frame-Options", "CSP"], present: [] },
      exposedPages: { exposed: [] },
    },
    plainEnglishSummary: "Your site is mostly secure.",
    fixGuide: [
      { priority: 1, title: "Add security headers", description: "Test fix", effort: "Low" },
    ],
  };

  await test("POST /api/report/generate", async () => {
    const d = await req("/report/generate", { reportData: sampleReport });
    if (!d.html) throw new Error("Missing html in response");
    return `html length=${d.html.length} chars`;
  });

  await test("POST /api/report/email (no creds → graceful note)", async () => {
    const d = await req("/report/email", {
      to: "test@example.com",
      reportData: sampleReport,
    });
    // Succeeds even without email creds (returns note)
    if (d.success !== true) throw new Error("Expected success:true");
    return d.note ? "no-email-creds note returned" : `sent to ${d.message}`;
  });

  await test("POST /api/report/email — missing fields → 400", async () => {
    try {
      await req("/report/email", { to: "test@example.com" });
      throw new Error("Should have returned 400");
    } catch (e) {
      if (e.message.includes("Should have")) throw e;
      return "correctly rejected";
    }
  });

  // ── Summary ───────────────────────────────
  console.log("\n══════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("══════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("\n💥 Test runner crashed:", err.message);
  process.exit(1);
});
