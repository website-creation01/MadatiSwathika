import React, { useState } from "react";
import "./FormCard.css";

function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Password changed (simulation)");
    setNewPassword("");
  };

  return (
    <div className="form-card-container">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>🔐 Change Password</h2>
        <input
          type="password"
          placeholder="Enter New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}

export default ChangePassword;
