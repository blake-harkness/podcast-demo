import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function StudentDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Student Dashboard</h2>
      <p>Welcome to your dashboard</p>
      
      <div className="button-group mt-4">
        <Link to="/course" className="btn-primary">Go to Course</Link>
        <button onClick={handleSignOut} className="btn-secondary mt-2">Sign Out</button>
      </div>
    </div>
  );
} 