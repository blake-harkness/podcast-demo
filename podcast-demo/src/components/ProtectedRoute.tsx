import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRole?: 'teacher' | 'student';
};

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, profile, loading, getProfile, refreshAuth } = useAuth();
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

    // If stuck loading for more than 6 seconds and haven't refreshed yet, try refreshAuth
    if (loading && waitTime > 6 && !hasRefreshed) {
      console.log("Authentication taking too long, refreshing auth state...");
      setHasRefreshed(true);
      refreshAuth();
      return;
    }
    
    // If loading persists for more than 10 seconds, force page reload
    if (loading && waitTime > 10 && hasRefreshed) {
      console.log("Auth refresh didn't resolve, reloading page...");
      window.location.reload();
      return;
    }
    
    // If we have a user but no profile, give it some time and then try to force fetch the profile
    let timer: number | undefined;
    if ((loading || (user && !profile)) && waitTime < 15) {
      console.log(`Waiting for auth/profile to load (${waitTime}s)...`);
      timer = window.setTimeout(() => {
        setWaitTime(prev => prev + 1);
        
        // After 2 seconds without a profile, try to fetch it manually
        if (user && !profile && waitTime >= 2 && !retryingProfile) {
          attemptProfileRetrieval();
        }
      }, 1000);
    }
    
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [loading, user, profile, allowedRole, waitTime, retryingProfile, hasRefreshed, refreshAuth]);
  
  // Function to try fetching the profile manually
  const attemptProfileRetrieval = async () => {
    if (!user || retryingProfile) return;
    
    try {
      console.log("Manually attempting to retrieve profile");
      setRetryingProfile(true);
      
      // First try direct profile fetch
      if (getProfile) {
        console.log("Using context getProfile function");
        const result = await getProfile(user.id);
        if (result.data && !result.error) {
          console.log("Profile retrieved successfully via context");
          return;
        }
      }
      
      // Then try direct query
      const { data: directProfile, error: directError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (directProfile && !directError) {
        console.log("Profile retrieved via direct query, refreshing auth");
        await refreshAuth();
        return;
      }
      
      // If that fails, create the profile
      console.log("Attempting to create profile");
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          role: 'student',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (upsertError) {
        console.error("Error upserting profile:", upsertError);
      } else {
        console.log("Profile created successfully");
      }
      
      // Fallback to RPC function
      await supabase.rpc('ensure_profile_exists', {
        user_id: user.id,
        user_role: user.user_metadata?.role || 'student',
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        user_email: user.email || ''
      });
      
      // Small delay to allow the profile to be created
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh auth state after profile creation
      await refreshAuth();
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
        {waitTime > 4 && (
          <button 
            onClick={() => refreshAuth()} 
            className="btn-primary mt-4"
          >
            Refresh Authentication
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
    const message = waitTime >= 3 
      ? "We're having trouble loading your profile. Please try refreshing the page."
      : "Loading your profile...";
      
    console.log(`ProtectedRoute: User authenticated but no profile found (waited ${waitTime}s)`);
    
    return (
      <div className="loading-container">
        <p>{message}</p>
        <div className="loading-details">
          {waitTime >= 2 && (
            <button 
              onClick={attemptProfileRetrieval} 
              className="btn-primary"
              disabled={retryingProfile}
              style={{ marginTop: '16px', marginRight: '8px' }}
            >
              {retryingProfile ? 'Loading Profile...' : 'Retry Loading Profile'}
            </button>
          )}
          {waitTime >= 4 && (
            <button 
              onClick={() => window.location.reload()} 
              className="btn-secondary"
              style={{ marginTop: '16px' }}
            >
              Reload Page
            </button>
          )}
        </div>
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