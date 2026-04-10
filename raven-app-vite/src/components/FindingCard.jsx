import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";

export function FindingCard({ f, idx }) {
  const [expanded, setExpanded] = useState(false);

  const getSevColor = (severity) =>
    severity === "Critical" ? "var(--threat)" : severity === "High" ? "#ffcc99" : severity === "Medium" ? "#fce8b2" : "var(--teal)";

  const getSevBg = (severity) =>
    severity === "Critical"
      ? "rgba(255, 180, 171, 0.15)"
      : severity === "High"
        ? "rgba(255, 204, 153, 0.1)"
        : severity === "Medium"
          ? "rgba(252, 232, 178, 0.1)"
          : "rgba(168, 240, 221, 0.1)";

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
            color: getSevColor(f.severity),
            background: getSevBg(f.severity),
            minWidth: 80,
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          {f.severity}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            {f.plain_english}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text3)", display: "flex", gap: 16 }}>
            <span>ID: {f.id}</span>
            <span>Est. time: {f.time_estimate}</span>
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
              <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                {f.fix_steps.map((step, i) => (
                  <li key={i} style={{ position: "relative", paddingLeft: 24, marginBottom: 12, color: "var(--text2)", fontSize: 15, lineHeight: 1.6 }}>
                    <span style={{ position: "absolute", left: 0, top: 8, width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
                    {step}
                  </li>
                ))}
              </ul>
              <button className="btn-ghost" style={{ marginTop: 24, padding: "12px 24px" }}>
                Mark as Fixed
              </button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}
