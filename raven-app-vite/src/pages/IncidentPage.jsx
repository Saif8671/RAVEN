import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import { AIChatBot } from "../components/AIChatBot";
import { getIncidentTypes, getIncidentPlaybook, diagnoseIncident } from "../services/api";

const SEVERITY_COLOR = { Critical: "var(--threat)", High: "#f97316", Medium: "var(--gold)" };
const SEVERITY_BG = { Critical: "rgba(255,180,171,0.06)", High: "rgba(249,115,22,0.06)", Medium: "rgba(255,220,168,0.06)" };

const SYMPTOM_OPTIONS = [
  { id: "files_encrypted", label: "Files have been encrypted / renamed", icon: "🔐" },
  { id: "ransom_note", label: "Ransom note appeared on screen", icon: "💀" },
  { id: "data_stolen", label: "Data appears to have been stolen", icon: "📤" },
  { id: "unusual_login", label: "Unusual login activity detected", icon: "🚨" },
  { id: "account_compromised", label: "An account has been taken over", icon: "🔓" },
  { id: "slow_computer", label: "Computer is unusually slow", icon: "🐢" },
  { id: "pop_ups", label: "Unexpected pop-ups / ads appearing", icon: "💬" },
  { id: "unknown_emails_sent", label: "Emails sent from your account you didn't write", icon: "📨" },
];

const INCIDENT_ICONS = {
  ransomware: "💀",
  data_breach: "📤",
  phishing_attack: "🎣",
  malware: "🦠",
};

function IncidentTypeCard({ incident, selected, onClick }) {
  const color = SEVERITY_COLOR[incident.severity] || "var(--text3)";
  return (
    <GlowCard>
      <div
        className={`feat-incident-type-card ${selected ? "selected" : ""}`}
        onClick={onClick}
        style={selected ? { borderColor: `${color}60`, background: SEVERITY_BG[incident.severity] } : {}}
      >
        <div className="feat-incident-type-card__icon">{INCIDENT_ICONS[incident.id] || "⚠"}</div>
        <div className="feat-incident-type-card__name">{incident.name}</div>
        <div className="feat-incident-type-card__severity" style={{ color }}>{incident.severity}</div>
      </div>
    </GlowCard>
  );
}

function PlaybookPhase({ phase, index }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="feat-phase-card"
    >
      <div className="feat-phase-card__header">
        <span className="feat-phase-card__num">Phase {index + 1}</span>
        <span className="feat-phase-card__name">{phase.phase}</span>
      </div>
      <ul className="feat-phase-card__actions">
        {phase.actions.map((action, i) => (
          <li key={i} className="feat-phase-card__action">
            <span className="feat-phase-card__bullet">›</span>
            {action}
          </li>
        ))}
      </ul>
    </Motion.div>
  );
}

