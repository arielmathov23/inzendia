'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase';

// Custom styles for irregular shapes
const customStyles = `
  .irregular-blob {
    border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%;
  }
  
  .irregular-blob-high {
    border-radius: 50% 60% 40% 70% / 45% 55% 60% 40%;
  }
  
  .irregular-blob-neutral {
    border-radius: 65% 35% 55% 45% / 40% 50% 65% 55%;
  }
  
  .irregular-blob-low {
    border-radius: 40% 60% 70% 30% / 55% 40% 60% 45%;
  }
`;

const MoodInsights = () => {
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // 'week', 'month', or 'year'
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    loadMoodData();
  }, [isAuthenticated, user]);

  const loadMoodData = async () => {
    setLoading(true);
    try {
      // Load from Supabase for authenticated users
      if (isAuthenticated && user) {
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        // Transform Supabase data to match the local format
        const formattedEntries = data.map(entry => ({
          mood: {
            value: entry.mood_value,
            label: entry.mood_label,
            color: entry.mood_color
          },
          reason: entry.reason,
          date: new Date(entry.date).toISOString()
        }));
        
        setMoodEntries(formattedEntries);
      } 
      // Load from localStorage for anonymous users
      else {
        const storedEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        setMoodEntries(storedEntries);
      }
    } catch (error) {
      console.error('Error loading mood data:', error);
      setMoodEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEntries = () => {
    if (moodEntries.length === 0) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (period === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    return moodEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= cutoffDate;
    });
  };

  const getAverageMoodValue = (entries) => {
    if (!entries.length) return 2;
    
    const sum = entries.reduce((total, entry) => total + entry.mood.value, 0);
    return (sum / entries.length).toFixed(1);
  };
  
  const getMoodDistribution = (entries) => {
    const distribution = { 1: 0, 2: 0, 3: 0 };
    
    entries.forEach(entry => {
      distribution[entry.mood.value] = (distribution[entry.mood.value] || 0) + 1;
    });
    
    const total = entries.length;
    
    return {
      low: total > 0 ? Math.round((distribution[1] / total) * 100) : 0,
      neutral: total > 0 ? Math.round((distribution[2] / total) * 100) : 0,
      high: total > 0 ? Math.round((distribution[3] / total) * 100) : 0
    };
  };

  // Calculate current mood streak
  const getCurrentStreak = () => {
    if (moodEntries.length === 0) return 0;
    
    // Sort entries by date (newest first)
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Get today and yesterday dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if we have an entry for today
    const latestEntryDate = new Date(sortedEntries[0].date);
    latestEntryDate.setHours(0, 0, 0, 0);
    
    // If the latest entry is older than yesterday, streak is 0
    if (latestEntryDate.getTime() < today.getTime() - 86400000) {
      return 0;
    }
    
    // Calculate streak
    let streak = 1;
    let currentDate = latestEntryDate;
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      // Check if this entry is from the day before the current date
      const expectedPrevDate = new Date(currentDate);
      expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
      
      if (entryDate.getTime() === expectedPrevDate.getTime()) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-[#F0EFEB] rounded-xl shadow-sm px-8">
      <div className="w-28 h-28 rounded-full bg-white/80 flex items-center justify-center mb-8 shadow-md animate-float">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-[#5A5A58]">
          <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
          <path d="M20 2a10 10 0 0 0-10 10"></path>
          <path d="M16 2a10 10 0 0 0-10 10"></path>
        </svg>
      </div>
      <h3 className="text-2xl font-medium mb-4 text-[#0C0907] font-cooper">No Insights Yet</h3>
      <p className="text-base text-[#0C0907]/70 mb-8 max-w-xs leading-relaxed">
        Start tracking your mood daily to see patterns, trends, and insights about your emotional well-being
      </p>
      <Link 
        href="/mood-tracking" 
        className="inline-flex items-center justify-center py-3 px-8 bg-[#5A5A58] text-white rounded-full font-medium transition-colors hover:bg-[#5A5A58]/90 font-cooper text-base shadow-sm"
      >
        Track Your First Mood
      </Link>
    </div>
  );

  const getBlobClass = (moodValue) => {
    switch(moodValue) {
      case 1: return 'irregular-blob-low';
      case 2: return 'irregular-blob-neutral';
      case 3: return 'irregular-blob-high';
      default: return 'irregular-blob';
    }
  };

  const renderInsights = () => {
    const filteredEntries = getFilteredEntries();
    
    if (filteredEntries.length === 0) {
      return renderEmptyState();
    }

    const avgMoodValue = getAverageMoodValue(filteredEntries);
    const distribution = getMoodDistribution(filteredEntries);
    const currentStreak = getCurrentStreak();

    return (
      <div className="w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-medium text-[#0C0907] font-cooper">Mood Summary</h3>
            <div className="flex rounded-lg overflow-hidden bg-white/60 backdrop-blur-sm p-1">
              <button 
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${period === 'week' ? 'bg-[#8A8BDE] text-white' : 'text-[#0C0907]/70 hover:bg-[#0C0907]/5'}`}
                onClick={() => setPeriod('week')}
              >
                Week
              </button>
              <button 
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${period === 'month' ? 'bg-[#8A8BDE] text-white' : 'text-[#0C0907]/70 hover:bg-[#0C0907]/5'}`}
                onClick={() => setPeriod('month')}
              >
                Month
              </button>
              <button 
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${period === 'year' ? 'bg-[#8A8BDE] text-white' : 'text-[#0C0907]/70 hover:bg-[#0C0907]/5'}`}
                onClick={() => setPeriod('year')}
              >
                Year
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Mood Card */}
            <div className="rounded-xl p-6 bg-[#F0EFEB] h-full">
              <h4 className="text-lg font-cooper mb-4">Average Mood</h4>
              <div className="flex items-center">
                <div className="w-16 h-16 flex items-center justify-center irregular-blob" 
                  style={{ 
                    background: `conic-gradient(#DA7A59 0% ${distribution.low}%, #D9C69C ${distribution.low}% ${distribution.low + distribution.neutral}%, #778D5E ${distribution.low + distribution.neutral}% 100%)` 
                  }}>
                  <div className="w-12 h-12 bg-[#F0EFEB] flex items-center justify-center irregular-blob">
                  </div>
                </div>
                <div className="ml-6">
                  <div className="text-base font-cooper">
                    Over the past {period === 'week' ? 'week' : period === 'month' ? 'month' : 'year'}
                  </div>
                  <div className="text-sm text-[#0C0907]/70 mt-1">
                    Based on {filteredEntries.length} days of data
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mood Streak Card - New! */}
            <div className="rounded-xl p-6 bg-[#F0EFEB] h-full">
              <h4 className="text-lg font-cooper mb-4">Current Streak</h4>
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-[#F7F6F3] border-4 border-[#8A8BDE] flex items-center justify-center shadow-sm">
                  <span className="text-2xl font-cooper text-[#0C0907]">{currentStreak}</span>
                </div>
                <div className="ml-6">
                  <div className="text-xl font-cooper">
                    {currentStreak === 0 ? 'No active streak' : 
                     currentStreak === 1 ? '1 day' : 
                     `${currentStreak} days`}
                  </div>
                  <div className="text-sm text-[#0C0907]/70 mt-1">
                    {currentStreak === 0 
                      ? 'Track your mood today to start a streak' 
                      : 'Keep going to build your streak!'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mood Distribution */}
        <div className="rounded-xl p-6 bg-[#F0EFEB] mb-8">
          <h4 className="text-lg font-cooper mb-6">Mood Distribution</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-cooper">Pleasant</span>
                <span className="text-base font-cooper">{distribution.high}%</span>
              </div>
              <div className="w-full bg-[#E5E4E0] rounded-full h-3">
                <div className="bg-[#778D5E] h-3 rounded-full" style={{ width: `${distribution.high}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-cooper">Neutral</span>
                <span className="text-base font-cooper">{distribution.neutral}%</span>
              </div>
              <div className="w-full bg-[#E5E4E0] rounded-full h-3">
                <div className="bg-[#D9C69C] h-3 rounded-full" style={{ width: `${distribution.neutral}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-cooper">Unpleasant</span>
                <span className="text-base font-cooper">{distribution.low}%</span>
              </div>
              <div className="w-full bg-[#E5E4E0] rounded-full h-3">
                <div className="bg-[#DA7A59] h-3 rounded-full" style={{ width: `${distribution.low}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 pb-20 sm:p-6" style={{ backgroundColor: '#E5E4E0' }}>
      {/* Custom styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="w-full max-w-md md:max-w-2xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0C0907] font-cooper">Mood Insights</h1>
          <p className="text-sm sm:text-base text-[#0C0907]/70 mt-1">Understand your emotional patterns</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="w-8 h-8 border-2 border-[#5A5A58] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          renderInsights()
        )}
      </div>
      
      {/* Updated bottom nav bar with improved design and 4 options */}
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
            <div className="absolute inset-x-0 -top-3 h-0.5 bg-[#5A5A58] opacity-100 rounded-b-md transition-all duration-300"></div>
            <div className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 bg-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5A5A58]">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                <path d="M20 2a10 10 0 0 0-10 10"></path>
                <path d="M16 2a10 10 0 0 0-10 10"></path>
              </svg>
            </div>
            <span className="mt-0.5 text-[12px] sm:text-[13px] font-medium font-cooper text-[#5A5A58]">Insights</span>
          </Link>
          
          <Link 
            href="/account" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-3 h-0.5 bg-transparent opacity-0 rounded-b-md transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#5A5A58]"></div>
            <div className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white group-hover:shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0C0907]/60 group-hover:text-[#5A5A58]">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span className="mt-0.5 text-[12px] sm:text-[13px] font-medium font-cooper text-[#0C0907]/60 group-hover:text-[#5A5A58]">Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MoodInsights; 