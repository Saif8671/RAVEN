import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import { checkEmailSecurity } from "../services/api";

function StatusBadge({ found, label }) {
  return (
    <div className={`feat-email-badge ${found ? "found" : "missing"}`}>
      <span className="feat-email-badge__icon">{found ? "✓" : "✕"}</span>
      <span className="feat-email-badge__label">{label}</span>
    </div>
  );
}

function RecordCard({ title, found, record, learnMore }) {
  return (
    <GlowCard>
      <div className="feat-record-card">
        <div className="feat-record-card__header">
          <span className="feat-record-card__title">{title}</span>
          <span className={`feat-record-card__status ${found ? "ok" : "missing"}`}>
            {found ? "✓ Found" : "✕ Missing"}
          </span>
        </div>
        {record ? (
          <div className="feat-record-card__value">{record}</div>
        ) : (
          <div className="feat-record-card__missing">No {title} record configured</div>
        )}
        <div className="feat-record-card__learn">{learnMore}</div>
      </div>
    </GlowCard>
  );
}

function FixStep({ step }) {
  return (
    <div className="feat-fix-card">
      <div className="feat-fix-card__priority">Step {step.priority}</div>
      <div className="feat-fix-card__title">{step.title}</div>
      <p className="feat-fix-card__desc">{step.description}</p>
      <div className="feat-fix-card__effort">Effort: {step.effort}</div>
    </div>
  );
}

export function EmailSecurityPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await checkEmailSecurity(domain.trim());
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const allOk = result && result.issues.length === 0;

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="feat-page">
      <div className="feat-hero">
        <div className="section-label">Email Security</div>
        <h1 className="feat-hero__title">
          Stop Email <span>Spoofing Attacks</span>
        </h1>
        <p className="feat-hero__copy">
          Verify your domain's SPF, DKIM, and DMARC DNS records — the three shields that prevent attackers from impersonating your business over email.
        </p>
      </div>

      <GlowCard className="feat-input-card">
        <div className="feat-input-row">
          <input
            className="feat-input"
            type="text"
            placeholder="yourdomain.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          />
          <button className="btn-primary feat-scan-btn" onClick={handleCheck} disabled={loading}>
            {loading ? <span className="feat-spinner" /> : "Check Email Security →"}
          </button>
        </div>
        {error && <div className="feat-error">{error}</div>}
      </GlowCard>

      <AnimatePresence>
        {result && (
          <Motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="feat-results">

            {/* Status badges */}
            <GlowCard className="feat-email-status-card">
              <div className="feat-email-domain">{result.domain}</div>
              <div className="feat-email-badges">
                <StatusBadge found={result.spf.found} label="SPF" />
                <StatusBadge found={result.dkim.found} label="DKIM" />
                <StatusBadge found={result.dmarc.found} label="DMARC" />
              </div>
              <div className={`feat-email-verdict ${allOk ? "ok" : "warn"}`}>
                {result.plainEnglish}
              </div>
            </GlowCard>

            {/* DNS Records */}
            <div className="feat-section-head">
              <div className="section-label">DNS Records</div>
            </div>
            <div className="feat-record-grid">
              <RecordCard
                title="SPF"
                found={result.spf.found}
                record={result.spf.record}
                learnMore="SPF tells receiving mail servers which servers are allowed to send email for your domain."
              />
              <RecordCard
                title="DKIM"
                found={result.dkim.found}
                record={result.dkim.record}
                learnMore={result.dkim.selector ? `Selector: ${result.dkim.selector}` : "DKIM cryptographically signs outgoing emails so receivers can verify authenticity."}
              />
              <RecordCard
                title="DMARC"
                found={result.dmarc.found}
                record={result.dmarc.record}
                learnMore="DMARC tells receivers what to do with emails that fail SPF/DKIM — reject, quarantine, or monitor."
              />
            </div>

            {/* Fix Steps */}
            {result.fixSteps.length > 0 && (
              <div>
                <div className="feat-section-head">
                  <div className="section-label">Fix Plan</div>
                  <h2 className="feat-section-title">How to protect your email domain</h2>
                </div>
                <div className="feat-fix-grid">
                  {result.fixSteps.map((s) => <FixStep key={s.priority} step={s} />)}
                </div>
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="feat-placeholder">
          <div className="feat-placeholder__icon">📧</div>
          <div className="feat-placeholder__text">Enter your domain to check email security configuration</div>
        </div>
      )}
    </Motion.div>
  );
}
