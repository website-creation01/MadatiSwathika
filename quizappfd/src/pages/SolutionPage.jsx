import React, { useEffect, useState } from "react";
import "./SolutionPage.css";

function SolutionPage() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("lastResult");
    if (saved) {
      setResult(JSON.parse(saved));
    }
  }, []);

  if (!result) return <div className="solution-page">Loading results...</div>;

  return (
    <div className="solution-page">
      <h2>📊 Test Solutions</h2>
      <div className="summary-box">
        <p><strong>Score:</strong> {result.score} / {result.total}</p>
        <p><strong>Percentage:</strong> {result.percentage}%</p>
        <p><strong>Rank:</strong> {result.rank || "To be calculated"}</p>
      </div>

      {result.questions.map((q, index) => (
        <div className="question-box" key={q.id}>
          <h3>Q{index + 1}: {q.question}</h3>

          {q.options ? (
            <ul className="options-list">
              {q.options.map((opt, i) => {
                let className = "option-item";
                if (opt === q.correct) className += " correct";
                else if (opt === q.selected && opt !== q.correct) className += " incorrect";

                return (
                  <li key={i} className={className}>
                    {opt}
                  </li>
                );
              })}
            </ul>
          ) : (
            <>
              <p><strong>Your Answer:</strong> {q.selected || "Not Answered"}</p>
              <p><strong>Correct Answer:</strong> {q.correct}</p>
            </>
          )}

          <div className="explanation">
            <strong>Explanation:</strong>
            <p>{q.explanation || "Explanation not available."}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SolutionPage;
