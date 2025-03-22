'use client';

import { useState } from 'react';
import Link from 'next/link';

const UserFeedback = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Please select a rating');
      return;
    }
    
    if (!feedback.trim()) {
      setError('Please enter your feedback');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // For now, we'll just simulate an API call with a timeout
      // In a real app, this would be an API request to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store in localStorage temporarily
      const feedbackEntry = {
        rating,
        feedback,
        date: new Date().toISOString(),
      };
      
      const existingFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
      existingFeedback.push(feedbackEntry);
      localStorage.setItem('userFeedback', JSON.stringify(existingFeedback));
      
      setSubmitted(true);
    } catch (err) {
      setError('Error submitting feedback. Please try again.');
      console.error('Error submitting feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-background to-muted">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-success rounded-full mx-auto flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-medium mb-2">Thank You</h2>
            <p className="text-secondary mb-8">Your feedback has been submitted</p>
            
            <div className="w-full space-y-3">
              <Link 
                href="/mood-tracking" 
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-primary text-white rounded-full font-medium transition-colors hover:bg-primary-hover"
              >
                Return to Mood Tracking
              </Link>
              
              <Link 
                href="/mood-history" 
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-muted text-foreground rounded-full font-medium transition-colors hover:bg-secondary hover:text-white"
              >
                View Your History
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
            <p className="text-sm text-secondary mt-1">{formatDate()}</p>
          </div>
          <nav className="flex space-x-4">
            <Link href="/mood-tracking" className="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </Link>
            <Link href="/mood-history" className="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"></path>
                <path d="M7 14l4-4 4 4 5-5"></path>
              </svg>
            </Link>
          </nav>
        </header>
        
        <div className="glass-card p-8">
          <h2 className="text-xl font-medium mb-2 text-center">How are we doing?</h2>
          <p className="text-secondary text-center mb-8">We value your feedback</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="block text-sm font-medium text-secondary mb-3 text-center">
                Rate your experience
              </label>
              <div className="flex justify-center space-x-4 mb-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-transform ${
                      rating === value 
                        ? 'bg-primary text-white scale-110' 
                        : 'bg-muted text-foreground hover:bg-secondary hover:text-white'
                    }`}
                    onClick={() => setRating(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <label htmlFor="feedback" className="block text-sm font-medium text-secondary mb-3">
                Your Feedback
              </label>
              <textarea
                id="feedback"
                className="w-full px-4 py-3 bg-muted border border-card-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                rows="4"
                placeholder="Tell us what you think..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              ></textarea>
            </div>
            
            {error && (
              <div className="mb-4 text-danger text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-primary text-white rounded-full font-medium transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Feedback'
                )}
              </button>
              
              <Link 
                href="/mood-tracking" 
                className="text-center py-2 text-secondary hover:text-foreground transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFeedback; 