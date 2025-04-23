import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      navigate('/login');
    }
  };

  return (
    <button 
      className="btn-link" 
      onClick={handleSignOut}
    >
      Sign Out
    </button>
  );
};

export default StudentDashboard; 