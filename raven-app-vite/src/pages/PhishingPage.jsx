import { useEffect, useRef, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import {
  getPhishingTemplates,
  createPhishingCampaign,
  getCampaignResults,
  getPhishingCampaigns,
} from "../services/api";
import { PHISHING_TEMPLATES } from "../constants/phishingTemplates";
import { RefreshCcw, History, Send, ShieldAlert, CheckCircle, BarChart2 } from "lucide-react";

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
            style={{
              color: DIFFICULTY_COLOR[template.difficulty],
              borderColor: `${DIFFICULTY_COLOR[template.difficulty]}40`,
            }}
          >
            {template.difficulty}
          </span>
        </div>
        <div className="feat-phish-template__category">{template.category}</div>
        <div style={{ fontSize: "0.82rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
          {template.previewText}
        </div>
        {selected && <div className="feat-phish-template__selected-indicator">Selected</div>}
      </div>
    </GlowCard>
  );
}

function StatBar({ label, value, color }) {
  const pct = parseInt(value, 10) || 0;

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
  const [templates, setTemplates] = useState(PHISHING_TEMPLATES);
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [results, setResults] = useState(null);
  const [step, setStep] = useState("select");

  const pollTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([getPhishingTemplates(), getPhishingCampaigns()]).then(([templatesResult, historyResult]) => {
      if (cancelled) return;

      if (templatesResult.status === "fulfilled" && Array.isArray(templatesResult.value) && templatesResult.value.length > 0) {
        const mergedTemplates = PHISHING_TEMPLATES.map((fallback) => {
          const match = templatesResult.value.find((template) => template.id === fallback.id);
          return match ? { ...fallback, ...match } : fallback;
        });
        setTemplates(mergedTemplates);
      } else {
        setTemplates(PHISHING_TEMPLATES);
        if (templatesResult.status === "rejected") {
          console.error("Failed to load phishing templates:", templatesResult.reason);
        }
      }

      if (historyResult.status === "fulfilled" && Array.isArray(historyResult.value)) {
        setHistory(historyResult.value);
      } else if (historyResult.status === "rejected") {
        console.error("Failed to load phishing history:", historyResult.reason);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (step === "results" && campaign?.id) {
      pollTimer.current = setInterval(async () => {
        try {
          const res = await getCampaignResults(campaign.id);
          setResults(res);
        } catch (pollError) {
          console.error("Polling error:", pollError);
        }
      }, 5000);
    } else if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }

    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, [step, campaign]);

  const fetchHistory = async () => {
    setRefreshing(true);
    try {
      const hist = await getPhishingCampaigns();
      setHistory(Array.isArray(hist) ? hist : []);
    } catch (fetchError) {
      console.error("Failed to refresh phishing history:", fetchError);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLaunch = async () => {
    const emails = emailInput
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

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
      setCampaign({ id: camp.campaignId });
      const res = await getCampaignResults(camp.campaignId);
      setResults(res);
      setStep("results");
      fetchHistory();
    } catch (launchError) {
      setError(launchError.message);
    } finally {
      setLoading(false);
    }
  };

  const viewDetailedResults = async (campId) => {
    setLoading(true);
    try {
      const res = await getCampaignResults(campId);
      setCampaign({ id: campId });
      setResults(res);
      setStep("results");
    } catch {
      setError("Failed to load campaign results.");
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedId);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="feat-page"
    >
      <div className="feat-hero">
        <div className="section-label">Phishing Simulation</div>
        <h1 className="feat-hero__title">
          Train Your Team Against <span>Social Engineering</span>
        </h1>
        <p className="feat-hero__copy">
          Launch realistic phishing simulations to identify which employees are vulnerable and build a
          security-aware culture.
        </p>
      </div>

      <div className="feat-steps">
        {[["select", "1. Choose Template"], ["configure", "2. Configure"], ["results", "3. Results"]].map(
          ([s, label]) => (
            <div key={s} className={`feat-step-tab ${step === s ? "active" : ""}`}>
              {label}
            </div>
          ),
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === "select" && (
          <Motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
              <div>
                <div className="feat-section-head">
                  <div className="section-label">Templates</div>
                  <h2 className="feat-section-title">Select a phishing scenario</h2>
                </div>
                <div
                  className="feat-phish-grid"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
                >
                  {templates.map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      selected={selectedId === t.id}
                      onSelect={setSelectedId}
                    />
                  ))}
                </div>
                {selectedId && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
                    <button className="btn-primary" onClick={() => setStep("configure")}>
                      Configure Campaign
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="feat-section-head" style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="section-label">Recent Campaigns</div>
                    <button
                      className="btn-ghost"
                      onClick={fetchHistory}
                      style={{ padding: 4 }}
                      disabled={refreshing}
                    >
                      <RefreshCcw size={16} className={refreshing ? "feat-spinner" : ""} />
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {history.length === 0 ? (
                    <GlowCard style={{ textAlign: "center", padding: "40px 20px" }}>
                      <History size={32} style={{ color: "var(--text-dim)", marginBottom: 12 }} />
                      <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>No campaigns launched yet.</p>
                    </GlowCard>
                  ) : (
                    history.map((c) => (
                      <GlowCard key={c.id} style={{ padding: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: "0.9rem", color: "var(--text-light)", fontWeight: 600 }}>
                            {c.name}
                          </span>
                          <span className="feat-phish-badge" style={{ fontSize: "0.7rem" }}>
                            {c.status}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginBottom: 12 }}>
                          {c.template}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                            {c.clicks}/{c.targets} Clicked ({c.clickRate}%)
                          </div>
                          <button
                            className="btn-ghost"
                            style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                            onClick={() => viewDetailedResults(c.id)}
                          >
                            View
                          </button>
                        </div>
                      </GlowCard>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Motion.div>
        )}

        {step === "configure" && (
          <Motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlowCard className="feat-input-card">
              <div className="feat-phish-config-header">
                <div className="section-label">Campaign Setup</div>
                <button className="btn-ghost" style={{ padding: "8px 16px" }} onClick={() => setStep("select")}>
                  Back to Scenarios
                </button>
              </div>

              {selectedTemplate && (
                <div className="feat-phish-selected-tag">
                  Using: <strong>{selectedTemplate.name}</strong>
                  <span
                    className="feat-phish-badge"
                    style={{
                      marginLeft: 12,
                      color: DIFFICULTY_COLOR[selectedTemplate.difficulty],
                      borderColor: `${DIFFICULTY_COLOR[selectedTemplate.difficulty]}40`,
                    }}
                  >
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
                <span className="feat-field-hint">Used for email personalization</span>
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
                  {loading ? (
                    <span className="feat-spinner" />
                  ) : (
                    <>
                      <Send size={18} style={{ marginRight: 8 }} /> Launch Simulation
                    </>
                  )}
                </button>
              </div>
            </GlowCard>
          </Motion.div>
        )}

        {step === "results" && results && (
          <Motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 24,
              }}
            >
              <div
                className={`feat-phish-awareness feat-phish-awareness--${results.awareness?.risk?.toLowerCase()}`}
                style={{ flex: 1, marginRight: 24, marginBottom: 0 }}
              >
                <div className="feat-phish-awareness__risk">
                  {results.awareness?.risk === "High" ? (
                    <ShieldAlert size={18} style={{ marginRight: 8 }} />
                  ) : (
                    <CheckCircle size={18} style={{ marginRight: 8 }} />
                  )}
                  {results.awareness?.risk} Risk Level
                </div>
                <p className="feat-phish-awareness__msg">{results.awareness?.message}</p>
              </div>

              <GlowCard style={{ padding: 16, width: 200, textAlign: "center" }}>
                <div className="section-label">Status</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--teal)", marginTop: 8 }}>
                  {results.status === "sending" ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <RefreshCcw size={16} className="feat-spinner" /> Sending...
                    </span>
                  ) : (
                    "Completed"
                  )}
                </div>
              </GlowCard>
            </div>

            <GlowCard className="feat-results-panel">
              <div className="feat-phish-config-header">
                <div className="section-label">Live Campaign Overview</div>
                <div className="feat-field-hint">Updates every 5 seconds</div>
              </div>
              <div className="feat-stats-grid">
                <div className="feat-stat-item">
                  <div className="feat-stat-item__value">{results.stats.sent}</div>
                  <div className="feat-stat-item__label">Total Targets</div>
                </div>
                <div className="feat-stat-item">
                  <div className="feat-stat-item__value" style={{ color: "var(--gold)" }}>
                    {results.stats.opened}
                  </div>
                  <div className="feat-stat-item__label">Email Opens</div>
                </div>
                <div className="feat-stat-item">
                  <div className="feat-stat-item__value" style={{ color: "var(--threat)" }}>
                    {results.stats.clicked}
                  </div>
                  <div className="feat-stat-item__label">Link Clicks</div>
                </div>
                <div className="feat-stat-item">
                  <div className="feat-stat-item__value" style={{ color: "var(--teal)" }}>
                    {results.stats.reported}
                  </div>
                  <div className="feat-stat-item__label">Reported</div>
                </div>
              </div>

              <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                <div>
                  <StatBar label="Open Rate" value={results.stats.openRate} color="var(--gold)" />
                  <StatBar label="Click Rate" value={results.stats.clickRate} color="var(--threat)" />
                </div>
                <GlowCard style={{ background: "rgba(255,255,255,0.02)", padding: 20 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <BarChart2 size={24} style={{ color: "var(--text-dim)" }} />
                    <span style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>
                      Real-time telemetry active
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginTop: 12, lineHeight: 1.5 }}>
                    Recipient activity is tracked via encrypted unique identifiers. Clicking the link will
                    trigger immediate status updates in this dashboard.
                  </p>
                </GlowCard>
              </div>
            </GlowCard>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 24, gap: 16 }}>
              <button
                className="btn-ghost"
                onClick={() => {
                  setStep("select");
                  setResults(null);
                  setCampaign(null);
                  fetchHistory();
                }}
              >
                Dashboard
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setStep("select");
                  setSelectedId(null);
                  setResults(null);
                  setCampaign(null);
                  fetchHistory();
                }}
              >
                New Campaign
              </button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}
