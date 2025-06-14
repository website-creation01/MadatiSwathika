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
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showGeneral, setShowGeneral] = useState(false);

  const email = localStorage.getItem("userEmail");

  const currentQ = () => quiz?.sections[currentSection]?.questions[currentQIndex];
  const qid = currentQ()?.id;

  // Fetch quiz and initialize status
  useEffect(() => {
    axios.get(`http://localhost:5000/api/quizzes/${id}`).then((res) => setQuiz(res.data));

    axios.get(`http://localhost:5000/api/quiz-status/${email}/${id}`).then((res) => {
      const { status } = res.data;
      if (status === "submitted") {
        alert("You have already submitted this test.");
        navigate("/dashboard/results");
      } else if (status === "in_progress") {
        // allow resume
      } else {
        axios.post("http://localhost:5000/api/start-quiz", { email, quizId: id });
      }
    });
  }, [id, email, navigate]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("⏰ Time up! Submitting test...");
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen + Tab switch monitor
  useEffect(() => {
    const goFullScreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
    };

    const onBlur = () => {
      const confirmed = window.confirm("You switched window/tab. Your test will be submitted.\nContinue?");
      if (confirmed) handleSubmit();
    };

    if (!showInstructions && !showGeneral) {
      goFullScreen();
      window.addEventListener("blur", onBlur);
    }
    return () => window.removeEventListener("blur", onBlur);
  }, [showInstructions, showGeneral, savedAnswers]);

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
    setSavedAnswers({ ...savedAnswers, [qid]: tempAnswers[qid] });
    setCurrentQIndex((i) => Math.min(i + 1, quiz.sections[currentSection].questions.length - 1));
  };

  const toggleReview = () => {
    setReviewFlags((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  const handleSubmit = () => {
    const finalAnswers = { ...savedAnswers, [qid]: tempAnswers[qid] };
    axios
      .post("http://localhost:5000/api/quizzes/submit", {
        quizId: id,
        answers: finalAnswers,
        email,
      })
      .then((res) => {
        localStorage.setItem("lastResult", JSON.stringify(res.data));
        navigate("/dashboard/results");
      })
      .catch((err) => {
        alert("Submission failed. Try again.");
        console.error(err);
      });
  };

  const formatTime = (t) => {
    const m = String(Math.floor(t / 60)).padStart(2, "0");
    const s = String(t % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!quiz || !currentQ()) return <div className="loading">Loading...</div>;

  return (
    <div className="quiz-container">
      {/* Instruction popups */}
      {showInstructions && (
        <div className="instructions-popup">
          <div className="instruction-box">
            <h2>📋 Instructions</h2>
            <ul>
              <li>Test duration: 30 minutes</li>
              <li>Only one attempt is allowed</li>
              <li>No switching window or tab</li>
            </ul>
            <button onClick={() => {
              setShowInstructions(false);
              setShowGeneral(true);
            }}>Next</button>
          </div>
        </div>
      )}

      {showGeneral && (
        <div className="instructions-popup">
          <div className="instruction-box">
            <h2>🧾 General Instructions</h2>
            <ul>
              <li>Use keypad for NAT answers</li>
              <li>Save & Next saves your answer</li>
              <li>Ledger shows answer status</li>
            </ul>
            <button onClick={() => setShowGeneral(false)}>Start Test</button>
          </div>
        </div>
      )}

      {/* Confirm submission popup */}
      {confirmSubmit && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Are you sure you want to submit the test?</p>
            <button onClick={handleSubmit}>Yes, Submit</button>
            <button onClick={() => setConfirmSubmit(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Quiz UI */}
      <div className="quiz-header">
        <h2>{quiz.title} | Section: {quiz.sections[currentSection].type}</h2>
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

          <h4>Q{currentQIndex + 1}: {currentQ().question}</h4>

          {currentQ().type === "MCQ" ? (
            currentQ().options.map((opt, i) => (
              <label key={i} className="option">
                <input
                  type="radio"
                  name={`q-${qid}`}
                  checked={(savedAnswers[qid] ?? tempAnswers[qid]) === opt}
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
          <h4>🧭 Ledger</h4>
          {quiz.sections.flatMap((sec) => sec.questions).map((q, i) => {
            let cls = "ledger-btn";
            const ans = savedAnswers[q.id];
            const rev = reviewFlags[q.id];
            if (rev && ans) cls += " marked-answered";
            else if (rev) cls += " marked";
            else if (ans) cls += " answered";
            else cls += " not-answered";

            return (
              <button key={q.id} className={cls} onClick={() => {
                const secIdx = quiz.sections.findIndex(s => s.questions.includes(q));
                const qIdx = quiz.sections[secIdx].questions.indexOf(q);
                setCurrentSection(secIdx);
                setCurrentQIndex(qIdx);
              }}>
                {i + 1}
              </button>
            );
          })}
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
