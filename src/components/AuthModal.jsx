'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialMode = 'signup', afterAuth }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signIn, signUp } = useAuth();
  
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'signup') {
        const { success, error } = await signUp(email, password);
        if (success) {
          setSuccess('Account created successfully!');
          // Brief delay before closing to show success message
          setTimeout(() => {
            if (afterAuth) afterAuth();
          }, 1000);
        } else {
          setError(error || 'Failed to sign up. Please try again.');
        }
      } else {
        const { success, error } = await signIn(email, password);
        if (success) {
          if (afterAuth) afterAuth();
        } else {
          setError(error || 'Invalid email or password.');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', error);
    } finally {
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
        
        <h2 className="text-2xl font-semibold mb-6 font-cooper text-[#0C0907]">
          {mode === 'signup' ? 'Join Pirca' : 'Welcome Back'}
        </h2>
        
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