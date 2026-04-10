import { motion as Motion } from "framer-motion";
import { NAV_LINKS, PAGES } from "../lib/pages";

export function Nav({ page, setPage }) {
  return (
    <Motion.nav className="nav">
      <div className="nav-logo" onClick={() => setPage(PAGES.HOME)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px var(--accent)", animation: "pulse 2s infinite" }} />
        <span style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em", color: "var(--text)" }}>RAVEN</span>
      </div>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {NAV_LINKS.map((l) => (
          <button
            key={l.key}
            onClick={() => setPage(l.key)}
            style={{
              fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500,
              color: page === l.key ? "var(--text)" : "var(--text2)", cursor: "pointer",
              border: "none", background: "none", transition: "color 0.2s",
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
    </Motion.nav>
  );
}
