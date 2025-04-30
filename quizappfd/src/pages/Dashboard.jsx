import React from "react";
import { Link, Outlet } from "react-router-dom";
import Header from "./Header";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <h2>📘 Dashboard</h2>
        <nav>
          <Link to="/dashboard/courses">My Courses</Link>
          <Link to="/dashboard/results">Results</Link>
        </nav>
      </aside>

      {/* Right Section */}
      <div className="main-content">
        <Header /> {/* Profile Dropdown at top-right */}
        <div className="dashboard-body">
          <Outlet /> {/* Shows MyCourses, Results, etc. */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
