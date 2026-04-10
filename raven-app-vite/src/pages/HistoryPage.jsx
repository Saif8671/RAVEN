import { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import { fetchReports } from "../lib/api";
import { PAGES } from "../lib/pages";

const bandColor = {
  GOOD: "var(--teal)",
  FAIR: "var(--gold)",
  POOR: "var(--threat)",
  CRITICAL: "var(--threat)",
};

export function HistoryPage({ setPage, setReport, reports: localReports }) {
  const [reports, setReports] = useState(localReports || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localReports?.length) return;
    setLoading(true);
    fetchReports()
      .then((data) => {
        if (data?.reports?.length) setReports(data.reports);
      })
      .catch(() => {
        // fall back to local state
      })
      .finally(() => setLoading(false));
  }, [localReports]);

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: "140px 80px 80px", maxWidth: 1100, margin: "0 auto" }}
    >
      <div style={{ marginBottom: 48 }}>
        <div className="section-label" style={{ marginBottom: 16 }}>
          Scan Archive
        </div>
        <h1
          style={{
            fontFamily: "var(--font-head)",
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          Scan History
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 17 }}>
          All previous scans are listed below. Click any row to view the full
          report.
        </p>
      </div>

      {loading && !reports.length && (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: "var(--text3)",
          }}
        >
          Loading history...
        </div>
      )}

      {!loading && !reports.length && (
        <GlowCard style={{ padding: 48, textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 24,
              marginBottom: 12,
            }}
          >
            No scans yet
          </div>
          <p style={{ color: "var(--text2)", marginBottom: 24 }}>
            Run your first security scan to see results here.
          </p>
          <button className="btn-primary" onClick={() => setPage(PAGES.SCAN)}>
            Start Security Scan {"->"}
          </button>
        </GlowCard>
      )}

      {reports.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {reports.map((r, idx) => (
            <Motion.div
              key={r.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={() => {
                if (r.findings) {
                  setReport(r);
                  setPage(PAGES.RESULTS);
                }
              }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 100px 180px",
                alignItems: "center",
                gap: 24,
                padding: "24px 32px",
                background: "var(--surface2)",
                border: "1px solid var(--border2)",
                borderRadius: 10,
                cursor: r.findings ? "pointer" : "default",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(208,188,255,0.3)";
                e.currentTarget.style.background = "var(--surface3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(208,188,255,0.1)";
                e.currentTarget.style.background = "var(--surface2)";
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-head)",
                    fontSize: 18,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  {r.business_name || r.domain}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "var(--text3)",
                  }}
                >
                  {r.domain}
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--font-head)",
                    fontSize: 28,
                    fontWeight: 700,
                    color: bandColor[r.band] || "var(--text)",
                  }}
                >
                  {r.score ?? "—"}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Score
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--font-head)",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "var(--text2)",
                  }}
                >
                  {r.totalIssues ?? 0}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Issues
                </div>
              </div>

              <div
                style={{
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--text3)",
                }}
              >
                {r.scannedAt
                  ? new Date(r.scannedAt).toLocaleString()
                  : "—"}
              </div>
            </Motion.div>
          ))}
        </div>
      )}
    </Motion.div>
  );
}
