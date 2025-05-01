// src/pages/QuizPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./QuizPage.css";

function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewFlags, setReviewFlags] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 min timer

  useEffect(() => {
    axios.get(`http://localhost:5000/api/quizzes/${id}`)
      .then(res => setQuiz(res.data))
      .catch(err => console.error("Failed to load quiz", err));
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleAnswer = (value) => {
    const qId = quiz.sections[currentSection].questions[currentQIndex].id;
    setAnswers({ ...answers, [qId]: value });
  };

  const markForReview = () => {
    const qId = quiz.sections[currentSection].questions[currentQIndex].id;
    setReviewFlags({ ...reviewFlags, [qId]: true });
  };

  const submitTest = () => {
    const email = localStorage.getItem("email");
    axios.post("http://localhost:5000/api/quizzes/submit", {
      answers,
      quizId: id,
      email,
    }).then(res => {
      localStorage.setItem("lastResult", JSON.stringify(res.data));
      navigate("/results");
    });
  };

  if (!quiz) return <div className="quiz-fullscreen">Loading...</div>;

  const section = quiz.sections[currentSection];
  const questions = section.questions;
  const currentQ = questions[currentQIndex];
  const profilePic = localStorage.getItem("profilePic");

  return (
    <div className="quiz-fullscreen">
      <div className="quiz-header">
        <h3>{quiz.title} | Section: {section.type}</h3>
        <div className="quiz-header-right">
          <span className="timer">⏱ {formatTime(timeLeft)}</span>
          {profilePic && (
            <img src={`http://localhost:5000/uploads/${profilePic}`} className="profile-img" alt="Profile" />
          )}
        </div>
      </div>

      <div className="quiz-body">
        <div className="quiz-left">
          <div className="section-buttons">
            {quiz.sections.map((sec, idx) => (
              <button
                key={idx}
                className={currentSection === idx ? "active" : ""}
                onClick={() => { setCurrentSection(idx); setCurrentQIndex(0); }}
              >
                {sec.type}
              </button>
            ))}
          </div>

          <h4>Q{currentQIndex + 1}: {currentQ.question}</h4>
          {section.type === "MCQ" ? (
            currentQ.options.map((opt) => (
              <label key={opt} className="option">
                <input
                  type="radio"
                  value={opt}
                  name={`q-${currentQ.id}`}
                  checked={answers[currentQ.id] === opt}
                  onChange={() => handleAnswer(opt)}
                /> {opt}
              </label>
            ))
          ) : (
            <input
              type="text"
              value={answers[currentQ.id] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Enter your answer"
              className="nat-input"
            />
          )}

          <div className="quiz-controls">
            <button onClick={() => setCurrentQIndex(i => Math.max(i - 1, 0))}>Previous</button>
            <button onClick={() => setCurrentQIndex(i => Math.min(i + 1, questions.length - 1))}>Next</button>
            <button onClick={markForReview}>Mark for Review</button>
            <button className="submit-btn" onClick={submitTest}>Submit</button>
          </div>
        </div>

        <div className="quiz-right">
          <h4>🧭 Ledger</h4>
          {questions.map((q, idx) => {
            const isAns = answers[q.id];
            const isReview = reviewFlags[q.id];
            let className = "ledger-btn";

            if (isReview && isAns) className += " review-answered";
            else if (isReview) className += " review";
            else if (isAns) className += " answered";
            else className += " unanswered";

            return (
              <button
                key={q.id}
                className={className}
                onClick={() => setCurrentQIndex(idx)}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


export default QuizPage;
