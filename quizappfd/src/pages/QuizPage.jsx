import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './QuizPage.css';

const QuizPage = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewFlags, setReviewFlags] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 min
  const [profilePic, setProfilePic] = useState('');

  useEffect(() => {
    axios.get("http://localhost:5000/api/quizzes/1").then(res => {
      setQuiz(res.data);
    });

    //  Get profile pic from localStorage (path)
    const storedPic = localStorage.getItem("profilePic");
    if (storedPic) {
      setProfilePic(`http://localhost:5000/uploads/${storedPic}`);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Time is up!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (t) => {
    const m = String(Math.floor(t / 60)).padStart(2, '0');
    const s = String(t % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!quiz) return <div className="loading">Loading...</div>;

  const section = quiz.sections[currentSection];
  const questions = section.questions;
  const currentQ = questions[currentQIndex];
  const qid = currentQ.id;

  const handleAnswer = (val) => {
    setAnswers({ ...answers, [qid]: val });
  };

  const appendToNAT = (char) => {
    const prev = answers[qid] || "";
    if (char === "C") {
      setAnswers({ ...answers, [qid]: "" });
    } else if (char === "←") {
      setAnswers({ ...answers, [qid]: prev.slice(0, -1) });
    } else if (char === "." && prev.includes(".")) {
      // Prevent multiple dots
      return;
    } else {
      setAnswers({ ...answers, [qid]: prev + char });
    }
  };
  
  const toggleReview = () => {
    setReviewFlags(prev => ({ ...prev, [qid]: !prev[qid] }));
  };

  const handleSubmit = () => {
    const email = localStorage.getItem("userEmail"); // ✅ Correct key now
    if (!email) {
      alert("Email not found. Please login again.");
      return;
    }
  
    axios.post("http://localhost:5000/api/quizzes/submit", {
      quizId: quiz.id,
      answers,
      email
    }).then(res => {
      localStorage.setItem("lastResult", JSON.stringify(res.data));
      window.location.href = "/results";
    }).catch(err => {
      console.error("Submission failed", err);
      alert("Submission failed");
    });
  };
  
  

  const getStatusCounts = () => {
    let a = 0, u = 0, m = 0, am = 0;
    quiz.sections.forEach(sec =>
      sec.questions.forEach(q => {
        const ans = answers[q.id];
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
      <div className="quiz-header">
        <h2>{quiz.title} | Section: {section.type}</h2>
        <div className="header-right">
          <span className="timer">⏱ {formatTime(timeLeft)}</span>
          {profilePic && (
            <img
              src={profilePic}
              className="profile-img"
              alt="Profile"
            />
          )}
        </div>
      </div>

      <div className="quiz-body">
        <div className="question-panel">
          <div className="section-tabs">
            {quiz.sections.map((sec, idx) => (
              <button
                key={idx}
                className={idx === currentSection ? 'active' : ''}
                onClick={() => {
                  setCurrentSection(idx);
                  setCurrentQIndex(0);
                }}
              >
                {sec.type}
              </button>
            ))}
          </div>

          <h4>Q{currentQIndex + 1}: {currentQ.question}</h4>

          {currentQ.type === 'MCQ' ? (
            currentQ.options.map((opt, i) => (
              <label key={i} className="option">
                <input
                  type="radio"
                  name={`q-${qid}`}
                  checked={answers[qid] === opt}
                  onChange={() => handleAnswer(opt)}
                />
                {opt}
              </label>
            ))
          ) : (
            <>
              <input
                className="nat-input"
                type="text"
                placeholder="Enter your answer"
                value={answers[qid] || ''}
                readOnly
              />
              <div className="numpad">
                {[...'1234567890'].map((n) => (
                  <button key={n} onClick={() => appendToNAT(n)}>{n}</button>
                ))}
                <button onClick={() => appendToNAT(".")}>.</button>
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
          <div className="ledger">
            {quiz.sections.flatMap(s => s.questions).map((q, i) => {
              let cls = "ledger-btn";
              const ans = answers[q.id];
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
        <button onClick={() => setCurrentQIndex(i => Math.max(i - 1, 0))}>Previous</button>
        <button onClick={() => setCurrentQIndex(i => Math.min(i + 1, questions.length - 1))}>Next</button>
        <button onClick={toggleReview}>Mark for Review</button>
        <button className="submit-btn" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default QuizPage;
