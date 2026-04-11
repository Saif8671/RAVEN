import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import { checkPassword } from "../services/api";

export function PasswordPage() {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      const data = await checkPassword({ password });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      style={{ padding: "160px 80px 80px", maxWidth: 1000, margin: "0 auto" }}
    >
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <div className="section-label" style={{ justifyContent: "center" }}>Security Tool</div>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 48, fontWeight: 800, marginBottom: 12 }}>
          Password Audit Lab
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 17 }}>
          Enter a password to check its strength and if it has appeared in known data breaches.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <GlowCard style={{ padding: 40 }}>
          <form onSubmit={handleCheck}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 10 }}>
                Test Password
              </label>
              <input 
                type="password"
                className="scan-field__input"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <button className="btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Checking..." : "Verify Security ->"}
            </button>
          </form>
        </GlowCard>

        <GlowCard style={{ padding: 40, minHeight: 400 }}>
          {!result ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", textAlign: "center" }}>
              Results will appear here <br/> after audit.
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 24, padding: 20, borderRadius: 8, background: result.isBreached ? "rgba(255, 180, 171, 0.1)" : "rgba(168, 240, 221, 0.1)", border: `1px solid ${result.isBreached ? "var(--threat)" : "var(--teal)"}` }}>
                <h4 style={{ color: result.isBreached ? "var(--threat)" : "var(--teal)", marginBottom: 4 }}>
                  {result.isBreached ? "BREACH DETECTED" : "NO BREACHES FOUND"}
                </h4>
                <p style={{ fontSize: 14 }}>
                  {result.isBreached 
                    ? `This password was found in ${result.breachCount.toLocaleString()} data leaks.` 
                    : "This password has not appeared in any known public data breaches."}
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--text3)" }}>Strength Score</span>
                  <span style={{ fontWeight: 700, color: "var(--accent)" }}>{["Weak", "Poor", "Fair", "Strong", "Excellent"][result.score]}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                  <div style={{ 
                    height: "100%", 
                    width: `${(result.score + 1) * 20}%`, 
                    background: result.score < 2 ? "var(--threat)" : result.score < 4 ? "var(--gold)" : "var(--teal)",
                    borderRadius: 2,
                    transition: "width 0.5s" 
                  }} />
                </div>
              </div>

              <div style={{ fontSize: 14, color: "var(--text2)" }}>
                <div style={{ marginBottom: 8 }}>Crack Time (Online): <strong>{result.crackTimes.online_no_throttling_10_per_second}</strong></div>
                <div>Crack Time (Offline): <strong>{result.crackTimes.offline_fast_hashing_1e10_per_second}</strong></div>
              </div>
            </div>
          )}
        </GlowCard>
      </div>
    </Motion.div>
  );
}
