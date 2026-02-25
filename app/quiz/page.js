// app/quiz/page.js
"use client";
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import GapFillQuiz from '@/components/GapFillQuiz';
import { vocabularyMasterList } from '@/lib/vocabData';

export default function QuizPage() {
  const searchParams = useSearchParams();
  const day = searchParams.get('day') || "Day 1";
  
  const wordsForQuiz = useMemo(() => {
    const currentWords = vocabularyMasterList[day] || [];
    
    // Get all day keys (Day 1, Day 2, etc.)
    const allDays = Object.keys(vocabularyMasterList);
    const currentIndex = allDays.indexOf(day);
    
    let reviewWords = [];
    
    // If we are past Day 1, grab 5-10 words from earlier days
    if (currentIndex > 0) {
      const previousDays = allDays.slice(0, currentIndex);
      // Flatten all previous words into one array
      const allPreviousWords = previousDays.flatMap(d => vocabularyMasterList[d]);
      
      // Shuffle and pick 10 random review words
      reviewWords = allPreviousWords
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);
    }

    return [...currentWords, ...reviewWords];
  }, [day]);

  return (
    <main className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">{day} Mixed Assessment</h1>
        <p className="text-sm text-gray-500">Includes {wordsForQuiz.length - 20} review words from previous days</p>
      </div>

      <GapFillQuiz words={wordsForQuiz} day={day} />
    </main>
  );
}