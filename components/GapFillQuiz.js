"use client";
import { useState, useEffect, useCallback } from 'react';

export default function GapFillQuiz({ words, day }) {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [missedWords, setMissedWords] = useState([]);

  // Fetching logic wrapped in useCallback to prevent re-render loops
  const prepareFullQuiz = useCallback(async () => {
    if (!words || words.length === 0 || questions.length > 0) return;

    let quizSet = [];
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await res.json();
        
        const definitionData = data[0]?.meanings[0]?.definitions[0];
        const sentence = definitionData?.example || 
                         `Definition: ${definitionData?.definition} (Identify the word)`;
        
        const distractors = words
          .filter(w => w !== word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        quizSet.push({
          word,
          maskedSentence: sentence.replace(new RegExp(word, 'gi'), '__________'),
          options: [...distractors, word].sort(() => 0.5 - Math.random())
        });
        
        setLoadingProgress(Math.round(((i + 1) / words.length) * 100));
      } catch (err) {
        console.error(`Error fetching ${word}:`, err);
      }
    }
    // Randomize the question order at the end of the fetch
    setQuestions(quizSet.sort(() => 0.5 - Math.random()));
  }, [words, questions.length]);

  useEffect(() => {
    prepareFullQuiz();
  }, [prepareFullQuiz]);

  const handleAnswer = (selected) => {
    if (selectedAnswer) return; // Prevent multiple clicks

    const correct = selected === questions[currentQ].word;
    const nextScore = correct ? score + 1 : score;
    
    setSelectedAnswer(selected);
    setIsCorrect(correct);
    if (correct) setScore(nextScore);
    else setMissedWords(prev => [...new Set([...prev, questions[currentQ].word])]);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        // QUIZ END LOGIC: Save to localStorage once
        const percentage = Math.round((nextScore / questions.length) * 100);
        const existingScores = JSON.parse(localStorage.getItem('quizScores') || '{}');
        
        if (!existingScores[day] || percentage > existingScores[day]) {
          existingScores[day] = percentage;
          localStorage.setItem('quizScores', JSON.stringify(existingScores));
        }
        setShowResults(true);
      }
    }, 1500);
  };

  const retakeMissed = () => {
    const missedSet = questions.filter(q => missedWords.includes(q.word));
    setQuestions(missedSet.sort(() => 0.5 - Math.random()));
    setCurrentQ(0);
    setScore(0);
    setMissedWords([]);
    setShowResults(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  // 1. Loading State
  if (questions.length < words.length && !showResults) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl shadow-sm border w-full max-w-xl">
        <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
          <div className="bg-blue-600 h-3 rounded-full transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
        </div>
        <p className="text-gray-500 font-medium">Building your randomized assessment: {loadingProgress}%</p>
      </div>
    );
  }

  // 2. Results State
  if (showResults) {
    return (
      <div className="p-10 bg-white rounded-3xl shadow-2xl max-w-xl w-full text-center border border-gray-100">
        <h2 className="text-3xl font-black text-gray-800 mb-2">Quiz Complete</h2>
        <p className="text-gray-400 mb-6 uppercase tracking-widest font-bold text-sm">{day} Accuracy</p>
        <div className="text-7xl font-black text-blue-600 mb-8">{Math.round((score / questions.length) * 100)}%</div>
        
        {missedWords.length > 0 && (
          <div className="text-left mb-8 bg-red-50 p-6 rounded-2xl">
            <h3 className="text-red-600 font-bold text-sm uppercase mb-3">Words to Review:</h3>
            <div className="flex flex-wrap gap-2">
              {missedWords.map(word => (
                <span key={word} className="px-3 py-1 bg-white text-red-600 border border-red-200 rounded-lg font-medium shadow-sm">
                  {word}
                </span>
              ))}
            </div>
            <button 
              onClick={retakeMissed}
              className="mt-6 w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
            >
              Retake {missedWords.length} Missed Words
            </button>
          </div>
        )}

        <button 
          onClick={() => window.location.href = '/'}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all"
        >
          Finish Day
        </button>
      </div>
    );
  }

  // 3. Quiz State
  const currentQuestion = questions[currentQ];

  return (
    <div className="max-w-2xl w-full p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-10">
        <div className="flex flex-col">
          <span className="text-xs font-black text-blue-500 uppercase tracking-tighter">Current Word</span>
          <span className="text-lg font-bold text-gray-800">{currentQ + 1} / {questions.length}</span>
        </div>
        <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <p className="text-2xl mb-12 leading-relaxed font-serif text-gray-700 italic">
        "{currentQuestion.maskedSentence}"
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((opt) => {
          let style = "border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50";
          if (selectedAnswer) {
            if (opt === currentQuestion.word) style = "bg-green-500 border-green-500 text-white";
            else if (opt === selectedAnswer && !isCorrect) style = "bg-red-500 border-red-500 text-white";
            else style = "opacity-30 border-gray-100 text-gray-400";
          }

          return (
            <button 
              key={opt}
              disabled={!!selectedAnswer}
              onClick={() => handleAnswer(opt)}
              className={`w-full text-left p-5 border-2 rounded-2xl transition-all font-bold text-lg active:scale-95 ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}