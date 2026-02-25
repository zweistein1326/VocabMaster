// app/quiz/page.js
"use client";
import { useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react'; // Added Suspense
import GapFillQuiz from '@/components/GapFillQuiz';
import { vocabularyMasterList } from '@/lib/vocabData';
import Link from 'next/link';

// 1. Create a "QuizContent" component to handle the logic
function QuizContent() {
  const searchParams = useSearchParams();
  const day = searchParams.get('day') || "Day 1";
  
  const wordsForQuiz = useMemo(() => {
    const currentWords = vocabularyMasterList[day] || [];
    const allDays = Object.keys(vocabularyMasterList);
    const currentIndex = allDays.indexOf(day);
    
    let reviewWords = [];
    if (currentIndex > 0) {
      const previousDays = allDays.slice(0, currentIndex);
      const allPreviousWords = previousDays.flatMap(d => vocabularyMasterList[d]);
      reviewWords = allPreviousWords.sort(() => 0.5 - Math.random()).slice(0, 10);
    }

    return [...currentWords, ...reviewWords];
  }, [day]);

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">{day} Mixed Assessment</h1>
        <p className="text-sm text-gray-500">
          Includes {wordsForQuiz.length - 20} review words from previous days
        </p>
      </div>
      <GapFillQuiz words={wordsForQuiz} day={day} />
    </>
  );
}

// 2. The main Page component wraps the content in Suspense
export default function QuizPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-xl mb-4">
        <Link href="/" className="text-sm text-blue-600">← Back to Dashboard</Link>
      </div>
      
      <Suspense fallback={<div className="p-20 text-center">Loading Assessment parameters...</div>}>
        <QuizContent />
      </Suspense>
    </main>
  );
}