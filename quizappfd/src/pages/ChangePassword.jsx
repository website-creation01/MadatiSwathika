import React, { useState } from "react";
import axios from "axios";
import "./ChangePassword.css"; 
import "./FormCard.css"  


const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");

  const email = localStorage.getItem("userEmail");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMsg(" New password and confirm password do not match");
    }

    axios
      .post("http://localhost:5000/api/user/change-password", {
        email,
        currentPassword,
        newPassword,
      })
      .then((res) => setMsg(" Password changed successfully"))
      .catch((err) => {
        if (err.response?.data?.error)
          setMsg(` ${err.response.data.error}`);
        else setMsg(" Error updating password");
      });
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>
      <form className="change-password-form" onSubmit={handleSubmit}>
        <label>Current Password</label>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <label>New Password</label>
        <input
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <label>Confirm New Password</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit">Update Password</button>
        {msg && <p className="message">{msg}</p>}
      </form>
    </div>
  );
};

export default ChangePassword;
