import React, { useState } from "react";
import axios from "axios";
import "./Register.css"; // You’ll create this for styling
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    collegeName: "",
    collegeID: "",
    profilePic: null,
    idCard: null,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form Validation
    if (
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.collegeName ||
      !form.collegeID ||
      !form.profilePic ||
      !form.idCard
    ) {
      setError(" All fields are required.");
      return;
    }

    const data = new FormData();
    for (let key in form) {
      data.append(key, form[key]);
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", data);
      alert("Registered successfully. Check your email for the password.");
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Try again.");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>📋 Student Registration</h2>

        {error && <p className="error-msg">{error}</p>}

        <input name="fullName" placeholder="Full Name" onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} />
        <input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} />
        <input name="collegeName" placeholder="College Name" onChange={handleChange} />
        <input name="collegeID" placeholder="College ID" onChange={handleChange} />

        <label>Upload Profile Picture</label>
        <input name="profilePic" type="file" accept="image/*" onChange={handleChange} />

        <label>Upload College ID Card</label>
        <input name="idCard" type="file" accept="image/*" onChange={handleChange} />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
