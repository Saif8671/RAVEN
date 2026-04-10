import { motion as Motion } from "framer-motion";
import { FindingCard } from "../components/FindingCard";

export function ResultsPage({ setPage, report }) {
  const activeReport = report;

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
            RAVEN no longer ships with a built-in sample report. Start a scan to load live results from the backend.
          </p>
          <button className="btn-primary" onClick={() => setPage("scan")}>
            Start Security Scan {"->"}
          </button>
        </div>
      </Motion.div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: "140px 80px 80px", maxWidth: 1200, margin: "0 auto" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 16 }}>
            Scan Complete
          </div>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: 48, fontWeight: 700 }}>{activeReport.business_name}</h1>
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
            Vulnerability Score
          </div>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 0.8,
              color: "var(--threat)",
              textShadow: "0 0 40px rgba(255, 180, 171, 0.4)",
            }}
          >
            {activeReport.risk_score ?? "—"}
            <span style={{ fontSize: 24, color: "var(--text3)", textShadow: "none" }}>/100</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 64 }}>
        {[
          { label: "Critical", count: activeReport.critical_count ?? 0, color: "var(--threat)" },
          { label: "High", count: activeReport.high_count ?? 0, color: "#ffcc99" },
          { label: "Medium", count: activeReport.medium_count ?? 0, color: "#fce8b2" },
          { label: "Low", count: activeReport.low_count ?? 0, color: "var(--teal)" },
        ].map((stat, i) => (
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            key={i}
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

      {activeReport.breach_detected && (
        <Motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            background: "rgba(255, 180, 171, 0.1)",
            border: "1px solid rgba(255, 180, 171, 0.3)",
            borderRadius: 8,
            padding: 32,
            marginBottom: 64,
            display: "flex",
            gap: 32,
            alignItems: "flex-start",
          }}
        >
          <div style={{ fontSize: 40 }}>[!]</div>
          <div>
            <h3 style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, color: "var(--threat)", marginBottom: 12 }}>
              Breach Detected: Password exposure likely
            </h3>
            <p style={{ color: "var(--text2)", lineHeight: 1.6, marginBottom: 24, maxWidth: 800 }}>
              {activeReport.breach_details || "No breach details were returned by the backend."}
            </p>
            <button className="btn-primary" style={{ background: "var(--threat)", color: "#3e0000" }} onClick={() => setPage("incident")}>
              View Incident Playbook {"->"}
            </button>
          </div>
        </Motion.div>
      )}

      <div style={{ marginBottom: 64, maxWidth: 800 }}>
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 600, marginBottom: 24 }}>Plain-English Summary</h2>
        <p style={{ fontSize: 18, color: "var(--text)", lineHeight: 1.7, fontWeight: 300 }}>
          {activeReport.summary_message || "No summary was returned by the backend."}
        </p>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid var(--border2)", paddingBottom: 24, marginBottom: 32 }}>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 600 }}>Action Items ({activeReport.total_issues})</h2>
          <span style={{ color: "var(--text3)", fontFamily: "var(--font-mono)", fontSize: 13 }}>Sorted by priority</span>
        </div>

        {Array.isArray(activeReport.findings) && activeReport.findings.length > 0 ? (
          activeReport.findings.map((f, i) => <FindingCard key={f.id} f={f} idx={i} />)
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
    </Motion.div>
  );
}
