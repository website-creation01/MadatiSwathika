// src/pages/MyCourses.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function MyCourses() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/quizzes")
      .then((res) => setQuizzes(res.data))
      .catch((err) => console.error("Failed to fetch quizzes", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📘 Available Tests</h2>
      {quizzes.map((quiz) => (
        <div key={quiz.id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h4>{quiz.title}</h4>
          <p>{quiz.description}</p>
          <Link to={`/quiz/${quiz.id}`}>
            <button>Start Test</button>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default MyCourses;
