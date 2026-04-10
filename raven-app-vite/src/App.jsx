import { useState } from "react";
import { AnimatePresence } from "framer-motion";

// Components
import { Nav } from "./components/Nav";

// Pages
import { HomePage } from "./pages/HomePage";
import { ScanPage } from "./pages/ScanPage";
import { ResultsPage } from "./pages/ResultsPage";
import { IncidentPage } from "./pages/IncidentPage";
import { MOCK_REPORT } from "./data/mockData";

import "./styles/global.css";

export default function App() {
  const [page, setPage] = useState("home"); // home, scan, results, incident
  const [report, setReport] = useState(MOCK_REPORT);

  return (
    <>
      <Nav page={page} setPage={setPage} />
      <AnimatePresence mode="wait">
        {page === "home" && <HomePage key="home" setPage={setPage} />}
        {page === "scan" && <ScanPage key="scan" setPage={setPage} setReport={setReport} />}
        {page === "results" && <ResultsPage key="results" setPage={setPage} report={report} />}
        {page === "incident" && <IncidentPage key="incident" setPage={setPage} />}
      </AnimatePresence>
    </>
  );
}
