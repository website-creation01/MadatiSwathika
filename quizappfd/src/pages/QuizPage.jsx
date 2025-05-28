import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./QuizPage.css";

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [tempAnswers, setTempAnswers] = useState({});
  const [reviewFlags, setReviewFlags] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showGeneral, setShowGeneral] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/quizzes/${id}`).then((res) => {
      setQuiz(res.data);
    });
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (t) => {
    const m = String(Math.floor(t / 60)).padStart(2, "0");
    const s = String(t % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!quiz) return <div className="loading">Loading...</div>;

  const section = quiz.sections[currentSection];
  const questions = section.questions;
  const currentQ = questions[currentQIndex];
  const qid = currentQ.id;

  const handleOptionSelect = (val) => {
    setTempAnswers({ ...tempAnswers, [qid]: val });
  };

  const appendToNAT = (char) => {
    const prev = tempAnswers[qid] || "";
    if (char === "C") setTempAnswers({ ...tempAnswers, [qid]: "" });
    else if (char === "←") setTempAnswers({ ...tempAnswers, [qid]: prev.slice(0, -1) });
    else setTempAnswers({ ...tempAnswers, [qid]: prev + char });
  };

  const handleSaveAndNext = () => {
    const updated = { ...savedAnswers, [qid]: tempAnswers[qid] };
    setSavedAnswers(updated);
    setCurrentQIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const toggleReview = () => {
    setReviewFlags((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  const handleSubmit = () => {
    const email = localStorage.getItem("userEmail");
    axios
      .post("http://localhost:5000/api/quizzes/submit", {
        quizId: quiz.id,
        answers: savedAnswers,
        email,
      })
      .then((res) => {
        localStorage.setItem("lastResult", JSON.stringify(res.data));
        navigate("/dashboard/results");
      });
  };

  const getStatusCounts = () => {
    let a = 0, u = 0, m = 0, am = 0;
    quiz.sections.forEach((sec) =>
      sec.questions.forEach((q) => {
        const ans = savedAnswers[q.id];
        const rev = reviewFlags[q.id];
        if (rev && ans) am++;
        else if (rev) m++;
        else if (ans) a++;
        else u++;
      })
    );
    return { a, u, m, am };
  };

  const { a, u, m, am } = getStatusCounts();

  return (
    <div className="quiz-container">
      {showInstructions && (
        <div className="instructions-popup">
          <div className="instruction-box">
            <h2>📋 Instructions</h2>
            <ul>
              <li>This is a GATE-style test interface.</li>
              <li>Answer MCQ and NAT questions carefully.</li>
              <li>Use "Save & Next" to save answers.</li>
              <li>Click Submit when done.</li>
            </ul>
            <button onClick={() => {
              setShowInstructions(false);
              setShowGeneral(true);
            }}>
              Next
            </button>
          </div>
        </div>
      )}

      {showGeneral && (
        <div className="instructions-popup">
          <div className="instruction-box">
            <h2>🧾 General Instructions</h2>
            <ul>
              <li>Test duration: 30 minutes</li>
              <li>Section-wise navigation is allowed.</li>
              <li>Click Submit only after completing all questions.</li>
            </ul>
            <button onClick={() => setShowGeneral(false)}>Start Test</button>
          </div>
        </div>
      )}

      {confirmSubmit && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Are you sure you want to submit the test?</p>
            <button onClick={handleSubmit}>Yes, Submit</button>
            <button onClick={() => setConfirmSubmit(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="quiz-header">
        <h2>{quiz.title} | Section: {section.type}</h2>
        <span className="timer">⏱ {formatTime(timeLeft)}</span>
      </div>

      <div className="quiz-body">
        <div className="question-panel">
          <div className="section-tabs">
            {quiz.sections.map((sec, idx) => (
              <button key={idx} className={idx === currentSection ? "active" : ""} onClick={() => {
                setCurrentSection(idx);
                setCurrentQIndex(0);
              }}>{sec.type}</button>
            ))}
          </div>

          <h4>Q{currentQIndex + 1}: {currentQ.question}</h4>

          {currentQ.type === "MCQ" ? (
            currentQ.options.map((opt, i) => (
              <label key={i} className="option">
                <input
                  type="radio"
                  name={`q-${qid}`}
                  checked={tempAnswers[qid] === opt}
                  onChange={() => handleOptionSelect(opt)}
                />
                {opt}
              </label>
            ))
          ) : (
            <>
              <input className="nat-input" type="text" readOnly value={tempAnswers[qid] || ""} />
              <div className="numpad">
                {[..."1234567890."].map((n) => (
                  <button key={n} onClick={() => appendToNAT(n)}>{n}</button>
                ))}
                <button onClick={() => appendToNAT("←")}>←</button>
                <button onClick={() => appendToNAT("C")}>Clear</button>
              </div>
            </>
          )}
        </div>

        <div className="ledger-panel">
          <div className="status-box">
            <div><span className="circle answered" /> Answered: {a}</div>
            <div><span className="circle not-answered" /> Not Answered: {u}</div>
            <div><span className="circle marked" /> Marked: {m}</div>
            <div><span className="circle marked-answered" /> Marked + Answered: {am}</div>
          </div>

          <h4>🧭 Ledger</h4>
          <div className="ledger scrollable">
            {quiz.sections.flatMap(s => s.questions).map((q, i) => {
              let cls = "ledger-btn";
              const ans = savedAnswers[q.id];
              const rev = reviewFlags[q.id];
              if (rev && ans) cls += " marked-answered";
              else if (rev) cls += " marked";
              else if (ans) cls += " answered";
              else cls += " not-answered";

              return (
                <button
                  key={q.id}
                  className={cls}
                  onClick={() => {
                    const secIdx = quiz.sections.findIndex(s => s.questions.includes(q));
                    const qIdx = quiz.sections[secIdx].questions.indexOf(q);
                    setCurrentSection(secIdx);
                    setCurrentQIndex(qIdx);
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bottom-controls">
        <div>
          <button onClick={() => setCurrentQIndex(i => Math.max(i - 1, 0))}>Previous</button>
          <button onClick={toggleReview}>Mark for Review</button>
          <button onClick={handleSaveAndNext}>Save & Next</button>
        </div>
        <button className="submit-btn" onClick={() => setConfirmSubmit(true)}>Submit</button>
      </div>
    </div>
  );
};

export default QuizPage;
