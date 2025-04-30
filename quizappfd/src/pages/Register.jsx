import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    collegeName: '',
    collegeID: '',
    profilePic: null,
    idCard: null
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key]);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);

      // ✅ Server response contains stored profile picture name
      if (response.data.profilePic) {
        localStorage.setItem("profilePic", response.data.profilePic);
      }

      alert("Registration Successful! Check your email for the password.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Student Registration</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required /><br /><br />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required /><br /><br />
        <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required /><br /><br />
        <input type="text" name="collegeName" placeholder="College Name" onChange={handleChange} required /><br /><br />
        <input type="text" name="collegeID" placeholder="College ID" onChange={handleChange} required /><br /><br />

        <label>Upload Profile Picture (50KB - 250KB)</label><br />
        <input type="file" name="profilePic" accept="image/*" onChange={handleFileChange} required /><br /><br />

        <label>Upload College ID Card (100KB - 500KB)</label><br />
        <input type="file" name="idCard" accept="image/*" onChange={handleFileChange} required /><br /><br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
