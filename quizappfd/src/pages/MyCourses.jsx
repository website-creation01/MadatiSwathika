// src/pages/MyCourses.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MyCourses() {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/quizzes")
      .then(res => setQuizzes(res.data))
      .catch(err => console.error("Failed to fetch quizzes", err));
  }, []);

  return (
    <div>
      <h2>📘 Available Tests</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {quizzes.map(quiz => (
          <div key={quiz.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
            <button onClick={() => navigate(`/quiz/${quiz.id}`)}>Start Test</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyCourses;
