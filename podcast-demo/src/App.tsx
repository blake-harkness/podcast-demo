import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { Students } from './pages/Students';
import { StudentCourse } from './pages/StudentCourse';
import { CreateStudent } from './pages/CreateStudent';
import Lesson1 from './pages/lessons/Lesson1';
import Lesson2 from './pages/lessons/Lesson2';
import Lesson3 from './pages/lessons/Lesson3';
import Lesson4 from './pages/lessons/Lesson4';
import Lesson5 from './pages/lessons/Lesson5';
import Lesson6 from './pages/lessons/Lesson6';
import Lesson7 from './pages/lessons/Lesson7';
import Lesson8 from './pages/lessons/Lesson8';
import Lesson9 from './pages/lessons/Lesson9';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes for all authenticated users */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Teacher-only routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-student"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <CreateStudent />
                </ProtectedRoute>
              }
            />

            {/* Student-only routes */}
            <Route
              path="/course"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentCourse />
                </ProtectedRoute>
              }
            />
            
            {/* Lesson routes with updated paths */}
            <Route
              path="/course/lesson1"
              element={
                <ProtectedRoute allowedRole="student">
                  <Lesson1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/lesson2"
              element={
                <ProtectedRoute allowedRole="student">
                  <Lesson2 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/lesson3"
              element={
                <ProtectedRoute allowedRole="student">
                  <Lesson3 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/lesson4"
              element={
                <ProtectedRoute allowedRole="student">
                  <Lesson4 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/lesson5"
              element={
                <ProtectedRoute allowedRole="student">
                  <Lesson5 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/lesson6"
              element={
                <ProtectedRoute allowedRole="student">
                  <Lesson6 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/lesson7"
              element={
                <ProtectedRoute allowedRole="student">
                  <Lesson7 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/lesson8"
              element={
                <ProtectedRoute allowedRole="student">
                  <Lesson8 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/lesson9"
              element={
                <ProtectedRoute allowedRole="student">
                  <Lesson9 />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
