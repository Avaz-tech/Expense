export const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const getStartOfWeek = () => {
  const curr = new Date();
  const day = curr.getDay();
  const first = curr.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(curr);
  start.setDate(first);
  return start.toISOString().split('T')[0];
};

export const formatDisplayDate = (date: string) => {
  if (date === getTodayDateString()) {
    return 'Bugun';
  }
  return date.split('-').reverse().join('.');
};
