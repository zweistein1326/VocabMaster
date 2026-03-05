"use client";
import { useState, useEffect } from 'react';

export default function HeatmapDashboard() {
  const [history, setHistory] = useState({});
  const [streak, setStreak] = useState(0);
  const [viewDate, setViewDate] = useState(new Date()); // For switching months
  const [hasMounted, setHasMounted] = useState(false);

  /**
 * Calculates the current daily streak.
 * A streak is maintained if there is a recorded quiz for Today OR Yesterday.
 * @param {Object} history - The vocabHistory object (e.g., { "2026-03-05": [...] })
 * @returns {number} - The total consecutive days
 */
  const calculateStreak = (history) => {
    if (!history || Object.keys(history).length === 0) return 0;

    let streak = 0;
    let checkDate = new Date(); // Start at "Today"

    // Helper to get local YYYY-MM-DD
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const todayStr = formatDate(checkDate);
    
    // 1. Determine the Start Point
    // If no entry for today, check yesterday.
    if (!history[todayStr]) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDate(yesterday);

      // If yesterday is also empty, the streak is broken.
      if (!history[yesterdayStr]) {
        return 0;
      }
      // If yesterday exists, start our backward count from yesterday.
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // 2. Count Backwards
    // Now that we've found the 'head' of the streak, count until we find a gap.
    while (true) {
      const dateKey = formatDate(checkDate);
      
      // Check if the history has an array for this date and it's not empty
      if (history[dateKey] && history[dateKey].length > 0) {
        streak++;
        // Move checkDate back by one day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Gap found, streak ends here
        break;
      }
    }

    return streak;
  };

  useEffect(() => {
    setHasMounted(true);
    const loadData = () => {
        const savedHistory = JSON.parse(localStorage.getItem('vocabHistory')) || {};
        setHistory(savedHistory);
        let streak = calculateStreak(savedHistory);
        setStreak(streak)
    };

    loadData();

    // Listen for changes from other components/pages
    window.addEventListener('storage', loadData);
      return () => window.removeEventListener('storage', loadData);
  }, []);

  if (!hasMounted) {
    return <div className="w-full max-w-2xl h-64 bg-gray-50 animate-pulse rounded-3xl" />; 
    // This renders a placeholder on the server so the "structure" matches
  }

  const renderHeatmap = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // 1. Get total days in the current view month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 2. Get the starting day of the week (0 = Sun, 1 = Mon...)
    // We use this to add empty spacers so the 1st of the month aligns with the correct day
    const firstDayIndex = new Date(year, month, 1).getDay();

    const grid = [];

    // Add empty spacer blocks for the previous month's tail
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push(<div key={`empty-${i}`} className="w-4 h-4 bg-transparent" />);
    }

    // Add actual day blocks
    for (let day = 1; day <= daysInMonth; day++) {
      // Construct the local date key to match saveProgress: YYYY-MM-DD
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // DayData is now an array: [{score, dayName, timestamp}, ...]
      const dayEntries = history[dateStr] || []; 
      const totalQuizzes = dayEntries.length;

      // Calculate the highest score achieved today to determine green intensity
      const maxScore = totalQuizzes > 0 
        ? Math.max(...dayEntries.map(e => e.score)) 
        : 0;

      // Color intensity logic (GitHub style)
      let colorClass = "bg-gray-100"; // No activity
      if (maxScore > 0) colorClass = "bg-green-200";   // Started/Low
      if (maxScore >= 10) colorClass = "bg-green-400";  // Average
      if (maxScore >= 18) colorClass = "bg-green-600";  // High/Mastered
      if (maxScore === 20) colorClass = "bg-green-800"; // Perfect Score

      let date = new Date(year, month, day).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })

      grid.push(
        <div key={day} className="relative group flex justify-center">
          {/* The Square */}
          <div className={`w-4 h-4 rounded-sm ${colorClass} transition-all duration-300 hover:ring-2 hover:ring-indigo-400 cursor-pointer`} />

          {/* The Tooltip (Visible on Hover) */}
          <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 animate-in fade-in slide-in-from-bottom-1">
            <div className="bg-gray-900 text-white text-[10px] p-3 rounded-xl shadow-2xl min-w-[150px] pointer-events-none border border-gray-700">
              <p className="font-bold border-b border-gray-700 pb-1 mb-2">
                {date}
              </p>
              
              {totalQuizzes > 0 ? (
                <div className="space-y-1.5">
                  {dayEntries.map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-4 border-b border-gray-800 last:border-0 pb-1">
                      <span className="text-gray-400 truncate max-w-[80px]">{entry.dayName}</span>
                      <span className={`font-mono ${entry.score >= 15 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {entry.score}/20
                      </span>
                    </div>
                  ))}
                  <p className="text-[8px] text-gray-500 pt-1 text-right italic">
                    {totalQuizzes} session{totalQuizzes > 1 ? 's' : ''} recorded
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No activity recorded</p>
              )}
            </div>
            {/* Tooltip Arrow */}
            <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1 border-r border-b border-gray-700"></div>
          </div>
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="w-full max-w-2xl p-8 bg-white rounded-3xl shadow-2xl border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Progress</h1>
          <p className="text-gray-500 font-medium">Keep the streak alive! 🔥</p>
        </div>
        <div className="text-center bg-orange-50 p-4 rounded-2xl border border-orange-100">
          <span className="block text-3xl font-bold text-orange-600">{streak}</span>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Day Streak</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4 px-1 gap-2 text-black">
          <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-2 bg-gray-200 hover:bg-gray-300 rounded">←</button>
          <h2 className="font-bold text-gray-700 uppercase text-sm tracking-wider">
            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-2 bg-gray-200 hover:bg-gray-300 rounded">→</button>
      </div>

      <div className="grid grid-cols-7 gap-2 w-fit mx-auto">
        {/* Day Labels */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
          <div key={`d-${index}`} className="text-[10px] text-gray-400 font-bold text-center">{d}</div>
        ))}
        {renderHeatmap()}
      </div>
      
      <div className="mt-6 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
        <span>Less</span>
        <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
        <span>More</span>
      </div>
    </div>
  );
}