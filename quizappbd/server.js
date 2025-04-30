const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ✅ MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

  

db.connect(err => {
  if (err) throw err;
  console.log("✅ MySQL Connected");
});

// ✅ File upload config (Multer)
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ Registration API
app.post('/api/auth/register', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'idCard', maxCount: 1 }
]), async (req, res) => {
  const { fullName, email, phone, collegeName, collegeID } = req.body;
  const profilePic = req.files['profilePic'][0].filename;
  const idCard = req.files['idCard'][0].filename;

  const rawPassword = crypto.randomBytes(4).toString('hex'); // 8-char password
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const sql = "INSERT INTO users (fullName, email, phone, collegeName, collegeID, profilePic, idCard, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [fullName, email, phone, collegeName, collegeID, profilePic, idCard, hashedPassword], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error.");
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Exam Portal Password',
      html: `<p>Hello ${fullName},</p><p>Your login password is: <b>${rawPassword}</b></p>`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Email sending failed.");
      }
      res.status(200).send("Registered successfully. Check your email.");
    });
  });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
