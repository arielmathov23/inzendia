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

const MoodHistoryVisualization = () => {
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('week'); // 'week' or 'month' or 'all'
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    // In a real app, we would fetch from an API
    // For now, we'll use localStorage
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

  // Function to generate test data
  const generateTestData = (count) => {
    setLoading(true);
    
    const testData = [];
    const now = new Date();
    
    // Generate mood entries going back from today
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Randomly select a mood (1, 2, or 3)
      const moodValue = Math.floor(Math.random() * 3) + 1;
      let mood;
      
      if (moodValue === 1) {
        mood = { color: '#DA7A59', label: 'Low', value: 1, icon: '•' };
      } else if (moodValue === 2) {
        mood = { color: '#E9DCBC', label: 'Neutral', value: 2, icon: '•' };
      } else {
        mood = { color: '#778D5E', label: 'High', value: 3, icon: '•' };
      }
      
      testData.push({
        mood,
        date: date.toISOString(),
      });
    }
    
    // Save to localStorage
    localStorage.setItem('moodEntries', JSON.stringify(testData));
    
    // Update state
    setMoodEntries(testData);
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getMoodColor = (mood) => {
    return mood?.color || '#29cc6a'; // Default to green if color not found
  };

  const getMoodIcon = (mood) => {
    if (!mood) return '•';
    
    switch(mood.value) {
      case 1: return '•';
      case 2: return '•';
      case 3: return '•';
      default: return '•';
    }
  };

  const getFilteredEntries = () => {
    if (moodEntries.length === 0) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (view === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
      return moodEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= cutoffDate;
      });
    } else if (view === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
      return moodEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= cutoffDate;
      });
    } else {
      // 'all' view
      return [...moodEntries];
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-[#F0EFEB] flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#0C0907]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      </div>
      <h3 className="text-2xl font-medium mb-3 text-[#0C0907] font-cooper">No mood data yet</h3>
      <p className="text-base text-[#0C0907]/70 mb-6 max-w-xs">Track your mood daily to see patterns and insights here</p>
      <Link 
        href="/mood-tracking" 
        className="inline-flex items-center justify-center py-3 px-6 bg-[#778D5E] text-white rounded-full font-medium transition-colors hover:bg-[#778D5E]/90 font-cooper text-base"
      >
        Track Your Mood
      </Link>
    </div>
  );

  const renderMoodGraph = () => {
    const filteredEntries = getFilteredEntries();
    
    if (filteredEntries.length === 0) {
      return renderEmptyState();
    }

    // Sort entries by date (newest first)
    const sortedEntries = [...filteredEntries].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    // Calculate circle sizes based on number of entries
    const calculateSize = (index) => {
      const minSize = 14; // minimum circle size in pixels
      const maxSize = 48; // maximum circle size in pixels
      
      // Size decreases with index, with a minimum size
      if (sortedEntries.length <= 20) {
        // For few entries, make size difference more visible
        return Math.max(maxSize - (index * 1.8), minSize);
      } else {
        // For many entries, make size difference more subtle
        const rate = (maxSize - minSize) / Math.min(sortedEntries.length, 100);
        return Math.max(maxSize - (index * rate), minSize);
      }
    };

    // Calculate grid columns based on entries count
    const calculateGridColumns = () => {
      if (sortedEntries.length <= 7) return 'grid-cols-4';
      if (sortedEntries.length <= 30) return 'grid-cols-5';
      if (sortedEntries.length <= 100) return 'grid-cols-8';
      if (sortedEntries.length <= 500) return 'grid-cols-10';
      return 'grid-cols-12';
    };

    // Get the appropriate blob class based on mood value
    const getBlobClass = (mood) => {
      if (!mood) return 'irregular-blob';
      
      switch(mood.value) {
        case 1: return 'irregular-blob-low';
        case 2: return 'irregular-blob-neutral';
        case 3: return 'irregular-blob-high';
        default: return 'irregular-blob';
      }
    };

    return (
      <div className="w-full py-6">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-medium text-[#0C0907] font-cooper">Your Mood Timeline</h3>
          <div className="flex rounded-full overflow-hidden" style={{ backgroundColor: '#F0EFEB' }}>
            <button 
              className={`py-2 px-5 text-base font-medium ${view === 'week' ? 'bg-[#778D5E] text-white' : 'text-[#0C0907]'} font-cooper`}
              onClick={() => setView('week')}
            >
              Week
            </button>
            <button 
              className={`py-2 px-5 text-base font-medium ${view === 'month' ? 'bg-[#778D5E] text-white' : 'text-[#0C0907]'} font-cooper`}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button 
              className={`py-2 px-5 text-base font-medium ${view === 'all' ? 'bg-[#778D5E] text-white' : 'text-[#0C0907]'} font-cooper`}
              onClick={() => setView('all')}
            >
              All
            </button>
          </div>
        </div>
        
        {/* Modern minimalist visualization with circles */}
        <div className="p-6 mb-6 rounded-lg" style={{ backgroundColor: '#F0EFEB' }}>
          <div className="relative min-h-[300px]">
            {sortedEntries.length > 0 ? (
              <div className={`grid ${calculateGridColumns()} gap-3 max-h-[500px] overflow-y-auto py-4 px-2 w-full auto-rows-max`}>
                {sortedEntries.map((entry, index) => {
                  const size = calculateSize(index);
                  return (
                    <div 
                      key={index} 
                      className="relative group flex justify-center"
                      title={`${formatDate(entry.date)}: ${entry.mood.label}`}
                    >
                      <div 
                        className={`transition-all hover:scale-110 hover:shadow-md cursor-pointer ${getBlobClass(entry.mood)}`}
                        style={{ 
                          backgroundColor: getMoodColor(entry.mood),
                          width: `${size}px`,
                          height: `${size}px`,
                          opacity: Math.max(0.7 + (1 - (index / sortedEntries.length) * 0.3), 0.7)
                        }}
                      >
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white text-[#0C0907] text-sm py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 shadow-sm whitespace-nowrap z-10">
                        <div className="flex items-center">
                          <span className="mr-1">{formatDate(entry.date)}:</span>
                          <span className="font-medium font-cooper">{entry.mood.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[#0C0907] flex justify-center items-center h-60">No data for the selected timeframe</div>
            )}
          </div>
          
          <div className="mt-4 text-center text-base text-[#0C0907]/80">
            {sortedEntries.length > 0 && (
              <p>Showing {sortedEntries.length} days of mood data • Newest entries on top-left</p>
            )}
          </div>
        </div>
        
        {/* Test controls button */}
        <button 
          className={`nav-link ${testMode ? 'bg-[#778D5E] text-white' : 'text-[#0C0907] hover:text-[#778D5E]'} rounded-md`}
          onClick={() => setTestMode(!testMode)}
          title="Toggle test mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
            <path d="M9 18h6"></path>
            <path d="M10 22h4"></path>
          </svg>
        </button>
      </div>
    );
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
    return Math.round(sum / entries.length);
  };
  
  const getAverageMoodLabel = (entries) => {
    const avgValue = getAverageMoodValue(entries);
    
    switch(avgValue) {
      case 1: return 'Low';
      case 2: return 'Neutral';
      case 3: return 'High';
      default: return 'Neutral';
    }
  };
  
  const getAverageMoodColor = (entries) => {
    const avgValue = getAverageMoodValue(entries);
    
    switch(avgValue) {
      case 1: return '#DA7A59';
      case 2: return '#E9DCBC';
      case 3: return '#778D5E';
      default: return '#E9DCBC';
    }
  };
  
  const getAverageMoodIcon = (entries) => {
    const avgValue = getAverageMoodValue(entries);
    
    switch(avgValue) {
      case 1: return '•';
      case 2: return '•';
      case 3: return '•';
      default: return '•';
    }
  };

  // Reset all mood data (for testing)
  const handleResetAllData = () => {
    if (confirm('Are you sure you want to delete all mood data? This cannot be undone.')) {
      try {
        localStorage.removeItem('moodEntries');
        setMoodEntries([]);
        setView('week');
        setTestMode(false);
      } catch (error) {
        console.error('Error resetting data:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 pb-20" style={{ backgroundColor: '#E5E4E0' }}>
      {/* Add custom styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="w-full max-w-3xl">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#0C0907] font-cooper">Mood History</h1>
            <p className="text-base text-[#0C0907]/70 mt-1">Your mood tracking journey</p>
          </div>
          <div className="flex space-x-2">
            <button 
              className={`nav-link ${testMode ? 'bg-[#778D5E] text-white' : 'text-[#0C0907] hover:text-[#778D5E]'} rounded-md`}
              onClick={() => setTestMode(!testMode)}
              title="Toggle test mode"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
                <path d="M9 18h6"></path>
                <path d="M10 22h4"></path>
              </svg>
            </button>
            <button
              onClick={handleResetAllData}
              className="text-[#0C0907] hover:text-[#DA7A59] rounded-md"
              title="Reset all mood data (for testing)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 1-9 9"></path>
                <path d="M3 12a9 9 0 0 1 9-9"></path>
                <path d="M21 12a9 9 0 0 0-9-9"></path>
                <path d="M3 12a9 9 0 0 0 9 9"></path>
                <path d="M12 7v4"></path>
              </svg>
            </button>
          </div>
        </header>
        
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="loader"></div>
          </div>
        ) : (
          <>
            {testMode && (
              <div className="mt-4 p-4 rounded-lg bg-[#F0EFEB] border border-[#0C0907]/10">
                <h4 className="text-sm font-medium mb-3 text-[#0C0907] font-cooper">Test Controls</h4>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => generateTestData(5)}
                    className="py-1 px-3 bg-[#0C0907]/10 text-[#0C0907] text-xs rounded-md hover:bg-[#0C0907]/20 font-cooper"
                  >
                    Generate 5 Days
                  </button>
                  <button 
                    onClick={() => generateTestData(50)}
                    className="py-1 px-3 bg-[#0C0907]/10 text-[#0C0907] text-xs rounded-md hover:bg-[#0C0907]/20 font-cooper"
                  >
                    Generate 50 Days
                  </button>
                  <button 
                    onClick={() => generateTestData(500)}
                    className="py-1 px-3 bg-[#0C0907]/10 text-[#0C0907] text-xs rounded-md hover:bg-[#0C0907]/20 font-cooper"
                  >
                    Generate 500 Days
                  </button>
                  <button 
                    onClick={() => generateTestData(5000)}
                    className="py-1 px-3 bg-[#0C0907]/10 text-[#0C0907] text-xs rounded-md hover:bg-[#0C0907]/20 font-cooper"
                  >
                    Generate 5000 Days
                  </button>
                </div>
              </div>
            )}
            {renderMoodGraph()}
          </>
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
            <div className="absolute inset-x-0 -top-4 h-1 bg-[#778D5E] opacity-100 rounded-b-md transition-all duration-300"></div>
            <div className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#778D5E]">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <span className="mt-1 text-sm font-medium font-cooper text-[#778D5E]">History</span>
          </Link>
          
          <Link 
            href="/insights" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-4 h-1 bg-transparent opacity-0 rounded-b-md transition-all duration-300 group-hover:opacity-50 group-hover:bg-[#778D5E]"></div>
            <div className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-[#F7F6F3] group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0C0907]/60 group-hover:text-[#778D5E]">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                <path d="M20 2a10 10 0 0 0-10 10"></path>
                <path d="M16 2a10 10 0 0 0-10 10"></path>
              </svg>
            </div>
            <span className="mt-1 text-sm font-medium font-cooper text-[#0C0907]/60 group-hover:text-[#778D5E]">Insights</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MoodHistoryVisualization; 