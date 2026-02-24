"use client";
import { useState, useEffect } from 'react';
import { vocabularyMasterList } from '@/lib/vocabData';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [currentDay, setCurrentDay] = useState("Day 1");
  const [index, setIndex] = useState(0);
  const [wordData, setWordData] = useState({ definition: '', example: '', loading: false });
  const [mastered, setMastered] = useState([]);
  const [isFlipped, setIsFlipped] = useState(false);

  const words = vocabularyMasterList[currentDay];
  const currentWord = words[index];

  // Load progress from LocalStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('masteredWords')) || [];
    setMastered(saved);
  }, []);

  // Fetch Definition from API
  useEffect(() => {
    async function getDef() {
      setWordData({ ...wordData, loading: true });
      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentWord}`);
        const data = await res.json();
        setWordData({
          definition: data[0].meanings[0].definitions[0].definition,
          example: data[0].meanings[0].definitions[0].example || "No example found.",
          loading: false
        });
      } catch (err) {
        setWordData({ definition: "Not found", example: "", loading: false });
      }
    }
    setIsFlipped(false);
    getDef();
  }, [index, currentDay]);

  const toggleMastery = () => {
    let updated = mastered.includes(currentWord) 
      ? mastered.filter(w => w !== currentWord) 
      : [...mastered, currentWord];
    setMastered(updated);
    localStorage.setItem('masteredWords', JSON.stringify(updated));
  };

  const speak = () => {
    const msg = new SpeechSynthesisUtterance(currentWord);
    window.speechSynthesis.speak(msg);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-8 text-black">
      <Dashboard masteredCount={mastered.length} />

      <h1 className="text-2xl font-bold mb-4">{currentDay}</h1>
      <div className="mb-6">
        <select 
          value={currentDay} 
          onChange={(e) => {
            setCurrentDay(e.target.value);
            setIndex(0);
          }}
          className="p-2 border rounded-md shadow-sm bg-white"
        >
          {Object.keys(vocabularyMasterList).map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className={`w-full max-w-sm h-64 bg-white rounded-2xl shadow-lg cursor-pointer transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ perspective: '1000px' }}
      >
        <div className="p-8 flex flex-col items-center justify-center h-full text-center">
          {!isFlipped ? (
            <div>
              <h2 className="text-4xl font-serif">{currentWord}</h2>
              <p className="text-gray-400 mt-2 italic">Click to reveal</p>
            </div>
          ) : (
            <div className="rotate-y-180">
              <p className="text-sm font-bold text-blue-600 uppercase">Definition</p>
              <p className="text-gray-700 mb-4">{wordData.definition}</p>
              <p className="text-sm italic text-gray-500">"{wordData.example}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button onClick={speak} className="bg-purple-100 p-3 rounded-full">🔊</button>
        <button 
          onClick={() => setIndex(Math.max(0, index - 1))}
          className="bg-gray-200 px-6 py-2 rounded-lg font-bold"
        >Prev</button>
        <button 
          onClick={toggleMastery}
          className={`${mastered.includes(currentWord) ? 'bg-green-500' : 'bg-yellow-500'} text-white px-6 py-2 rounded-lg font-bold`}
        >
          {mastered.includes(currentWord) ? '✓ Mastered' : 'Master Word'}
        </button>
        <button 
          onClick={() => setIndex(Math.min(words.length - 1, index + 1))}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
        >Next</button>
      </div>
    </main>
  );
}