import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function CreateStudent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { createStudent, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not a teacher
    if (profile && profile.role !== 'teacher') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  // If profile is not loaded yet, don't render anything
  if (!profile) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  const validateForm = () => {
    if (!email || !password || !fullName) {
      setError('Please fill in all fields');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      const { error, user } = await createStudent(email, password, fullName);
      
      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('auth/invalid-email')) {
          errorMessage = 'Invalid email address format';
        } else if (error.message.includes('already in use')) {
          errorMessage = 'This email is already registered. Please use another email or add the existing student.';
        } else if (error.message.includes('Database error saving new user')) {
          errorMessage = 'Error creating student profile. Please try again.';
        }
        
        setError(errorMessage);
        return;
      }
      
      setSuccess(`Student account for ${fullName} (${email}) created successfully`);
      // Clear form after successful creation
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Student Account</h2>
        <p className="auth-subtitle">Create an account for your student</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Student Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Student Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Temporary Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <small>The student will use this password for their first login. Must be at least 6 characters.</small>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Student Account'}
          </button>
        </form>
        
        <button 
          className="btn-secondary mt-4" 
          onClick={() => navigate('/dashboard')}
          disabled={loading}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
} 