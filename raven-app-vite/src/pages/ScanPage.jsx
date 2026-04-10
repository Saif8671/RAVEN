import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import { getFallbackReport, runScan } from "../lib/api";

export function ScanPage({ setPage, setReport }) {
  const [step, setStep] = useState("form");
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [form, setForm] = useState({
    business_name: "",
    website_url: "",
    email_domain: "",
    owner_email: "",
  });
  const [agentStates, setAgentStates] = useState([
    { name: "Input Classifier", status: "pending" },
    { name: "Web Vulnerability Scanner", status: "pending" },
    { name: "Email Security Agent", status: "pending" },
    { name: "Breach Detection Agent", status: "pending" },
    { name: "Risk Scorer", status: "pending" },
    { name: "Plain English Translator", status: "pending" },
    { name: "Fix Guide Generator", status: "pending" },
    { name: "Report Compiler & Dispatcher", status: "pending" },
  ]);
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

  const startScan = async () => {
    if (!form.business_name || !form.website_url || !form.email_domain || !form.owner_email) {
      setErrorText("Please fill in all four fields before starting the scan.");
      return;
    }

    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    setStep("scanning");
    setErrorText("");
    setStatusText("Connecting to the scan backend...");

    const scanPromise = runScan(form).catch(() => getFallbackReport(form));
    const delays = [400, 600, 700, 800, 1200, 900, 800, 700];

    for (let i = 0; i < agentStates.length; i += 1) {
      // Keep the progress animation readable even while the backend runs.
      // Each step is simulated so users can see the scan moving.
      // The actual report can still resolve faster or slower.
      // eslint-disable-next-line no-await-in-loop
      await sleep(delays[i]);
      setAgentStates((prev) =>
        prev.map((a, idx) => ({
          ...a,
          status: idx < i ? "done" : idx === i ? "active" : "pending",
        }))
      );
      setStatusText(`Running ${agentStates[i].name.toLowerCase()}...`);
    }

    const report = await scanPromise;

    setAgentStates((prev) => prev.map((a) => ({ ...a, status: "done" })));
    setStatusText("Scan complete. Preparing the report...");

    if (typeof setReport === "function") {
      setReport(report);
    }

    const doneId = setTimeout(() => setPage("results"), 750);
    timerRefs.current.push(doneId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="scan-page"
    >
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
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="scan-field__input"
                  />
                </div>
              ))}
            </div>

            <div className="scan-panel__footer">
              <p className="scan-panel__helper">Press start when ready. We’ll move straight into the scan flow.</p>
              <button className="btn-primary scan-cta" onClick={startScan}>
                Start Security Scan →
              </button>
            </div>
            {(statusText || errorText) && (
              <div style={{ marginTop: 18, color: errorText ? "var(--threat)" : "var(--text3)", fontSize: 14 }}>
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
          <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 100% { transform: rotate(360deg); } }` }} />

          <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
            Scanning {form.business_name || "your business"}...
          </div>
          {statusText && <div style={{ color: "var(--text3)", marginBottom: 28, fontSize: 14 }}>{statusText}</div>}
          <div style={{ marginTop: 40, textAlign: "left" }}>
            {agentStates.map((a, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                }}
                key={i}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      a.status === "done" ? "var(--teal)" : a.status === "active" ? "var(--accent)" : "var(--text3)",
                    boxShadow:
                      a.status !== "pending" ? `0 0 10px ${a.status === "done" ? "var(--teal)" : "var(--accent)"}` : "none",
                    animation: a.status === "active" ? "pulse 1s infinite" : "none",
                  }}
                />
                <span style={{ flex: 1, color: a.status === "done" ? "var(--text)" : "var(--text2)" }}>{a.name}</span>
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.05em",
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontWeight: 500,
                    background:
                      a.status === "done"
                        ? "rgba(192,167,255,0.1)"
                        : a.status === "active"
                          ? "rgba(208,188,255,0.15)"
                          : "rgba(255,255,255,0.03)",
                    color: a.status === "done" ? "var(--teal)" : a.status === "active" ? "var(--accent)" : "var(--text3)",
                  }}
                >
                  {a.status === "done" ? "DONE" : a.status === "active" ? "RUNNING" : "WAITING"}
                </span>
              </motion.div>
            ))}
          </div>
        </GlowCard>
      )}
    </motion.div>
  );
}
