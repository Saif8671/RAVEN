import { useState } from "react";
import { AnimatePresence } from "framer-motion";

// Components
import { Nav } from "./components/Nav";

// Pages
import { PAGES } from "./lib/pages";
import { HomePage } from "./pages/HomePage";
import { ScanPage } from "./pages/ScanPage";
import { ResultsPage } from "./pages/ResultsPage";
import { IncidentPage } from "./pages/IncidentPage";
import { HistoryPage } from "./pages/HistoryPage";
import { PasswordPage } from "./pages/PasswordPage";
import { PhishingPage } from "./pages/PhishingPage";

import "./styles/global.css";

export default function App() {
  const [page, setPage] = useState(PAGES.HOME);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSetReport = (newReport) => {
    setReport(newReport);
    if (newReport && newReport.id) {
      setHistory((prev) => {
        const exists = prev.some((r) => r.id === newReport.id);
        if (exists) return prev;
        return [newReport, ...prev];
      });
    }
  };

  const pageComponents = {
    [PAGES.HOME]: <HomePage key={PAGES.HOME} setPage={setPage} />,
    [PAGES.SCAN]: <ScanPage key={PAGES.SCAN} setPage={setPage} setReport={handleSetReport} />,
    [PAGES.RESULTS]: <ResultsPage key={PAGES.RESULTS} setPage={setPage} report={report} />,
    [PAGES.INCIDENT]: <IncidentPage key={PAGES.INCIDENT} setPage={setPage} report={report} />,
    [PAGES.HISTORY]: <HistoryPage key={PAGES.HISTORY} setPage={setPage} setReport={handleSetReport} reports={history} />,
    [PAGES.PASSWORD]: <PasswordPage key={PAGES.PASSWORD} />,
    [PAGES.PHISHING]: <PhishingPage key={PAGES.PHISHING} />,
  };

  return (
    <>
      <Nav page={page} setPage={setPage} />
      <AnimatePresence mode="wait">{pageComponents[page]}</AnimatePresence>
    </>
  );
}
