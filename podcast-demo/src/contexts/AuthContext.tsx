import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../utils/supabase';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'teacher' | 'student') => Promise<{ error: any }>;
  signOut: () => Promise<boolean>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  createStudent: (email: string, password: string, fullName: string) => Promise<{ error: any, user?: User | null }>;
  getProfile: (userId: string) => Promise<{ data?: Profile | null, error?: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Function to refresh auth state
  const refreshAuth = async () => {
    try {
      setLoading(true);
      
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error refreshing session:", sessionError);
        return;
      }
      
      // Update session and user state
      setSession(sessionData.session);
      setUser(sessionData.session?.user ?? null);
      
      // Get profile if we have a user
      if (sessionData.session?.user) {
        await getProfile(sessionData.session.user.id);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error in refreshAuth:", error);
    } finally {
      setLoading(false);
      setLastFetch(Date.now());
    }
  };

  useEffect(() => {
    let mounted = true;
    let sessionTimeout: NodeJS.Timeout;
    let refreshTimeout: NodeJS.Timeout;
    
    const getSession = async () => {
      try {
        if (!mounted) return;
        
        setLoading(true);
        console.log("Getting session...");
        
        // Set a timeout for session retrieval
        sessionTimeout = setTimeout(() => {
          if (!mounted) return;
          
          console.error("Session retrieval timed out");
          setLoading(false);
        }, 8000);
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Clear the timeout since we got a response
        clearTimeout(sessionTimeout);
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setLoading(false);
          return;
        }
        
        console.log("Session retrieved:", session ? "Found" : "Not found");
        
        // Update state with session data
        setSession(session);
        setUser(session?.user ?? null);
        setLastFetch(Date.now());
        
        if (session?.user) {
          console.log("User authenticated, getting profile...");
          
          // Add a retry mechanism for profile retrieval
          let retries = 0;
          let profileResult: { data?: Profile | null; error?: any } | null = null;
          
          while (retries < 3 && mounted) {
            if (retries > 0) {
              console.log(`Retry ${retries}/3 getting profile...`);
              await new Promise(r => setTimeout(r, 1000)); // Wait before retry
            }
            
            profileResult = await getProfile(session.user.id);
            retries++;
            
            // If we got data or a non-retriable error, break
            if (profileResult?.data || (profileResult?.error && profileResult.error.code !== 'PGRST116')) {
              break;
            }
          }
          
          // If we still don't have a profile after retries, try to create one
          if (mounted && (!profileResult || !profileResult.data)) {
            console.log("Profile not found after retries, attempting to create");
            await createMissingProfile(session.user.id);
          }
        } else {
          console.log("No authenticated user found");
          setProfile(null);
        }
      } catch (error) {
        if (!mounted) return;
        
        console.error("Error in getSession:", error);
      } finally {
        if (mounted) {
          clearTimeout(sessionTimeout);
          setLoading(false);
        }
      }
    };

    getSession();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event);
        
        // Set loading true during this process
        setLoading(true);
        
        // Update the session and user state
        setSession(session);
        setUser(session?.user ?? null);
        setLastFetch(Date.now());
        
        if (session?.user) {
          console.log("User authenticated after state change, getting profile...");
          
          // Add timeout for profile retrieval
          const profileTimeout = setTimeout(() => {
            if (mounted) {
              console.log("Profile retrieval timed out during auth state change");
              setLoading(false);
            }
          }, 5000);
          
          // Get profile with retries
          let retries = 0;
          let profileResult: { data?: Profile | null; error?: any } | null = null;
          
          while (retries < 2 && mounted) {
            profileResult = await getProfile(session.user.id);
            retries++;
            
            if (profileResult?.data) {
              break;
            }
            
            if (retries < 2) {
              console.log(`Auth state change: retry ${retries}/2 getting profile...`);
              await new Promise(r => setTimeout(r, 800));
            }
          }
          
          clearTimeout(profileTimeout);
        } else {
          console.log("No authenticated user after state change");
          setProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Set up a periodic refresh to prevent stale auth state
    refreshTimeout = setInterval(() => {
      // Only refresh if it's been more than 5 minutes since last fetch
      // and we're not already loading
      if (mounted && !loading && Date.now() - lastFetch > 5 * 60 * 1000) {
        console.log("Auto-refreshing auth state...");
        refreshAuth();
      }
    }, 60 * 1000); // Check every minute

    return () => {
      mounted = false;
      clearTimeout(sessionTimeout);
      clearInterval(refreshTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const getProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      
      // First check if we have a valid user ID
      if (!userId) {
        console.error('Invalid user ID provided to getProfile');
        return { error: 'Invalid user ID' };
      }
      
      // Add a timeout to the fetch operation
      const timeoutPromise = new Promise<{ error: string }>((_, reject) => 
        setTimeout(() => reject({ error: 'Profile fetch timeout' }), 5000)
      );
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Race between fetch and timeout
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('Error fetching profile:', error);
        
        // Clear profile if we got an error
        setProfile(null);
        
        // Try to create profile if not found
        if (error.code === 'PGRST116') {  // Record not found
          console.log('Profile not found, attempting to create');
          return await createMissingProfile(userId);
        }
        
        return { error };
      }

      console.log("Profile retrieved:", data);
      
      if (data) {
        setProfile(data as Profile);
        setLastFetch(Date.now());
        return { data };
      } else {
        console.log("No profile data returned");
        setProfile(null);
        return { error: 'No profile data' };
      }
    } catch (error) {
      console.error("Unexpected error in getProfile:", error);
      setProfile(null);
      return { error };
    }
  };
  
  // Helper function to create a missing profile
  const createMissingProfile = async (userId: string) => {
    try {
      console.log("Creating missing profile for user:", userId);
      
      // Get user data
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      
      if (!user) {
        console.error("No user data available for profile creation");
        return { error: 'No user data' };
      }
      
      // Try direct upsert first
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: 'student', // Default role
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating profile:", error);
        
        // Try RPC fallback
        const { error: rpcError } = await supabase.rpc('ensure_profile_exists', {
          user_id: userId,
          user_role: user.user_metadata?.role || 'student',
          user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          user_email: user.email || ''
        });
        
        if (rpcError) {
          console.error("RPC fallback failed:", rpcError);
          return { error: rpcError };
        }
        
        // Fetch the profile after RPC call
        const { data: profileData, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (fetchError) {
          console.error("Failed to fetch profile after RPC:", fetchError);
          return { error: fetchError };
        }
        
        setProfile(profileData as Profile);
        return { data: profileData };
      }
      
      console.log("Profile created successfully:", data);
      setProfile(data as Profile);
      return { data };
    } catch (error) {
      console.error("Unexpected error in createMissingProfile:", error);
      return { error };
    }
  };

  // Send password reset email
  const resetPassword = async (email: string) => {
    try {
      console.log("Sending password reset email to:", email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error("Password reset error:", error);
        return { error };
      }
      
      console.log("Password reset email sent successfully");
      return { error: null };
    } catch (error) {
      console.error("Unexpected error in resetPassword:", error);
      return { error };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in user:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error);
        return { error };
      }
      
      console.log("Sign in successful:", data.user?.id);
      return { error: null };
    } catch (error) {
      console.error("Unexpected error in signIn:", error);
      return { error };
    }
  };

  // Ensure profile exists using our backup function
  const ensureProfileExists = async (userId: string, role: string, fullName: string, email: string) => {
    try {
      console.log("Calling ensure_profile_exists function for user:", userId);
      const { error } = await supabase.rpc('ensure_profile_exists', {
        user_id: userId,
        user_role: role,
        user_name: fullName,
        user_email: email
      });
      
      if (error) {
        console.error("Error in ensure_profile_exists:", error);
        return { error };
      }
      
      console.log("ensure_profile_exists completed successfully");
      return { error: null };
    } catch (error) {
      console.error("Unexpected error in ensureProfileExists:", error);
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string, role: 'teacher' | 'student') => {
    try {
      // Only allow teacher registration through this method
      if (role !== 'teacher') {
        console.error("Only teachers can register directly");
        return { error: new Error('Only teachers can register directly. Students must be created by teachers.') };
      }

      console.log("Signing up user:", email, "as", role);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        return { error };
      }

      console.log("Sign up successful:", data.user?.id);
      
      // The user should now be signed in automatically after signup
      if (data.user) {
        try {
          console.log("Attempting to create profile after signup");
          
          // Wait a moment to ensure auth state is updated
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Get a fresh session to ensure we have up-to-date tokens
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData.session) {
            console.log("Got fresh session, creating profile");
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                role: role,
                full_name: fullName,
                email: email,
                created_at: new Date(),
                updated_at: new Date()
              });
              
            if (profileError) {
              console.error("Error creating profile:", profileError);
              // Try the backup method with our function
              await ensureProfileExists(data.user.id, role, fullName, email);
            } else {
              console.log("Profile created successfully");
            }
          } else {
            console.log("No session available after signup, profile will be created by trigger");
          }
        } catch (profileError) {
          console.error("Unexpected error creating profile:", profileError);
          // Continue with signup, as the user was created successfully
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error("Unexpected error in signUp:", error);
      return { error };
    }
  };

  // Create student account by teacher
  const createStudent = async (email: string, password: string, fullName: string) => {
    if (!user) {
      console.error("Cannot create student: No authenticated user");
      return { error: new Error('You must be logged in as a teacher to create a student') };
    }

    if (profile?.role !== 'teacher') {
      console.error("Cannot create student: User is not a teacher");
      return { error: new Error('Only teachers can create student accounts') };
    }

    try {
      console.log("Creating student account for:", email);
      
      // Create the auth user with standard signUp instead of admin.createUser
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'student',
          },
        },
      });

      if (error) {
        console.error("Student creation error:", error);
        return { error };
      }

      console.log("Student signup successful:", data.user?.id);
      
      // Manually create the profile for the student
      if (data.user) {
        try {
          console.log("Creating profile for new student");
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              role: 'student',
              full_name: fullName,
              email: email,
              created_at: new Date(),
              updated_at: new Date()
            });
            
          if (profileError) {
            console.error("Error creating student profile:", profileError);
            // Try the backup function
            await ensureProfileExists(data.user.id, 'student', fullName, email);
          } else {
            console.log("Student profile created successfully");
          }
        } catch (profileError) {
          console.error("Unexpected error creating student profile:", profileError);
          // Continue with student creation process
        }
        
        try {
          // Link student to teacher
          const { error: linkError } = await linkStudentToTeacher(data.user.id);
          if (linkError) {
            console.error("Error linking student to teacher:", linkError);
            // Continue anyway, we'll still return success
          }
        } catch (linkError) {
          console.error("Unexpected error linking student:", linkError);
        }
      }
      
      return { error: null, user: data.user };
    } catch (error) {
      console.error("Unexpected error in createStudent:", error);
      return { error };
    }
  };

  // Link student to teacher
  const linkStudentToTeacher = async (studentId: string) => {
    if (!user) return { error: new Error('Teacher not authenticated') };
    
    try {
      const { error } = await supabase
        .from('student_teacher')
        .insert({
          student_id: studentId,
          teacher_id: user.id,
        });
        
      if (error) {
        console.error("Error linking student to teacher:", error);
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error("Unexpected error in linkStudentToTeacher:", error);
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log("Signing out user");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        return false;
      }
      
      // Manually clear state
      setUser(null);
      setProfile(null);
      setSession(null);
      
      console.log("User signed out successfully");
      return true;
    } catch (error) {
      console.error("Unexpected error in signOut:", error);
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      console.error("Cannot update profile: No authenticated user");
      return { error: new Error('User not authenticated') };
    }

    try {
      console.log("Updating profile for user:", user.id);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error("Error updating profile:", error);
        return { error };
      }

      console.log("Profile updated successfully");
      // Refresh profile
      await getProfile(user.id);
      return { error: null };
    } catch (error) {
      console.error("Unexpected error in updateProfile:", error);
      return { error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    createStudent,
    getProfile,
    resetPassword,
    refreshAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 