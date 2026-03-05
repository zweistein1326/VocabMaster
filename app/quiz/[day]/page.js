"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vocabularyMasterList } from '@/lib/vocabData';
import Link from 'next/link';

export default function QuizDayPage() {
  const { day } = useParams();
  const router = useRouter();
  
  // Format slug (day-1) to key (Day 1)
  const dayName = day.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const words = vocabularyMasterList[dayName] || [];

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);

  const confirmExit = () => {
    router.push('/');
  };

  // 1. Logic to fetch definitions and build the quiz
  const prepareQuiz = useCallback(async () => {
    if (words.length === 0) return;
    setLoading(true);
    
    try {
      const quizData = await Promise.all(words.slice(0, 20).map(async (word) => {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await res.json();
        
        const definition = data[0]?.meanings[0]?.definitions[0]?.definition || "Definition not found.";
        const example = data[0]?.meanings[0]?.definitions[0]?.example || `Context: This word is defined as ${definition}`;

        // Create 3 random distractors from the current day's list
        const distractors = words
          .filter(w => w !== word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        return {
          word,
          // Create the "Gap" in the sentence
          question: example.replace(new RegExp(word, 'gi'), '__________'),
          options: [...distractors, word].sort(() => 0.5 - Math.random()),
          correct: word
        };
      }));
      
      setQuestions(quizData);
    } catch (error) {
      console.error("Quiz Prep Error:", error);
    } finally {
      setLoading(false);
    }
  }, [words]);

  useEffect(() => {
    prepareQuiz();
  }, [prepareQuiz]);

  // 2. Save Progress Logic (Triggers Heatmap & Streak)
  const saveProgress = (finalScore, dayName) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const history = JSON.parse(localStorage.getItem('vocabHistory')) || {};
    
    // Initialize the array for today if it doesn't exist
    if (!Array.isArray(history[dateStr])) {
      history[dateStr] = [];
    }

    // Push the new quiz result into the array
    history[dateStr].push({
      score: finalScore,
      dayName: dayName,
      timestamp: now.getTime()
    });
    
    localStorage.setItem('vocabHistory', JSON.stringify(history));
    window.dispatchEvent(new Event('storage')); // Sync Dashboard
  };

  const handleAnswer = (choice) => {
    const isCorrect = choice === questions[currentIdx].correct;
    const newScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) setScore(newScore);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setQuizComplete(true);
      saveProgress(newScore, dayName);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Generating your {dayName} Quiz...</p>
      </div>
    </div>
  );

  if (quizComplete) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Finished!</h2>
        <p className="text-gray-500 mb-6">Great job on completing {dayName}</p>
        <div className="text-6xl font-black text-indigo-600 mb-8">{score} / {questions.length}</div>
        <button 
          onClick={() => router.push('/')}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-2xl">
        <div className="w-full max-w-2xl flex justify-between items-center mb-8">
          <button 
            onClick={() => setShowExitPopup(true)}
            className="text-red-400 hover:text-red-600 font-bold transition-colors"
          >
            ✕ Exit Quiz
          </button>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-bold text-gray-600 border border-gray-100">
            {currentIdx + 1} of {questions.length}
          </div>
        </div>

        {/* 2. Exit Confirmation Popup (Modal) */}
        {showExitPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Quit Quiz?</h3>
              <p className="text-gray-500 mb-6">Your progress for this session will not be saved. Are you sure you want to leave?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowExitPopup(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Stay
                </button>
                <button 
                  onClick={confirmExit}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 min-h-[300px] flex flex-col justify-center">
          <h3 className="text-indigo-600 font-black uppercase text-xs tracking-widest mb-4">Fill in the blank</h3>
          <p className="text-2xl font-serif text-gray-800 leading-relaxed italic">
            &quot;{questions[currentIdx].question}&quot;
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {questions[currentIdx].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className="p-5 bg-white border-2 border-gray-100 rounded-2xl text-left font-bold text-gray-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}