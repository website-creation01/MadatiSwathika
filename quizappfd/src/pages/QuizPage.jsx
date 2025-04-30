// src/pages/QuizPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const dummyQuestions = {
  1: [
    { id: 1, question: "What is the output of 2 + 2?", options: ["2", "4", "6", "8"], answer: "4" },
    { id: 2, question: "Which is a valid C keyword?", options: ["int", "num", "loop", "voided"], answer: "int" }
  ],
  2: [
    { id: 1, question: "Which data structure uses FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], answer: "Queue" },
    { id: 2, question: "What is the time complexity of binary search?", options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"], answer: "O(log n)" }
  ],
  3: [
    { id: 1, question: "Which layer does IP work in?", options: ["Application", "Transport", "Network", "Physical"], answer: "Network" },
    { id: 2, question: "Port number of HTTP?", options: ["20", "25", "80", "443"], answer: "80" }
  ]
};

function QuizPage() {
  const { id } = useParams();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = dummyQuestions[id] || [];

  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers({ ...answers, [questionId]: selectedOption });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.answer) {
        score++;
      }
    });
    return score;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📝 Attempt Quiz #{id}</h2>
      {questions.map((q) => (
        <div key={q.id}>
          <p><strong>{q.question}</strong></p>
          {q.options.map((opt) => (
            <label key={opt}>
              <input
                type="radio"
                name={`q${q.id}`}
                value={opt}
                disabled={submitted}
                checked={answers[q.id] === opt}
                onChange={() => handleOptionChange(q.id, opt)}
              />
              {opt}
            </label>
          ))}
          <br /><br />
        </div>
      ))}

      {!submitted ? (
        <button onClick={handleSubmit}>Submit Quiz</button>
      ) : (
        <h3>✅ Your Score: {calculateScore()} / {questions.length}</h3>
      )}
    </div>
  );
}

export default QuizPage;
