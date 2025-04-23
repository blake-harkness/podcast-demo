import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until auth is loaded
    if (loading) return;

    if (!user) {
      // Not logged in - go to login page
      navigate('/login');
    } else if (profile?.role === 'teacher') {
      // Teacher - go to dashboard
      navigate('/dashboard');
    } else if (profile?.role === 'student') {
      // Student - go to course
      navigate('/course');
    }
  }, [user, profile, loading, navigate]);

  // Show loading until redirect happens
  return <div>Loading...</div>;
} 