import { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS, PAGES } from "../constants/navigation";
import * as Icons from "lucide-react";

export function Nav({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Motion.nav
      className={`nav ${scrolled ? "nav--scrolled" : ""}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="nav-container">
        <button
          type="button"
          className="nav-logo"
          onClick={() => { setPage(PAGES.HOME); }}
          aria-label="Go to home"
        >
          <Motion.div
            className="logo-dot"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.55, 1, 0.55],
              boxShadow: [
                "0 0 0 0 rgba(208, 188, 255, 0.0)",
                "0 0 18px 4px rgba(208, 188, 255, 0.35)",
                "0 0 0 0 rgba(208, 188, 255, 0.0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="logo-text">
            RAVEN
          </span>
        </button>

        <div className="nav-links-wrapper">
          <Motion.div
            className="nav-links"
            layout
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {NAV_LINKS.map((l, i) => {
              const IconComponent = Icons[l.icon];
              const isActive = page === l.key;

              return (
                <Motion.button
                  key={l.key}
                  type="button"
                  onClick={() => setPage(l.key)}
                  className={`nav-link ${isActive ? "active" : ""}`}
                  onHoverStart={() => setHoveredLink(l.key)}
                  onHoverEnd={() => setHoveredLink(null)}
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    delay: 0.08 + i * 0.045,
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {isActive && (
                    <Motion.span
                      layoutId="navActivePill"
                      className="active-indicator"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}

                  <AnimatePresence>
                    {hoveredLink === l.key && !isActive && (
                      <Motion.span
                        layoutId="navHoverPill"
                        className="hover-indicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      />
                    )}
                  </AnimatePresence>

                  <span className="nav-link-content">
                    {IconComponent && <IconComponent size={16} className="nav-icon" />}
                    <span className="nav-label">{l.label}</span>
                  </span>
                </Motion.button>
              );
            })}
          </Motion.div>
        </div>

        <div className="nav-status" aria-hidden="true">
          <span className="nav-status__dot" />
          Live defense console
        </div>
      </div>
    </Motion.nav>
  );
}

export default Nav;
