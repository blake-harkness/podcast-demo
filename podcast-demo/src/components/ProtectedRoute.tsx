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

    // Break endless loop if we've been waiting too long
    if (waitTime > 20 && user && !profile) {
      console.log("Breaking out of profile retrieval loop after 20 seconds");
      // Force user to log out and try again
      window.localStorage.clear();
      window.location.href = '/login?error=profile';
      return;
    }

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
    if ((loading || (user && !profile)) && waitTime < 20) {
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
      
      console.log("Profile not found, attempting to create profile");
      
      // Create a new profile since it doesn't exist
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          role: 'student', // Default role
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'id' 
        });
        
      if (upsertError) {
        console.error("Error upserting profile:", upsertError);
        
        // If we hit a permission error or other issue, try RPC as fallback
        if (upsertError.code === '42501' || upsertError.code === '23505') {
          await tryRpcFallback();
        } else {
          // For other errors, wait and retry once more
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await tryDirectInsert();
        }
      } else {
        console.log("Profile created successfully");
        // Refresh auth state after successful profile creation
        await refreshAuth();
      }
    } catch (error) {
      console.error("Error in manual profile retrieval:", error);
      await tryRpcFallback();
    } finally {
      setRetryingProfile(false);
    }
  };
  
  // Try direct insert as an alternative way
  const tryDirectInsert = async () => {
    try {
      console.log("Attempting direct insert of profile");
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user?.id,
          role: 'student',
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (!insertError) {
        console.log("Profile inserted successfully");
        await refreshAuth();
      } else {
        console.error("Error in direct insert:", insertError);
      }
    } catch (error) {
      console.error("Error in tryDirectInsert:", error);
    }
  };
  
  // Try RPC function as fallback
  const tryRpcFallback = async () => {
    try {
      console.log("Trying RPC ensure_profile_exists as fallback");
      const { error: rpcError } = await supabase.rpc('ensure_profile_exists', {
        user_id: user?.id,
        user_role: user?.user_metadata?.role || 'student',
        user_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
        user_email: user?.email || ''
      });
      
      if (rpcError) {
        console.error("Error in RPC call:", rpcError);
      } else {
        console.log("Profile created via RPC");
        // Small delay to allow the profile to be created
        await new Promise(resolve => setTimeout(resolve, 800));
        await refreshAuth();
      }
    } catch (error) {
      console.error("Error in tryRpcFallback:", error);
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