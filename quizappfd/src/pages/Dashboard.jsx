import React, { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const profilePic = localStorage.getItem("profilePic");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Student Panel</h2>
        <ul>
          <li
            className={location.pathname.includes("/dashboard/mycourses") ? "active" : ""}
            onClick={() => navigate("/dashboard/mycourses")}
          >
            📘 My Courses
          </li>
          <li
            className={location.pathname.includes("/dashboard/results") ? "active" : ""}
            onClick={() => navigate("/dashboard/results")}
          >
            📊 Results
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="topbar">
          <div
            className="profile-section"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img
              src={`http://localhost:5000/uploads/${profilePic}`}
              alt="Profile"
              className="profile-pic"
            />
            {showDropdown && (
              <div className="profile-dropdown">
                <ul>
                  <li onClick={() => navigate("/dashboard/profile")}>👤 My Profile</li>
                  <li onClick={() => navigate("/dashboard/change-password")}>🔐 Change Password</li>
                  <li onClick={handleLogout}>🚪 Logout</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
