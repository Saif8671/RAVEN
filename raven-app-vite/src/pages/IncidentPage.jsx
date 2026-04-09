import { motion } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import { PLAYBOOK_STEPS } from "../data/mockData";

export function IncidentPage({ setPage }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ padding: "140px 80px 80px", maxWidth: 1000, margin: "0 auto" }}>
      
      <div style={{ marginBottom: 64, display: "flex", gap: 40, alignItems: "center" }}>
        <div style={{ width: 80, height: 80, background: "rgba(255, 180, 171, 0.1)", border: "2px solid var(--threat)", borderRadius: "50%", display: "flex", alignItems: "center", justify: "center", fontSize: 32 }}>🚨</div>
        <div>
          <div className="section-label" style={{ marginBottom: 8, color: "var(--threat)" }}>Emergency Protocol</div>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: 40, fontWeight: 700, margin: 0 }}>Active Incident Playbook</h1>
        </div>
      </div>

      <p style={{ fontSize: 18, color: "var(--text2)", marginBottom: 48, lineHeight: 1.6 }}>
        If you suspect a breach, time is your most important asset. Follow these steps exactly in order. Do not try to investigate the cause yourself yet — focus on containment.
      </p>

      <div style={{ position: "relative", paddingLeft: 40, borderLeft: "2px solid var(--border2)" }}>
        {PLAYBOOK_STEPS.map((step, i) => (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} key={i} style={{ position: "relative", marginBottom: 48 }}>
            <div style={{ position: "absolute", left: -41, top: 4, width: 20, height: 20, borderRadius: "50%", background: "var(--bg)", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
            </div>
            
            <GlowCard style={{ padding: 32 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 16 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.05em", padding: "6px 12px", background: "rgba(208, 188, 255, 0.1)", borderRadius: 4 }}>
                  {step.time}
                </div>
                <h3 style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 600, margin: 0 }}>{step.title}</h3>
              </div>
              <p style={{ color: "var(--text2)", lineHeight: 1.6, margin: 0, fontSize: 15 }}>{step.desc}</p>
            </GlowCard>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: 64, display: "flex", gap: 24 }}>
        <button className="btn-primary" onClick={() => setPage("scan")}>Run Compromise Scan</button>
        <button className="btn-ghost" onClick={() => setPage("home")}>Cancel</button>
      </div>
    </motion.div>
  );
}
