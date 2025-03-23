'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempMoodData, setTempMoodData] = useState(null);

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
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        // If user is logged in, ensure their profile has the email
        if (session?.user?.id) {
          updateUserProfileWithEmail(session.user.id, session.user.email);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        // If user is logged in, ensure their profile has the email
        if (session?.user?.id) {
          // For Google OAuth events, make sure to create a profile
          if (event === 'SIGNED_IN' && session?.user?.app_metadata?.provider === 'google') {
            await updateUserProfileWithEmail(session.user.id, session.user.email);
          } else {
            // For regular email/password auth
            await updateUserProfileWithEmail(session.user.id, session.user.email);
          }
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
        .eq('id', userId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // Error other than "not found"
        console.error('Error fetching user profile:', fetchError);
        return;
      }
      
      if (!profile) {
        // Create profile if it doesn't exist
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert([{ 
            id: userId,
            display_name: email.split('@')[0],
            email: email
          }]);
        
        if (createError) {
          console.error('Error creating user profile:', createError);
        }
      } else if (!profile.email) {
        // Update profile if email is missing
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ email: email })
          .eq('id', userId);
        
        if (updateError) {
          console.error('Error updating user profile with email:', updateError);
        }
      }
    } catch (error) {
      console.error('Error in updateUserProfileWithEmail:', error);
    }
  };
  
  // Sign up with email and password
  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Create user profile after successful signup
      if (data?.user?.id) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            { 
              id: data.user.id,
              display_name: email.split('@')[0], // Default display name from email
              email: email // Store email in user_profiles table
            }
          ]);
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
        
        // Also store email in session data for immediate access
        if (data.session) {
          data.session.email = email;
        }
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Fetch and update the user profile with email if it's missing
      if (data?.user?.id) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('id', data.user.id)
          .single();
        
        if (!profileError && (!profile.email || profile.email === null)) {
          // Update the profile with the email used to sign in
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ email: email })
            .eq('id', data.user.id);
          
          if (updateError) {
            console.error('Error updating user profile with email:', updateError);
          }
        }
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear temp mood data on sign out
      localStorage.removeItem('tempMoodData');
      setTempMoodData(null);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      // Save any current temp mood data to localStorage before redirect
      if (tempMoodData) {
        localStorage.setItem('tempMoodData', JSON.stringify(tempMoodData));
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
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