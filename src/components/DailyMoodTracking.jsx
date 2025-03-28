'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Custom animations
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

  @keyframes scale-in {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    60% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
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

  .animate-ripple {
    animation: ripple 1.5s ease-out infinite;
  }

  .animate-scale-in {
    animation: scale-in 0.4s ease-out forwards;
  }
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out forwards;
  }
  
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

const DailyMoodTracking = () => {
  const [submittedToday, setSubmittedToday] = useState(false);
  const [todaysMood, setTodaysMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSelection, setActiveSelection] = useState(null);
  const [confirmProgress, setConfirmProgress] = useState(0);
  const [confirmationAnimating, setConfirmationAnimating] = useState(false);
  const holdTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const router = useRouter();

  // Update mood options with darker neutral color for better contrast
  const moods = [
    { value: 3, label: 'High', color: '#778D5E', description: 'Energized, positive, and productive' },
    { value: 2, label: 'Neutral', color: '#D9C69C', description: 'Content, steady, and balanced' }, // Darker neutral color
    { value: 1, label: 'Low', color: '#DA7A59', description: 'Tired, down, or unmotivated' }
  ];

  useEffect(() => {
    // Check if already submitted today
    const checkTodaySubmission = () => {
      try {
        const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        const today = new Date().setHours(0, 0, 0, 0);
        
        const todayEntry = entries.find(entry => {
          const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
          return entryDate === today;
        });
        
        if (todayEntry) {
          setTodaysMood(todayEntry.mood);
          setSubmittedToday(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking today\'s submission:', error);
        setLoading(false);
      }
    };
    
    checkTodaySubmission();
  }, []);

  // Cleanup any timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const startHoldConfirmation = (mood) => {
    setActiveSelection(mood);
    setConfirmProgress(0);
    
    // Start progress animation
    progressIntervalRef.current = setInterval(() => {
      setConfirmProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(progressIntervalRef.current);
          completeMoodSelection(mood);
          return 100;
        }
        return newProgress;
      });
    }, 20); // 20ms interval for smooth animation (100% in 1 second)
  };
  
  const cancelHoldConfirmation = () => {
    setActiveSelection(null);
    setConfirmProgress(0);
    clearInterval(progressIntervalRef.current);
  };

  const completeMoodSelection = (mood) => {
    setConfirmationAnimating(true);
    
    // Create the entry
    const entry = {
      mood: mood,
      date: new Date().toISOString()
    };
    
    // Save to localStorage
    try {
      const existingEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
      
      // Filter out any existing entries from today
      const today = new Date().setHours(0, 0, 0, 0);
      const filteredEntries = existingEntries.filter(entry => {
        const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
        return entryDate !== today;
      });
      
      // Add new entry
      filteredEntries.push(entry);
      
      // Save back to localStorage
      localStorage.setItem('moodEntries', JSON.stringify(filteredEntries));
      
      // Set mood and trigger animation
      setTimeout(() => {
        setTodaysMood(mood);
        setSubmittedToday(true);
        setActiveSelection(null);
        setConfirmProgress(0);
        
        // Reset confirmation state after animation
        setTimeout(() => {
          setConfirmationAnimating(false);
        }, 1500);
      }, 300);
    } catch (error) {
      console.error('Error saving mood:', error);
      setActiveSelection(null);
      setConfirmProgress(0);
    }
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };

  const handleResetData = () => {
    try {
      // Get existing entries
      const existingEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
      
      // Remove today's entry
      const today = new Date().setHours(0, 0, 0, 0);
      const filteredEntries = existingEntries.filter(entry => {
        const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
        return entryDate !== today;
      });
      
      // Save back to localStorage
      localStorage.setItem('moodEntries', JSON.stringify(filteredEntries));
      
      // Reset state
      setSubmittedToday(false);
      setTodaysMood(null);
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 pb-20" style={{ backgroundColor: '#E5E4E0' }}>
      {/* Custom animations */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="w-full max-w-md">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#0C0907] font-cooper">Daily Mood Tracking</h1>
            <p className="text-base text-[#0C0907]/70 mt-1">{formatDate()}</p>
          </div>
          <button
            onClick={handleResetData}
            className="text-[#0C0907] hover:text-[#778D5E] p-2 rounded-full transition-colors"
            title="Reset today's mood (for testing)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 1-9 9"></path>
              <path d="M3 12a9 9 0 0 1 9-9"></path>
              <path d="M21 12a9 9 0 0 0-9-9"></path>
              <path d="M3 12a9 9 0 0 0 9 9"></path>
              <path d="M12 7v4"></path>
            </svg>
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="loader"></div>
          </div>
        ) : (
          <div>
            {submittedToday ? (
              <div 
                className={`rounded-xl p-6 overflow-hidden relative ${confirmationAnimating ? 'animate-fade-in' : ''}`} 
                style={{ backgroundColor: '#F0EFEB' }}
              >
                {/* Large decorative circle */}
                <div 
                  className="absolute -top-10 -right-10 opacity-10 transition-all duration-700 ease-out"
                  style={{ 
                    backgroundColor: todaysMood?.color || '#778D5E',
                    borderRadius: '50%',
                    width: '180px',
                    height: '180px',
                    transform: confirmationAnimating ? 'scale(1.5)' : 'scale(1)',
                  }}
                ></div>
                
                {/* Small decorative circles */}
                <div 
                  className="absolute bottom-10 left-0 opacity-10 transition-all duration-700 ease-out"
                  style={{ 
                    backgroundColor: todaysMood?.color || '#778D5E',
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    transform: confirmationAnimating ? 'translateX(20px)' : 'translateX(0)',
                  }}
                ></div>
                
                <div className="absolute w-full h-full top-0 left-0 pointer-events-none overflow-hidden">
                  <div 
                    className="absolute transition-all duration-1000 ease-out"
                    style={{ 
                      backgroundColor: todaysMood?.color || '#778D5E',
                      width: '100%',
                      height: '3px',
                      top: '0',
                      left: '0',
                      transform: confirmationAnimating ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left',
                      opacity: 0.7
                    }}
                  ></div>
                </div>
                
                <h2 className="text-2xl font-medium text-[#0C0907] mb-6 relative z-10 font-cooper">Today's Mood</h2>
                
                <div className="flex items-center relative z-10 mb-8">
                  <div className="mr-4 flex flex-col items-center">
                    <div 
                      className={`w-20 h-20 shadow-lg transition-transform duration-700 ease-out ${todaysMood?.value === 3 ? 'irregular-blob-high' : todaysMood?.value === 2 ? 'irregular-blob-neutral' : 'irregular-blob-low'}`}
                      style={{ 
                        backgroundColor: todaysMood?.color || '#778D5E',
                        transform: confirmationAnimating ? 'scale(1.2)' : 'scale(1)'
                      }}
                    >
                      <div 
                        className={`absolute inset-0 ${todaysMood?.value === 3 ? 'irregular-blob-high' : todaysMood?.value === 2 ? 'irregular-blob-neutral' : 'irregular-blob-low'}`}
                        style={{ 
                          backgroundColor: todaysMood?.color || '#778D5E', 
                          opacity: 0.2,
                          transform: confirmationAnimating ? 'scale(1.5)' : 'scale(1)',
                          transition: 'transform 1s ease-out'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div 
                      className="text-2xl font-medium text-[#0C0907] mb-1 transition-transform duration-500 font-cooper"
                      style={{ transform: confirmationAnimating ? 'translateY(-5px)' : 'translateY(0)' }}
                    >
                      {todaysMood?.label}
                    </div>
                    <div 
                      className="text-base text-[#0C0907]/70 transition-transform duration-500"
                      style={{ transform: confirmationAnimating ? 'translateY(-5px)' : 'translateY(0)' }}
                    >
                      {todaysMood?.description}
                    </div>
                  </div>
                </div>
                
                <div 
                  className="bg-white/40 backdrop-blur-sm rounded-xl p-5 mb-2 relative z-10 overflow-hidden transition-all duration-700"
                  style={{ 
                    transform: confirmationAnimating ? 'translateY(5px)' : 'translateY(0)',
                    boxShadow: confirmationAnimating ? '0 10px 25px -5px rgba(0, 0, 0, 0.05)' : 'none'
                  }}
                >
                  <div 
                    className="absolute inset-0" 
                    style={{ 
                      background: `linear-gradient(135deg, ${todaysMood?.color || '#778D5E'}10, transparent 30%)` 
                    }}
                  ></div>
                  <p className="text-[#0C0907]/90 text-base font-medium relative z-10">
                    Tracking your emotional state helps you understand patterns and gain valuable self-insights over time.
                  </p>
                </div>
                
                <div 
                  className="text-xs tracking-wide uppercase text-[#0C0907]/50 text-center pt-3 relative z-10 transition-all duration-500"
                  style={{ opacity: confirmationAnimating ? 0 : 1 }}
                >
                  Return tomorrow to continue
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-xl p-6 text-center relative overflow-hidden" style={{ backgroundColor: '#F0EFEB' }}>
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#DA7A59] via-[#D9C69C] to-[#778D5E]"></div>
                  <h2 className="text-2xl font-medium text-[#0C0907] mb-1 font-cooper">How are you feeling today?</h2>
                  <p className="text-base text-[#0C0907]/70">Press and hold to confirm your selection</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {moods.map((mood) => (
                    <div
                      key={mood.value}
                      className={`relative rounded-xl overflow-hidden ${activeSelection?.value === mood.value ? 'ring-2 ring-offset-2' : 'border border-transparent'}`}
                      style={{ 
                        ringColor: mood.color,
                        backgroundColor: activeSelection?.value === mood.value ? `${mood.color}15` : '#F7F6F3' 
                      }}
                    >
                      {/* Progress bar for hold confirmation */}
                      {activeSelection?.value === mood.value && (
                        <div 
                          className="absolute bottom-0 left-0 h-1 transition-all ease-out"
                          style={{ 
                            width: `${confirmProgress}%`, 
                            backgroundColor: mood.color,
                            zIndex: 5,
                          }}
                        ></div>
                      )}
                      
                      {/* Ripple background animation */}
                      {activeSelection?.value === mood.value && (
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute w-full h-full animate-ripple" style={{ 
                            backgroundColor: mood.color,
                            opacity: 0.05,
                            borderRadius: '50%',
                            transformOrigin: 'center',
                          }}></div>
                        </div>
                      )}
                      
                      <button
                        className="w-full p-5 flex items-center relative z-10 transition-all"
                        onMouseDown={() => startHoldConfirmation(mood)}
                        onTouchStart={() => startHoldConfirmation(mood)}
                        onMouseUp={cancelHoldConfirmation}
                        onMouseLeave={cancelHoldConfirmation}
                        onTouchEnd={cancelHoldConfirmation}
                        onTouchCancel={cancelHoldConfirmation}
                      >
                        <div 
                          className={`w-14 h-14 mr-4 transition-all duration-300 flex items-center justify-center shadow-md relative ${mood.value === 3 ? 'irregular-blob-high' : mood.value === 2 ? 'irregular-blob-neutral' : 'irregular-blob-low'} ${activeSelection?.value === mood.value ? 'scale-110' : 'scale-100'}`} 
                          style={{ backgroundColor: mood.color }}
                        >
                          {/* Pulse animation */}
                          {activeSelection?.value === mood.value && (
                            <div className={`absolute inset-0 animate-ping ${mood.value === 3 ? 'irregular-blob-high' : mood.value === 2 ? 'irregular-blob-neutral' : 'irregular-blob-low'}`} style={{ 
                              backgroundColor: mood.color,
                              opacity: 0.3
                            }}></div>
                          )}
                          
                          {/* Check mark that appears during hold */}
                          {activeSelection?.value === mood.value && confirmProgress > 50 && (
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-6 w-6 text-white animate-scale-in" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="text-left flex-1">
                          <span className="text-xl font-medium text-[#0C0907] block font-cooper">{mood.label}</span>
                          <span className="text-base text-[#0C0907]/70 block">{mood.description}</span>
                        </div>
                        <div className="ml-auto">
                          <svg 
                            className={`w-6 h-6 transition-all duration-300 ${activeSelection?.value === mood.value ? 'text-[#0C0907]/90 rotate-90' : 'text-[#0C0907]/40'}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2 text-center">
                  <div className="inline-flex items-center justify-center space-x-1 text-xs text-[#0C0907]/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Press and hold to confirm selection</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Updated bottom nav bar with smoother design */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#0C0907]/5 px-6 py-4 shadow-sm">
        <div className="flex justify-around max-w-md mx-auto">
          <Link 
            href="/mood-tracking" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-4 h-1 bg-[#778D5E] opacity-100 rounded-b-md transition-all duration-300"></div>
            <div className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#778D5E]">
                <circle cx="12" cy="12" r="8"></circle>
                <circle cx="12" cy="12" r="3"></circle>
                <line x1="12" y1="4" x2="12" y2="4.01"></line>
                <line x1="12" y1="20" x2="12" y2="20.01"></line>
                <line x1="4" y1="12" x2="4.01" y2="12"></line>
                <line x1="20" y1="12" x2="20.01" y2="12"></line>
              </svg>
            </div>
            <span className="mt-1 text-sm font-medium font-cooper text-[#778D5E]">Track</span>
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

export default DailyMoodTracking; 