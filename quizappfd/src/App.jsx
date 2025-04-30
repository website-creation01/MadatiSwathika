import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import Results from './pages/Results';
import QuizPage from './pages/QuizPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="results" element={<Results />} />
        </Route>
        <Route path="/quiz/:id" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
