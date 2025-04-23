import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Profile() {
  const { profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      setLoading(true);

      const { error } = await updateProfile({
        full_name: fullName,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="profile-card">
        <div className="profile-info">
          <div className="info-group">
            <label>Email</label>
            <p>{profile?.email}</p>
          </div>
          <div className="info-group">
            <label>Role</label>
            <p>{profile?.role === 'teacher' ? 'Teacher' : 'Student'}</p>
          </div>
          <div className="info-group">
            <label>Joined</label>
            <p>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}</p>
          </div>
        </div>
        
        <div className="profile-edit">
          <h3>Edit Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 