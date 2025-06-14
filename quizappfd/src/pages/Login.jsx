import React, { useState } from "react";
import axios from "axios";
import "./Register.css"; // Using the same styling as Register
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError(" Email and password are required.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("profilePic", res.data.profilePic || "");
        localStorage.setItem("email", res.data.email || "");
        localStorage.setItem("fullName", res.data.fullName || "");
        localStorage.setItem("collegeName", res.data.collegeName || "");
        localStorage.setItem("collegeID", res.data.collegeID || "");
        localStorage.setItem("phone", res.data.phone || "");
        alert("Login successful!");
        navigate("/dashboard");
      } else {
        setError(` ${res.data.message}`);
      }
    } catch (err) {
      console.error(err);
      setError(" Login failed. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>🔐 Student Login</h2>

        {error && <p className="error-msg">{error}</p>}

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
