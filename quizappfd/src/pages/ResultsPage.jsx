import React, { useEffect, useState } from 'react';
import './ResultsPage.css';
import { useNavigate } from 'react-router-dom';

const ResultsPage = () => {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("lastResult");
    if (!saved) {
      alert("No result found. Please take the test.");
      navigate("/dashboard");
      return;
    }
    setResult(JSON.parse(saved));
  }, [navigate]);

  if (!result) return <div className="loading">Loading your results...</div>;

  const { score, total, percentage, questions } = result;

  const getRank = () => {
    if (percentage >= 90) return "Top 1%";
    if (percentage >= 75) return "Top 10%";
    if (percentage >= 60) return "Top 25%";
    return "Needs Improvement";
  };

  return (
    <div className="results-page">
      <h2>📈 Test Results - GATE 2025</h2>

      <div className="summary">
        <div><strong>Score:</strong> {score} / {total}</div>
        <div><strong>Percentage:</strong> {percentage}%</div>
        <div><strong>Rank:</strong> {getRank()}</div>
      </div>

      <h3>📄 Detailed Solutions</h3>
      <div className="questions-list">
        {questions.map((q, idx) => (
          <div key={q.id} className="question-card">
            <p><strong>Q{idx + 1}:</strong> {q.question}</p>

            {/* MCQ Section */}
            {q.options ? (
              <ul>
                {q.options.map((opt, i) => {
                  let className = '';
                  if (opt === q.correct) className = 'correct';
                  else if (opt === q.selected) className = 'wrong';

                  return (
                    <li key={i} className={className}>
                      {opt}
                    </li>
                  );
                })}
              </ul>
            ) : (
              // NAT Section
              <div className="nat-answers">
                <p><strong>Your Answer:</strong> {q.selected || 'Not Answered'}</p>
                <p><strong>Correct Answer:</strong> {q.correct}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPage;
