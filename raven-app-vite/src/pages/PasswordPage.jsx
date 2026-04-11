import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { checkPassword } from "../services/api";
import "../styles/PasswordElite.css";

const STATUS_THEMES = {
  INERT: { color: '#a3abc0', fill: '0%' },
  CRITICAL: { color: '#ff7166', fill: '15%' },
  VULNERABLE: { color: '#ff9966', fill: '35%' },
  VIBRANT: { color: '#e7ffd9', fill: '60%' },
  SECURE: { color: '#c1fffe', fill: '85%' },
  ELITE: { color: '#2ff801', fill: '100%' },
  COMPROMISED: { color: '#ff7166', fill: '10%' }
};

export function PasswordPage() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheck = async (val) => {
    setPassword(val);
    if (!val) {
      setResult(null);
      return;
    }

    try {
      const data = await checkPassword({ password: val });
      setResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  const status = result?.advanced?.status || "INERT";
  const theme = STATUS_THEMES[status] || STATUS_THEMES.INERT;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="elite-page"
    >
      <div className="elite-container">
        <header className="elite-header">
          <div className="elite-subtitle">Secure Encryption Interface</div>
          <h1 className="elite-title">Security Scanner </h1>
          <h1 className="elite-title">Security Scanner </h1>
        </header>

        <main className="elite-glass-card">
          <div className="elite-input-section">
            <div className="elite-input-wrapper">
              <input
                type={visible ? "text" : "password"}
                className="elite-input"
                placeholder="Initialize security sequence..."
                spellCheck="false"
                value={password}
                onChange={(e) => handleCheck(e.target.value)}
              />
              <div className="elite-input-line"></div>
              <button
                className="elite-toggle-btn"
                onClick={() => setVisible(!visible)}
                type="button"
              >
                {visible ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>

            <AnimatePresence>
              {result?.isBreached && (
                <Motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="elite-breach-alert"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  <span>CRITICAL: Signature detected in {result.breachCount.toLocaleString()} known deep-web data breaches.</span>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="elite-dashboard">
            <div className="elite-main-status">
              <div className="elite-label-header">Current Strength</div>
              <div className="elite-strength-label" style={{ color: theme.color }}>{status}</div>
              <div className="elite-liquid-meter">
                <div
                  className="elite-liquid-fill"
                  style={{
                    width: result ? `${result.advanced.percent}%` : '0%',
                    background: theme.color,
                    boxShadow: `0 0 15px ${theme.color}66`
                  }}
                ></div>
              </div>
            </div>

            <div className="elite-metrics-grid">
              <div className="elite-metric-card">
                <div className="elite-metric-label">Shannon Entropy</div>
                <div className="elite-metric-value">{result?.advanced?.entropy || "0.00"}</div>
                <div className="elite-metric-sub">bits/char</div>
              </div>
              <div className="elite-metric-card">
                <div className="elite-metric-label">Crack Forecast</div>
                <div className="elite-metric-value">{result?.advanced?.crackForecast || "INSTANT"}</div>
                <div className="elite-metric-sub">RTX 5090 Cluster</div>
              </div>
              <div className="elite-metric-card">
                <div className="elite-metric-label">Guesser Index</div>
                <div className="elite-metric-value">{result?.advanced?.guessProbability || "0.000"}</div>
                <div className="elite-metric-sub">ML Probability</div>
              </div>
              <div className="elite-metric-card">
                <div className="elite-metric-label">Byte Length</div>
                <div className="elite-metric-value">{result?.advanced?.byteLength || "0"}</div>
                <div className="elite-metric-sub">UTF-8 Encoded</div>
              </div>
            </div>
          </div>

          <div className="elite-policy-section">
            <div className="elite-label-header elite-policy-header">Security Requirements</div>
            <div className="elite-policy-grid">
              <div className={`elite-policy-item ${result?.advanced?.policies?.length ? 'met' : ''}`}>
                <div className="elite-policy-dot"></div>
                <span>12+ Complexity Length</span>
              </div>
              <div className={`elite-policy-item ${result?.advanced?.policies?.casing ? 'met' : ''}`}>
                <div className="elite-policy-dot"></div>
                <span>Casing Divergence</span>
              </div>
              <div className={`elite-policy-item ${result?.advanced?.policies?.numeric ? 'met' : ''}`}>
                <div className="elite-policy-dot"></div>
                <span>Numerical Sequence</span>
              </div>
              <div className={`elite-policy-item ${result?.advanced?.policies?.symbols ? 'met' : ''}`}>
                <div className="elite-policy-dot"></div>
                <span>Symbolic High-Bit</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="elite-footer">
          ADVANCED BIOMETRIC & CRYPTOGRAPHIC SIMULATOR v24.1.0 | ENCRYPTED LOCAL CHANNEL
        </footer>
      </div>
    </Motion.div>
  );
}
