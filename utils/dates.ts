import i18n, { getLocaleTag } from '../i18n';
import { LanguageCode } from '../i18n/languages';

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

export const formatDisplayDate = (date: string, todayText?: string) => {
  if (date === getTodayDateString()) {
    return todayText || i18n.t('common.today') || 'Today';
  }
  return date.split('-').reverse().join('.');
};

export const getMonthName = (monthStr: string, locale?: string) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const currentLocale = locale || (i18n.language ? getLocaleTag(i18n.language as LanguageCode) : 'en-US');
  return date.toLocaleString(currentLocale, { month: 'long', year: 'numeric' });
};

export const getMonthOffset = (monthStr: string, offset: number) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1 + offset, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}`;
};
