import { motion as Motion } from "framer-motion";

export function Nav({ page, setPage }) {
  return (
    <Motion.nav className="nav">
      <div className="nav-logo" onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px var(--accent)", animation: "pulse 2s infinite" }} />
        <span style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em", color: "var(--text)" }}>RAVEN</span>
      </div>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {["home", "scan", "incident"].map(p => (
          <button 
            key={p}
            onClick={() => setPage(p)}
            style={{
              fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500,
              color: page === p ? "var(--text)" : "var(--text2)", cursor: "pointer", 
              border: "none", background: "none", transition: "color 0.2s",
              textTransform: "capitalize"
            }}
          >
            {p === "incident" ? "Incident Response" : p}
          </button>
        ))}
        <button className="btn-ghost" style={{ padding: "10px 24px" }} onClick={() => setPage("scan")}>
          Scan Your Business Free
        </button>
      </div>
    </Motion.nav>
  );
}
