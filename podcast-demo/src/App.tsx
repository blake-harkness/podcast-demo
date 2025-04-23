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
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
