'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const AuthModal = ({ isOpen, onClose, initialMode = 'signup', afterAuth }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fullName, setFullName] = useState('');
  
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If user becomes authenticated and modal is open, handle success
    if (user && isOpen) {
      console.log('User authenticated, closing modal');
      
      // Reset form state
      setLoading(false);
      setError('');
      setSuccess('Authentication successful!');
      
      // Close the modal with a short delay
      const closeTimeout = setTimeout(() => {
        console.log('Closing auth modal after successful auth');
        if (afterAuth) {
          afterAuth();
        } else {
          onClose();
        }
      }, 500);
      
      return () => clearTimeout(closeTimeout);
    }
  }, [user, isOpen, afterAuth, onClose]);
  
  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setSuccess('');
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);
  
  // Add safety timeout to reset loading state
  useEffect(() => {
    let timeoutId;
    
    if (loading) {
      // If loading state persists for more than 10 seconds, reset it
      timeoutId = setTimeout(() => {
        console.log('Auth operation timeout - resetting loading state');
        setLoading(false);
        setError('The operation is taking longer than expected. Please try again.');
      }, 10000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log(`Starting ${mode} process with email: ${email}`);
    
    // Store the current tempMoodData before authentication to ensure it's not lost
    const currentTempMoodData = (() => {
      try {
        const storedData = localStorage.getItem('tempMoodData');
        console.log('Current tempMoodData before auth:', storedData);
        return storedData;
      } catch (e) {
        console.error('Error accessing tempMoodData from localStorage:', e);
        return null;
      }
    })();
    
    try {
      if (mode === 'signup') {
        console.log('Calling signUp function');
        const { success, error, data } = await signUp(email, password);
        console.log('signUp response:', { success, error, data: data ? 'data object' : undefined });
        
        if (success) {
          // Restore tempMoodData if it existed before authentication
          if (currentTempMoodData) {
            console.log('Restoring tempMoodData after successful signup');
            localStorage.setItem('tempMoodData', currentTempMoodData);
          }
          
          setSuccess('Account created successfully!');
          console.log('Signup successful, closing modal');
          // Close immediately rather than waiting
          if (afterAuth) {
            afterAuth();
          } else {
            onClose();
          }
        } else {
          console.log('Signup failed:', error);
          setError(error || 'Failed to sign up. Please try again.');
          setLoading(false);
        }
      } else {
        console.log('Calling signIn function');
        const { success, error } = await signIn(email, password);
        console.log('signIn response:', { success, error });
        
        if (success) {
          // Restore tempMoodData if it existed before authentication
          if (currentTempMoodData) {
            console.log('Restoring tempMoodData after successful signin');
            localStorage.setItem('tempMoodData', currentTempMoodData);
          }
          
          setSuccess('Signed in successfully!');
          console.log('Sign in successful, closing modal');
          // Close immediately rather than waiting
          if (afterAuth) {
            afterAuth();
          } else {
            onClose();
          }
        } else {
          console.log('Sign in failed:', error);
          setError(error || 'Invalid email or password.');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { success, error } = await signInWithGoogle();
      
      if (!success) {
        setError(error || 'Failed to sign in with Google. Please try again.');
        setLoading(false);
      }
      
      // Set a timeout to prevent UI getting stuck if redirect doesn't happen
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError('Sign-in is taking longer than expected. Please try again.');
      }, 10000);
      
      // Google sign-in redirects to another page, so we don't need to handle success case here
      // We just need to ensure the timeout is cleared if component unmounts
      return () => clearTimeout(timeoutId);
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Google auth error:', error);
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    console.log(`Starting signup process for ${email}`);

    setLoading(true);
    setError('');
    
    // Store current tempMoodData before auth process
    let currentTempMoodData = null;
    try {
      const storedData = localStorage.getItem('tempMoodData');
      console.log('Temporary mood data before signup:', storedData);
      if (storedData) {
        currentTempMoodData = JSON.parse(storedData);
      }
    } catch (err) {
      console.error('Error accessing tempMoodData before signup:', err);
    }
    
    try {
      // Check if the user already exists
      const { data: existingUsers } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase());
      
      if (existingUsers && existingUsers.length > 0) {
        setError('An account with this email already exists. Please sign in instead.');
        setLoading(false);
        return;
      }

      // Create user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        setError(error.message || 'An error occurred during sign up.');
        setLoading(false);
        return;
      }

      console.log('Signup successful:', data);
      
      // Insert user into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: email.toLowerCase(),
            full_name: fullName,
            created_at: new Date(),
          }
        ]);

      if (insertError) {
        console.error('Error inserting user:', insertError);
      }
      
      // Restore tempMoodData after successful authentication
      if (currentTempMoodData) {
        console.log('Restoring mood data after signup:', currentTempMoodData);
        localStorage.setItem('tempMoodData', JSON.stringify(currentTempMoodData));
      }

      setLoading(false);
      if (afterAuth) {
        afterAuth();
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Unexpected signup error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    console.log(`Starting signin process for ${email}`);

    setLoading(true);
    setError('');
    
    // Store current tempMoodData before auth process
    let currentTempMoodData = null;
    try {
      const storedData = localStorage.getItem('tempMoodData');
      console.log('Temporary mood data before signin:', storedData);
      if (storedData) {
        currentTempMoodData = JSON.parse(storedData);
      }
    } catch (err) {
      console.error('Error accessing tempMoodData before signin:', err);
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Signin error:', error);
        setError(error.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      console.log('Signin successful:', data);
      
      // Restore tempMoodData after successful authentication
      if (currentTempMoodData) {
        console.log('Restoring mood data after signin:', currentTempMoodData);
        localStorage.setItem('tempMoodData', JSON.stringify(currentTempMoodData));
      }

      setLoading(false);
      if (afterAuth) {
        afterAuth();
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Unexpected signin error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#0C0907]/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative w-full max-w-md p-6 mx-4 bg-[#F7F6F3] rounded-2xl shadow-xl animate-scale-in">
        {/* Decorative element */}
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-[#DA7A59] via-[#D9C69C] to-[#778D5E]"></div>
        
        {/* Logo centered at the top */}
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Pirca logo" className="h-12 w-12 object-contain" />
        </div>
        
        <h2 className="text-2xl font-semibold mb-6 font-cooper text-[#0C0907] text-center">
          {mode === 'signup' ? 'Join Pirca' : 'Welcome Back to Pirca'}
        </h2>
        
        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 mb-6 rounded-xl font-medium text-[#0C0907] bg-white border border-[#E5E4E0] hover:bg-[#F7F6F3] transition-colors flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" className="mr-3">
            <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
          </svg>
          {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
        </button>
        
        {/* Separator */}
        <div className="flex items-center mb-6">
          <div className="flex-grow h-px bg-[#E5E4E0]"></div>
          <span className="px-4 text-sm text-[#0C0907]/60">or</span>
          <div className="flex-grow h-px bg-[#E5E4E0]"></div>
        </div>
        
        {/* Form */}
        {mode === 'signup' ? (
          <form 
            className="space-y-4 md:space-y-6" 
            onSubmit={handleSignUp}
          >
            <div>
              <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-gray-900">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="Your Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}
            
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-medium text-white transition-opacity bg-[#8A8BDE] hover:bg-[#8A8BDE]/90"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create an account'}
            </button>
            
            <p className="text-sm font-light text-gray-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[#8A8BDE] hover:text-[#6061C0] font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </form>
        ) : (
          <form 
            className="space-y-4 md:space-y-6" 
            onSubmit={handleSignIn}
          >
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}
            
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-medium text-white transition-opacity bg-[#8A8BDE] hover:bg-[#8A8BDE]/90"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            
            <p className="text-sm font-light text-gray-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#8A8BDE] hover:text-[#6061C0] font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </form>
        )}
        
        {/* Subtle branding */}
        <div className="mt-8 text-center">
          <span className="text-xs text-[#0C0907]/40">Pirca — Track your wellbeing journey</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 