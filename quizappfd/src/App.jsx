import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyCourses from "./pages/MyCourses";
import Results from "./pages/Results";
import QuizPage from "./pages/QuizPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="" element={<MyCourses />} />         {/* /dashboard */}
          <Route path="results" element={<Results />} />    {/* /dashboard/results */}
        </Route>

        {/* Quiz Attempt Page */}
        <Route path="/quiz/:id" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
