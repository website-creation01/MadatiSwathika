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
app.use('/uploads', express.static('uploads')); // serve profile image path

// Add this on top of server.js
const quizzes = {
  1: {
    title: "C Programming Test",
    sections: [
      {
        type: "MCQ",
        questions: [
          {
            id: 1,
            question: "Which of these is a valid C keyword?",
            options: ["include", "void", "main", "define"],
            correct: "void"
          },
          {
            id: 2,
            question: "Which operator is used for modulus?",
            options: ["%", "/", "*", "&"],
            correct: "%"
          }
        ]
      },
      {
        type: "NAT",
        questions: [
          {
            id: 3,
            question: "Result of 2 + 3 * 4?",
            correct: "14"
          },
          {
            id: 4,
            question: "Value of 10/2 + 5?",
            correct: "10"
          }
        ]
      }
    ]
  }
};


app.get("/api/quizzes", (req, res) => {
  const sampleQuizzes = [
    { id: 1, title: "C Programming Test", description: "20 MCQs + NAT" },
    { id: 2, title: "DSA Level 1", description: "Mixed concepts quiz" }
  ];
  res.json(sampleQuizzes);
});

app.get("/api/quizzes/:id", (req, res) => {
  const quiz = quizzes[req.params.id];
  if (!quiz) return res.status(404).send("Quiz not found");
  res.json(quiz);
});
app.post("/api/quizzes/submit", (req, res) => {
  const { answers, quizId, email } = req.body;
  const quiz = quizzes[quizId];

  if (!quiz || !quiz.sections) {
    return res.status(400).json({ error: "Invalid quiz data" });
  }

  let score = 0, total = 0;

  quiz.sections.forEach(section => {
    if (section.questions) {
      section.questions.forEach(q => {
        total++;
        if (answers[q.id] && answers[q.id].toString().trim().toLowerCase() === q.correct.toString().trim().toLowerCase()) {
          score++;
        }
      });
    }
  });

  const result = {
    score,
    total,
    percentage: Math.round((score / total) * 100),
    quizId
  };

  // ... (email logic remains unchanged)

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

// ✅ File upload config (Multer)
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
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

      res.status(200).json({ message: "Registered successfully. Check your email.", profilePic }); // ✅ return stored pic
    });
  });
});

// ✅ Login API
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

      return res.json({ success: true, message: "Login successful", profilePic: user.profilePic });
    });
  });
});

// ✅ Quiz list API (temporary)
// ✅ Fetch quiz by ID (return mcqs and nats separately for frontend)
app.get("/api/quizzes/:id", (req, res) => {
  const quiz = quizzes[req.params.id];
  if (!quiz) return res.status(404).send("Quiz not found");

  const mcqs = quiz.sections.find(sec => sec.type === "MCQ")?.questions || [];
  const nats = quiz.sections.find(sec => sec.type === "NAT")?.questions || [];

  res.json({
    id: req.params.id,
    title: quiz.title,
    mcqs,
    nats
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
