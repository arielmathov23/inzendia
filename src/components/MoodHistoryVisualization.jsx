'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase';

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
  
  .calendar-header-day {
    font-weight: 500;
    color: #5A5A58;
    font-size: 0.9rem;
    padding: 0.5rem 0;
    text-align: center;
    width: 100%;
  }
  
  .calendar-background {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(233, 220, 188, 0.05), rgba(218, 122, 89, 0.02), rgba(119, 141, 94, 0.05));
    z-index: 0;
    border-radius: inherit;
  }

  .calendar-container {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
`;

const MoodHistoryVisualization = () => {
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('grid');
  const [timeRange, setTimeRange] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMoodEntry, setSelectedMoodEntry] = useState(null);
  const [showMoodTable, setShowMoodTable] = useState(true);
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Load mood data based on authentication status
    loadMoodData();
  }, [isAuthenticated, user]);

  const loadMoodData = async () => {
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
        const formattedEntries = data.map(entry => {
          // Extract just the date part from the database entry to avoid timezone issues
          // The date in the database is in YYYY-MM-DD format
          const dateParts = entry.date.split('T')[0].split('-');
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
          const day = parseInt(dateParts[2]);
          
          // Create a date object with noon UTC time to ensure consistent date representation
          const entryDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
          
          return {
            mood: {
              value: entry.mood_value,
              label: entry.mood_label,
              color: entry.mood_color
            },
            reason: entry.reason,
            date: entryDate.toISOString()
          };
        });
        
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
    // Parse the date string and create a date object that preserves the date
    let date;
    if (typeof dateString === 'string') {
      if (dateString.includes('T')) {
        // Extract date components and create date with noon UTC
        const dateParts = dateString.split('T')[0].split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
        const day = parseInt(dateParts[2]);
        
        date = new Date(Date.UTC(year, month, day, 12, 0, 0));
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
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
      <div className="w-28 h-28 rounded-full bg-white/80 flex items-center justify-center mb-6 animate-float shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-[#5A5A58]">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      </div>
      <h3 className="text-2xl font-medium mb-3 font-cooper">Your Mood Journey Begins</h3>
      <p className="text-base text-[#0C0907]/70 mb-6 max-w-xs">Track your first mood to see your emotional patterns visualized here</p>
      <Link 
        href="/mood-tracking" 
        className="inline-flex items-center justify-center py-3 px-8 bg-[#5A5A58] text-white rounded-full font-medium transition-colors hover:bg-[#5A5A58]/90 font-cooper shadow-sm"
      >
        Track Your First Mood
      </Link>
    </div>
  );

  // Render table of mood entries
  const renderMoodTable = () => {
    if (getFilteredEntries.length === 0) {
      return null;
    }

    // Sort entries with newest first
    const sortedEntries = [...getFilteredEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return (
      <div className="w-full my-8 animate-fade-in">
        <div className="glass-card p-4 sm:p-5 animate-scale-in relative mx-auto overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-cooper text-[#0C0907]">Mood History</h3>
            <button 
              onClick={() => setShowMoodTable(!showMoodTable)}
              className="text-xs px-3 py-1 rounded-full bg-[#F0EFEB] text-[#5A5A58] hover:bg-[#E5E4E0] transition-colors"
            >
              {showMoodTable ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {showMoodTable && (
            <div className="overflow-auto max-h-[400px] rounded-lg">
              <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
                <thead className="sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-[#5A5A58] uppercase tracking-wider">Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-[#5A5A58] uppercase tracking-wider">Mood</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-[#5A5A58] uppercase tracking-wider">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((entry, index) => (
                    <tr 
                      key={`table-entry-${index}`} 
                      className="bg-white hover:bg-[#F7F6F3] transition-colors cursor-pointer"
                      onClick={() => setSelectedMoodEntry(entry)}
                    >
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-[#0C0907]">
                        {formatDate(entry.date, 'short')}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className={`w-6 h-6 ${getBlobClass(entry.mood)} mr-2`}
                            style={{ backgroundColor: getMoodColor(entry.mood) }}
                          ></div>
                          <span className="text-sm text-[#0C0907]">{entry.mood.label}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-[#0C0907]/80">
                        <div className="truncate max-w-[200px] md:max-w-[300px]">
                          {entry.reason || 'No reason specified'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add this shared function to handle mood entry selection
  const handleMoodEntryClick = (entry) => {
    setSelectedMoodEntry(entry);
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
    
    // Check if we need to scale down due to many entries
    const scaleDown = sortedEntries.length > minItems * 0.7;
    
    // Vary item size based on timeRange and entry count
    const getItemSize = () => {
      const isMobile = window.innerWidth < 768;
      const isDesktop = window.innerWidth >= 1280;
      
      // Base sizes (larger than before)
      let baseSize;
      
      switch (timeRange) {
        case 'week':
          baseSize = isMobile ? 50 : isDesktop ? 90 : 70;
          break;
        case 'month':
          baseSize = isMobile ? 45 : isDesktop ? 60 : 48;
          break;
        case 'year':
          baseSize = isMobile ? 30 : isDesktop ? 40 : 35;
          break;
        case 'all':
          baseSize = isMobile ? 25 : isDesktop ? 35 : 30;
          break;
        default:
          baseSize = isMobile ? 40 : isDesktop ? 55 : 45;
      }
      
      // Scale down by 30% if needed
      return scaleDown ? baseSize * 0.7 : baseSize;
    };
    
    const fixedItemSize = getItemSize();
    const fixedGap = Math.max(Math.min(fixedItemSize * 0.15, 12), 6);

    return (
      <div className="w-full py-2 animate-fade-in">
        <div className="glass-card p-5 mb-2 animate-scale-in dotted-pattern mx-auto md:max-w-3xl lg:max-w-4xl">
          <div 
            className="grid grid-flow-row"
            style={{ 
              gridTemplateColumns: `repeat(${fixedColumns}, 1fr)`,
              gridTemplateRows: `repeat(${fixedRows}, 1fr)`,
              gap: `${fixedGap}px`, 
              width: '100%',
              maxWidth: '100%',
              height: timeRange === 'week' ? '400px' : timeRange === 'month' ? '380px' : '360px',
              maxHeight: '520px'
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
                      onClick={() => handleMoodEntryClick(entry)}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-white text-foreground text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 shadow-sm whitespace-nowrap z-10">
                        {formatDate(entry.date)}: {entry.mood.label}
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Empty placeholder cell
                return (
                  <div 
                    key={`grid-empty-${index}`} 
                    className="flex justify-center items-center"
                  >
                    <div 
                      className="rounded-md bg-[#F0EFEB] opacity-20"
                      style={{ 
                        width: `${Math.max(fixedItemSize * 0.6, 8)}px`, 
                        height: `${Math.max(fixedItemSize * 0.6, 8)}px` 
                      }}
                    ></div>
                  </div>
                );
              }
            })}
          </div>
        </div>
        
        {/* Legend below grid */}
        <div className="text-center mb-4">
          <div className="inline-flex space-x-8 py-2 px-4 text-sm bg-background rounded-full">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-high"></div>
              <span className="text-sm text-secondary">Pleasant</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-neutral"></div>
              <span className="text-sm text-secondary">Neutral</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-low"></div>
              <span className="text-sm text-secondary">Unpleasant</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

    return (
      <div className="w-full py-0 animate-fade-in">
        <div className="glass-card p-4 mb-2 animate-scale-in relative mx-auto md:max-w-2xl lg:max-w-3xl overflow-hidden">
          <div className="calendar-background"></div>
          
          <div className="calendar-container">
            {/* Day labels */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="calendar-header-day font-cooper">
                {day}
              </div>
            ))}
          
            {/* Calendar days */}
            {paddedDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="month-day month-day-empty"></div>;
              }
              
              const hasEntry = entriesByDay[day];
              const isToday = new Date(selectedYear, selectedMonth, day).toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={`day-${day}`}
                  className={`month-day ${hasEntry ? 'month-day-has-entry' : ''} ${
                    isToday ? 'ring-1 ring-[#5A5A58] ring-opacity-50' : ''
                  }`}
                  onClick={() => {
                    if (hasEntry) {
                      handleMoodEntryClick(hasEntry);
                    }
                  }}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span className="text-sm sm:text-base z-10 relative font-medium">{day}</span>
                    
                    {hasEntry && (
                      <div 
                        className={`absolute inset-0 opacity-70 ${getBlobClass(hasEntry.mood)}`}
                        style={{ 
                          backgroundColor: getMoodColor(hasEntry.mood),
                          transform: 'scale(0.9)'
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
          <div className="inline-flex space-x-8 py-2 px-4 text-sm bg-background rounded-full">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-high"></div>
              <span className="text-sm text-secondary">Pleasant</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-neutral"></div>
              <span className="text-sm text-secondary">Neutral</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-low"></div>
              <span className="text-sm text-secondary">Unpleasant</span>
            </div>
          </div>
        </div>
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
    <div className="flex flex-col items-center justify-start min-h-screen p-4 pb-20 sm:p-6" style={{ backgroundColor: '#E5E4E0' }}>
      {/* Custom animations */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="w-full max-w-4xl">
        <header className="mb-6 sm:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0C0907] font-cooper">Mood History</h1>
            <p className="text-sm sm:text-base text-[#0C0907]/70 mt-1">Track your emotional well-being over time</p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3 items-center md:pr-4 lg:pr-0">
            {/* Visualization Controls */}
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-lg p-1">
            <button 
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewType === 'grid' ? 'bg-[#8A8BDE] text-white' : 'text-[#0C0907]/70 hover:bg-[#0C0907]/5'}`}
                onClick={() => setViewType('grid')}
              >
                Grid
            </button>
            <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewType === 'calendar' ? 'bg-[#8A8BDE] text-white' : 'text-[#0C0907]/70 hover:bg-[#0C0907]/5'}`}
                onClick={() => setViewType('calendar')}
              >
                Calendar
              </button>
            </div>
            
            {/* Time Range Filter - only show in grid view */}
            {viewType === 'grid' && (
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-lg p-1">
                {['all', 'week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${timeRange === range ? 'bg-[#8A8BDE] text-white' : 'text-[#0C0907]/70 hover:bg-[#0C0907]/5'}`}
                    onClick={() => setTimeRange(range)}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* Month navigation - only show in calendar view */}
            {viewType === 'calendar' && (
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-lg p-1">
                <button
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-[#0C0907]/70 hover:bg-[#0C0907]/5"
                  onClick={() => {
                    const newMonth = selectedMonth - 1;
                    if (newMonth < 0) {
                      setSelectedMonth(11);
                      setSelectedYear(selectedYear - 1);
                    } else {
                      setSelectedMonth(newMonth);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>
                <span className="px-3 py-1.5 text-sm font-medium">
                  {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-[#0C0907]/70 hover:bg-[#0C0907]/5"
                  onClick={() => {
                    const newMonth = selectedMonth + 1;
                    if (newMonth > 11) {
                      setSelectedMonth(0);
                      setSelectedYear(selectedYear + 1);
                    } else {
                      setSelectedMonth(newMonth);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </header>
        
        {/* Visualization based on selected view */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-[#5A5A58] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : getFilteredEntries.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {viewType === 'calendar' ? renderCalendarView() : renderGridView()}
            {renderMoodTable()}
          </>
        )}
      </div>
      
      {/* Mood Details Popup */}
      {selectedMoodEntry && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/30 animate-fade-in">
          <div className="w-full max-w-xs bg-white rounded-2xl p-6 shadow-xl animate-scale-in">
            <div className="flex items-center mb-4">
              <div 
                className={`w-12 h-12 ${getBlobClass(selectedMoodEntry.mood)} animate-float`}
                style={{ backgroundColor: getMoodColor(selectedMoodEntry.mood) }}
              ></div>
              <div className="ml-4">
                <h3 className="text-base font-medium font-cooper">{formatDate(selectedMoodEntry.date, 'long')}</h3>
                <p className="text-secondary text-sm">Mood: {selectedMoodEntry.mood.label}</p>
              </div>
            </div>
            
            {selectedMoodEntry.reason && (
              <div className="mb-4 bg-[#F0EFEB] rounded-xl p-4">
                <p className="text-sm text-[#0C0907]/80 italic">"{selectedMoodEntry.reason}"</p>
              </div>
            )}
            
            <button 
              onClick={() => setSelectedMoodEntry(null)}
              className="w-full py-2 mt-2 text-center bg-[#F0EFEB] text-[#5A5A58] rounded-lg hover:bg-[#E5E4E0] transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Fixed bottom navbar - improved design */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F7F6F3] px-4 py-3 shadow-md rounded-t-2xl border-t border-[#E5E4E0]">
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
            <div className="absolute inset-x-0 -top-3 h-0.5 bg-[#5A5A58] opacity-100 rounded-b-md transition-all duration-300"></div>
            <div className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 bg-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5A5A58]">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <span className="mt-0.5 text-[12px] sm:text-[13px] font-medium font-cooper text-[#5A5A58]">History</span>
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

export default MoodHistoryVisualization; 