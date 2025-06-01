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

// In-memory Questions (shared across quizzes)

const allQuestions = [
  {
    id: 1,
    type: 'MCQ',
    question: 'The Laplace transform of f(t) = e^(–2t) is:',
    options: ['1/(s+2)', 's+2', '1/(s–2)', 's–2'],
    correct: '1/(s+2)',
    explanation: 'The Laplace transform of e^(–at) is 1/(s + a). Here, a = 2, so the answer is 1/(s + 2).'
  },
  {
    id: 2,
    type: 'MCQ',
    question: 'Which law explains the phenomenon of electromagnetic induction?',
    options: ['Ohm’s Law', 'Faraday’s Law', 'Lenz’s Law', 'Ampere’s Law'],
    correct: 'Faraday’s Law',
    explanation: 'Faraday’s Law states that a changing magnetic field induces an electromotive force (EMF) in a circuit.'
  },
  {
    id: 3,
    type: 'MCQ',
    question: 'Which of the following is an eigenvalue of the matrix [[2, 1], [1, 2]]?',
    options: ['1', '2', '3', '4'],
    correct: '3',
    explanation: 'Solving the characteristic equation |A - λI| = 0 gives λ = 3 and λ = 1. So 3 is a valid eigenvalue.'
  },
  {
    id: 4,
    type: 'MCQ',
    question: 'Which of the following is a scalar quantity?',
    options: ['Velocity', 'Acceleration', 'Force', 'Work'],
    correct: 'Work',
    explanation: 'Work has magnitude but no direction, so it is a scalar. Others are vectors.'
  },
  {
    id: 5,
    type: 'MCQ',
    question: 'Which gas is liberated when metal reacts with acid?',
    options: ['Oxygen', 'Hydrogen', 'Nitrogen', 'Chlorine'],
    correct: 'Hydrogen',
    explanation: 'Metals reacting with acids produce hydrogen gas and a salt.'
  },
  {
    id: 6,
    type: 'MCQ',
    question: 'If A is an n x n matrix with determinant zero, then A is:',
    options: ['Invertible', 'Orthogonal', 'Singular', 'Diagonal'],
    correct: 'Singular',
    explanation: 'A matrix with determinant 0 is called singular and it is non-invertible.'
  },
  {
    id: 7,
    type: 'MCQ',
    question: 'Which rule is used in thermodynamics for entropy calculation?',
    options: ['Clapeyron Equation', 'Clausius Equation', 'Gibbs Free Energy', 'Carnot’s Theorem'],
    correct: 'Clausius Equation',
    explanation: 'Clausius Equation relates heat transfer to entropy change in reversible processes.'
  },
  {
    id: 8,
    type: 'MCQ',
    question: 'The reaction rate is independent of reactant concentration. It is a:',
    options: ['First order', 'Second order', 'Zero order', 'Third order'],
    correct: 'Zero order',
    explanation: 'In zero-order reactions, rate is constant and independent of reactant concentration.'
  },
  {
    id: 9,
    type: 'MCQ',
    question: 'In Gauss elimination, which matrix form is obtained?',
    options: ['Identity Matrix', 'Echelon Form', 'Symmetric Matrix', 'Diagonal Matrix'],
    correct: 'Echelon Form',
    explanation: 'Gaussian elimination reduces a matrix to row echelon form using elementary row operations.'
  },
  {
    id: 10,
    type: 'MCQ',
    question: 'What is the maximum power transfer condition?',
    options: ['Load = 0', 'Load = Source Resistance', 'Load → ∞', 'No Load'],
    correct: 'Load = Source Resistance',
    explanation: 'Maximum power is transferred when load resistance equals source (Thevenin) resistance.'
  },
  {
    id: 11,
    type: 'MCQ',
    question: 'Which one is a pseudo force?',
    options: ['Gravitational force', 'Centrifugal force', 'Normal force', 'Tension'],
    correct: 'Centrifugal force',
    explanation: 'Centrifugal force is a fictitious force observed in non-inertial (rotating) frames.'
  },
  {
    id: 12,
    type: 'MCQ',
    question: 'A p-type semiconductor is formed by adding:',
    options: ['Pentavalent impurity', 'Trivalent impurity', 'Tetravalent impurity', 'Hexavalent impurity'],
    correct: 'Trivalent impurity',
    explanation: 'Trivalent impurities (like B, Al) create holes by accepting electrons, making the semiconductor p-type.'
  },
  {
    id: 13,
    type: 'MCQ',
    question: 'Orthogonal vectors have:',
    options: ['Dot product = 1', 'Dot product = 0', 'Cross product = 0', 'Equal magnitude'],
    correct: 'Dot product = 0',
    explanation: 'Orthogonal (perpendicular) vectors have zero dot product due to cos(90°) = 0.'
  },
  {
    id: 14,
    type: 'MCQ',
    question: 'Which instrument is used to measure very small currents?',
    options: ['Voltmeter', 'Ammeter', 'Galvanometer', 'Ohmmeter'],
    correct: 'Galvanometer',
    explanation: 'Galvanometers are sensitive instruments used to measure very small electric currents.'
  },
  {
    id: 15,
    type: 'MCQ',
    question: 'Which principle is used in Nuclear Reactors?',
    options: ['Fusion', 'Fission', 'Decay', 'Electrolysis'],
    correct: 'Fission',
    explanation: 'Nuclear reactors work on nuclear fission where heavy nuclei split into smaller nuclei, releasing energy.'
  },
  {
    id: 16,
    type: 'MCQ',
    question: 'Which compound has SP³ hybridization?',
    options: ['CO₂', 'C₂H₂', 'CH₄', 'BF₃'],
    correct: 'CH₄',
    explanation: 'CH₄ (methane) has 4 sigma bonds around carbon, which requires sp³ hybridization.'
  },
  {
    id: 17,
    type: 'MCQ',
    question: 'Which theorem converts a network to a single voltage source?',
    options: ['Norton', 'Thevenin', 'Millman', 'Superposition'],
    correct: 'Thevenin',
    explanation: 'Thevenin’s theorem replaces a linear network with an equivalent voltage source and resistance.'
  },
  {
    id: 18,
    type: 'MCQ',
    question: 'Probability of drawing an ace from a deck is:',
    options: ['1/13', '1/4', '1/52', '4/52'],
    correct: '1/13',
    explanation: 'There are 4 aces in 52 cards, so probability = 4/52 = 1/13.'
  },
  {
    id: 19,
    type: 'MCQ',
    question: 'If sinθ = 3/5, then cosθ = ?',
    options: ['4/5', '5/4', '3/4', '√3/2'],
    correct: '4/5',
    explanation: 'Using identity sin²θ + cos²θ = 1 ⇒ cosθ = √(1 – (3/5)²) = 4/5.'
  },
  {
    id: 20,
    type: 'MCQ',
    question: 'Find the inverse of matrix [[1,2],[3,4]] determinant.',
    options: ['–2', '–1', '1', '2'],
    correct: '–2',
    explanation: 'Determinant = 1×4 – 2×3 = 4 – 6 = –2. Inverse exists since determinant ≠ 0.'
  },
    {
    id: 21,
    type: 'NAT',
    question: 'What is the square of 7?',
    correct: '49',
    explanation: '7 × 7 = 49. The square of a number is the number multiplied by itself.'
  },
  {
    id: 22,
    type: 'NAT',
    question: 'Find x: 3x + 2 = 17',
    correct: '5',
    explanation: 'Solving: 3x = 17 - 2 ⇒ 3x = 15 ⇒ x = 5.'
  },
  {
    id: 23,
    type: 'NAT',
    question: 'Evaluate lim(x→0) sin(x)/x',
    correct: '1',
    explanation: 'This is a standard calculus limit: lim(x→0) sin(x)/x = 1.'
  },
  {
    id: 24,
    type: 'NAT',
    question: 'If velocity = 20 m/s and time = 5s, find distance.',
    correct: '100',
    explanation: 'Distance = velocity × time = 20 × 5 = 100 meters.'
  },
  {
    id: 25,
    type: 'NAT',
    question: 'Atomic number of Aluminium?',
    correct: '13',
    explanation: 'Aluminium has 13 protons, so its atomic number is 13.'
  },
  {
    id: 26,
    type: 'NAT',
    question: 'Mass of 1 mole of H₂?',
    correct: '2',
    explanation: 'Each H atom has mass 1 u, so H₂ = 1 + 1 = 2 grams/mole.'
  },
  {
    id: 27,
    type: 'NAT',
    question: 'Find derivative of x² + 2x + 1 at x = 1',
    correct: '4',
    explanation: 'Derivative is 2x + 2. At x = 1: 2×1 + 2 = 4.'
  },
  {
    id: 28,
    type: 'NAT',
    question: 'Boiling point of water in Kelvin?',
    correct: '373',
    explanation: '100°C + 273 = 373 K.'
  },
  {
    id: 29,
    type: 'NAT',
    question: 'What is log₁₀(1000)?',
    correct: '3',
    explanation: 'log₁₀(1000) = log₁₀(10³) = 3.'
  },
  {
    id: 30,
    type: 'NAT',
    question: 'How many valence electrons in Oxygen?',
    correct: '6',
    explanation: 'Oxygen (atomic number 8) has 6 electrons in its outer shell.'
  },
  {
    id: 31,
    type: 'NAT',
    question: 'If A = 5 and B = 7, compute A² + B².',
    correct: '74',
    explanation: 'A² + B² = 25 + 49 = 74.'
  },
  {
    id: 32,
    type: 'NAT',
    question: 'Calculate the molarity: 2 mols in 1 L.',
    correct: '2',
    explanation: 'Molarity = mols/volume = 2/1 = 2 mol/L.'
  },
  {
    id: 33,
    type: 'NAT',
    question: 'Voltage = Current × Resistance. If I=2A, R=5Ω',
    correct: '10',
    explanation: 'V = I × R = 2 × 5 = 10 volts.'
  },
  {
    id: 34,
    type: 'NAT',
    question: 'What is √16?',
    correct: '4',
    explanation: 'Square root of 16 is 4 because 4² = 16.'
  },
  {
    id: 35,
    type: 'NAT',
    question: 'Evaluate ∫₀² x dx',
    correct: '2',
    explanation: '∫ x dx = (x²/2). From 0 to 2: (4/2 - 0) = 2.'
  },
  {
    id: 36,
    type: 'NAT',
    question: 'Speed = 90km/hr. Time = 2 hr. Find Distance (in km)',
    correct: '180',
    explanation: 'Distance = Speed × Time = 90 × 2 = 180 km.'
  },
  {
    id: 37,
    type: 'NAT',
    question: 'Evaluate log₁₀(1)',
    correct: '0',
    explanation: 'log base 10 of 1 is 0 because 10⁰ = 1.'
  },
  {
    id: 38,
    type: 'NAT',
    question: 'Find the volume of cube with side 5 cm.',
    correct: '125',
    explanation: 'Volume of cube = a³ = 5³ = 125 cm³.'
  },
  {
    id: 39,
    type: 'NAT',
    question: 'Find pH of 0.01 M HCl (strong acid)',
    correct: '2',
    explanation: 'For strong acid: pH = –log₁₀[H⁺] = –log₁₀(0.01) = 2.'
  },
  {
    id: 40,
    type: 'NAT',
    question: 'Value of e⁰',
    correct: '1',
    explanation: 'Any number raised to 0 is 1, so e⁰ = 1.'
  }
];






