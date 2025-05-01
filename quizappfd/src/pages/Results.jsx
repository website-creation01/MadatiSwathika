import React from 'react';

function Results() {
  const result = JSON.parse(localStorage.getItem('lastResult'));
  if (!result) return <p>No result found.</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Results</h2>
      <p>Score: {result.score} / {result.total}</p>
      <p>Percentage: {result.percentage}%</p>
      {/* Add rank if you implement it */}
    </div>
  );
}

export default Results;
