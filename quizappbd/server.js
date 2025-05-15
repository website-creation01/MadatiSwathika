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
app.use('/uploads', express.static('uploads')); // to serve profile images

// ✅ In-memory Questions (shared across quizzes)
const allQuestions = [
  { id: 1, type: 'MCQ', question: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correct: 'Paris' },
  { id: 2, type: 'NAT', question: 'What is the square root of 144?', correct: '12' },
  { id: 3, type: 'MCQ', question: 'Who developed the theory of relativity?', options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Niels Bohr'], correct: 'Albert Einstein' },
  { id: 4, type: 'NAT', question: 'What is the value of Pi up to two decimal places?', correct: '3.14' },
  { id: 5, type: 'MCQ', question: 'Which language is used for web apps?', options: ['Python', 'JavaScript', 'C++', 'Java'], correct: 'JavaScript' },
  { id: 6, type: 'NAT', question: 'How many bytes are there in a kilobyte (KB)?', correct: '1024' },
];

// ✅ Sample Quizzes using question IDs
const quizzes = {
  1: {
    id: 1,
    title: "C Programming Test",
    description: "20 MCQs + NAT",
    sections: [
      {
        type: "MCQ",
        questions: [allQuestions[0], allQuestions[2], allQuestions[4]]
      },
      {
        type: "NAT",
        questions: [allQuestions[1], allQuestions[3], allQuestions[5]]
      }
    ]
  }
};

// ✅ Get All Quizzes
app.get("/api/quizzes", (req, res) => {
  const quizList = Object.values(quizzes).map(q => ({
    id: q.id,
    title: q.title,
    description: q.description
  }));
  res.json(quizList);
});

// ✅ Get Quiz by ID
// ✅ Updated (frontend expects `sections`)
app.get("/api/quizzes/:id", (req, res) => {
  const quiz = quizzes[req.params.id];
  if (!quiz) return res.status(404).send("Quiz not found");

  res.json(quiz); // Send full quiz with `sections`
});


// ✅ Submit Quiz Answers
app.post("/api/quizzes/submit", (req, res) => {
  console.log("🔔 Received Submission:");
  console.log("Quiz ID:", req.body.quizId);
  console.log("Email:", req.body.email);
  console.log("Answers:", req.body.answers);
  const { answers, quizId, email } = req.body;
  const quiz = quizzes[quizId];
  const userName = email.split('@')[0];

  if (!quiz || !quiz.sections) {
    return res.status(400).json({ error: "Invalid quiz data" });
  }

  let score = 0, total = 0;
  let allQuestions = [];

  quiz.sections.forEach(section => {
    section.questions.forEach(q => {
      total++;
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer && userAnswer.toString().trim().toLowerCase() === q.correct.toString().trim().toLowerCase();
      if (isCorrect) score++;

      allQuestions.push({
        id: q.id,
        question: q.question,
        options: q.options || null,
        correct: q.correct,
        selected: userAnswer || null
      });
    });
  });

  const result = {
    score,
    total,
    percentage: Math.round((score / total) * 100),
    quizId,
    questions: allQuestions
  };

  // ✅ Send confirmation email
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
    subject: 'Test Submission Confirmation',
    html: `
      <p>Dear <strong>${userName}</strong>,</p>
      <p>Your test has been successfully submitted.</p>
      <p><strong>Course Name:</strong> GATE - 2025</p>
      <p><strong>Test Name:</strong> Test - ${quizId}</p>
      <br/>
      <p>Best Regards,<br/>nDMatrix</p>
    `
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error("❌ Email Error:", err.message);
  });

  res.json(result);
});


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

// ✅ File Upload (Multer)
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ✅ Register User
app.post('/api/auth/register', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'idCard', maxCount: 1 }
]), async (req, res) => {
  const { fullName, email, phone, collegeName, collegeID } = req.body;
  const profilePic = req.files['profilePic'][0].filename;
  const idCard = req.files['idCard'][0].filename;

  const rawPassword = crypto.randomBytes(4).toString('hex');
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

      res.status(200).json({ message: "Registered successfully. Check your email.", profilePic });
    });
  });
});

// ✅ Login User
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.json({ success: false, message: "Database error" });

    if (results.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.json({ success: false, message: "Invalid password" });
      }

      return res.json({ 
        success: true, 
        message: "Login successful", 
        profilePic: user.profilePic,
        email: user.email               // ✅ Add this
      });
      
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
