'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = () => {
    try {
      const storedEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
      setMoodEntries(storedEntries);
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

  // Helper functions for insights
  const getMostFrequentMood = (entries) => {
    if (!entries.length) return null;
    
    const moodCounts = entries.reduce((acc, entry) => {
      const value = entry.mood.value;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
    
    let maxCount = 0;
    let maxMoodValue = null;
    
    Object.entries(moodCounts).forEach(([value, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxMoodValue = parseInt(value);
      }
    });
    
    return entries.find(entry => entry.mood.value === maxMoodValue)?.mood;
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

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 irregular-blob-high bg-[#F0EFEB] flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#0C0907]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
          <path d="M20 2a10 10 0 0 0-10 10"></path>
          <path d="M16 2a10 10 0 0 0-10 10"></path>
        </svg>
      </div>
      <h3 className="text-2xl font-medium mb-3 text-[#0C0907] font-cooper">No insights available</h3>
      <p className="text-base text-[#0C0907]/70 mb-6 max-w-xs">Track your mood for a few days to see patterns and insights here</p>
      <Link 
        href="/mood-tracking" 
        className="inline-flex items-center justify-center py-3 px-6 bg-[#778D5E] text-white rounded-full font-medium transition-colors hover:bg-[#778D5E]/90 font-cooper text-base"
      >
        Track Your Mood
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

    const mostFrequentMood = getMostFrequentMood(filteredEntries);
    const avgMoodValue = getAverageMoodValue(filteredEntries);
    const distribution = getMoodDistribution(filteredEntries);

    return (
      <div className="w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-medium text-[#0C0907] font-cooper">Mood Summary</h3>
            <div className="flex rounded-full overflow-hidden" style={{ backgroundColor: '#F0EFEB' }}>
              <button 
                className={`py-2 px-5 text-base font-medium ${period === 'week' ? 'bg-[#778D5E] text-white' : 'text-[#0C0907]'} font-cooper`}
                onClick={() => setPeriod('week')}
              >
                Week
              </button>
              <button 
                className={`py-2 px-5 text-base font-medium ${period === 'month' ? 'bg-[#778D5E] text-white' : 'text-[#0C0907]'} font-cooper`}
                onClick={() => setPeriod('month')}
              >
                Month
              </button>
              <button 
                className={`py-2 px-5 text-base font-medium ${period === 'year' ? 'bg-[#778D5E] text-white' : 'text-[#0C0907]'} font-cooper`}
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
                    <span className="text-2xl font-cooper">{avgMoodValue}</span>
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
            
            {/* Most Frequent Mood Card */}
            <div className="rounded-xl p-6 bg-[#F0EFEB] h-full">
              <h4 className="text-lg font-cooper mb-4">Most Frequent Mood</h4>
              {mostFrequentMood && (
                <div className="flex items-center">
                  <div className={`w-16 h-16 ${getBlobClass(mostFrequentMood.value)}`} style={{ backgroundColor: mostFrequentMood.color }}></div>
                  <div className="ml-6">
                    <div className="text-xl font-cooper">{mostFrequentMood.label}</div>
                    <div className="text-sm text-[#0C0907]/70 mt-1">
                      {mostFrequentMood.description}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mood Distribution */}
        <div className="rounded-xl p-6 bg-[#F0EFEB] mb-8">
          <h4 className="text-lg font-cooper mb-6">Mood Distribution</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-cooper">High</span>
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
                <span className="text-base font-cooper">Low</span>
                <span className="text-base font-cooper">{distribution.low}%</span>
              </div>
              <div className="w-full bg-[#E5E4E0] rounded-full h-3">
                <div className="bg-[#DA7A59] h-3 rounded-full" style={{ width: `${distribution.low}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-base text-[#0C0907]/70">
          Showing insights based on {filteredEntries.length} days of mood data
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 pb-20" style={{ backgroundColor: '#E5E4E0' }}>
      {/* Add custom styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="w-full max-w-3xl">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#0C0907] font-cooper">Mood Insights</h1>
            <p className="text-base text-[#0C0907]/70 mt-1">Understand your emotional patterns</p>
          </div>
        </header>
        
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="loader"></div>
          </div>
        ) : (
          renderInsights()
        )}
      </div>
      
      {/* Updated bottom nav bar with smoother design */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#0C0907]/5 px-6 py-4 shadow-sm">
        <div className="flex justify-around max-w-md mx-auto">
          <Link 
            href="/mood-tracking" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-4 h-1 bg-transparent opacity-0 rounded-b-md transition-all duration-300 group-hover:opacity-50 group-hover:bg-[#778D5E]"></div>
            <div className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-[#F7F6F3] group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0C0907]/60 group-hover:text-[#778D5E]">
                <circle cx="12" cy="12" r="8"></circle>
                <circle cx="12" cy="12" r="3"></circle>
                <line x1="12" y1="4" x2="12" y2="4.01"></line>
                <line x1="12" y1="20" x2="12" y2="20.01"></line>
                <line x1="4" y1="12" x2="4.01" y2="12"></line>
                <line x1="20" y1="12" x2="20.01" y2="12"></line>
              </svg>
            </div>
            <span className="mt-1 text-sm font-medium font-cooper text-[#0C0907]/60 group-hover:text-[#778D5E]">Track</span>
          </Link>
          
          <Link 
            href="/mood-history" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-4 h-1 bg-transparent opacity-0 rounded-b-md transition-all duration-300 group-hover:opacity-50 group-hover:bg-[#778D5E]"></div>
            <div className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-[#F7F6F3] group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0C0907]/60 group-hover:text-[#778D5E]">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <span className="mt-1 text-sm font-medium font-cooper text-[#0C0907]/60 group-hover:text-[#778D5E]">History</span>
          </Link>
          
          <Link 
            href="/insights" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-4 h-1 bg-[#778D5E] opacity-100 rounded-b-md transition-all duration-300"></div>
            <div className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#778D5E]">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                <path d="M20 2a10 10 0 0 0-10 10"></path>
                <path d="M16 2a10 10 0 0 0-10 10"></path>
              </svg>
            </div>
            <span className="mt-1 text-sm font-medium font-cooper text-[#778D5E]">Insights</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MoodInsights; 