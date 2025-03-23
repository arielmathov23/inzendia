'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, signOut } = useAuth();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  
  const handleSignOut = async () => {
    const { success } = await signOut();
    if (success) {
      setIsOpen(false);
    }
  };
  
  if (!user) return null;
  
  const userEmail = user.email;
  const userInitial = userEmail ? userEmail[0].toUpperCase() : '?';
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-[#8A8BDE] text-white font-medium hover:bg-[#8A8BDE]/90 transition-colors"
        aria-label="Profile menu"
      >
        {userInitial}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg py-2 z-30 border border-[#E5E4E0] animate-fade-in">
          <div className="px-4 py-3 border-b border-[#E5E4E0]">
            <p className="text-sm font-medium text-[#0C0907]">{userEmail}</p>
            <p className="text-xs text-[#0C0907]/60 mt-1">Joined {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
          
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-[#0C0907]/70 hover:bg-[#F7F6F3] transition-colors"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0C0907]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown; 