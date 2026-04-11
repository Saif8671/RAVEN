import { useState } from "react";
import { AnimatePresence } from "framer-motion";

// Components
import { Nav } from "./components/Nav";

// Pages
import { PAGES } from "./constants/navigation";
import { HomePage } from "./pages/HomePage";
import { PasswordPage } from "./pages/PasswordPage";

import "./styles/global.css";

export default function App() {
  const [page, setPage] = useState(PAGES.HOME);

  const pageComponents = {
    [PAGES.HOME]: <HomePage key={PAGES.HOME} setPage={setPage} />,
    [PAGES.PASSWORD]: <PasswordPage key={PAGES.PASSWORD} />,
  };

  return (
    <>
      <Nav page={page} setPage={setPage} />
      <AnimatePresence mode="wait">{pageComponents[page]}</AnimatePresence>
    </>
  );
}
