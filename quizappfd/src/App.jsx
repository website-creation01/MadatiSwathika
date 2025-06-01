import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyCourses from "./pages/MyCourses";
import ResultsPage from "./pages/ResultsPage";
import QuizPage from "./pages/QuizPage";
import MyProfile from "./pages/MyProfile";
import ChangePassword from "./pages/ChangePassword";
import WelcomePage from "./pages/WelcomePage"; 
import SolutionPage from "./pages/SolutionPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard with nested routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="" element={<WelcomePage />} /> {/* 🆕 Default Page */}
          <Route path="mycourses" element={<MyCourses />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="change-password" element={<ChangePassword />} />
          

        </Route>

        {/* Separate quiz page */}
        <Route path="/quiz/:id" element={<QuizPage />} />
        <Route path="/solution" element={<SolutionPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
