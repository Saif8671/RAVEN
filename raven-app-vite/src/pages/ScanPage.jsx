import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import { runFullScan } from "../lib/api";

const LOADING_STEPS = [
  "Checking SSL...",
  "Scanning email security...",
  "Checking breach databases...",
  "Running AI analysis...",
  "Building your report...",
];

export function ScanPage({ setPage, setReport }) {
  const [step, setStep] = useState("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [progressIndex, setProgressIndex] = useState(0);
  const progressTimer = useRef(null);
  const [form, setForm] = useState({
    domain: "",
    email: "",
    business_name: "",
    website_url: "",
  });

  useEffect(() => {
    if (!isSubmitting) {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
        progressTimer.current = null;
      }
      return;
    }

    setProgressIndex(0);
    progressTimer.current = setInterval(() => {
      setProgressIndex((current) => Math.min(current + 1, LOADING_STEPS.length - 1));
    }, 7000);

    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
        progressTimer.current = null;
      }
    };
  }, [isSubmitting]);

  const validate = () => {
    const domain = form.domain.trim().toLowerCase();
    const email = form.email.trim().toLowerCase();
    const domainPattern = /^[a-z0-9.-]+\.[a-z]{2,}$/i;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!domainPattern.test(domain)) return "Please enter a valid domain, like example.com.";
    if (!emailPattern.test(email)) return "Please enter a valid business email address.";
    return null;
  };

  const startScan = async () => {
    const validationError = validate();
    if (validationError) {
      setErrorText(validationError);
      return;
    }

    setIsSubmitting(true);
    setStep("scanning");
    setErrorText("");
    setStatusText(LOADING_STEPS[0]);

    try {
      const payload = {
        domain: form.domain.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        business_name: form.business_name.trim(),
        website_url: form.website_url.trim(),
      };

      const progressText = ["Checking SSL...", "Scanning email security...", "Checking breach databases...", "Running AI analysis..."];
      for (let i = 0; i < progressText.length; i += 1) {
        setStatusText(progressText[i]);
        if (i < progressText.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }

      const data = await runFullScan(payload);
      setStatusText("Report ready.");

      if (typeof setReport === "function") {
        setReport(data.report);
      }

      setPage("results");
    } catch (error) {
      setStep("form");
      setErrorText(error?.message || "Failed to run scan.");
      setStatusText("");
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
        <h1 className="scan-title">Find the weak spots before attackers do.</h1>
        <p className="scan-subtitle">
          Enter your domain and business email. RAVEN will run a fast public-surface check and return a plain-English risk report.
        </p>
      </div>

      {step === "form" && (
        <GlowCard className="scan-form-wrap" style={{ width: "100%", maxWidth: 760, padding: 0 }}>
          <div className="scan-panel">
            <div className="scan-panel__header">
              <div>
                <div className="scan-panel__eyebrow">Business Intake</div>
                <h2 className="scan-panel__title">Tell us what to scan</h2>
              </div>
              <p className="scan-panel__note">
                We use your domain to check SSL, headers, exposed paths, and email protections. The email is used for breach lookup.
              </p>
            </div>

            <div className="scan-form-grid">
              {[
                { label: "Domain", key: "domain", placeholder: "northstarfoods.com" },
                { label: "Business Email", key: "email", placeholder: "owner@northstarfoods.com" },
                { label: "Business Name", key: "business_name", placeholder: "Northstar Foods" },
                { label: "Website URL", key: "website_url", placeholder: "https://northstarfoods.com" },
              ].map(({ label, key, placeholder }) => (
                <div className="scan-field" key={key}>
                  <label className="scan-field__label" htmlFor={key}>
                    {label}
                  </label>
                  <input
                    id={key}
                    value={form[key]}
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                    placeholder={placeholder}
                    className="scan-field__input"
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>

            <div className="scan-panel__footer">
              <p className="scan-panel__helper">The scan usually takes under 90 seconds, depending on public DNS and site response time.</p>
              <button className="btn-primary scan-cta" onClick={startScan} disabled={isSubmitting}>
                {isSubmitting ? "Scanning..." : "Start Security Scan ->"}
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
          <div style={{ marginBottom: 36 }}>
            <div className="section-label" style={{ justifyContent: "center" }}>
              Live scan
            </div>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: 34, marginBottom: 8 }}>Running your security checks</h2>
            <p style={{ color: "var(--text2)" }}>{statusText || LOADING_STEPS[progressIndex]}</p>
          </div>

          <div
            style={{
              width: 140,
              height: 140,
              margin: "0 auto 40px",
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

          <div
            style={{
              marginTop: 28,
              padding: "20px 24px",
              borderRadius: 12,
              border: "1px solid var(--border2)",
              background: "var(--surface2)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--text3)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Progress
            </div>
            <div style={{ color: "var(--text)", lineHeight: 1.7, fontSize: 15 }}>
              {LOADING_STEPS.map((item, index) => (
                <div key={item} style={{ opacity: index <= progressIndex ? 1 : 0.35 }}>
                  {index <= progressIndex ? "Running: " : "Waiting: "}
                  {item}
                </div>
              ))}
            </div>
          </div>
        </GlowCard>
      )}
    </Motion.div>
  );
}
