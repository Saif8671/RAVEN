import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import { checkBreach } from "../services/api";

function BreachCard({ breach, index }) {
  return (
    <Motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="feat-breach-card"
    >
      <div className="feat-breach-card__header">
        <div className="feat-breach-card__name">{breach.name || breach.domain || "Unknown"}</div>
        {breach.breachDate && (
          <div className="feat-breach-card__date">{breach.breachDate}</div>
        )}
      </div>
      {breach.dataClasses && breach.dataClasses.length > 0 && (
        <div className="feat-breach-card__classes">
          {breach.dataClasses.map((c) => (
            <span key={c} className="feat-breach-chip">{c}</span>
          ))}
        </div>
      )}
      {breach.pwnCount && (
        <div className="feat-breach-card__count">
          {breach.pwnCount.toLocaleString()} accounts exposed
        </div>
      )}
    </Motion.div>
  );
}

function ResultBlock({ result }) {
  const isBreached = result.breached;
  const hasNote = result.note;

  return (
    <GlowCard className="feat-breach-result">
      <div className="feat-breach-result__header">
        <span className="feat-breach-result__type">{result.type === "email" ? "📧 Email" : "🌐 Domain"}</span>
        <span className="feat-breach-result__target">{result.target}</span>
        {hasNote && <span className="feat-breach-result__note">{result.note}</span>}
      </div>

      {!hasNote && (
        <div className={`feat-breach-result__verdict ${isBreached ? "breached" : "safe"}`}>
          {isBreached ? (
            <>
              <span className="feat-breach-result__icon">⚠</span>
              <span>{result.breachCount} breach{result.breachCount !== 1 ? "es" : ""} found</span>
            </>
          ) : (
            <>
              <span className="feat-breach-result__icon safe">✓</span>
              <span>No breaches found</span>
            </>
          )}
        </div>
      )}

      {result.breaches && result.breaches.length > 0 && (
        <div className="feat-breach-list">
          <div className="feat-breach-list__head">Breach Details</div>
          {result.breaches.map((b, i) => (
            <BreachCard key={i} breach={b} index={i} />
          ))}
        </div>
      )}
    </GlowCard>
  );
}

export function BreachPage() {
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    if (!email.trim() && !domain.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await checkBreach({
        email: email.trim() || undefined,
        domain: domain.trim() || undefined,
      });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalBreaches = result?.results?.reduce((sum, r) => sum + (r.breachCount || 0), 0) || 0;

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="feat-page">
      <div className="feat-hero">
        <div className="section-label">Breach Detection</div>
        <h1 className="feat-hero__title">
          Have You Been <span>Compromised?</span>
        </h1>
        <p className="feat-hero__copy">
          Cross-check your email or domain against known data breaches from thousands of security incidents worldwide.
        </p>
      </div>

      <GlowCard className="feat-input-card">
        <div className="feat-breach-inputs">
          <div className="feat-breach-field">
            <label className="feat-breach-label">Email Address</label>
            <input
              className="feat-input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            />
          </div>
          <div className="feat-breach-divider">or</div>
          <div className="feat-breach-field">
            <label className="feat-breach-label">Domain</label>
            <input
              className="feat-input"
              type="text"
              placeholder="yourcompany.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <button className="btn-primary feat-scan-btn" onClick={handleCheck} disabled={loading}>
            {loading ? <span className="feat-spinner" /> : "Check for Breaches →"}
          </button>
        </div>
        {error && <div className="feat-error">{error}</div>}
      </GlowCard>

      <AnimatePresence>
        {result && (
          <Motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="feat-results">

            {/* Summary banner */}
            <div className={`feat-breach-summary ${totalBreaches > 0 ? "danger" : "safe"}`}>
              {totalBreaches > 0 ? (
                <>
                  <div className="feat-breach-summary__count">{totalBreaches}</div>
                  <div className="feat-breach-summary__text">breach{totalBreaches !== 1 ? "es" : ""} detected</div>
                </>
              ) : (
                <>
                  <div className="feat-breach-summary__safe-icon">✓</div>
                  <div className="feat-breach-summary__text">No breaches found</div>
                </>
              )}
              <div className="feat-breach-summary__advice">{result.summary}</div>
            </div>

            {result.results.map((r, i) => (
              <ResultBlock key={i} result={r} />
            ))}

            <p className="feat-breach-disclaimer">
              Breach data powered by Have I Been Pwned. Configure <code>HIBP_API_KEY</code> in backend <code>.env</code> for real-time results.
            </p>
          </Motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="feat-placeholder">
          <div className="feat-placeholder__icon">🔎</div>
          <div className="feat-placeholder__text">Enter an email or domain to check for known data breaches</div>
        </div>
      )}
    </Motion.div>
  );
}
