'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { tempMoodData } = useAuth();
  const [localTempMoodData, setLocalTempMoodData] = useState(null);

  useEffect(() => {
    // Try to load temp mood data from localStorage directly
    try {
      const storedTempMoodData = localStorage.getItem('tempMoodData');
      if (storedTempMoodData) {
        setLocalTempMoodData(JSON.parse(storedTempMoodData));
      }
    } catch (error) {
      console.error('Error loading tempMoodData from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get('code');
      
      if (code) {
        try {
          // Exchange code for session
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Error exchanging code for session:', error);
            router.push('/auth/error');
            return;
          }
          
          // Use either context tempMoodData or localStorage tempMoodData
          const moodData = tempMoodData || localTempMoodData;
          
          // Redirect based on mood flow status
          if (moodData) {
            // If user was in the middle of mood tracking, 
            // redirect back to mood tracking page
            if (moodData.reason === 'No reason specified') {
              // If reason wasn't specified, redirect to mood tracking to enter reason
              router.push('/mood-tracking');
            } else {
              // If reason was already specified, show the confirmation
              router.push('/mood-tracking/confirmation');
            }
          } else {
            // No mood data, just redirect to the main page
            router.push('/mood-tracking');
          }
        } catch (error) {
          console.error('Error handling auth callback:', error);
          router.push('/auth/error');
        }
      } else {
        // No code present, redirect back to mood tracking
        router.push('/mood-tracking');
      }
    };

    // Always run the auth callback handler if code is present, regardless of mood data
    const runCallback = async () => {
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get('code');
      
      if (code) {
        await handleAuthCallback();
      } else if (localTempMoodData || tempMoodData) {
        // Only run without code if there's mood data
        handleAuthCallback();
      }
    };
    
    runCallback();
    
  }, [router, tempMoodData, localTempMoodData]);

  // Fallback timeout - reduced to 2 seconds for quicker handling
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // If nothing happens after 2 seconds, try to proceed anyway
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get('code');
      
      if (code) {
        const exchangeCodeAndRedirect = async () => {
          try {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.error('Error exchanging code in fallback:', error);
              router.push('/auth/error');
              return;
            }
            
            // Force a page reload to ensure auth state is updated completely
            window.location.href = '/mood-tracking';
          } catch (error) {
            console.error('Error in fallback auth handler:', error);
            router.push('/auth/error');
          }
        };
        
        exchangeCodeAndRedirect();
      } else {
        router.push('/mood-tracking');
      }
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3]">
      <div className="text-center p-6">
        <div className="w-16 h-16 border-t-4 border-[#8A8BDE] border-solid rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-cooper text-[#0C0907]">Completing sign in...</h2>
        <p className="text-[#0C0907]/70 mt-2">Please wait while we authenticate your account.</p>
      </div>
    </div>
  );
} 