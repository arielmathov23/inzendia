'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';

const LoginButton = () => {
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) return null;
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-[#8A8BDE] text-white hover:bg-[#6061C0] px-4 py-2 rounded-full transition-colors text-sm font-medium shadow-sm"
      >
        Sign In
      </button>
      
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialMode="signin"
        afterAuth={() => setShowModal(false)}
      />
    </>
  );
};

export default LoginButton; 