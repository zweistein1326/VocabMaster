"use client";
export default function Dashboard({ masteredCount }) {
  const milestone = 5000;
  const percentage = Math.min((masteredCount / milestone) * 100, 100);

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Your Progress</h2>
        <span className="text-blue-600 font-mono text-xl">{masteredCount.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div 
          className="bg-green-500 h-4 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-right">{percentage.toFixed(1)}% of Fluency Milestone</p>
    </div>
  );
}