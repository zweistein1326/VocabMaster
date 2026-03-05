import { vocabularyMasterList } from './vocabData';

export const getNextIncompleteDay = () => {
  if (typeof window === 'undefined') return "Day 1";
  const history = JSON.parse(localStorage.getItem('vocabHistory')) || {};
  console.log(history);
  // Flatten all arrays from all dates into one list of completed day names
  const completedDays = Object.values(history)
    .flat() // Turns [[day1], [day2, day3]] into [day1, day2, day3]
    .map(entry => entry.dayName);
  
  const allDays = Object.keys(vocabularyMasterList);
  const nextDay = allDays.find(day => !completedDays.includes(day));
  
  return nextDay || "All Days Complete!";
};