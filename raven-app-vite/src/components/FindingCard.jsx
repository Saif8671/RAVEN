import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";

const severityColorMap = {
  CRITICAL: "var(--threat)",
  HIGH: "#ffcc99",
  MEDIUM: "#fce8b2",
  LOW: "var(--teal)",
};

const severityBgMap = {
  CRITICAL: "rgba(255, 180, 171, 0.15)",
  HIGH: "rgba(255, 204, 153, 0.1)",
  MEDIUM: "rgba(252, 232, 178, 0.1)",
  LOW: "rgba(168, 240, 221, 0.1)",
};

export function FindingCard({ f, idx }) {
  const [expanded, setExpanded] = useState(false);
  const severity = f.severity || "MEDIUM";

  return (
    <Motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: idx * 0.05 }}
      viewport={{ once: true }}
      style={{
        background: expanded ? "var(--surface3)" : "var(--surface2)",
        border: `1px solid ${expanded ? "var(--border-glow)" : "var(--border2)"}`,
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 16,
        transition: "all 0.3s",
      }}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: "24px 32px", display: "flex", alignItems: "flex-start", gap: 24, cursor: "pointer" }}
      >
        <div
          style={{
            padding: "6px 12px",
            borderRadius: 4,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.05em",
            color: severityColorMap[severity] || "var(--text2)",
            background: severityBgMap[severity] || "rgba(255,255,255,0.05)",
            minWidth: 80,
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          {severity}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            {f.plainEnglish || f.message || f.id}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text3)", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>ID: {f.id}</span>
            <span>Est. time: {f.estimatedTime || "5 minutes"}</span>
          </div>
        </div>
        <div style={{ color: "var(--text3)", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
          v
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <Motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ width: "100%", overflow: "hidden" }}
          >
            <div style={{ padding: "0 32px 32px", borderTop: "1px solid var(--border2)", marginTop: 16, paddingTop: 24 }}>
              <div
                style={{
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                How to fix it:
              </div>
              {Array.isArray(f.steps) && f.steps.length ? (
                <ol style={{ paddingLeft: 20, color: "var(--text2)" }}>
                  {f.steps.map((step) => (
                    <li key={step} style={{ marginBottom: 12, lineHeight: 1.6 }}>
                      {step}
                    </li>
                  ))}
                </ol>
              ) : (
                <div style={{ color: "var(--text2)" }}>No fix steps were returned.</div>
              )}
              {f.codeSnippet ? (
                <pre style={{ marginTop: 16, padding: 14, borderRadius: 8, background: "var(--bg2)", overflowX: "auto", color: "var(--text3)" }}>
                  <code>{f.codeSnippet}</code>
                </pre>
              ) : null}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}
