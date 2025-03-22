'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// Custom animations and styles
const customStyles = `
  @keyframes ripple {
    0% {
      transform: scale(0.1);
      opacity: 0.2;
    }
    50% {
      opacity: 0.1;
    }
    100% {
      transform: scale(3);
      opacity: 0;
    }
  }

  @keyframes float {
    0% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-5px) rotate(2deg);
    }
    100% {
      transform: translateY(0px) rotate(0deg);
    }
  }

  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes scale-in {
    0% {
      transform: scale(0.95);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scale-in 0.4s ease-out forwards;
  }
  
  .animate-float {
    animation: float 5s ease-in-out infinite;
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

  .glass-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }

  .month-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .month-day {
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    position: relative;
  }

  .month-day-empty {
    background: transparent;
  }

  .month-day-has-entry {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .month-day-has-entry:hover {
    transform: scale(1.05);
  }

  .dotted-pattern {
    background-image: radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    background-position: 0 0;
  }
`;

const MoodHistoryVisualization = () => {
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('grid'); // Changed default to 'grid' instead of 'calendar'
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year', 'all'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMoodEntry, setSelectedMoodEntry] = useState(null);

  useEffect(() => {
    // Load mood data from localStorage
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

  // Function to generate test data for development
  const generateTestData = (count) => {
    setLoading(true);
    
    const testData = [];
    const now = new Date();
    
    // Generate mood entries going back from today
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(now.getDate() - Math.floor(Math.random() * 180)); // Random dates within last 6 months
      
      // Randomly select a mood (1, 2, or 3)
      const moodValue = Math.floor(Math.random() * 3) + 1;
      let mood;
      
      if (moodValue === 1) {
        mood = { color: '#DA7A59', label: 'Unpleasant', value: 1, description: 'Experience negativity, distress, or discomfort.' };
      } else if (moodValue === 2) {
        mood = { color: '#E9DCBC', label: 'Neutral', value: 2, description: 'Experience neither strong positive nor negative feelings.' };
      } else {
        mood = { color: '#778D5E', label: 'Pleasant', value: 3, description: 'Experience positivity, satisfaction, or joy.' };
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

  // Format date for display
  const formatDate = (dateString, format = 'short') => {
    const date = new Date(dateString);
    
    if (format === 'short') {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } else if (format === 'long') {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Get the appropriate color based on mood
  const getMoodColor = (mood) => {
    return mood?.color || '#778D5E';
  };

  // Get the appropriate blob class for shape variation
  const getBlobClass = (mood) => {
    if (!mood) return '';
    
    switch(mood.value) {
      case 1: return 'irregular-blob-low';
      case 2: return 'irregular-blob-neutral';
      case 3: return 'irregular-blob-high';
      default: return '';
    }
  };

  const getFilteredEntries = useMemo(() => {
    if (moodEntries.length === 0) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
      return moodEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= cutoffDate;
      });
    } else if (timeRange === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
      return moodEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= cutoffDate;
      });
    } else if (timeRange === 'year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
      return moodEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= cutoffDate;
      });
    } else {
      // 'all' view
      return [...moodEntries];
    }
  }, [moodEntries, timeRange]);

  // Empty state when no data is available
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6 animate-float">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 10c.667 2.667 0 5.333-2 7-1.5 1.5-3.36 2-5.5 2-3.202 0-5.904-1.756-7-5.5C4 10 5.5 7 7 5.5c1.5-1.5 3.83-2 6-2 2.872 0 5.029 1.765 6 5.5z" />
        </svg>
      </div>
      <h3 className="text-2xl font-medium mb-3 font-cooper">Your journey begins</h3>
      <p className="text-base text-secondary mb-6 max-w-xs">Track your mood daily to see beautiful patterns and insights here</p>
      <Link 
        href="/mood-tracking" 
        className="inline-flex items-center justify-center py-3 px-8 bg-[#5A5A58] text-white rounded-full font-medium transition-colors hover:bg-[#5A5A58]/90 font-cooper"
      >
        Track Your First Mood
      </Link>
    </div>
  );

  // Calendar View
  const renderCalendarView = () => {
    if (getFilteredEntries.length === 0) {
      return renderEmptyState();
    }

    // Calculate days in month and first day of month
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    
    // Create array with all days in month
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Pad with empty days for the first week
    const paddedDays = Array(firstDayOfMonth).fill(null).concat(days);
    
    // Group entries by day for the selected month
    const entriesByDay = {};
    moodEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate.getMonth() === selectedMonth && entryDate.getFullYear() === selectedYear) {
        const day = entryDate.getDate();
        entriesByDay[day] = entry;
      }
    });
    
    // Format month name for display
    const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long' });

    return (
      <div className="w-full py-2 animate-fade-in">
        <div className="glass-card p-5 mb-2 animate-scale-in relative">
          {/* Day labels */}
          <div className="month-grid mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-sm font-medium text-secondary">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="month-grid">
            {paddedDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="month-day month-day-empty"></div>;
              }
              
              const hasEntry = entriesByDay[day];
              
              return (
                <div
                  key={`day-${day}`}
                  className={`month-day ${hasEntry ? 'month-day-has-entry' : ''} ${
                    new Date(selectedYear, selectedMonth, day).toDateString() === new Date().toDateString() 
                      ? 'ring-2 ring-[#5A5A58] ring-opacity-50' 
                      : ''
                  }`}
                  onClick={() => {
                    if (hasEntry) {
                      setSelectedMoodEntry(hasEntry);
                    }
                  }}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span className="text-sm">{day}</span>
                    
                    {hasEntry && (
                      <div 
                        className={`absolute inset-0 opacity-70 ${getBlobClass(hasEntry.mood)}`}
                        style={{ 
                          backgroundColor: getMoodColor(hasEntry.mood),
                          transform: 'scale(0.85)'
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Legend moved below calendar */}
        <div className="text-center mb-4">
          <div className="inline-flex space-x-4 py-1 px-3 text-xs bg-background rounded-full">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-high"></div>
              <span className="text-xs text-secondary">Pleasant</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral"></div>
              <span className="text-xs text-secondary">Neutral</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-low"></div>
              <span className="text-xs text-secondary">Unpleasant</span>
            </div>
          </div>
        </div>
        
        {/* Selected day mood details */}
        {selectedMoodEntry && (
          <div className="glass-card p-4 animate-scale-in">
            <div className="flex items-center space-x-4">
              <div 
                className={`w-12 h-12 ${getBlobClass(selectedMoodEntry.mood)} animate-float`}
                style={{ backgroundColor: getMoodColor(selectedMoodEntry.mood) }}
              ></div>
              <div>
                <h3 className="text-base font-medium font-cooper">{formatDate(selectedMoodEntry.date, 'long')}</h3>
                <p className="text-secondary text-sm">Mood: {selectedMoodEntry.mood.label}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedMoodEntry(null)}
              className="mt-3 text-[#5A5A58] text-xs hover:underline"
            >
              Close
            </button>
          </div>
        )}
      </div>
    );
  };

  // Grid View - Dynamic visualization
  const renderGridView = () => {
    // Create an empty grid even if no entries
    const sortedEntries = getFilteredEntries.length === 0 
      ? [] 
      : [...getFilteredEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Fixed grid size parameters
    const fixedColumns = 8; // Always 8 columns
    const fixedRows = 6;    // Always 6 rows
    const minItems = fixedColumns * fixedRows; // Minimum 48 items for grid
    
    // Vary item size based on timeRange
    const getItemSize = () => {
      switch (timeRange) {
        case 'week':
        case 'month':
          return 30; // Slightly reduced from 32 to ensure it fits properly
        case 'year':
          return 16; // Medium for year view
        case 'all':
          return 8;  // Smallest for all view
        default:
          return 25; // Default fallback
      }
    };
    
    const fixedItemSize = getItemSize();
    const fixedGap = Math.max(Math.min(fixedItemSize * 0.15, 8), 4); // Gap scales with item size, capped between 4-8px

    return (
      <div className="w-full py-2 animate-fade-in">
        <div className="glass-card p-5 mb-2 animate-scale-in dotted-pattern">
          <div 
            className="grid grid-flow-row"
            style={{ 
              gridTemplateColumns: `repeat(${fixedColumns}, 1fr)`,
              gridTemplateRows: `repeat(${fixedRows}, 1fr)`,
              gap: `${fixedGap}px`, 
              width: '100%',
              height: timeRange === 'week' || timeRange === 'month' ? '350px' : '320px' // Taller for week/month views
            }}
          >
            {/* Render empty placeholders to maintain grid size */}
            {Array.from({ length: minItems }).map((_, index) => {
              // Use actual data if available, otherwise render empty cell
              const entry = sortedEntries[index];
              
              if (entry) {
                return (
                  <div
                    key={`grid-entry-${index}`}
                    className="relative group flex justify-center items-center"
                    title={`${formatDate(entry.date)}: ${entry.mood.label}`}
                  >
                    <div 
                      className={`transition-all hover:scale-110 hover:shadow-md cursor-pointer ${getBlobClass(entry.mood)}`}
                      style={{ 
                        backgroundColor: getMoodColor(entry.mood),
                        width: `${fixedItemSize}px`,
                        height: `${fixedItemSize}px`
                      }}
                      onClick={() => setSelectedMoodEntry(entry)}
                    />
                    
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-white text-foreground text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 shadow-sm whitespace-nowrap z-10">
                      {formatDate(entry.date)}: {entry.mood.label}
                    </div>
                  </div>
                );
              } else {
                // Empty placeholder cell - scale down empty cells even more for visual difference
                const emptySize = Math.max(fixedItemSize * 0.6, 5);
                return (
                  <div
                    key={`empty-${index}`}
                    className="relative flex justify-center items-center opacity-10"
                  >
                    <div 
                      className="rounded-full"
                      style={{ 
                        backgroundColor: '#E5E4E0',
                        width: `${emptySize}px`,
                        height: `${emptySize}px`
                      }}
                    />
                  </div>
                );
              }
            })}
          </div>
        </div>
        
        {/* Legend with scale info based on timeRange */}
        <div className="text-center mb-4">
          <div className="inline-flex space-x-4 py-1 px-3 text-xs bg-background rounded-full">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-high"></div>
              <span className="text-xs text-secondary">Pleasant</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral"></div>
              <span className="text-xs text-secondary">Neutral</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-low"></div>
              <span className="text-xs text-secondary">Unpleasant</span>
            </div>
          </div>
          
          {/* Display current timeRange scaling hint */}
          <div className="mt-1 text-xs text-secondary/70">
            {timeRange === 'week' || timeRange === 'month' 
              ? 'Full-size view' 
              : timeRange === 'year' 
                ? 'Scaled view (50%)' 
                : 'Compact view (25%)'}
          </div>
        </div>
        
        {/* Selected day mood details */}
        {selectedMoodEntry && (
          <div className="glass-card p-4 animate-scale-in">
            <div className="flex items-center space-x-4">
              <div 
                className={`w-12 h-12 ${getBlobClass(selectedMoodEntry.mood)} animate-float`}
                style={{ backgroundColor: getMoodColor(selectedMoodEntry.mood) }}
              ></div>
              <div>
                <h3 className="text-base font-medium font-cooper">{formatDate(selectedMoodEntry.date, 'long')}</h3>
                <p className="text-secondary text-sm">Mood: {selectedMoodEntry.mood.label}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedMoodEntry(null)}
              className="mt-3 text-[#5A5A58] text-xs hover:underline"
            >
              Close
            </button>
          </div>
        )}
      </div>
    );
  };

  // Generate insights based on mood data
  const getMoodInsights = () => {
    if (getFilteredEntries.length < 3) return null;
    
    // Calculate frequency of each mood type
    const moodCounts = { 1: 0, 2: 0, 3: 0 };
    getFilteredEntries.forEach(entry => {
      moodCounts[entry.mood.value] = (moodCounts[entry.mood.value] || 0) + 1;
    });
    
    // Find most frequent mood
    let mostFrequentMood = 1;
    let maxCount = 0;
    
    Object.keys(moodCounts).forEach(moodValue => {
      if (moodCounts[moodValue] > maxCount) {
        maxCount = moodCounts[moodValue];
        mostFrequentMood = parseInt(moodValue);
      }
    });
    
    // Labels for moods
    const moodLabels = {
      1: 'Unpleasant',
      2: 'Neutral',
      3: 'Pleasant'
    };
    
    // Calculate percentage
    const percentage = Math.round((maxCount / getFilteredEntries.length) * 100);
    
    return {
      mostFrequentMood: moodLabels[mostFrequentMood],
      percentage
    };
  };

  const insights = useMemo(() => getMoodInsights(), [getFilteredEntries]);

  return (
    <div className="flex flex-col items-center justify-start p-5 pb-20">
      {/* Custom styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="w-full max-w-md">
        <header className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-cooper">Mood History</h1>
            <p className="text-sm text-secondary mt-0.5">Your emotional journey</p>
          </div>
          <nav className="flex items-center space-x-3">
            <Link href="/mood-tracking" className="p-2 text-foreground hover:text-[#5A5A58] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </Link>
            <div className="p-2 text-foreground cursor-pointer hover:text-[#5A5A58] transition-colors" onClick={() => generateTestData(50)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </nav>
        </header>
        
        {/* Control Panel - View Switcher & Time Controls */}
        <div className="flex mb-4 justify-between items-center">
          {/* View Type Switcher - Grid first, then Calendar */}
          <div className="flex rounded-full overflow-hidden" style={{ backgroundColor: '#F0EFEB' }}>
            <button 
              className={`py-2 px-4 text-sm font-medium ${viewType === 'grid' ? 'bg-[#5A5A58] text-white' : 'text-foreground'} font-cooper`}
              onClick={() => setViewType('grid')}
            >
              Grid
            </button>
            <button 
              className={`py-2 px-4 text-sm font-medium ${viewType === 'calendar' ? 'bg-[#5A5A58] text-white' : 'text-foreground'} font-cooper`}
              onClick={() => setViewType('calendar')}
            >
              Calendar
            </button>
          </div>

          {/* Month/Period Controls */}
          {viewType === 'calendar' ? (
            <div className="flex items-center">
              <button 
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(selectedYear - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-sm px-2 font-medium font-cooper">
                {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button 
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(selectedYear + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex rounded-full overflow-hidden" style={{ backgroundColor: '#F0EFEB' }}>
              <button 
                className={`py-1 px-2 text-xs ${timeRange === 'week' ? 'bg-[#5A5A58] text-white' : 'text-foreground'}`}
                onClick={() => setTimeRange('week')}
              >
                Week
              </button>
              <button 
                className={`py-1 px-2 text-xs ${timeRange === 'month' ? 'bg-[#5A5A58] text-white' : 'text-foreground'}`}
                onClick={() => setTimeRange('month')}
              >
                Month
              </button>
              <button 
                className={`py-1 px-2 text-xs ${timeRange === 'year' ? 'bg-[#5A5A58] text-white' : 'text-foreground'}`}
                onClick={() => setTimeRange('year')}
              >
                Year
              </button>
              <button 
                className={`py-1 px-2 text-xs ${timeRange === 'all' ? 'bg-[#5A5A58] text-white' : 'text-foreground'}`}
                onClick={() => setTimeRange('all')}
              >
                All
              </button>
            </div>
          )}
        </div>
        
        {/* Visualization based on selected view */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-[#5A5A58] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          viewType === 'calendar' ? renderCalendarView() : renderGridView()
        )}
        
        {/* Developer Tool */}
        <div className="mt-4 mb-6 glass-card p-3 animate-scale-in">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-secondary">Developer Tools</h3>
              <button 
                onClick={() => {
                  localStorage.removeItem('moodEntries');
                  loadMoodData();
                }}
                className="text-xs text-red-500 hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => generateTestData(10)}
                className="py-1 px-3 text-xs bg-muted hover:bg-muted/80 rounded-full"
              >
                10 Records
              </button>
              <button 
                onClick={() => generateTestData(50)}
                className="py-1 px-3 text-xs bg-muted hover:bg-muted/80 rounded-full"
              >
                50 Records
              </button>
              <button 
                onClick={() => generateTestData(100)}
                className="py-1 px-3 text-xs bg-muted hover:bg-muted/80 rounded-full"
              >
                100 Records
              </button>
              <button 
                onClick={() => generateTestData(200)}
                className="py-1 px-3 text-xs bg-muted hover:bg-muted/80 rounded-full"
              >
                200 Records
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed bottom navbar - improved design */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F7F6F3] px-6 py-3 shadow-md rounded-t-2xl border-t border-[#E5E4E0]">
        <div className="flex justify-around max-w-md mx-auto">
          <Link 
            href="/mood-tracking" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-3 h-0.5 bg-transparent opacity-0 rounded-b-md transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#5A5A58]"></div>
            <div className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white group-hover:shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/60 group-hover:text-[#5A5A58]">
                <circle cx="12" cy="12" r="8"></circle>
                <circle cx="12" cy="12" r="3"></circle>
                <line x1="12" y1="4" x2="12" y2="4.01"></line>
                <line x1="12" y1="20" x2="12" y2="20.01"></line>
                <line x1="4" y1="12" x2="4.01" y2="12"></line>
                <line x1="20" y1="12" x2="20.01" y2="12"></line>
              </svg>
            </div>
            <span className="mt-0.5 text-[13px] font-medium font-cooper text-foreground/60 group-hover:text-[#5A5A58]">Track</span>
          </Link>
          
          <Link 
            href="/mood-history" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-3 h-0.5 bg-[#5A5A58] opacity-100 rounded-b-md transition-all duration-300"></div>
            <div className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 bg-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5A5A58]">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <span className="mt-0.5 text-[13px] font-medium font-cooper text-[#5A5A58]">History</span>
          </Link>
          
          <Link 
            href="/insights" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-3 h-0.5 bg-transparent opacity-0 rounded-b-md transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#5A5A58]"></div>
            <div className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white group-hover:shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/60 group-hover:text-[#5A5A58]">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                <path d="M20 2a10 10 0 0 0-10 10"></path>
                <path d="M16 2a10 10 0 0 0-10 10"></path>
              </svg>
            </div>
            <span className="mt-0.5 text-[13px] font-medium font-cooper text-foreground/60 group-hover:text-[#5A5A58]">Insights</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MoodHistoryVisualization; 