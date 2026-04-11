import { motion as Motion } from "framer-motion";
import { Ticker } from "../components/Ticker";
import { GlowCard } from "../components/GlowCard";
import { PAGES } from "../constants/navigation";

export function HomePage({ setPage }) {
  const crisisStats = [
    { label: "Small businesses attacked in 2025", value: "80%", detail: "suffered at least one cyberattack" },
    { label: "Attack frequency", value: "11 sec", detail: "one attack every 11 seconds globally" },
    { label: "Average breach cost", value: "$120K", detail: "per incident for SMBs" },
    { label: "Brute-force attacks", value: "41%", detail: "of SMB incidents involve automated credential stuffing" },
  ];

  const features = [
    {
      num: "01",
      title: "Vulnerability Scanner",
      desc: "Full domain audit — SSL health, security headers, and exposed sensitive pages.",
      page: PAGES.SCANNER,
      icon: "🔍",
    },
    {
      num: "02",
      title: "Password Audit",
      desc: "Mathematical entropy analysis matching real-world AI brute-force crack times.",
      page: PAGES.PASSWORD,
      icon: "🔑",
    },
    {
      num: "03",
      title: "Email Security",
      desc: "Verify SPF, DKIM, and DMARC to prevent attackers spoofing your email domain.",
      page: PAGES.EMAIL_SECURITY,
      icon: "📧",
    },
    {
      num: "04",
      title: "Breach Detection",
      desc: "Cross-check your email or domain against thousands of known data breach databases.",
      page: PAGES.BREACH,
      icon: "🔎",
    },
    {
      num: "05",
      title: "Phishing Simulation",
      desc: "Train your team with realistic phishing campaigns and measure who's at risk.",
      page: PAGES.PHISHING,
      icon: "🎣",
    },
    {
      num: "06",
      title: "Incident Response",
      desc: "Get an instant, plain-English playbook for ransomware, data breaches, and more.",
      page: PAGES.INCIDENT,
      icon: "🛡️",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="home-hero">
        <div className="home-hero__glow" />

        <Motion.div variants={container} initial="hidden" animate="show" className="home-hero__content">
          <Motion.div variants={item} className="section-label" style={{ marginBottom: 32 }}>
            Cybersecurity for Small Business
          </Motion.div>
          <Motion.div variants={item} className="home-acronym">
            RAVEN: Real-time Automated Vulnerability &amp; Exposure Notifier
          </Motion.div>
          <Motion.h1 variants={item} className="home-hero__title">
            Your silent
            <br />
            <span>guardian.</span>
            <br />
            Always watching.
          </Motion.h1>
          <Motion.p variants={item} className="home-hero__copy">
            RAVEN gives small businesses enterprise-grade threat intelligence — scanning for vulnerabilities, detecting breaches, simulating phishing attacks, and guiding you through incident response. All in one place.
          </Motion.p>
          <Motion.div variants={item} className="home-hero__actions">
            <button className="btn-primary" onClick={() => setPage(PAGES.SCANNER)}>
              Run a Free Scan {"->"}
            </button>
            <button className="btn-ghost" onClick={() => setPage(PAGES.INCIDENT)}>
              Respond to an Incident
            </button>
          </Motion.div>
        </Motion.div>
      </section>

      <Ticker />

      <section className="home-section home-crisis">
        <div className="home-section__head">
          <div className="section-label">Crisis in Numbers</div>
          <h2 className="home-section__title">The small-business threat is constant, expensive, and increasingly automated.</h2>
          <p className="home-section__copy">
            These numbers explain why RAVEN exists: most small businesses are under-protected, under-staffed, and using poor credential hygiene.
          </p>
        </div>

        <div className="home-crisis-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
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

      <section className="home-section home-features">
        <div className="section-label">What RAVEN does</div>
        <h2 className="home-section__title home-features__title">
          Six tools. One platform. Complete protection.
        </h2>
        <div className="home-feature-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {features.map((feature, i) => (
            <GlowCard key={feature.num} delay={i * 0.05}>
              <div
                className="home-feature-card"
                onClick={() => setPage(feature.page)}
                style={{ cursor: "pointer" }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: 14 }}>{feature.icon}</div>
                <div className="home-feature-card__num">{feature.num}</div>
                <div className="home-feature-card__title">{feature.title}</div>
                <p className="home-feature-card__desc">{feature.desc}</p>
                <div style={{
                  marginTop: 20,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--accent)",
                  letterSpacing: "0.08em",
                }}>
                  Launch tool →
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>
    </Motion.div>
  );
}
