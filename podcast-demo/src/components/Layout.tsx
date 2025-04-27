import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header>
        <div className="header-content">
          <div className="header-brand">
            <img src="/digikor_logo.png" alt="DigiKōr Logo" className="header-logo" />
            <h1>DigiKōr - Digital Kōrero</h1>
          </div>
          {user ? (
            <nav>
              <ul>
                {profile?.role === 'teacher' ? (
                  <>
                    <li>
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                      <Link to="/students">Students</Link>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link to="/course">My Course</Link>
                  </li>
                )}
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
                <li>
                  <button onClick={handleSignOut} className="btn-link">
                    Sign Out
                  </button>
                </li>
              </ul>
            </nav>
          ) : (
            <nav>
              <ul>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </header>
      <main>{children}</main>
      <footer>
        <p>&copy; {new Date().getFullYear()} DigiKōr - Digital Kōrero</p>
      </footer>
    </div>
  );
} 