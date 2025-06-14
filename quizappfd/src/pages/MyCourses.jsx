import React, { useEffect, useState } from "react";
import axios from "axios";

function MyCourses() {
  const [quizzes, setQuizzes] = useState([]);
  

  useEffect(() => {
    axios.get("http://localhost:5000/api/quizzes")
      .then(res => setQuizzes(res.data))
      .catch(err => console.error("Error fetching quizzes", err));
  }, []);

  const openPopup = (quizId) => {
    const newWindow = window.open(`/quiz/${quizId}`, "_blank", "width=1200,height=800");
    if (newWindow) newWindow.focus();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📘 Available Tests</h2>
      {quizzes.map((quiz) => (
        <div key={quiz.id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h4>{quiz.title}</h4>
          <p>{quiz.description}</p>
          <button onClick={() => openPopup(quiz.id)}>Start Test</button>
        </div>
      ))}
    </div>
  );
}

export default MyCourses;
