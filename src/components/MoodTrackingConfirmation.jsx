'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MoodTrackingConfirmation = () => {
  const router = useRouter();
  const [todaysMood, setTodaysMood] = useState(null);

  useEffect(() => {
    // Get the most recent mood entry
    try {
      const existingEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
      if (existingEntries.length > 0) {
        // Sort by date (newest first)
        const sortedEntries = [...existingEntries].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setTodaysMood(sortedEntries[0].mood);
      }
    } catch (error) {
      console.error('Error getting today\'s mood:', error);
    }
  }, []);

  const getMoodIcon = (mood) => {
    if (!mood) return '😐';
    
    switch(mood.value) {
      case 1: return '😔';
      case 2: return '😐';
      case 3: return '😊';
      default: return '😐';
    }
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="flex flex-col items-center">
            {todaysMood && (
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6"
                style={{ backgroundColor: todaysMood.color }}
              >
                {getMoodIcon(todaysMood)}
              </div>
            )}
            
            <div className="text-center">
              <h2 className="text-2xl font-medium mb-2">Thank You</h2>
              <p className="text-secondary mb-2">Your mood has been recorded</p>
              <p className="text-xs text-secondary mb-8">{formatDate()}</p>
            </div>
            
            <div className="w-full space-y-3">
              <Link 
                href="/mood-history" 
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-primary text-white rounded-full font-medium transition-colors hover:bg-primary-hover"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18"></path>
                  <path d="M7 14l4-4 4 4 5-5"></path>
                </svg>
                <span>View Your History</span>
              </Link>
              
              <Link 
                href="/mood-tracking" 
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-muted text-foreground rounded-full font-medium transition-colors hover:bg-secondary hover:text-white"
              >
                <span>Back to Today</span>
              </Link>
            </div>
            
            <div className="mt-10 text-center">
              <p className="text-sm text-secondary">
                Your mood data is being tracked. View patterns and insights in the history page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTrackingConfirmation; 