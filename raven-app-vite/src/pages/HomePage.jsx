import { motion as Motion } from "framer-motion";
import { Ticker } from "../components/Ticker";
import { GlowCard } from "../components/GlowCard";
import { PAGES } from "../constants/navigation";

export function HomePage({ setPage }) {
  const crisisStats = [
    { label: "Small businesses attacked in 2025", value: "80%", detail: "suffered at least one cyberattack" },
    { label: "Attack frequency", value: "11 sec", detail: "one attack every 11 seconds globally" },
    { label: "Average breach cost", value: "$120K", detail: "per incident for SMBs" },
    { label: "AI-driven attacks", value: "41%", detail: "of SMB incidents in 2025 were AI-powered" },
    { label: "Phishing emails per day", value: "3.4B", detail: "sent daily in 2025" },
      <section className="home-section home-crisis">
        <div className="home-section__head">
          <div className="section-label">Crisis in Numbers</div>
          <h2 className="home-section__title">The small-business threat is constant, expensive, and increasingly automated.</h2>
          <p className="home-section__copy">
            These numbers explain why RAVEN exists: most small businesses are under-protected, under-staffed, and facing attacks that never sleep.
          </p>
        </div>

        <div className="home-crisis-grid">
          {crisisStats.map((stat) => (
            <GlowCard key={stat.label}>
              <div className="home-crisis-card">
                <div className="home-crisis-card__value">{stat.value}</div>
                <div className="home-crisis-card__label">{stat.label}</div>
                <div className="home-crisis-card__detail">{stat.detail}</div>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      <section className="home-section home-value">
        <div className="home-value__inner">
          <div className="section-label">Always-on defense</div>
          <h2 className="home-section__title">RAVEN is a 24/7 autonomous AI security guardian for small businesses.</h2>
          <p className="home-section__copy home-value__copy">
            It scans, explains, fixes, monitors, and educates. Instead of handing you a cryptic report and disappearing,
            RAVEN keeps working in the background and turns security into an ongoing service.
          </p>
          <div className="home-pill-row">
            {["Scans", "Explains", "Fixes", "Monitors", "Educates"].map((label) => (
              <span key={label} className="home-pill">
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-features">
        <div className="section-label">What RAVEN does</div>
        <h2 className="home-section__title home-features__title">Everything a security team does. Automated.</h2>
        <div className="home-feature-grid">
          {features.map((feature) => (
            <GlowCard key={feature.num}>
              <div className="home-feature-card">
                <div className="home-feature-card__num">{feature.num}</div>
                <div className="home-feature-card__title">{feature.title}</div>
                <p className="home-feature-card__desc">{feature.desc}</p>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>
    </Motion.div>
  );
}
