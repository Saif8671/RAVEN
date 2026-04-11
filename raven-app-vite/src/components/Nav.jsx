import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { NAV_LINKS, PAGES } from "../constants/navigation";

export function Nav({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Motion.nav className="nav" style={{ flexWrap: "wrap" }}>
      <div
        className="nav-logo"
        onClick={() => { setPage(PAGES.HOME); setMenuOpen(false); }}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
      >
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "var(--accent)", boxShadow: "0 0 10px var(--accent)",
          animation: "pulse 2s infinite",
        }} />
        <span style={{
          fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800,
          letterSpacing: "-0.04em", color: "var(--text)",
        }}>RAVEN</span>
      </div>

      {/* Desktop nav */}
      <div className="nav-links" style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        {NAV_LINKS.map((l) => (
          <button
            key={l.key}
            onClick={() => setPage(l.key)}
            style={{
              fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
              color: page === l.key ? "var(--accent)" : "var(--text2)",
              cursor: "pointer", border: "none", background: "none",
              transition: "color 0.2s", padding: "4px 0",
              borderBottom: page === l.key ? "1px solid var(--accent)" : "1px solid transparent",
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
    </Motion.nav>
  );
}
