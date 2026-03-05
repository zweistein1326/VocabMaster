"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vocabularyMasterList } from '@/lib/vocabData';
import Link from 'next/link';

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  
  // Format the ID from "day-1" back to "Day 1"
  const dayId = params.day.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const words = vocabularyMasterList[dayId] || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [details, setDetails] = useState({ def: '', ex: '', loading: false });

  // Fetch from Dictionary API when word changes
  useEffect(() => {
    async function fetchWord() {
      setDetails({ ...details, loading: true });
      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${words[currentIndex]}`);
        const data = await res.json();
        setDetails({
          def: data[0].meanings[0].definitions[0].definition,
          ex: data[0].meanings[0].definitions[0].example || "No example available.",
          loading: false
        });
      } catch (err) {
        setDetails({ def: "Definition not found.", ex: "", loading: false });
      }
    }
    setIsFlipped(false);
    if (words.length > 0) fetchWord();
  }, [currentIndex]);

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(words[currentIndex]);
    window.speechSynthesis.speak(utterance);
  };

  if (words.length === 0) return <div className="p-10 text-center">Day not found.</div>;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/* Header & Progress */}
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <Link href="/" className="text-gray-500 hover:text-black">← Back</Link>
        <h1 className="text-xl font-bold">{dayId}</h1>
        <span className="text-sm font-mono bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          {currentIndex + 1} / 20
        </span>
      </div>

    {/* Flashcard Container */}
    <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative w-full max-w-md h-80 cursor-pointer group"
        style={{ perspective: '1000px' }} // Necessary for 3D effect
    >
    <div 
        className={`relative w-full h-full transition-transform duration-500 shadow-xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
    >
        {/* FRONT FACE */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-3xl flex flex-col items-center justify-center p-8 border border-gray-100"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
            <h2 className="text-5xl font-serif text-gray-800">{words[currentIndex]}</h2>
            <button 
                onClick={(e) => { e.stopPropagation(); speak(); }} 
                className="mt-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                🔊
            </button>
            <p className="mt-8 text-gray-300 text-xs uppercase tracking-widest font-bold">Tap to reveal meaning</p>
        </div>

        {/* BACK FACE */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-3xl flex flex-col justify-center p-8 border border-gray-100 rotate-y-180"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
            <div className="space-y-4">
                <div>
                <h3 className="text-blue-600 font-bold uppercase text-xs tracking-widest mb-1">Definition</h3>
                <p className="text-gray-700 text-lg leading-snug">
                    {details.loading ? "Fetching definition..." : details.def}
                </p>
                </div>
                <hr className="border-gray-50" />
                <div>
                <h3 className="text-blue-600 font-bold uppercase text-xs tracking-widest mb-1">Usage</h3>
                <p className="text-gray-500 italic leading-relaxed">
                    {details.loading ? "..." : details.ex}
                </p>
                </div>
            </div>
        </div>
        </div>
    </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-10 w-full max-w-md">
        <button 
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
          className="flex-1 py-4 bg-gray-200 rounded-2xl font-bold disabled:opacity-30 text-black"
        >
          Previous
        </button>
        
        {currentIndex < words.length - 1 ? (
          <button 
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200"
          >
            Next Word
          </button>
        ) : (
          <Link href={`/quiz/${params.day}`} className="flex-1">
            <button className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-200 animate-bounce">
              Start Quiz 🎯
            </button>
          </Link>
        )}
      </div>
    </main>
  );
}