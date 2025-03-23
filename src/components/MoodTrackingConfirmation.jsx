'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase';

const MoodTrackingConfirmation = () => {
  const router = useRouter();
  const [todaysMood, setTodaysMood] = useState(null);
  const [todaysMoodReason, setTodaysMoodReason] = useState('');
  const { user, isAuthenticated, tempMoodData } = useAuth();

  useEffect(() => {
    const loadMoodData = async () => {
      try {
        // Check for authenticated user data first
        if (isAuthenticated && user) {
          // Get today's date in YYYY-MM-DD format
          const today = new Date();
          const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          
          const { data, error } = await supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', formattedDate)
            .single();
            
          if (!error && data) {
            setTodaysMood({
              value: data.mood_value,
              label: data.mood_label,
              color: data.mood_color
            });
            setTodaysMoodReason(data.reason);
            return;
          }
        }
        
        // Check tempMoodData from context or localStorage
        let moodData = tempMoodData;
        if (!moodData) {
          try {
            const storedData = localStorage.getItem('tempMoodData');
            moodData = storedData ? JSON.parse(storedData) : null;
          } catch (e) {
            console.error('Error parsing tempMoodData from localStorage:', e);
          }
        }
        
        if (moodData) {
          setTodaysMood(moodData.mood);
          setTodaysMoodReason(moodData.reason);
          return;
        }
        
        // Fall back to generic mood entries in localStorage
        const existingEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        if (existingEntries.length > 0) {
          // Sort by date (newest first)
          const sortedEntries = [...existingEntries].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
          setTodaysMood(sortedEntries[0].mood);
          setTodaysMoodReason(sortedEntries[0].reason || 'No reason specified');
        }
      } catch (error) {
        console.error('Error getting today\'s mood:', error);
      }
    };
    
    loadMoodData();
  }, [isAuthenticated, user, tempMoodData]);

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
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
          <div className="h-1.5 bg-gradient-to-r from-[#DA7A59] via-[#D9C69C] to-[#778D5E]"></div>
          
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">{getMoodIcon(todaysMood)}</div>
            
            <h1 className="text-2xl font-semibold font-cooper text-[#0C0907] mb-2">
              Mood Tracked Successfully
            </h1>
            
            <p className="text-[#0C0907]/70 mb-6">
              You recorded a <span className="font-medium" style={{ color: todaysMood?.color }}>
                {todaysMood?.label || 'Neutral'}
              </span> mood for {formatDate()}.
            </p>
            
            {todaysMoodReason && (
              <div className="mb-6 p-4 bg-[#F7F6F3] rounded-xl">
                <p className="text-sm text-[#0C0907]/80 italic">"{todaysMoodReason}"</p>
              </div>
            )}
            
            <div className="space-y-3">
              <Link
                href="/mood-tracking"
                className="block w-full py-3 rounded-xl font-medium text-white bg-[#8A8BDE] hover:bg-[#8A8BDE]/90 transition-colors"
              >
                Return to Mood Tracking
              </Link>
              
              <Link
                href="/insights"
                className="block w-full py-3 rounded-xl font-medium border border-[#8A8BDE] text-[#8A8BDE] hover:bg-[#8A8BDE]/10 transition-colors"
              >
                View Mood Insights
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