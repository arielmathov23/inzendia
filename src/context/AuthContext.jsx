'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempMoodData, setTempMoodData] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Load temp mood data from localStorage on initial load
  useEffect(() => {
    try {
      const storedTempMoodData = localStorage.getItem('tempMoodData');
      if (storedTempMoodData) {
        setTempMoodData(JSON.parse(storedTempMoodData));
      }
    } catch (error) {
      console.error('Error loading tempMoodData from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    // Check for active session on initial load
    const checkUser = async () => {
      try {
        console.log('Checking initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setLoading(false);
          return;
        }
        
        console.log('Initial session check result:', !!session, session?.user?.email);
        
        if (session?.user) {
          console.log('Setting user from initial session', session.user.email);
          setUser(session.user);
          
          // If user is logged in, ensure their profile has the email
          if (session.user.id) {
            await updateUserProfileWithEmail(session.user.id, session.user.email);
          }
        } else {
          console.log('No active session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in event detected');
          if (session?.user) {
            setUser(session.user);
            
            // Ensure profile is updated with email
            await updateUserProfileWithEmail(session.user.id, session.user.email);
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed event detected');
          if (session?.user) {
            setUser(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out event detected');
          setUser(null);
        } else if (event === 'USER_UPDATED') {
          console.log('User updated event detected');
          setUser(session?.user || null);
        } else {
          console.log('Unhandled auth event:', event);
          // Default fallback - update user state based on session
          setUser(session?.user || null);
        }
        
        setLoading(false);
      }
    );
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  // Helper function to ensure user profile has email
  const updateUserProfileWithEmail = async (userId, email) => {
    if (!userId || !email) return;
    
    try {
      // Check if user profile exists and has email
      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId);
      
      if (fetchError) {
        // Error fetching profile
        console.error('Error fetching user profile:', fetchError);
        return;
      }
      
      if (!profile || profile.length === 0) {
        // Create profile if it doesn't exist - using upsert instead of insert to handle potential conflicts
        const { error: createError } = await supabase
          .from('user_profiles')
          .upsert([{ 
            id: userId,
            display_name: email.split('@')[0],
            email: email
          }], { onConflict: 'id' });
        
        if (createError) {
          console.error('Error creating user profile:', createError);
        }
      }
    } catch (error) {
      console.error('Error in updateUserProfileWithEmail:', error);
    }
  };
  
  // Sign up with email and password
  const signUp = async (email, password) => {
    console.log('Starting signup process for:', email);
    setAuthLoading(true);
    
    // Preserve any current tempMoodData before signup
    let currentTempMoodData = null;
    try {
      const storedData = localStorage.getItem('tempMoodData');
      if (storedData) {
        currentTempMoodData = JSON.parse(storedData);
        console.log('Preserved tempMoodData before signup:', currentTempMoodData);
      }
    } catch (e) {
      console.error('Error parsing tempMoodData during signup:', e);
    }
    
    try {
      // First clear any existing sessions to avoid conflicts
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Update user state if we got a user back
      if (data?.user) {
        console.log('User signed up successfully, creating profile...');
        setUser(data.user);
        
        try {
          // Create a user profile in the user_profiles table
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert([
              {
                id: data.user.id,
                email: data.user.email,
                created_at: new Date().toISOString(),
              },
            ]);
            
          if (profileError) {
            console.error('Error creating user profile:', profileError);
          } else {
            console.log('User profile created successfully.');
          }
        } catch (profileError) {
          console.error('Exception creating user profile:', profileError);
        }
        
        // Restore saved tempMoodData after successful signup
        if (currentTempMoodData) {
          console.log('Restoring tempMoodData after signup:', currentTempMoodData);
          setTempMoodData(currentTempMoodData);
          localStorage.setItem('tempMoodData', JSON.stringify(currentTempMoodData));
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };
  
  // Sign in with email and password
  const signIn = async (email, password) => {
    console.log('Starting signin process for:', email);
    setAuthLoading(true);
    
    // Preserve any current tempMoodData before signin
    let currentTempMoodData = null;
    try {
      const storedData = localStorage.getItem('tempMoodData');
      if (storedData) {
        currentTempMoodData = JSON.parse(storedData);
        console.log('Preserved tempMoodData before signin:', currentTempMoodData);
      }
    } catch (e) {
      console.error('Error parsing tempMoodData during signin:', e);
    }
    
    try {
      // First clear any existing sessions to avoid conflicts
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Update user state if we got a user back
      if (data?.user) {
        console.log('User signed in successfully, checking profile...');
        setUser(data.user);
        
        // Check if user has a profile, and if not create one
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('id', data.user.id)
            .single();
            
          if (profileError || !profileData?.email) {
            console.log('Profile not found or missing email, creating/updating...');
            
            // Create/update user profile
            const { error: upsertError } = await supabase
              .from('user_profiles')
              .upsert([
                {
                  id: data.user.id,
                  email: data.user.email,
                  updated_at: new Date().toISOString(),
                },
              ]);
              
            if (upsertError) {
              console.error('Error creating/updating user profile:', upsertError);
            } else {
              console.log('User profile created/updated successfully.');
            }
          }
        } catch (profileError) {
          console.error('Exception checking/creating user profile:', profileError);
        }
        
        // Restore saved tempMoodData after successful signin
        if (currentTempMoodData) {
          console.log('Restoring tempMoodData after signin:', currentTempMoodData);
          setTempMoodData(currentTempMoodData);
          localStorage.setItem('tempMoodData', JSON.stringify(currentTempMoodData));
        }
      }
    } catch (error) {
      console.error('Signin error:', error);
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      console.log('Signing out...');
      
      // Clear temp mood data on sign out
      localStorage.removeItem('tempMoodData');
      setTempMoodData(null);
      
      // Clear user state immediately
      setUser(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during signOut:', error);
        throw error;
      }
      
      console.log('Sign out successful, will reload page');
      
      // Force full page navigation to root to completely reset app state
      window.location.href = '/';
      
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      // Clear any existing sessions first to prevent login issues
      await supabase.auth.signOut();
      
      // Save any current temp mood data to localStorage before redirect
      if (tempMoodData) {
        localStorage.setItem('tempMoodData', JSON.stringify(tempMoodData));
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            // Always prompt for account selection
            prompt: 'select_account',
            // Request offline access to get refresh token
            access_type: 'offline'
          }
        }
      });
      
      if (error) {
        console.error('Google sign-in error:', error);
        throw error;
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Store temporary mood data during signup process
  const storeTempMoodData = (data) => {
    // Store in state
    setTempMoodData(data);
    
    // Also store in localStorage for persistence across page loads
    if (data) {
      localStorage.setItem('tempMoodData', JSON.stringify(data));
    } else {
      localStorage.removeItem('tempMoodData');
    }
  };
  
  // Clear temporary mood data after it's been processed
  const clearTempMoodData = () => {
    setTempMoodData(null);
    localStorage.removeItem('tempMoodData');
  };
  
  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    tempMoodData,
    storeTempMoodData,
    clearTempMoodData,
    isAuthenticated: !!user,
    authLoading,
    authError,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 