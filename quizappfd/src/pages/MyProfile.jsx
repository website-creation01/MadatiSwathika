import React from "react";
import "./FormCard.css";

function MyProfile() {
  const fullName = localStorage.getItem("fullName");
  const email = localStorage.getItem("email");
  const profilePic = localStorage.getItem("profilePic");
  const collegeName = localStorage.getItem("collegeName");
  const collegeID = localStorage.getItem("collegeID");
  const phone = localStorage.getItem("phone");

  return (
    <div className="form-card-container">
      <form className="form-card">
        <h2>👤 My Profile</h2>

        <img
          src={`http://localhost:5000/uploads/${profilePic}`}
          alt="Profile"
          className="form-profile-img"
        />

        <p><strong>Full Name:</strong> {fullName}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>College:</strong> {collegeName}</p>
        <p><strong>College ID:</strong> {collegeID}</p>
      </form>
    </div>
  );
}

export default MyProfile;