//  Sample Quizzes using question IDs
const quizzes = {
  1: {
    id: 1,
    title: "GATE Practice Test 1",
    description: "20 MCQ + 20 NAT",
    sections: [
      {
        type: "MCQ",
        questions: allQuestions.slice(0, 20)
      },
      {
        type: "NAT",
        questions: allQuestions.slice(20, 40)
      }
    ]
  },
}

//  Get All Quizzes
app.get("/api/quizzes", (req, res) => {
  const quizList = Object.values(quizzes).map(q => ({
    id: q.id,
    title: q.title,
    description: q.description
  }));
  res.json(quizList);
});

//  Get Quiz by ID

app.get("/api/quizzes/:id", (req, res) => {
  const quiz = quizzes[req.params.id];
  if (!quiz) return res.status(404).send("Quiz not found");
  console.log("🔍 Quiz Fetched:", quiz.title);


  res.json(quiz); // Send full quiz with `sections`
});

app.get("/api/user/profile/:email", (req, res) => {
  const { email } = req.params;
  const sql = "SELECT fullName, email, phone, collegeName, collegeID, profilePic FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(results[0]);
  });
});

app.post("/api/user/change-password", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  const sql = "SELECT password FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, results[0].password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect current password" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updateSql = "UPDATE users SET password = ? WHERE email = ?";
    db.query(updateSql, [hashedNewPassword, email], (updateErr) => {
      if (updateErr) return res.status(500).json({ error: "Password update failed" });
      res.json({ message: "Password updated successfully" });
    });
  });
});



// Submit Quiz Answers
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
        selected: userAnswer || null,
        explanation: q.explanation || ""
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

  //  Send confirmation email
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


//  MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log(" MySQL Connected");
});

// File Upload (Multer)
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

//  Register User
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

//  Login User
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
        email: user.email,
        fullName: user.fullName,
        collegeName: user.collegeName,     
        collegeID: user.collegeID,         
        phone: user.phone                
      });
      
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
