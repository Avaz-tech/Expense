export const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getStartOfWeek = () => {
  const curr = new Date();
  // Get Monday of the current week in local time
  const day = curr.getDay();
  const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(curr);
  start.setDate(diff);

  const year = start.getFullYear();
  const month = String(start.getMonth() + 1).padStart(2, '0');
  const dayStr = String(start.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayStr}`;
};

export const formatDisplayDate = (date: string) => {
  if (date === getTodayDateString()) {
    return 'Bugun';
  }
  return date.split('-').reverse().join('.');
};

export const getMonthName = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleString('uz-UZ', { month: 'long', year: 'numeric' });
};

export const getMonthOffset = (monthStr: string, offset: number) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1 + offset, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}`;
};
