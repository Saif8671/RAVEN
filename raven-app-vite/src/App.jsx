import { useState } from "react";
import { AnimatePresence } from "framer-motion";

// Components
import { Nav } from "./components/Nav";

// Pages
import { PAGES } from "./constants/navigation";
import { HomePage } from "./pages/HomePage";
import { PasswordPage } from "./pages/PasswordPage";
import { VulnerabilityPage } from "./pages/VulnerabilityPage";
import { EmailSecurityPage } from "./pages/EmailSecurityPage";
import { BreachPage } from "./pages/BreachPage";
import { PhishingPage } from "./pages/PhishingPage";
import { IncidentPage } from "./pages/IncidentPage";

import "./styles/global.css";
import "./styles/features.css";

export default function App() {
  const [page, setPage] = useState(PAGES.HOME);

  const pageComponents = {
    [PAGES.HOME]:           <HomePage          key={PAGES.HOME}           setPage={setPage} />,
    [PAGES.PASSWORD]:       <PasswordPage      key={PAGES.PASSWORD} />,
    [PAGES.SCANNER]:        <VulnerabilityPage key={PAGES.SCANNER} />,
    [PAGES.EMAIL_SECURITY]: <EmailSecurityPage key={PAGES.EMAIL_SECURITY} />,
    [PAGES.BREACH]:         <BreachPage        key={PAGES.BREACH} />,
    [PAGES.PHISHING]:       <PhishingPage      key={PAGES.PHISHING} />,
    [PAGES.INCIDENT]:       <IncidentPage      key={PAGES.INCIDENT} />,
  };

  return (
    <>
      <Nav page={page} setPage={setPage} />
      <AnimatePresence mode="wait">{pageComponents[page]}</AnimatePresence>
    </>
  );
}
