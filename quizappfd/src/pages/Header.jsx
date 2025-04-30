import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const profilePic = localStorage.getItem("profilePic");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="topbar">
      <img
        src={`http://localhost:5000/uploads/${profilePic}`}
        alt="Profile"
        className="profile-pic"
        onClick={() => setShowDropdown(!showDropdown)}
      />
      {showDropdown && (
        <div className="dropdown">
          <div onClick={() => navigate("/profile")}>👤 My Profile</div>
          <div onClick={() => navigate("/change-password")}>🔑 Change Password</div>
          <div onClick={handleLogout}>🚪 Logout</div>
        </div>
      )}
    </div>
  );
}

export default Header;
