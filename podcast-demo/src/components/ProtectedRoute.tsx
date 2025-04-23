import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRole?: 'teacher' | 'student';
};

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const [waitTime, setWaitTime] = useState(0);
  const [retryingProfile, setRetryingProfile] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);

  useEffect(() => {
    console.log('ProtectedRoute state:', { 
      loading, 
      authenticated: !!user, 
      hasProfile: !!profile,
      userRole: profile?.role,
      requiredRole: allowedRole,
      waitTime
    });

    // If stuck loading for more than 8 seconds and haven't refreshed yet, try a refresh
    if (loading && waitTime > 8 && !hasRefreshed) {
      console.log("Authentication taking too long, refreshing page...");
      setHasRefreshed(true);
      window.location.reload();
      return;
    }
    
    // If we have a user but no profile, give it some time and then try to force fetch the profile
    let timer: number | undefined;
    if ((loading || (user && !profile)) && waitTime < 10) {
      console.log(`Waiting for auth/profile to load (${waitTime}s)...`);
      timer = window.setTimeout(() => {
        setWaitTime(prev => prev + 1);
        
        // After 3 seconds without a profile, try to fetch it manually
        if (user && !profile && waitTime >= 3 && !retryingProfile) {
          attemptProfileRetrieval();
        }
      }, 1000);
    }
    
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [loading, user, profile, allowedRole, waitTime, retryingProfile, hasRefreshed]);
  
  // Function to try fetching the profile manually
  const attemptProfileRetrieval = async () => {
    if (!user || retryingProfile) return;
    
    try {
      console.log("Manually attempting to retrieve profile");
      setRetryingProfile(true);
      
      // Create the profile if it doesn't exist
      await supabase.rpc('ensure_profile_exists', {
        user_id: user.id,
        user_role: 'teacher', // Default to teacher if unknown
        user_name: user.email?.split('@')[0] || 'User',
        user_email: user.email || ''
      });
      
      // Small delay to allow the profile to be created
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Now try to get the profile using getSession to avoid RLS issues
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log("Successfully got session, reloading page to refresh profile");
        window.location.reload();
      } else {
        console.log("No session available");
      }
    } catch (error) {
      console.error("Error in manual profile retrieval:", error);
    } finally {
      setRetryingProfile(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    console.log('ProtectedRoute: Still loading authentication state');
    return (
      <div className="loading-container">
        <p>Loading...</p>
        <p className="loading-details">Please wait while we authenticate you...</p>
        {waitTime > 5 && (
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary mt-4"
          >
            Refresh Page
          </button>
        )}
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If we have a user but no profile, it might still be loading or there's an issue
  if (!profile) {
    const message = waitTime >= 4 
      ? "We're having trouble loading your profile. Please try refreshing the page."
      : "Loading your profile...";
      
    console.log(`ProtectedRoute: User authenticated but no profile found (waited ${waitTime}s)`);
    
    return (
      <div className="loading-container">
        <p>{message}</p>
        <p className="loading-details">
          {waitTime >= 3 && !retryingProfile && (
            <button 
              onClick={attemptProfileRetrieval} 
              className="btn-primary"
              style={{ marginTop: '16px' }}
            >
              Retry Loading Profile
            </button>
          )}
        </p>
      </div>
    );
  }

  // Check role if allowedRole is specified
  if (allowedRole && profile.role !== allowedRole) {
    console.log(`ProtectedRoute: User has role ${profile.role} but needs ${allowedRole}, redirecting`);
    // Redirect based on role
    return <Navigate to={profile.role === 'teacher' ? '/dashboard' : '/course'} replace />;
  }

  console.log('ProtectedRoute: Access granted');
  return <>{children}</>;
} 