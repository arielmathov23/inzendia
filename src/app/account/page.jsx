'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';
import supabase from '@/lib/supabase';

export default function AccountPage() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timezone, setTimezone] = useState('');
  const [userTimezone, setUserTimezone] = useState('');
  const [savingTimezone, setSavingTimezone] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  useEffect(() => {
    // Get user's browser timezone
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(browserTimezone);
    
    // Fetch user profile if authenticated
    if (isAuthenticated && user) {
      fetchUserProfile();
    }
  }, [isAuthenticated, user]);
  
  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('timezone')
        .eq('id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data && data.timezone) {
        setUserTimezone(data.timezone);
        setTimezone(data.timezone);
      }
    } catch (error) {
      console.error('Error fetching user timezone:', error);
    }
  };
  
  const saveTimezone = async () => {
    if (!isAuthenticated || !user) return;
    
    setSavingTimezone(true);
    setSaveMessage('');
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          timezone: timezone,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setUserTimezone(timezone);
      setSaveMessage('Timezone saved successfully');
      
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving timezone:', error);
      setSaveMessage('Failed to save timezone');
    } finally {
      setSavingTimezone(false);
    }
  };
  
  const handleSignOut = async () => {
    setLoading(true);
    const { success } = await signOut();
    setLoading(false);
  };
  
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 pb-20 sm:p-6" style={{ backgroundColor: '#E5E4E0' }}>
      <div className="w-full max-w-md">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0C0907] font-cooper">Account</h1>
          <p className="text-sm sm:text-base text-[#0C0907]/70 mt-1">Manage your Pirca profile</p>
        </header>
        
        <div className="bg-[#F0EFEB] rounded-xl p-6 shadow-sm mb-4">
          {isAuthenticated && user ? (
            <div>
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[#8A8BDE] flex items-center justify-center text-white text-2xl font-medium">
                  {user.email ? user.email[0].toUpperCase() : '?'}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-cooper text-[#0C0907]">{user.email}</h2>
                  <p className="text-sm text-[#0C0907]/60 mt-1">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Location/Timezone setting */}
              <div className="mb-6">
                <label htmlFor="timezone" className="block text-[#0C0907] text-sm font-medium mb-2">
                  Location (Timezone)
                </label>
                <div className="relative">
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-white rounded-md border border-[#E5E4E0] focus:outline-none focus:ring-1 focus:ring-[#8A8BDE] appearance-none text-sm"
                  >
                    {/* Major timezones with GMT references */}
                    <optgroup label="Americas">
                      <option value="America/New_York">Eastern Time (GMT-5) - New York</option>
                      <option value="America/Chicago">Central Time (GMT-6) - Chicago</option>
                      <option value="America/Denver">Mountain Time (GMT-7) - Denver</option>
                      <option value="America/Los_Angeles">Pacific Time (GMT-8) - Los Angeles</option>
                      <option value="America/Anchorage">Alaska Time (GMT-9) - Anchorage</option>
                      <option value="Pacific/Honolulu">Hawaii Time (GMT-10) - Honolulu</option>
                      <option value="America/Halifax">Atlantic Time (GMT-4) - Halifax</option>
                      <option value="America/St_Johns">Newfoundland Time (GMT-3:30) - St. John's</option>
                      <option value="America/Sao_Paulo">São Paulo (GMT-3) - Brazil</option>
                      <option value="America/Mexico_City">Mexico City (GMT-6) - Mexico</option>
                    </optgroup>
                    <optgroup label="Europe & Africa">
                      <option value="Europe/London">London (GMT+0) - UK</option>
                      <option value="Europe/Paris">Paris (GMT+1) - France</option>
                      <option value="Europe/Berlin">Berlin (GMT+1) - Germany</option>
                      <option value="Europe/Madrid">Madrid (GMT+1) - Spain</option>
                      <option value="Europe/Rome">Rome (GMT+1) - Italy</option>
                      <option value="Europe/Athens">Athens (GMT+2) - Greece</option>
                      <option value="Europe/Moscow">Moscow (GMT+3) - Russia</option>
                      <option value="Africa/Cairo">Cairo (GMT+2) - Egypt</option>
                      <option value="Africa/Johannesburg">Johannesburg (GMT+2) - South Africa</option>
                      <option value="Africa/Lagos">Lagos (GMT+1) - Nigeria</option>
                    </optgroup>
                    <optgroup label="Asia & Pacific">
                      <option value="Asia/Dubai">Dubai (GMT+4) - UAE</option>
                      <option value="Asia/Kolkata">Mumbai/Delhi (GMT+5:30) - India</option>
                      <option value="Asia/Bangkok">Bangkok (GMT+7) - Thailand</option>
                      <option value="Asia/Singapore">Singapore (GMT+8) - Singapore</option>
                      <option value="Asia/Hong_Kong">Hong Kong (GMT+8) - China</option>
                      <option value="Asia/Tokyo">Tokyo (GMT+9) - Japan</option>
                      <option value="Asia/Seoul">Seoul (GMT+9) - South Korea</option>
                      <option value="Australia/Sydney">Sydney (GMT+10) - Australia</option>
                      <option value="Australia/Perth">Perth (GMT+8) - Australia</option>
                      <option value="Pacific/Auckland">Auckland (GMT+12) - New Zealand</option>
                    </optgroup>
                  </select>
                  <div className="absolute right-0 top-0">
                    <button
                      onClick={saveTimezone}
                      disabled={savingTimezone || timezone === userTimezone}
                      className={`h-10 px-4 rounded-tr-md rounded-br-md text-sm font-medium text-white ${
                        savingTimezone || timezone === userTimezone
                          ? 'bg-[#5A5A58]/50 cursor-not-allowed'
                          : 'bg-[#5A5A58] hover:bg-[#5A5A58]/90'
                      }`}
                    >
                      {savingTimezone ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
                {saveMessage && (
                  <p className={`mt-2 text-sm ${saveMessage.includes('Failed') ? 'text-[#DA7A59]' : 'text-[#778D5E]'}`}>
                    {saveMessage}
                  </p>
                )}
                <p className="mt-2 text-xs text-[#0C0907]/60">
                  Your timezone helps us show mood patterns in your local time.
                </p>
              </div>
              
              {/* More subtle sign out button */}
              <div className="border-t border-[#E5E4E0] pt-6 mt-6">
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className={`w-full py-2.5 rounded-lg font-medium transition-colors text-[#5A5A58] ${
                    loading ? 'opacity-70' : 'opacity-100'
                  } bg-[#F7F6F3] hover:bg-[#E5E4E0] text-sm`}
                >
                  {loading ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#F7F6F3] mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0C0907]/70">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h2 className="text-xl font-cooper text-[#0C0907] mb-2">Not Signed In</h2>
              <p className="text-[#0C0907]/70 mb-6">Sign in to sync your mood data across devices</p>
              
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full py-3 rounded-xl font-medium text-white bg-[#8A8BDE] hover:bg-[#8A8BDE]/90 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-[#F0EFEB] rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-cooper text-[#0C0907] mb-4">About Pirca</h3>
          <p className="text-sm text-[#0C0907]/70 mb-4">
            Pirca helps you track your daily mood and emotional well-being, providing insights and patterns over time.
          </p>
          <div className="text-sm text-[#0C0907]/60">Version 1.0.0</div>
        </div>
      </div>
      
      {/* Bottom navbar with 4 options */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#F7F6F3] px-4 py-3 shadow-md rounded-t-2xl border-t border-[#E5E4E0]">
        <div className="flex justify-around max-w-md mx-auto">
          <Link 
            href="/mood-tracking" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-3 h-0.5 bg-transparent opacity-0 rounded-b-md transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#5A5A58]"></div>
            <div className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white group-hover:shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0C0907]/60 group-hover:text-[#5A5A58]">
                <circle cx="12" cy="12" r="8"></circle>
                <circle cx="12" cy="12" r="3"></circle>
                <line x1="12" y1="4" x2="12" y2="4.01"></line>
                <line x1="12" y1="20" x2="12" y2="20.01"></line>
                <line x1="4" y1="12" x2="4.01" y2="12"></line>
                <line x1="20" y1="12" x2="20.01" y2="12"></line>
              </svg>
            </div>
            <span className="mt-0.5 text-[12px] sm:text-[13px] font-medium font-cooper text-[#0C0907]/60 group-hover:text-[#5A5A58]">Track</span>
          </Link>
          
          <Link 
            href="/mood-history" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-3 h-0.5 bg-transparent opacity-0 rounded-b-md transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#5A5A58]"></div>
            <div className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white group-hover:shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0C0907]/60 group-hover:text-[#5A5A58]">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <span className="mt-0.5 text-[12px] sm:text-[13px] font-medium font-cooper text-[#0C0907]/60 group-hover:text-[#5A5A58]">History</span>
          </Link>
          
          <Link 
            href="/insights" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-3 h-0.5 bg-transparent opacity-0 rounded-b-md transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#5A5A58]"></div>
            <div className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white group-hover:shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0C0907]/60 group-hover:text-[#5A5A58]">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                <path d="M20 2a10 10 0 0 0-10 10"></path>
                <path d="M16 2a10 10 0 0 0-10 10"></path>
              </svg>
            </div>
            <span className="mt-0.5 text-[12px] sm:text-[13px] font-medium font-cooper text-[#0C0907]/60 group-hover:text-[#5A5A58]">Insights</span>
          </Link>
          
          <Link 
            href="/account" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-3 h-0.5 bg-[#5A5A58] opacity-100 rounded-b-md transition-all duration-300"></div>
            <div className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 bg-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5A5A58]">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span className="mt-0.5 text-[12px] sm:text-[13px] font-medium font-cooper text-[#5A5A58]">Account</span>
          </Link>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
        afterAuth={() => setShowAuthModal(false)}
      />
    </div>
  );
} 