import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("email", email);         // optional fallback
        localStorage.setItem("userEmail", email);     // preferred

        alert("Login successful!");
        navigate("/dashboard");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Login failed. Try again.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />
        <input
          type="password"
          placeholder="Enter Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
