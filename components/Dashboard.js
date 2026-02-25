"use client";
import { useEffect, useState } from 'react';

export default function Dashboard({ masteredCount }) {
  const [dailyScores, setDailyScores] = useState({});

  useEffect(() => {
    const scores = JSON.parse(localStorage.getItem('quizScores')) || {};
    setDailyScores(scores);
  }, []);

  return (
    <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-xs text-blue-600 font-bold uppercase">Words Mastered</p>
          <p className="text-3xl font-black text-blue-700">{masteredCount}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl">
          <p className="text-xs text-green-600 font-bold uppercase">Avg. Retention</p>
          <p className="text-3xl font-black text-green-700">
            {Object.values(dailyScores).length > 0 
              ? Math.round(Object.values(dailyScores).reduce((a,b) => a+b, 0) / Object.values(dailyScores).length)
              : 0}%
          </p>
        </div>
      </div>

      {/* <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase">Recent Quiz Performance</h3>
      <div className="flex items-end gap-2 h-32">
        {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"].map((day) => (
          <div key={day} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-blue-500 rounded-t-md transition-all duration-1000" 
              style={{ height: `${dailyScores[day] || 0}%` }}
            ></div>
            <span className="text-[10px] mt-2 font-bold text-gray-500">{day}</span>
          </div>
        ))}
      </div> */}
    </div>
  );
}