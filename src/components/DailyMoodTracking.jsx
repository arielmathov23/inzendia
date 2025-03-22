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

  @keyframes breathe-animation {
    0%, 100% {
      transform: scale(1);
      opacity: 0.9;
    }
    25% {
      transform: scale(1.35);
      opacity: 1;
    }
    50% {
      transform: scale(1.35);
      opacity: 1;
    }
    75% {
      transform: scale(1);
      opacity: 0.9;
    }
  }
  
  @keyframes pulse-gentle {
    0%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.05);
      opacity: 1;
    }
  }
  
  @keyframes float-subtle {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
  
  @keyframes rotate-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes color-shift {
    0%, 100% {
      color: rgba(255, 255, 255, 0.9);
    }
    50% {
      color: rgba(138, 139, 222, 1);
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
  
  .animate-breathe {
    animation: breathe-animation 16s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
  
  .animate-pulse-gentle {
    animation: pulse-gentle 3s ease-in-out infinite;
  }
  
  .animate-float-subtle {
    animation: float-subtle 6s ease-in-out infinite;
  }
  
  .animate-rotate-slow {
    animation: rotate-slow 12s linear infinite;
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

  @keyframes breathe-in-animation {
    0% {
      transform: scale(1);
      opacity: 0.9;
    }
    100% {
      transform: scale(1.35); 
      opacity: 1;
    }
  }
  
  @keyframes breathe-out-animation {
    0% {
      transform: scale(1.35);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0.9;
    }
  }
  
  .animate-breathe-in {
    animation: breathe-in-animation 4s ease-in-out forwards;
  }
  
  .animate-breathe-out {
    animation: breathe-out-animation 4s ease-in-out forwards;
  }
  
  .circle-expanded {
    transform: scale(1.35);
    opacity: 1;
  }
  
  .circle-contracted {
    transform: scale(1);
    opacity: 0.9;
  }
`;

const DailyMoodTracking = () => {
  const [submittedToday, setSubmittedToday] = useState(false);
  const [todaysMood, setTodaysMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSelection, setActiveSelection] = useState(null);
  const [confirmProgress, setConfirmProgress] = useState(0);
  const [confirmationAnimating, setConfirmationAnimating] = useState(false);
  const [moodReason, setMoodReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const holdTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const router = useRouter();
  const breathingIntervalRef = useRef(null);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingStage, setBreathingStage] = useState(0);
  const [breathingRound, setBreathingRound] = useState(1);
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [completedExercise, setCompletedExercise] = useState(false);
  const [autoStartCountdown, setAutoStartCountdown] = useState(4);
  const autoStartRef = useRef(null);

  // Update mood options with darker neutral color for better contrast
  const moods = [
    { value: 3, label: 'Pleasant', color: '#778D5E', description: 'Experience positivity, satisfaction, or joy.' },
    { value: 2, label: 'Neutral', color: '#D9C69C', description: 'Experience neither strong positive nor negative feelings.' },
    { value: 1, label: 'Unpleasant', color: '#DA7A59', description: 'Experience negativity, distress, or discomfort.' }
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
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
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
    setSelectedMood(mood);
    setShowReasonInput(true);
  };

  const saveMoodEntry = () => {
    // Create the entry with mood and reason
    const entry = {
      mood: selectedMood,
      reason: moodReason.trim() || `No reason specified`,
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
        setTodaysMood(selectedMood);
        setSubmittedToday(true);
        setActiveSelection(null);
        setConfirmProgress(0);
        setShowReasonInput(false);
        
        // Reset confirmation state after animation
        setTimeout(() => {
          setConfirmationAnimating(false);
        }, 1500);
      }, 300);
    } catch (error) {
      console.error('Error saving mood:', error);
      setActiveSelection(null);
      setConfirmProgress(0);
      setShowReasonInput(false);
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
      
      // Reset all states including breathing exercise
      setSubmittedToday(false);
      setTodaysMood(null);
      setCompletedExercise(false);
      setTapCount(0);
      setMoodReason('');
      setShowReasonInput(false);
      
      // Close breathing modal if open
      if (showBreathingExercise) {
        closeBreathingModal();
      }
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  // Start breathing exercise
  const startBreathingExercise = () => {
    console.log("Starting breathing exercise");
    setIsBreathingActive(true);
    setBreathingStage(0); // Start with Breathe In
    setBreathingRound(1); // Start with round 1
    setBreathingTimer(4); // 4 seconds per stage
    
    if (breathingIntervalRef.current) {
      clearInterval(breathingIntervalRef.current);
    }
    
    // These variables track state outside of React's state
    // to prevent closure issues with setInterval
    let currentStage = 0;
    let currentRound = 1;
    let timer = 4;
    
    breathingIntervalRef.current = setInterval(() => {
      // Decrement timer
      timer -= 1;
      
      // Update React state for display
      setBreathingTimer(timer);
      
      if (timer <= 0) {
        // Advance to next stage when timer reaches 0
        currentStage = (currentStage + 1) % 4;
        console.log(`Moving to stage ${currentStage}: ${getBreathingStageText(currentStage)}`);
        
        // If we've completed a full cycle (all 4 stages), increment round
        if (currentStage === 0) {
          currentRound += 1;
          console.log(`Completed cycle, moving to round ${currentRound}`);
          
          // If we've completed all 4 rounds, end the exercise
          if (currentRound > 4) {
            console.log("Exercise complete!");
            clearInterval(breathingIntervalRef.current);
            setIsBreathingActive(false);
            setCompletedExercise(true);
            setBreathingRound(4); // Keep at 4 to show completion
            return;
          }
          
          setBreathingRound(currentRound);
        }
        
        // Update the stage in React state and reset timer
        setBreathingStage(currentStage);
        timer = 4; // Reset timer to 4 for the next stage
        setBreathingTimer(4); // Make sure UI shows 4 immediately
        
        // Check if we're at the final position (Round 4, stage 0)
        if (currentRound === 4 && currentStage === 0) {
          // Complete exercise after a small delay to let user see the fourth round start
          setTimeout(() => {
            console.log("Exercise complete - delayed trigger");
            clearInterval(breathingIntervalRef.current);
            setIsBreathingActive(false);
            setCompletedExercise(true);
          }, 500);
        }
      }
    }, 1000);
  };

  // Handle card taps for breathing exercise
  const handleCardTap = () => {
    setTapCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 4) {
        showBreathingModal();
        return 0;
      }
      return newCount;
    });
  };

  // Stop breathing exercise
  const stopBreathingExercise = () => {
    if (breathingIntervalRef.current) {
      clearInterval(breathingIntervalRef.current);
    }
    setIsBreathingActive(false);
  };

  // Close breathing modal
  const closeBreathingModal = () => {
    if (breathingRound === 4 && breathingStage === 0 && breathingTimer === 4) {
      setCompletedExercise(true);
    }
    stopBreathingExercise();
    setShowBreathingExercise(false);
    setBreathingStage(0);
    setBreathingRound(1);
    setBreathingTimer(4);
    setAutoStartCountdown(4);
    if (autoStartRef.current) {
      clearInterval(autoStartRef.current);
    }
  };

  // Handle showing breathing exercise modal
  const showBreathingModal = () => {
    setShowBreathingExercise(true);
    
    // Start auto-start countdown
    if (autoStartRef.current) {
      clearInterval(autoStartRef.current);
    }
    
    autoStartRef.current = setInterval(() => {
      setAutoStartCountdown(prev => {
        if (prev <= 1) {
          clearInterval(autoStartRef.current);
          startBreathingExercise();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getBreathingStageText = (stage = breathingStage) => {
    const stages = [
      'Breathe In',
      'Hold With Air',
      'Breathe Out',
      'Hold Without Air'
    ];
    return stages[stage];
  };

  const getBreathingStageDescription = () => {
    const descriptions = [
      'Inhale deeply through your nose, expanding your diaphragm',
      'Keep your lungs full, hold the oxygen within',
      'Exhale slowly through your mouth, release all tension',
      'Keep your lungs empty, embrace the stillness'
    ];
    return descriptions[breathingStage];
  };

  // Handle completion of breathing exercise
  const handleExerciseCompletion = () => {
    setCompletedExercise(true);
    setShowBreathingExercise(false);
  };

  // Get breathing stage animation class
  const getBreathingAnimationClass = () => {
    if (!isBreathingActive) return '';
    
    // Each stage has its own distinct animation/style
    switch (breathingStage) {
      case 0: // Breathe In - animate from small to large
        return 'animate-breathe-in';
      case 1: // Hold With Air - stay large
        return 'circle-expanded';
      case 2: // Breathe Out - animate from large to small
        return 'animate-breathe-out';
      case 3: // Hold Without Air - stay small
        return 'circle-contracted';
      default:
        return '';
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
    <div className="flex flex-col items-center justify-start min-h-screen p-4 pb-20 sm:p-6" style={{ backgroundColor: '#E5E4E0' }}>
      {/* Custom animations */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="w-full max-w-md">
        <header className="mb-4 sm:mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0C0907] font-cooper">Daily Mood Tracking</h1>
            <p className="text-sm sm:text-base text-[#0C0907]/70 mt-1">{formatDate()}</p>
          </div>
          <button
            onClick={handleResetData}
            className="text-[#DA7A59] hover:text-[#DA7A59]/80 p-2 rounded-full transition-colors"
            title="Developer tool: reset data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
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
              <div>
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
                    className="bg-white/50 backdrop-blur-sm rounded-xl p-6 relative z-10 overflow-hidden transition-all duration-700 border border-white/60"
                    style={{ 
                      transform: confirmationAnimating ? 'translateY(5px)' : 'translateY(0)',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.03)'
                    }}
                  >
                    <div 
                      className="absolute inset-0" 
                      style={{ 
                        background: `linear-gradient(135deg, ${todaysMood?.color || '#778D5E'}10, transparent 40%)` 
                      }}
                    ></div>
                    <div className="space-y-4">
                      <p className="text-[#0C0907]/80 text-base font-medium relative z-10 font-cooper">
                        Tracking your emotional state helps you understand patterns and gain valuable self-insights over time.
                      </p>
                      
                      <div className="w-full h-px bg-[#0C0907]/10"></div>
                      
                      <div 
                        className="relative z-10 transition-all duration-500 text-center"
                        style={{ 
                          opacity: confirmationAnimating ? 0 : 1,
                          transform: confirmationAnimating ? 'translateY(10px)' : 'translateY(0)'
                        }}
                      >
                        {/* Display the user's reason if available */}
                        <span className="text-[#5A5A58] font-medium font-cooper tracking-wide text-[15px] relative inline-block">
                          {(() => {
                            try {
                              const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
                              const today = new Date().setHours(0, 0, 0, 0);
                              const todayEntry = entries.find(entry => {
                                const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
                                return entryDate === today;
                              });
                              
                              if (todayEntry && todayEntry.reason) {
                                return todayEntry.reason;
                              }
                              return "Return tomorrow to continue";
                            } catch (error) {
                              return "Return tomorrow to continue";
                            }
                          })()}
                          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#5A5A58]/30 rounded-full"></span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Breathing Exercise Card */}
                <div 
                  className="bg-[#8A8BDE] rounded-xl p-6 relative z-10 overflow-hidden transition-all duration-300 cursor-pointer mt-4"
                  style={{ 
                    boxShadow: '0 10px 25px -5px rgba(138, 139, 222, 0.3)'
                  }}
                  onClick={handleCardTap}
                >
                  <div 
                    className="absolute inset-0" 
                    style={{ 
                      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 70%)` 
                    }}
                  ></div>
                  
                  <div className="relative z-10 flex items-center">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mr-4 shadow-md relative">
                      {tapCount > 0 && (
                        <div className="absolute inset-0 rounded-full bg-[#8A8BDE]/5 transform scale-110"></div>
                      )}
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#8A8BDE] relative z-10">
                        <path d="M12 22c5.5 0 10-4.5 10-10 0-2.7-1-5.2-2.9-7.1C17.2 2.9 14.7 2 12 2 9.3 2 6.8 2.9 4.9 4.9 3 6.8 2 9.3 2 12c0 5.5 4.5 10 10 10z" />
                        <path d="M12 6v2" />
                        <path d="M12 18v-2" />
                        <path d="M6 12h2" />
                        <path d="M16 12h2" />
                        <path d="M9.5 9.5c1.9-1.9 5.1-1.9 7 0" />
                        <path d="M16.5 14.5c-1.9 1.9-5.1 1.9-7 0" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white text-lg font-semibold font-cooper tracking-tight">Breathing Exercise</h3>
                      <p className="text-white text-sm">
                        {completedExercise 
                          ? "Exercise completed today" 
                          : "Tap 4 times for calm & focus"
                        }
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      {completedExercise ? (
                        <div className="bg-white/20 rounded-full p-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                      ) : (
                        <>
                          <div className="mb-1 text-[11px] text-white font-medium tracking-wide">
                            {tapCount > 0 ? `${tapCount}/4 taps` : ''}
                          </div>
                          <div className="flex space-x-1.5">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div 
                                key={i} 
                                className="w-2 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  backgroundColor: i < tapCount ? 'white' : 'rgba(255, 255, 255, 0.3)',
                                  transform: i < tapCount ? 'scale(1.2)' : 'scale(1)'
                                }}
                              ></div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div 
                  className="rounded-xl mb-4 sm:mb-6 p-5 sm:p-6 text-center"
                  style={{ backgroundColor: '#F0EFEB' }}
                >
                  <h2 className="text-xl sm:text-2xl font-medium mb-3 font-cooper">How are you feeling today?</h2>
                  <p className="text-sm sm:text-base text-[#0C0907]/70">Press and hold to confirm your selection</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {moods.map((mood) => (
                    <div
                      key={mood.value}
                      className={`rounded-xl mb-3 sm:mb-4 overflow-hidden p-4 sm:p-5 relative cursor-pointer transition-transform duration-200 ${activeSelection?.value === mood.value ? 'transform scale-[1.02]' : 'hover:transform hover:scale-[1.01]'}`}
                      style={{ backgroundColor: '#F0EFEB' }}
                      onMouseDown={() => startHoldConfirmation(mood)}
                      onTouchStart={() => startHoldConfirmation(mood)}
                      onMouseUp={cancelHoldConfirmation}
                      onMouseLeave={cancelHoldConfirmation}
                      onTouchEnd={cancelHoldConfirmation}
                      onTouchCancel={cancelHoldConfirmation}
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
                      
                      <div className="flex items-center relative z-10">
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
                      </div>
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
      
      {/* Updated bottom nav bar with improved design */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#F7F6F3] px-4 py-3 shadow-md rounded-t-2xl border-t border-[#E5E4E0]">
        <div className="flex justify-around max-w-md mx-auto">
          <Link 
            href="/mood-tracking" 
            className="flex flex-col items-center relative group"
          >
            <div className="absolute inset-x-0 -top-3 h-0.5 bg-[#5A5A58] opacity-100 rounded-b-md transition-all duration-300"></div>
            <div className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 bg-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5A5A58]">
                <circle cx="12" cy="12" r="8"></circle>
                <circle cx="12" cy="12" r="3"></circle>
                <line x1="12" y1="4" x2="12" y2="4.01"></line>
                <line x1="12" y1="20" x2="12" y2="20.01"></line>
                <line x1="4" y1="12" x2="4.01" y2="12"></line>
                <line x1="20" y1="12" x2="20.01" y2="12"></line>
              </svg>
            </div>
            <span className="mt-0.5 text-[12px] sm:text-[13px] font-medium font-cooper text-[#5A5A58]">Track</span>
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
            <span className="mt-0.5 text-[13px] font-medium font-cooper text-[#0C0907]/60 group-hover:text-[#5A5A58]">History</span>
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
            <span className="mt-0.5 text-[13px] font-medium font-cooper text-[#0C0907]/60 group-hover:text-[#5A5A58]">Insights</span>
          </Link>
        </div>
      </div>

      {/* Reason Input Overlay */}
      {showReasonInput && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#0C0907]/60 animate-fade-in">
          <div className="w-full max-w-md bg-[#F7F6F3] rounded-xl p-6 shadow-lg">
            <h3 className="text-2xl font-cooper text-[#0C0907] mb-4">Why do you feel {selectedMood?.label.toLowerCase()}?</h3>
            
            <div className="mb-5">
              <textarea
                placeholder="Share why you're feeling this way... (i.e. work stress, quality time with friends, got enough sleep)"
                className="w-full h-24 p-3 border border-[#E5E4E0] rounded-lg bg-white focus:ring-2 focus:ring-[#8A8BDE] focus:outline-none font-medium text-[#0C0907]"
                value={moodReason}
                onChange={(e) => setMoodReason(e.target.value)}
              ></textarea>
            </div>
            
            <div className="mb-5">
              <p className="text-sm text-[#0C0907]/60 mb-2">Suggested topics:</p>
              <div className="flex flex-wrap gap-2">
                {['Work', 'Relationships', 'Health', 'Sleep', 'Exercise', 'Weather', 'Food', 'Family'].map(topic => (
                  <button
                    key={topic}
                    className="px-3 py-1 bg-[#8A8BDE]/10 text-[#8A8BDE] rounded-full text-sm hover:bg-[#8A8BDE]/20 transition-colors"
                    onClick={() => setMoodReason(prev => prev ? `${prev}, ${topic.toLowerCase()}` : topic.toLowerCase())}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-[#0C0907]/60 rounded-md hover:bg-[#0C0907]/5 transition-colors"
                onClick={() => {
                  setMoodReason('');
                  setShowReasonInput(false);
                  setSelectedMood(null);
                  setActiveSelection(null);
                  setConfirmProgress(0);
                }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-[#8A8BDE] text-white rounded-md hover:bg-[#8A8BDE]/90 transition-colors"
                onClick={saveMoodEntry}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breathing Exercise Modal - IMPROVED DESIGN */}
      {showBreathingExercise && (
        <div className="fixed inset-0 z-50 flex flex-col animate-fade-in overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #f7f6f3, #e6e5f0, #d4d3f2)' }}
        >
          {/* Enhanced decorative background elements */}
          <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none">
            <div className="absolute w-[600px] h-[600px] rounded-full bg-[#8A8BDE]/20 -top-80 -right-80 animate-rotate-slow"></div>
            <div className="absolute w-[400px] h-[400px] rounded-full bg-[#8A8BDE]/25 bottom-20 -left-60 animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }}></div>
            <div className="absolute w-80 h-80 rounded-full bg-[#8A8BDE]/15 top-1/3 right-10 animate-pulse-gentle"></div>
            <div className="absolute w-full h-[600px] -bottom-300 bg-[#8A8BDE]/10 rotate-12 animate-float-subtle" style={{ animationDuration: '20s' }}></div>
            <div className="absolute w-[200px] h-[200px] rounded-full bg-[#8A8BDE]/10 top-1/4 left-10 animate-pulse-gentle" style={{ animationDuration: '8s' }}></div>
          </div>
          
          <div className="p-6 flex justify-center items-center relative z-10">
            <div className="text-center">
              <h2 className="text-3xl font-cooper text-[#0C0907]">Breathing Exercise</h2>
              <p className="text-base text-[#0C0907]/60 mt-1">4-seconds breathing technique</p>
            </div>
            
            <button 
              onClick={closeBreathingModal}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm text-[#0C0907]/70 hover:text-[#8A8BDE] transition-colors absolute top-6 right-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {(completedExercise || (breathingRound === 4 && breathingStage === 0 && !isBreathingActive)) ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 relative">
              <div className="animate-float-subtle mb-10">
                <div className="relative mx-auto">
                  <div className="w-28 h-28 rounded-full bg-[#8A8BDE]/15 mx-auto flex items-center justify-center">
                    <svg className="w-16 h-16 text-[#8A8BDE]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-full animate-pulse-gentle opacity-50" style={{ background: 'radial-gradient(circle, rgba(138,139,222,0.3) 0%, rgba(138,139,222,0) 70%)' }}></div>
                </div>
              </div>
              
              <div className="text-center mb-14 max-w-sm mx-auto">
                <h3 className="text-4xl font-cooper text-[#8A8BDE] mb-6">Wonderful job!</h3>
                <p className="text-xl text-[#0C0907]/80 mb-8 leading-relaxed">
                  You've completed your breathing exercise for today.
                </p>
                
                <div className="bg-[#8A8BDE]/15 rounded-2xl p-6 mb-10 shadow-sm">
                  <div className="flex items-start">
                    <div className="text-[#8A8BDE] mr-4 mt-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                        <line x1="9" y1="9" x2="9.01" y2="9"></line>
                        <line x1="15" y1="9" x2="15.01" y2="9"></line>
                      </svg>
                    </div>
                    <p className="text-left text-[#0C0907]/80 text-base leading-relaxed">
                      Regular breathing practice can reduce stress and improve focus. Come back tomorrow to continue your mindfulness journey.
                    </p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleExerciseCompletion}
                className="py-4 px-10 rounded-full bg-[#8A8BDE] text-white font-semibold font-cooper tracking-wide text-lg transition-all hover:bg-[#7879C5] shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
                style={{ animationDuration: '3s' }}
              >
                See you tomorrow
              </button>
            </div>
          ) : autoStartCountdown > 0 && !isBreathingActive ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 relative">
              <div className="text-center mb-6">
                <h3 className="text-xl font-cooper text-[#8A8BDE] mb-3">Starting in</h3>
              </div>
              
              <div className="relative mb-10 animate-float-subtle">
                <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto bg-white/60 backdrop-blur-sm border border-white/80 relative animate-pulse-gentle"
                  style={{ boxShadow: '0 10px 30px -5px rgba(138, 139, 222, 0.25)' }}
                >
                  <div className="text-8xl font-cooper text-[#8A8BDE]">
                    {autoStartCountdown}
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-[#8A8BDE]/30"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-[#8A8BDE]/50 animate-pulse-gentle"></div>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-lg text-[#0C0907]/70 max-w-xs mx-auto">
                  Get ready to follow along with the breathing exercise
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 relative">
              <div className="text-center mb-14">
                <h3 className="text-2xl text-[#8A8BDE] font-cooper mb-1">Round {breathingRound} of 4</h3>
                <div className="flex space-x-3 justify-center mt-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`transition-all duration-500 rounded-full border ${i < breathingRound ? 'w-3 h-3 bg-[#8A8BDE] border-[#8A8BDE]' : 'w-2.5 h-2.5 bg-transparent border-[#8A8BDE]/30'}`}
                    ></div>
                  ))}
                </div>
              </div>
                
              <div className="relative mb-20 animate-float-subtle">
                <div className="absolute inset-0 rounded-full bg-[#8A8BDE]/20 animate-pulse-gentle"></div>
                <div 
                  className={`w-56 h-56 rounded-full flex items-center justify-center mx-auto bg-white/60 backdrop-blur-sm border border-white/80 relative ${getBreathingAnimationClass()}`}
                  style={{ 
                    boxShadow: '0 10px 30px -5px rgba(138, 139, 222, 0.25)',
                  }}
                >
                  <div className={`text-6xl font-cooper transition-all duration-300 ${isBreathingActive ? 'animate-color-shift' : 'text-[#8A8BDE]'}`}>
                    {isBreathingActive ? breathingTimer : "4"}
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-[#8A8BDE]/30"></div>
                  {isBreathingActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-[#8A8BDE]/50 animate-pulse-gentle"></div>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-3xl font-cooper text-[#8A8BDE] transition-all duration-500">
                  {getBreathingStageText()}
                </h3>
              </div>
              
              {!isBreathingActive && (
                <button 
                  onClick={startBreathingExercise}
                  className="py-3 px-8 mt-10 rounded-full bg-[#8A8BDE]/10 border border-[#8A8BDE]/20 text-[#8A8BDE] font-medium font-cooper tracking-wide text-base transition-all hover:bg-[#8A8BDE]/20"
                >
                  I'm ready
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyMoodTracking; 