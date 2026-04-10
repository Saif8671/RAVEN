import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import { runScan } from "../lib/api";

const AGENT_TEMPLATE = [
  "Input Classifier",
  "Web Vulnerability Scanner",
  "Email Security Agent",
  "Breach Detection Agent",
  "Risk Scorer",
  "Plain English Translator",
  "Fix Guide Generator",
  "Report Compiler & Dispatcher",
];

export function ScanPage({ setPage, setReport }) {
  const [step, setStep] = useState("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [form, setForm] = useState({
    business_name: "",
    website_url: "",
    email_domain: "",
    owner_email: "",
  });
  const [agentStates, setAgentStates] = useState(
    AGENT_TEMPLATE.map((name) => ({ name, status: "pending" }))
  );
  const timerRefs = useRef([]);

  useEffect(() => {
    return () => {
      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];
    };
  }, []);

  const sleep = (ms) =>
    new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      timerRefs.current.push(id);
    });

  const resetTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  };

  const startScan = async () => {
    if (!form.business_name || !form.website_url || !form.email_domain || !form.owner_email) {
      setErrorText("Please fill in all four fields before starting the scan.");
      return;
    }

    setIsSubmitting(true);
    resetTimers();
    setStep("scanning");
    setErrorText("");
    setStatusText("Connecting to the scan backend...");
    setAgentStates(AGENT_TEMPLATE.map((name) => ({ name, status: "pending" })));

    try {
      const scanPromise = runScan(form);
      const delays = [400, 600, 700, 800, 1200, 900, 800, 700];

      for (let i = 0; i < AGENT_TEMPLATE.length; i += 1) {
        await sleep(delays[i]);
        setAgentStates((prev) =>
          prev.map((agent, index) => ({
            ...agent,
            status: index < i ? "done" : index === i ? "active" : "pending",
          }))
        );
        setStatusText(`Running ${AGENT_TEMPLATE[i].toLowerCase()}...`);
      }

      const report = await scanPromise;
      setStatusText("Backend response received. Compiling the report...");
      setAgentStates((prev) => prev.map((agent) => ({ ...agent, status: "done" })));

      if (typeof setReport === "function") {
        setReport(report);
      }

      const doneId = setTimeout(() => setPage("results"), 750);
      timerRefs.current.push(doneId);
    } catch (error) {
      setStep("form");
      setErrorText(error?.message || "Failed to run scan.");
      setStatusText("");
      setAgentStates(AGENT_TEMPLATE.map((name) => ({ name, status: "pending" })));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="scan-page">
      <div className="scan-hero">
        <div className="section-label" style={{ justifyContent: "center" }}>
          Security Audit
        </div>
        <h1 className="scan-title">Protect your business in one sweep.</h1>
        <p className="scan-subtitle">
          Share a few details and RAVEN will map out your web, email, and account exposure in under 60 seconds.
        </p>
      </div>

      {step === "form" && (
        <GlowCard className="scan-form-wrap" style={{ width: "100%", maxWidth: 760, padding: 0 }}>
          <div className="scan-panel">
            <div className="scan-panel__header">
              <div>
                <div className="scan-panel__eyebrow">Business Intake</div>
                <h2 className="scan-panel__title">Tell us who to protect</h2>
              </div>
              <p className="scan-panel__note">
                The scan uses these details to check your public site, email domain, and owner account footprint.
              </p>
            </div>

            <div className="scan-form-grid">
              {[
                { label: "Business Name", key: "business_name", placeholder: "Northstar Foods" },
                { label: "Website URL", key: "website_url", placeholder: "https://northstarfoods.com" },
                { label: "Email Domain", key: "email_domain", placeholder: "northstarfoods.com" },
                { label: "Owner Email", key: "owner_email", placeholder: "owner@northstarfoods.com" },
              ].map(({ label, key, placeholder }) => (
                <div className="scan-field" key={key}>
                  <label className="scan-field__label" htmlFor={key}>
                    {label}
                  </label>
                  <input
                    id={key}
                    value={form[key]}
                    onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="scan-field__input"
                  />
                </div>
              ))}
            </div>

            <div className="scan-panel__footer">
              <p className="scan-panel__helper">Press start when ready. We will move straight into the scan flow.</p>
              <button className="btn-primary scan-cta" onClick={startScan} disabled={isSubmitting}>
                {isSubmitting ? "Connecting..." : "Start Security Scan ->"}
              </button>
            </div>
            {(statusText || errorText) && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  marginTop: 18,
                  padding: "14px 16px",
                  borderRadius: 8,
                  border: errorText ? "1px solid rgba(255, 180, 171, 0.35)" : "1px solid rgba(208, 188, 255, 0.18)",
                  background: errorText ? "rgba(255, 180, 171, 0.08)" : "rgba(208, 188, 255, 0.06)",
                  color: errorText ? "var(--threat)" : "var(--text3)",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {errorText || statusText}
              </div>
            )}
          </div>
        </GlowCard>
      )}

      {step === "scanning" && (
        <GlowCard style={{ width: "100%", maxWidth: 680, padding: "64px 48px", textAlign: "center" }}>
          <div
            style={{
              width: 140,
              height: 140,
              margin: "0 auto 48px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(208,188,255,0.05) 0%, transparent 70%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "conic-gradient(from 0deg, transparent 70%, rgba(208, 188, 255, 0.4) 100%)",
                animation: "spin 2s linear infinite",
              }}
            />
            <div style={{ position: "absolute", inset: 2, borderRadius: "50%", background: "var(--surface)" }} />
            <div className="scan-ring" />
            <div className="scan-ring" style={{ animationDelay: "0.6s", inset: 20 }} />
            <div className="scan-ring" style={{ animationDelay: "1.2s", inset: 40 }} />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 20px var(--accent)",
                zIndex: 1,
                animation: "pulse 1.2s infinite",
              }}
            />
          </div>
          <style dangerouslySetInnerHTML={{ __html: "@keyframes spin { 100% { transform: rotate(360deg); } }" }} />

          <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
            Scanning {form.business_name || "your business"}...
          </div>
          {statusText && <div style={{ color: "var(--text3)", marginBottom: 28, fontSize: 14 }}>{statusText}</div>}
          <div style={{ marginTop: 40, textAlign: "left" }}>
            {agentStates.map((agent, index) => (
              <Motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                }}
                key={agent.name}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      agent.status === "done" ? "var(--teal)" : agent.status === "active" ? "var(--accent)" : "var(--text3)",
                    boxShadow:
                      agent.status !== "pending" ? `0 0 10px ${agent.status === "done" ? "var(--teal)" : "var(--accent)"}` : "none",
                    animation: agent.status === "active" ? "pulse 1s infinite" : "none",
                  }}
                />
                <span style={{ flex: 1, color: agent.status === "done" ? "var(--text)" : "var(--text2)" }}>{agent.name}</span>
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.05em",
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontWeight: 500,
                    background:
                      agent.status === "done"
                        ? "rgba(192,167,255,0.1)"
                        : agent.status === "active"
                          ? "rgba(208,188,255,0.15)"
                          : "rgba(255,255,255,0.03)",
                    color:
                      agent.status === "done" ? "var(--teal)" : agent.status === "active" ? "var(--accent)" : "var(--text3)",
                  }}
                >
                  {agent.status === "done" ? "DONE" : agent.status === "active" ? "RUNNING" : "WAITING"}
                </span>
              </Motion.div>
            ))}
          </div>
        </GlowCard>
      )}
    </Motion.div>
  );
}
