import { motion } from "framer-motion";
import { Ticker } from "../components/Ticker";
import { GlowCard } from "../components/GlowCard";

export function HomePage({ setPage }) {
  const crisisStats = [
    { label: "Small businesses attacked in 2025", value: "80%", detail: "suffered at least one cyberattack" },
    { label: "Attack frequency", value: "11 sec", detail: "one attack every 11 seconds globally" },
    { label: "Average breach cost", value: "$120K", detail: "per incident for SMBs" },
    { label: "AI-driven attacks", value: "41%", detail: "of SMB incidents in 2025 were AI-powered" },
    { label: "Phishing emails per day", value: "3.4B", detail: "sent daily in 2025" },
    { label: "Employee negligence", value: "95%", detail: "of breaches caused by human error" },
    { label: "No cybersecurity policy", value: "80%", detail: "have no formal security policy" },
    { label: "In-house security", value: "52%", detail: "rely on an untrained owner or employee" },
    { label: "Budget barrier", value: "37%", detail: "say cost is the biggest obstacle" },
  ];

  const features = [
    { num: "01", title: "Vulnerability Scanner", desc: "Checks SSL, headers, exposed pages, and other public weaknesses across your web presence." },
    { num: "02", title: "Email Security Check", desc: "Validates SPF, DKIM, and DMARC so attackers cannot spoof your business by email." },
    { num: "03", title: "Breach Detection", desc: "Looks for your business email domain in known breach sources and leaked credential sets." },
    { num: "04", title: "Risk Score 0-100", desc: "Turns complex findings into one simple score with clear severity bands." },
    { num: "05", title: "Plain English Report", desc: "Explains every issue in language your team can actually understand and use." },
    { num: "06", title: "Step-by-Step Fix Guide", desc: "Gives practical remediation steps in the order that reduces risk fastest." },
    { num: "07", title: "Email Report Delivery", desc: "Sends findings directly to the owner or team so nothing gets buried in a dashboard." },
    { num: "08", title: "Weekly Auto-Scan", desc: "Runs recurring checks so new issues get caught without manual follow-up." },
    { num: "09", title: "Phishing Simulation", desc: "Tests employee awareness with realistic but safe phishing exercises." },
    { num: "10", title: "Incident Response Playbook", desc: "Creates a guided response plan when you suspect compromise or active abuse." },
    { num: "11", title: "Managed Security Service", desc: "Acts like an always-on guardian for small teams that need ongoing help, not one-time advice." },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section
        className="home-hero"
      >
        <div className="home-hero__glow" />

        <motion.div variants={container} initial="hidden" animate="show" className="home-hero__content">
          <motion.div variants={item} className="section-label" style={{ marginBottom: 32 }}>
            AI Cybersecurity for Small Business
          </motion.div>
          <motion.div
            variants={item}
            className="home-acronym"
          >
            RAVEN: Real-time Automated Vulnerability & Exposure Notifier
          </motion.div>
          <motion.h1 variants={item} className="home-hero__title">
            Your silent
            <br />
            <span>guardian.</span>
            <br />
            Always watching.
          </motion.h1>
          <motion.p variants={item} className="home-hero__copy">
            RAVEN is not a one-time security checker. It is a 24/7 autonomous AI security guardian purpose-built for small businesses.
            It scans, explains, fixes, monitors, and educates, so security becomes an ongoing service instead of a one-off report.
          </motion.p>
          <motion.div variants={item} className="home-hero__actions">
            <button className="btn-primary" onClick={() => setPage("scan")}>
              Scan Your Business Free →
            </button>
            <button className="btn-ghost" onClick={() => setPage("results")}>
              View Sample Report
            </button>
          </motion.div>
        </motion.div>
      </section>

      <Ticker />

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
    </motion.div>
  );
}
