'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const AuthModal = ({ isOpen, onClose, initialMode = 'signup', afterAuth }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
    
    // Store the current tempMoodData for restoration after authentication
    let tempMoodData = null;
    try {
      const storedData = localStorage.getItem('tempMoodData');
      if (storedData) {
        tempMoodData = JSON.parse(storedData);
        console.log('Preserving temp mood data during authentication:', tempMoodData);
      }
    } catch (error) {
      console.error('Error accessing temp mood data:', error);
    }
    
    try {
      if (mode === 'signup') {
        console.log('Calling signUp function');
        const { success, error, data } = await signUp(email, password);
        console.log('signUp response:', { success, error, data: data ? 'data object' : undefined });
        
        if (success) {
          // Restore tempMoodData if it was stored
          if (tempMoodData) {
            console.log('Restoring temp mood data after successful signup');
            localStorage.setItem('tempMoodData', JSON.stringify(tempMoodData));
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
          // Restore tempMoodData if it was stored
          if (tempMoodData) {
            console.log('Restoring temp mood data after successful signin');
            localStorage.setItem('tempMoodData', JSON.stringify(tempMoodData));
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
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-[#0C0907]/70 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#E5E4E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A8BDE]"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-[#0C0907]/70 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#E5E4E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A8BDE]"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-[#DA7A59]/10 text-[#DA7A59] rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-[#778D5E]/10 text-[#778D5E] rounded-lg text-sm">
              {success}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-medium text-white transition-opacity ${
              loading ? 'opacity-70' : 'opacity-100'
            } bg-[#8A8BDE] hover:bg-[#8A8BDE]/90`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              </span>
            ) : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-5 text-center">
          <button
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            className="text-sm text-[#8A8BDE] hover:text-[#6061C0] transition-colors"
          >
            {mode === 'signup' ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
        
        {/* Subtle branding */}
        <div className="mt-8 text-center">
          <span className="text-xs text-[#0C0907]/40">Pirca — Track your wellbeing journey</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 