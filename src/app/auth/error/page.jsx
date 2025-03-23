'use client';

import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#DA7A59]/10 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-[#DA7A59]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold font-cooper text-[#0C0907]">Authentication Error</h2>
          <p className="mt-2 text-[#0C0907]/70">
            We encountered an issue while trying to authenticate your account.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-[#0C0907]/70">
            This could be due to:
          </p>
          <ul className="list-disc pl-5 text-sm text-[#0C0907]/70 space-y-1">
            <li>A temporary service disruption</li>
            <li>An expired or invalid authentication token</li>
            <li>Permissions issues with the authentication provider</li>
          </ul>
          
          <div className="pt-4">
            <Link 
              href="/mood-tracking"
              className="block w-full text-center py-3 rounded-xl font-medium text-white bg-[#8A8BDE] hover:bg-[#8A8BDE]/90 transition-colors"
            >
              Return to Mood Tracking
            </Link>
            
            <p className="mt-4 text-center text-sm text-[#0C0907]/60">
              Need help? <a href="mailto:support@pirca.app" className="text-[#8A8BDE]">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 