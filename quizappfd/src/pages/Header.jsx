import React, { useState } from "react";
import "./Header.css";

function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const profilePic = localStorage.getItem("profilePic");

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="header">
      <div className="profile-container" onClick={toggleMenu}>
        <img
          src={`http://localhost:5000/uploads/${profilePic}`}
          alt="Profile"
          className="profile-pic"
        />
        {showMenu && (
          <div className="dropdown">
            <div>👤 My Profile</div>
            <div>🔑 Change Password</div>
            <div
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
            >
              🚪 Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
