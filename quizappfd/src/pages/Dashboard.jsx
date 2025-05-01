import React from "react";
import { Outlet } from "react-router-dom";
import "./Dashboard.css";
import Header from "./Header";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>📘 Dashboard</h2>
        <ul>
          <li><a href="/dashboard">My Courses</a></li>
          <li><a href="/dashboard/results">Results</a></li>
        </ul>
      </aside>
      
      <main className="main-content">
        <Header />
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
