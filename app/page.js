"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeatmapDashboard from '@/components/HeatmapDashboard';
import { getNextIncompleteDay } from '@/lib/progressTracker';

export default function Home() {
  const [targetDay, setTargetDay] = useState("Day 1");

  useEffect(() => {
    const refreshProgress = () => {
      let targetDay = getNextIncompleteDay();
      setTargetDay(targetDay);
    };

    refreshProgress();
    window.addEventListener('focus', refreshProgress); // Re-check when user returns to dashboard
    return () => window.removeEventListener('focus', refreshProgress);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-8 gap-8">
      {/* 1. Heatmap Dashboard */}
      <HeatmapDashboard />

      {/* 2. Today's Lesson Action Card */}
      <div className="w-full max-w-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white">
        <h3 className="text-blue-100 uppercase text-xs font-black tracking-widest mb-2">Your Next Milestone</h3>
        <h2 className="text-3xl font-bold mb-6">Ready for {targetDay}?</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/learn/${targetDay.replace(' ', '-').toLowerCase()}`} className="flex-1">
            <button className="w-full bg-white text-blue-700 font-bold py-4 rounded-2xl hover:bg-blue-50 transition-colors shadow-lg">
              📖 Study 20 New Words
            </button>
          </Link>
          
          <Link href={`/quiz/${targetDay.replace(' ', '-').toLowerCase()}`} className="flex-1">
            <button className="w-full bg-transparent border-2 border-white/30 hover:border-white text-white font-bold py-4 rounded-2xl transition-all">
              🎯 Take the Quiz
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}