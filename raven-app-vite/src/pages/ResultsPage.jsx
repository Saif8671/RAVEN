import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { FindingCard } from "../components/FindingCard";
import { sendReportEmail } from "../lib/api";
import { PAGES } from "../lib/pages";


export function ResultsPage({ setPage, report }) {
  const [emailRecipient, setEmailRecipient] = useState(report?.email || "");
  const [emailStatus, setEmailStatus] = useState("");
  const [emailError, setEmailError] = useState("");

  const activeReport = report;
  const activeBand = activeReport?.band || "UNKNOWN";

  const sendEmail = async () => {
    if (!activeReport?.id) {
      setEmailError("No report is available to send.");
      return;
    }

    if (!String(emailRecipient || "").trim()) {
      setEmailStatus("");
      setEmailError("Enter an email address before sending the report.");
      return;
    }

    try {
      setEmailError("");
      setEmailStatus("Sending report...");
      const response = await sendReportEmail({
        reportId: activeReport.id,
        recipientEmail: String(emailRecipient).trim(),
      });
      setEmailStatus(response.message || `Report sent to ${emailRecipient}.`);
    } catch (error) {
      setEmailStatus("");
      setEmailError(error?.message || "Failed to send report.");
    }
  };

  if (!activeReport) {
    return (
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          padding: "140px 80px 80px",
          maxWidth: 960,
          margin: "0 auto",
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            padding: "48px",
            borderRadius: 12,
            border: "1px solid var(--border2)",
            background: "var(--surface2)",
            textAlign: "center",
          }}
        >
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>
            No Report Loaded
          </div>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: 42, fontWeight: 700, marginBottom: 16 }}>
            Run a scan to generate results
          </h1>
          <p style={{ color: "var(--text2)", lineHeight: 1.7, marginBottom: 32 }}>
            Start a scan to load live results from the backend.
          </p>
          <button className="btn-primary" onClick={() => setPage(PAGES.SCAN)}>
            Start Security Scan -&gt;
          </button>
        </div>
      </Motion.div>
    );
  }

  const findings = Array.isArray(activeReport.findings) ? activeReport.findings : [];
  const quickWins = activeReport.aiGuide?.quickWins || [];
  const fixes = activeReport.aiGuide?.fixes || [];
  const incidentPlaybook = activeReport.aiGuide?.incidentPlaybook || [];

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: "140px 80px 80px", maxWidth: 1200, margin: "0 auto", minHeight: "100vh" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 32, marginBottom: 48 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 16 }}>
            Scan Complete
          </div>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: 48, fontWeight: 700 }}>{activeReport.business_name || activeReport.domain}</h1>
          <a
            href={activeReport.website_url}
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--text3)", textDecoration: "none", fontSize: 15 }}
          >
            {activeReport.website_url}
          </a>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}
          >
            Security Score
          </div>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 0.8,
              color: activeReport.band === "GOOD" ? "var(--teal)" : activeReport.band === "FAIR" ? "var(--gold)" : "var(--threat)",
              textShadow: "0 0 40px rgba(255, 180, 171, 0.25)",
            }}
          >
            {activeReport.score ?? "N/A"}
            <span style={{ fontSize: 24, color: "var(--text3)", textShadow: "none" }}>/100</span>
          </div>
          <div style={{ color: "var(--text2)", marginTop: 8 }}>{activeBand} band</div>
        </div>
      </div>

      {activeReport.scanMeta && (
        <div style={{
          display: "flex", gap: 32, marginBottom: 32, padding: "16px 24px",
          borderRadius: 8, background: "var(--surface2)", border: "1px solid var(--border2)",
          fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text3)",
          flexWrap: "wrap",
        }}>
          <span>Scanned: {new Date(activeReport.scannedAt).toLocaleString()}</span>
          <span>Duration: {activeReport.scanMeta.durationSec}s</span>
          <span>Vuln: {activeReport.scanMeta.vulnScan?.status}</span>
          <span>Email: {activeReport.scanMeta.emailScan?.status}</span>
          <span>Breach: {activeReport.scanMeta.breachScan?.status}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 48 }}>
        {[
          { label: "Critical", count: activeReport.counts?.criticalCount ?? 0, color: "var(--threat)" },
          { label: "High", count: activeReport.counts?.highCount ?? 0, color: "#ffcc99" },
          { label: "Medium", count: activeReport.counts?.mediumCount ?? 0, color: "#fce8b2" },
          { label: "Low", count: activeReport.counts?.lowCount ?? 0, color: "var(--teal)" },
        ].map((stat, index) => (
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            key={stat.label}
            style={{
              background: "var(--surface2)",
              padding: "32px 24px",
              borderRadius: 8,
              borderTop: `2px solid ${stat.color}`,
            }}
          >
            <div style={{ fontSize: 40, fontFamily: "var(--font-head)", fontWeight: 700, color: stat.color, marginBottom: 8 }}>
              {stat.count}
            </div>
            <div style={{ color: "var(--text2)", fontFamily: "var(--font-mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {stat.label} Issues
            </div>
          </Motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 32, marginBottom: 48 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 600, marginBottom: 20 }}>Plain-English Summary</h2>
          <p style={{ fontSize: 18, color: "var(--text)", lineHeight: 1.7, fontWeight: 300 }}>{activeReport.summary_message}</p>
        </div>
        <div style={{ background: "var(--surface2)", borderRadius: 12, padding: 24, border: "1px solid var(--border2)" }}>
          <div className="section-label">Quick Wins</div>
          {quickWins.length ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {quickWins.map((item) => (
                <li key={item} style={{ marginBottom: 12, color: "var(--text2)" }}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ color: "var(--text2)" }}>No quick wins returned yet.</div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderBottom: "1px solid var(--border2)",
            paddingBottom: 24,
            marginBottom: 32,
          }}
        >
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 600 }}>Action Items ({activeReport.totalIssues ?? findings.length})</h2>
          <span style={{ color: "var(--text3)", fontFamily: "var(--font-mono)", fontSize: 13 }}>Sorted by severity</span>
        </div>

        {findings.length ? (
          findings.map((finding, index) => <FindingCard key={finding.id} f={finding} idx={index} />)
        ) : (
          <div
            style={{
              padding: "32px",
              borderRadius: 8,
              border: "1px solid var(--border2)",
              background: "var(--surface2)",
              color: "var(--text2)",
            }}
          >
            No findings were returned for this scan.
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48 }}>
        <div style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 24, marginBottom: 16 }}>Fix Guide</h2>
          {fixes.length ? (
            fixes.map((fix) => (
              <div key={fix.issue} style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "var(--font-head)", fontSize: 18, marginBottom: 8 }}>{fix.issue}</div>
                <div style={{ color: "var(--text2)", marginBottom: 8 }}>{fix.plainEnglish}</div>
                {Array.isArray(fix.steps) && (
                  <ol style={{ paddingLeft: 20, color: "var(--text2)" }}>
                    {fix.steps.map((step) => (
                      <li key={step} style={{ marginBottom: 6 }}>
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
                {fix.codeSnippet ? (
                  <pre style={{ marginTop: 12, padding: 14, borderRadius: 8, background: "var(--bg2)", overflowX: "auto", color: "var(--text3)" }}>
                    <code>{fix.codeSnippet}</code>
                  </pre>
                ) : null}
              </div>
            ))
          ) : (
            <div style={{ color: "var(--text2)" }}>No fix guide returned.</div>
          )}
        </div>

        <div style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 24, marginBottom: 16 }}>Attack Narrative</h2>
          <p style={{ color: "var(--text2)", lineHeight: 1.7, marginBottom: 20 }}>{activeReport.attackStory || activeReport.aiGuide?.attackStory}</p>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 8 }}>
            Incident Playbook
          </div>
          {incidentPlaybook.length ? (
            <ol style={{ paddingLeft: 20, color: "var(--text2)" }}>
              {incidentPlaybook.map((item) => (
                <li key={item} style={{ marginBottom: 8 }}>
                  {item}
                </li>
              ))}
            </ol>
          ) : (
            <div style={{ color: "var(--text2)" }}>No incident playbook returned.</div>
          )}
        </div>
      </div>

      <div style={{ background: "rgba(255, 180, 171, 0.08)", border: "1px solid rgba(255, 180, 171, 0.2)", borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: 24, marginBottom: 12 }}>Email Report</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            value={emailRecipient}
            onChange={(event) => setEmailRecipient(event.target.value)}
            placeholder="owner@business.com"
            style={{
              minWidth: 280,
              flex: 1,
              padding: "14px 16px",
              borderRadius: 8,
              border: "1px solid var(--border2)",
              background: "var(--surface2)",
              color: "var(--text)",
            }}
          />
          <button className="btn-primary" onClick={sendEmail}>
            Email me this report
          </button>
        </div>
        {(emailStatus || emailError) && (
          <div style={{ marginTop: 12, color: emailError ? "var(--threat)" : "var(--text2)" }}>{emailError || emailStatus}</div>
        )}
      </div>

      <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <button className="btn-primary" onClick={() => setPage(PAGES.INCIDENT)}>
          View Incident Response Playbook
        </button>
        <button className="btn-ghost" onClick={() => setPage(PAGES.SCAN)}>
          Run another scan
        </button>
        <button className="btn-ghost" onClick={() => setPage(PAGES.HISTORY)}>
          View scan history
        </button>
      </div>
    </Motion.div>
  );
}
