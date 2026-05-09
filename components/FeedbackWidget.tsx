'use client';

import { useState } from 'react';
import { MessageSquare, X, Brain } from 'lucide-react';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    // Todo: Send to API or database
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setFeedback('');
    }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-72 transform transition-all animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-gray-800">How's DoJo today?</h4>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {submitted ? (
            <div className="text-center py-4 text-green-600 font-medium">
              Thanks for the feedback! 🚀
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what you think..."
                className="w-full text-sm p-2 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold text-sm py-2 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Send Feedback
              </button>
            </form>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105 flex items-center justify-center"
        >
          <Brain className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
