// Consistent date formatting to avoid Timezone shifts
export const getLocalDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const getNextIncompleteDay = () => {
  if (typeof window === 'undefined') return "Day 1";
  const history = JSON.parse(localStorage.getItem('vocabHistory')) || {};
  
  // Extract day names from the history objects
  const completedDays = Object.values(history).map(entry => entry.dayName);
  
  const allDays = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"]; // Extend to Day 90
  const nextDay = allDays.find(day => !completedDays.includes(day));
  
  return nextDay || "Day 1";
};