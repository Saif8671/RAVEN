import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import { getPolicies, getPolicy } from "../services/api";

export function PolicyPage() {
  const [policies, setPolicies] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [currentPolicy, setCurrentPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [policyLoading, setPolicyLoading] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const data = await getPolicies();
      setPolicies(data);
    } catch (e) {
      console.error("Failed to fetch policies:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (id) => {
    setSelectedId(id);
    setPolicyLoading(true);
    try {
      const data = await getPolicy(id);
      setCurrentPolicy(data);
    } catch (e) {
      console.error("Failed to fetch policy detail:", e);
    } finally {
      setPolicyLoading(false);
    }
  };

  return (
    <Motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }} 
      className="feat-page"
    >
      <div className="feat-hero">
        <div className="section-label">Policy Generator</div>
        <h1 className="feat-hero__title">
          Small Business <span>Security Governance</span>
        </h1>
        <p className="feat-hero__copy">
          Generate professional security policies for your employees. Choose a template below to get started.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", marginTop: "40px" }}>
        {/* Policy List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {loading ? (
            <div className="feat-spinner" />
          ) : (
            policies.map((p) => (
              <GlowCard 
                key={p.id} 
                className={`feat-policy-item ${selectedId === p.id ? "active" : ""}`}
                style={{ 
                  cursor: "pointer", 
                  padding: "20px",
                  border: selectedId === p.id ? "1px solid var(--accent)" : "1px solid rgba(255,255,255,0.05)"
                }}
                onClick={() => handleSelect(p.id)}
              >
                <h3 style={{ margin: "0 0 8px 0", color: "var(--text1)" }}>{p.name}</h3>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text3)", lineHeight: "1.4" }}>
                  {p.description}
                </p>
              </GlowCard>
            ))
          )}
        </div>

        {/* Policy Content */}
        <div>
          <GlowCard style={{ minHeight: "500px", padding: "40px" }}>
            <AnimatePresence mode="wait">
              {policyLoading ? (
                <Motion.div 
                  key="loader"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}
                >
                  <div className="feat-spinner" />
                </Motion.div>
              ) : currentPolicy ? (
                <Motion.div 
                  key={currentPolicy.id}
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <h2 style={{ margin: 0, color: "var(--accent)" }}>{currentPolicy.name}</h2>
                    <button 
                      className="btn-primary" 
                      onClick={() => window.print()}
                      style={{ padding: "8px 16px", fontSize: "0.8rem" }}
                    >
                      Print / Save PDF
                    </button>
                  </div>
                  <div 
                    className="feat-policy-content"
                    style={{ color: "var(--text2)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}
                  >
                    {currentPolicy.content.replace(/\[Your Company Name\]/g, "YOUR BUSINESS")}
                  </div>
                </Motion.div>
              ) : (
                <Motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "400px", color: "var(--text3)" }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📄</div>
                  <p>Select a policy template from the left to preview</p>
                </Motion.div>
              )}
            </AnimatePresence>
          </GlowCard>
        </div>
      </div>
    </Motion.div>
  );
}
