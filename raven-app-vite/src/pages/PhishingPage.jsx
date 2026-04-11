import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import { getPhishingTemplates, createPhishingCampaign, getCampaignResults } from "../services/api";

const DIFFICULTY_COLOR = {
  Easy: "var(--teal)",
  Medium: "var(--gold)",
  Hard: "var(--threat)",
};

function TemplateCard({ template, selected, onSelect }) {
  return (
    <GlowCard>
      <div
        className={`feat-phish-template ${selected ? "selected" : ""}`}
        onClick={() => onSelect(template.id)}
      >
        <div className="feat-phish-template__header">
          <div className="feat-phish-template__name">{template.name}</div>
          <span
            className="feat-phish-badge"
            style={{ color: DIFFICULTY_COLOR[template.difficulty], borderColor: `${DIFFICULTY_COLOR[template.difficulty]}40` }}
          >
            {template.difficulty}
          </span>
        </div>
        <div className="feat-phish-template__category">{template.category}</div>
        {selected && <div className="feat-phish-template__selected-indicator">✓ Selected</div>}
      </div>
    </GlowCard>
  );
}

function StatBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="feat-stat-bar">
      <div className="feat-stat-bar__header">
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div className="feat-stat-bar__track">
        <div className="feat-stat-bar__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function PhishingPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [results, setResults] = useState(null);
  const [step, setStep] = useState("select"); // select | configure | results

  useEffect(() => {
    getPhishingTemplates()
      .then(setTemplates)
      .catch(() => {});
  }, []);

  const handleLaunch = async () => {
    const emails = emailInput.split(",").map((e) => e.trim()).filter(Boolean);
    if (!selectedId || emails.length === 0) {
      setError("Select a template and enter at least one email.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const camp = await createPhishingCampaign({
        templateId: selectedId,
        targetEmails: emails,
        companyName: companyName || "Your Company",
      });
      setCampaign(camp);
      // Immediately fetch results (simulated)
      const res = await getCampaignResults(camp.campaignId);
      setResults(res);
      setStep("results");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedId);

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="feat-page">
      <div className="feat-hero">
        <div className="section-label">Phishing Simulation</div>
        <h1 className="feat-hero__title">
          Train Your Team Against <span>Social Engineering</span>
        </h1>
        <p className="feat-hero__copy">
          Launch realistic phishing simulations to identify which employees are vulnerable and build a security-aware culture.
        </p>
      </div>

      {/* Step tabs */}
      <div className="feat-steps">
        {[["select", "1. Choose Template"], ["configure", "2. Configure"], ["results", "3. Results"]].map(([s, label]) => (
          <div key={s} className={`feat-step-tab ${step === s ? "active" : ""}`}>{label}</div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {step === "select" && (
          <Motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="feat-section-head">
              <div className="section-label">Templates</div>
              <h2 className="feat-section-title">Select a phishing scenario</h2>
            </div>
            <div className="feat-phish-grid">
              {templates.map((t) => (
                <TemplateCard key={t.id} template={t} selected={selectedId === t.id} onSelect={setSelectedId} />
              ))}
            </div>
            {selectedId && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
                <button className="btn-primary" onClick={() => setStep("configure")}>
                  Configure Campaign →
                </button>
              </div>
            )}
          </Motion.div>
        )}

        {step === "configure" && (
          <Motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlowCard className="feat-input-card">
              <div className="feat-phish-config-header">
                <div className="section-label">Campaign Setup</div>
                <button className="btn-ghost" style={{ padding: "8px 16px" }} onClick={() => setStep("select")}>
                  ← Change Template
                </button>
              </div>

              {selectedTemplate && (
                <div className="feat-phish-selected-tag">
                  Using: <strong>{selectedTemplate.name}</strong>
                  <span className="feat-phish-badge" style={{ marginLeft: 12, color: DIFFICULTY_COLOR[selectedTemplate.difficulty], borderColor: `${DIFFICULTY_COLOR[selectedTemplate.difficulty]}40` }}>
                    {selectedTemplate.difficulty}
                  </span>
                </div>
              )}

              <div className="feat-field">
                <label className="feat-field-label">Company Name</label>
                <input
                  className="feat-input"
                  placeholder="Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="feat-field" style={{ marginTop: 18 }}>
                <label className="feat-field-label">Target Emails (comma-separated)</label>
                <textarea
                  className="feat-input feat-textarea"
                  placeholder="alice@acme.com, bob@acme.com, charlie@acme.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  rows={3}
                />
              </div>

              {error && <div className="feat-error">{error}</div>}

              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <button className="btn-primary feat-scan-btn" onClick={handleLaunch} disabled={loading}>
                  {loading ? <span className="feat-spinner" /> : "Launch Simulation →"}
                </button>
              </div>
            </GlowCard>
          </Motion.div>
        )}

        {step === "results" && results && (
          <Motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            <div className={`feat-phish-awareness feat-phish-awareness--${results.awareness?.risk?.toLowerCase()}`}>
              <div className="feat-phish-awareness__risk">{results.awareness?.risk} Risk</div>
              <p className="feat-phish-awareness__msg">{results.awareness?.message}</p>
            </div>

            <GlowCard className="feat-results-panel">
              <div className="section-label">Campaign Results</div>
              <div className="feat-stats-grid">
                <div className="feat-stat-item">
                  <div className="feat-stat-item__value">{results.stats.sent}</div>
                  <div className="feat-stat-item__label">Emails Sent</div>
                </div>
                <div className="feat-stat-item">
                  <div className="feat-stat-item__value" style={{ color: "var(--gold)" }}>{results.stats.opened}</div>
                  <div className="feat-stat-item__label">Opened</div>
                </div>
                <div className="feat-stat-item">
                  <div className="feat-stat-item__value" style={{ color: "var(--threat)" }}>{results.stats.clicked}</div>
                  <div className="feat-stat-item__label">Clicked Link</div>
                </div>
                <div className="feat-stat-item">
                  <div className="feat-stat-item__value" style={{ color: "var(--teal)" }}>{results.stats.reported}</div>
                  <div className="feat-stat-item__label">Reported</div>
                </div>
              </div>

              <div style={{ marginTop: 32 }}>
                <StatBar label="Open Rate" value={results.stats.openRate} max="100%" color="var(--gold)" />
                <StatBar label="Click Rate" value={results.stats.clickRate} max="100%" color="var(--threat)" />
              </div>
            </GlowCard>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
              <button className="btn-ghost" onClick={() => { setStep("select"); setResults(null); setCampaign(null); }}>
                ← Run Another Campaign
              </button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}
