import { motion as Motion } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import { AlertTriangle, ShieldCheck, Eye } from "lucide-react";
import { PHISHING_TEMPLATE_INFO } from "../constants/phishingTemplates";

export function PhishingAwarenessPage({ templateId }) {
  const info = PHISHING_TEMPLATE_INFO[templateId] || PHISHING_TEMPLATE_INFO.it_password_reset;

  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="feat-page awareness-page"
      style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "60px 20px" }}
    >
      <div style={{ marginBottom: 40 }}>
        <div className="severity-badge threat" style={{ margin: "0 auto 20px" }}>
          <AlertTriangle size={24} />
          <span>Security Alert</span>
        </div>
        <h1 className="feat-hero__title" style={{ fontSize: "2.5rem" }}>
          Wait! This was a <span>Phishing Test</span>
        </h1>
        <p className="feat-hero__copy" style={{ fontSize: "1.2rem", maxWidth: "100%" }}>
          If this had been a real attack, your credentials or company data could have been stolen.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, textAlign: "left" }}>
        <GlowCard>
          <div className="section-label" style={{ color: "var(--threat)" }}>
            Education
          </div>
          <h3 style={{ marginTop: 8, fontSize: "1.4rem" }}>What just happened?</h3>
          <p style={{ color: "var(--text-dim)", marginTop: 12, lineHeight: 1.6 }}>
            You received a simulated phishing email as part of your company's security awareness training.
            By clicking the link, you've helped identify a learning opportunity.
          </p>
          <div
            style={{
              marginTop: 20,
              padding: 16,
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: 8,
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--threat)", fontWeight: "bold" }}>
              <Eye size={18} />
              Simulation Template: {info.name}
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <div className="section-label" style={{ color: "var(--teal)" }}>
            Training
          </div>
          <h3 style={{ marginTop: 8, fontSize: "1.4rem" }}>Red Flags You Missed</h3>
          <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
            {info.redFlags.map((flag, i) => (
              <li key={i} style={{ marginBottom: 16, display: "flex", gap: 12 }}>
                <div style={{ color: "var(--threat)", flexShrink: 0 }}>•</div>
                <span style={{ color: "var(--text-light)" }}>{flag}</span>
              </li>
            ))}
          </ul>
        </GlowCard>
      </div>

      <GlowCard style={{ marginTop: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(20, 184, 166, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--teal)",
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <div style={{ textAlign: "left" }}>
            <h4 style={{ fontSize: "1.2rem", marginBottom: 4 }}>How to stay safe</h4>
            <p style={{ color: "var(--text-dim)" }}>
              Always check the sender's email address, hover over links before clicking, and report suspicious
              emails to IT.
            </p>
          </div>
        </div>
      </GlowCard>

      <div style={{ marginTop: 40 }}>
        <button className="btn-ghost" onClick={() => (window.location.href = "/")}>
          Return to Dashboard
        </button>
      </div>
    </Motion.div>
  );
}

