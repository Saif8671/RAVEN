import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { GlowCard } from "../components/GlowCard";
import { fetchPhishingQuiz } from "../services/api";

export function PhishingPage() {
  const [quiz, setQuiz] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await fetchPhishingQuiz({ industry: "General Business" });
        setQuiz(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  const handleSelect = (option) => {
    if (isAnswered) return;
    setSelected(option);
    setIsAnswered(true);
    if (option === quiz[currentIdx].correct) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  if (loading) return (
    <div style={{ padding: "200px 80px", textAlign: "center", color: "var(--text3)" }}>
      Generating AI simulation scenarios...
    </div>
  );

  if (showResult) return (
    <div style={{ padding: "160px 80px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <GlowCard style={{ padding: 60 }}>
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: 32, marginBottom: 12 }}>Training Complete</h2>
        <p style={{ color: "var(--text2)", marginBottom: 40 }}>
          You correctly identified {score} out of {quiz.length} phishing threats.
        </p>
        <div style={{ fontSize: 64, fontWeight: 800, color: "var(--accent)", marginBottom: 40 }}>
          {Math.round((score / quiz.length) * 100)}%
        </div>
        <button className="btn-primary" onClick={() => window.location.reload()}>Retake Academy</button>
      </GlowCard>
    </div>
  );

  const q = quiz[currentIdx];

  if (!q) return (
    <div style={{ padding: "200px 80px", textAlign: "center", color: "var(--text3)" }}>
      Setting up scenarios...
    </div>
  );

  return (
    <Motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      style={{ padding: "160px 80px 80px", maxWidth: 800, margin: "0 auto" }}
    >
      <div style={{ marginBottom: 48 }}>
        <div className="section-label">Employee Awareness</div>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 40, fontWeight: 800, marginBottom: 8 }}>
          Phishing Academy
        </h1>
        <p style={{ color: "var(--text2)" }}>Question {currentIdx + 1} of {quiz.length}</p>
      </div>

      <AnimatePresence mode="wait">
        <Motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <GlowCard style={{ padding: 48, marginBottom: 32 }}>
            <h3 style={{ fontFamily: "var(--font-head)", fontSize: 24, lineHeight: 1.4 }}>{q.scenario}</h3>
          </GlowCard>

          <div style={{ display: "grid", gap: 16, marginBottom: 40 }}>
            {q.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(option)}
                disabled={isAnswered}
                className="glass-panel"
                style={{
                  padding: "24px 32px",
                  textAlign: "left",
                  background: isAnswered 
                    ? option === q.correct ? "rgba(168, 240, 221, 0.1)" : selected === option ? "rgba(255, 180, 171, 0.1)" : "var(--surface2)"
                    : "var(--surface2)",
                  border: `1px solid ${isAnswered && option === q.correct ? "var(--teal)" : isAnswered && selected === option ? "var(--threat)" : "var(--border2)"}`,
                  color: isAnswered && (option === q.correct || selected === option) ? "var(--text)" : "var(--text2)",
                  cursor: isAnswered ? "default" : "pointer",
                  width: "100%"
                }}
              >
                {option}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {isAnswered && (
              <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ padding: 32, borderRadius: 12, background: "rgba(208, 188, 255, 0.05)", border: "1px solid var(--border2)", marginBottom: 32 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>Explanation</div>
                  <p style={{ color: "var(--text2)", fontSize: 15, lineHeight: 1.6 }}>{q.explanation}</p>
                </div>
                <button className="btn-primary" onClick={nextQuestion} style={{ float: "right" }}>
                  {currentIdx === quiz.length - 1 ? "Finish Academy ->" : "Next Scenario ->"}
                </button>
              </Motion.div>
            )}
          </AnimatePresence>
        </Motion.div>
      </AnimatePresence>
    </Motion.div>
  );
}
