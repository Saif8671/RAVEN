import { useState } from "react";
import { AnimatePresence } from "framer-motion";

// Components
import Nav from "./components/Nav";

// Pages
import { PAGES } from "./constants/navigation";
import { HomePage } from "./pages/HomePage";
import { PasswordPage } from "./pages/PasswordPage";
import { VulnerabilityPage } from "./pages/VulnerabilityPage";
import { EmailSecurityPage } from "./pages/EmailSecurityPage";
import { BreachPage } from "./pages/BreachPage";
import { PhishingPage } from "./pages/PhishingPage";
import { IncidentPage } from "./pages/IncidentPage";
import { PhishingAwarenessPage } from "./pages/PhishingAwarenessPage";
import { PolicyPage } from "./pages/PolicyPage";

import "./styles/global.css";
import "./styles/features.css";

function getInitialRoute() {
  if (typeof window === "undefined") {
    return { page: PAGES.HOME, awarenessTemplate: null };
  }

  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get("page");
  const templateParam = params.get("templateId");

  if (pageParam === "phishing-awareness") {
    return { page: PAGES.PHISHING_AWARENESS, awarenessTemplate: templateParam };
  }

  return { page: PAGES.HOME, awarenessTemplate: null };
}

export default function App() {
  const initialRoute = getInitialRoute();
  const [page, setPage] = useState(initialRoute.page);
  const [awarenessTemplate] = useState(initialRoute.awarenessTemplate);

  const pageComponents = {
    [PAGES.HOME]:           <HomePage          key={PAGES.HOME}           setPage={setPage} />,
    [PAGES.PASSWORD]:       <PasswordPage      key={PAGES.PASSWORD} />,
    [PAGES.SCANNER]:        <VulnerabilityPage key={PAGES.SCANNER} />,
    [PAGES.EMAIL_SECURITY]: <EmailSecurityPage key={PAGES.EMAIL_SECURITY} />,
    [PAGES.BREACH]:         <BreachPage        key={PAGES.BREACH} />,
    [PAGES.PHISHING]:       <PhishingPage      key={PAGES.PHISHING} />,
    [PAGES.INCIDENT]:       <IncidentPage      key={PAGES.INCIDENT} />,
    [PAGES.PHISHING_AWARENESS]: <PhishingAwarenessPage key={PAGES.PHISHING_AWARENESS} templateId={awarenessTemplate} />,
    [PAGES.POLICY]:         <PolicyPage        key={PAGES.POLICY} />,
  };

  return (
    <>
      <Nav page={page} setPage={setPage} />
      <AnimatePresence mode="wait">{pageComponents[page]}</AnimatePresence>
    </>
  );
}
