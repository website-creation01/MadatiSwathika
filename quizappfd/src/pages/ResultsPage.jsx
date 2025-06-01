import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResultsPage = () => {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("lastResult");
    if (stored) {
      setResult(JSON.parse(stored));
    }
  }, []);

  if (!result) return <div>Loading results...</div>;

  const { score, total, percentage } = result;

  // Dummy rank calculation
  const rank = Math.max(1, Math.floor(Math.random() * 50));

  return (
    <div style={{ padding: '30px' }}>
      <h2>📊 Test Results</h2>
      <p><strong>Total Score:</strong> {score} / {total}</p>
      <p><strong>Percentage:</strong> {percentage}%</p>
      <p><strong>Your Rank:</strong> {rank}</p>
      <button onClick={() => navigate('/solution')}>View Solutions</button>
    </div>
  );
};

export default ResultsPage;
