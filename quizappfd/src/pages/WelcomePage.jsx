import React from "react";
import "./WelcomePage.css";

function WelcomePage() {
  const name = localStorage.getItem("fullName");

  return (
    <div className="welcome-page">
      <div className="welcome-box">
        <h1>🎓 Welcome, {name || "Student"}!</h1>
        <p>Select <b>My Courses</b> from the sidebar to begin your GATE preparation.</p>
      </div>
    </div>
  );
}

export default WelcomePage;