export function IncidentPage() {
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [playbook, setPlaybook] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);
  const [loadingPlaybook, setLoadingPlaybook] = useState(false);
  const [loadingDiagnose, setLoadingDiagnose] = useState(false);
  const [mode, setMode] = useState("browse"); // browse | diagnose

  useEffect(() => {
    getIncidentTypes().then(setIncidentTypes).catch(() => {});
  }, []);

  const loadPlaybook = async (type) => {
    setSelectedType(type);
    setPlaybook(null);
    setLoadingPlaybook(true);
    try {
      const data = await getIncidentPlaybook(type);
      setPlaybook(data);
    } catch (error) {
      console.error("Failed to load incident playbook:", error);
      setPlaybook(null);
    } finally {
      setLoadingPlaybook(false);
    }
  };

  const handleDiagnose = async () => {
    if (symptoms.length === 0) return;
    setLoadingDiagnose(true);
    setDiagnosis(null);
    try {
      const data = await diagnoseIncident(symptoms);
      setDiagnosis(data);
      setSelectedType(data.diagnosedType);
      setPlaybook(data.playbook);
    } catch (error) {
      console.error("Failed to diagnose incident:", error);
    } finally {
      setLoadingDiagnose(false);
    }
  };

  const toggleSymptom = (id) => {
    setSymptoms((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="feat-page">
      <div className="feat-hero">
        <div className="section-label">Incident Response</div>
        <h1 className="feat-hero__title">
          Under Attack? <span>Act Fast.</span>
        </h1>
        <p className="feat-hero__copy">
          Get an instant, plain-English response playbook for any cyber incident. Don't panic — follow the steps.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="feat-mode-toggle">
        <button className={`feat-mode-btn ${mode === "browse" ? "active" : ""}`} onClick={() => setMode("browse")}>
          Browse Playbooks
        </button>
        <button className={`feat-mode-btn ${mode === "diagnose" ? "active" : ""}`} onClick={() => setMode("diagnose")}>
          🤔 Diagnose My Incident
        </button>
      </div>

      <AnimatePresence mode="wait">

        {mode === "diagnose" && (
          <Motion.div key="diagnose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="feat-section-head">
              <div className="section-label">Symptom Checker</div>
              <h2 className="feat-section-title">What are you experiencing?</h2>
            </div>

            <GlowCard className="feat-symptom-grid-wrap">
              <div className="feat-symptom-grid">
                {SYMPTOM_OPTIONS.map((s) => (
                  <label key={s.id} className={`feat-symptom-item ${symptoms.includes(s.id) ? "checked" : ""}`}>
                    <input
                      type="checkbox"
                      checked={symptoms.includes(s.id)}
                      onChange={() => toggleSymptom(s.id)}
                      style={{ display: "none" }}
                    />
                    <span className="feat-symptom-item__icon">{s.icon}</span>
                    <span className="feat-symptom-item__label">{s.label}</span>
                    {symptoms.includes(s.id) && <span className="feat-symptom-item__check">✓</span>}
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <button
                  className="btn-primary feat-scan-btn"
                  onClick={handleDiagnose}
                  disabled={loadingDiagnose || symptoms.length === 0}
                >
                  {loadingDiagnose ? <span className="feat-spinner" /> : "Diagnose Incident →"}
                </button>
              </div>
            </GlowCard>

            {diagnosis && (
              <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <GlowCard className="feat-diagnosis-banner">
                  <div className="feat-diagnosis-banner__label">Most Likely Incident Type</div>
                  <div className="feat-diagnosis-banner__type">
                    {INCIDENT_ICONS[diagnosis.diagnosedType]} {playbook?.name || diagnosis.diagnosedType}
                  </div>
                  <div className="feat-diagnosis-banner__confidence">Confidence: {diagnosis.confidence}</div>
                </GlowCard>
              </Motion.div>
            )}
          </Motion.div>
        )}

        {mode === "browse" && (
          <Motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="feat-section-head">
              <div className="section-label">Incident Types</div>
              <h2 className="feat-section-title">Select your incident type</h2>
            </div>
            <div className="feat-incident-types-grid">
              {incidentTypes.map((t) => (
                <IncidentTypeCard
                  key={t.id}
                  incident={t}
                  selected={selectedType === t.id}
                  onClick={() => loadPlaybook(t.id)}
                />
              ))}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Playbook */}
      <AnimatePresence>
        {(playbook || loadingPlaybook) && (
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="feat-playbook"
          >
            {loadingPlaybook ? (
              <div className="feat-loading">Loading playbook...</div>
            ) : playbook && (
              <>
                <div className="feat-playbook-header">
                  <div className="section-label">Response Playbook</div>
                  <h2 className="feat-section-title">
                    {INCIDENT_ICONS[selectedType]} {playbook.name}
                    <span className="feat-playbook-severity" style={{ color: SEVERITY_COLOR[playbook.severity] }}>
                      {playbook.severity}
                    </span>
                  </h2>
                </div>

                <div className="feat-phases">
                  {playbook.steps.map((phase, i) => (
                    <PlaybookPhase key={i} phase={phase} index={i} />
                  ))}
                </div>

                {playbook.contacts && (
                  <GlowCard className="feat-contacts-card">
                    <div className="section-label">Emergency Contacts</div>
                    <div className="feat-contacts-list">
                      {playbook.contacts.map((c) => (
                        <div key={c} className="feat-contact-item">
                          <span className="feat-contact-item__icon">📞</span>
                          {c}
                        </div>
                      ))}
                    </div>
                  </GlowCard>
                )}
              </>
            )}
          </Motion.div>
        )}
      </AnimatePresence>

      {!selectedType && !loadingPlaybook && mode === "browse" && (
        <div className="feat-placeholder">
          <div className="feat-placeholder__icon">🛡️</div>
          <div className="feat-placeholder__text">Select an incident type to view the response playbook</div>
        </div>
      )}

      {/* AI Chat Bot */}
      <AIChatBot />
    </Motion.div>
  );
}
