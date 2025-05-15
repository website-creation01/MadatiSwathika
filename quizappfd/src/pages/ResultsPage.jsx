// src/pages/ResultsPage.jsx
import React, { useEffect, useState } from 'react';
import './ResultsPage.css';
import { useNavigate } from 'react-router-dom';

function ResultsPage() {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("lastResult"));
    if (!saved) {
      navigate("/dashboard");
    } else {
      setResult(saved);
    }
  }, []);

  if (!result) return <div className="results">Loading result...</div>;

  return (
    <div className="results">
      <h2>🎯 Performance Summary</h2>
      <p><strong>Score:</strong> {result.score} / {result.total}</p>
      <p><strong>Percentage:</strong> {result.percentage}%</p>
      <p><strong>Rank:</strong> Will be assigned soon</p>

      <h3>📘 Detailed Solutions</h3>
      {result.questions.map((q, idx) => (
        <div key={q.id} className="question-card">
          <p><strong>Q{idx + 1}:</strong> {q.question}</p>
          {q.options && (
            <ul>
              {q.options.map((opt, i) => (
                <li key={i} className={opt === q.correct ? 'correct' : opt === q.selected ? 'selected' : ''}>
                  {opt}
                </li>
              ))}
            </ul>
          )}
          {!q.options && (
            <div>
              <p><strong>Your Answer:</strong> {q.selected || "Not Answered"}</p>
              <p><strong>Correct Answer:</strong> {q.correct}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ResultsPage;
