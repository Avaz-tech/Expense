import { Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'food', name: "Oziq-ovqat", icon: 'ShoppingCart', bgColor: '#d1fae5', textColor: '#059669' },
  { id: 'eatout', name: "Ko'chada ovqat", icon: 'Coffee', bgColor: '#ffedd5', textColor: '#ea580c' },
  { id: 'internet', name: 'Internet va Aloqa', icon: 'Wifi', bgColor: '#dbeafe', textColor: '#2563eb' },
  { id: 'electricity', name: 'Elektr toki', icon: 'Zap', bgColor: '#fef9c3', textColor: '#ca8a04' },
  { id: 'gas', name: 'Gaz', icon: 'Flame', bgColor: '#fee2e2', textColor: '#dc2626' },
  { id: 'gatherings', name: 'Choyxona / Tadbir', icon: 'Users', bgColor: '#e0e7ff', textColor: '#4f46e5' },
  { id: 'transport', name: "Transport / Yo'l", icon: 'Bus', bgColor: '#cffafe', textColor: '#0891b2' },
  { id: 'clothing', name: 'Kiyim-kechak', icon: 'Shirt', bgColor: '#fce7f3', textColor: '#db2777' },
  { id: 'hygiene', name: 'Gigiyena / Tozalik', icon: 'Sparkles', bgColor: '#ccfbf1', textColor: '#0d9488' },
  { id: 'health', name: 'Dori-darmon', icon: 'Pill', bgColor: '#ffe4e6', textColor: '#e11d48' },
  { id: 'sheep_food', name: "Chorva (Qo'y) yemi", icon: 'Wheat', bgColor: '#fef3c7', textColor: '#d97706' },
  { id: 'sheep_meds', name: 'Chorva dorisi', icon: 'HeartPulse', bgColor: '#fef2f2', textColor: '#ef4444' },
  { id: 'house', name: "Uy ta'miri", icon: 'Wrench', bgColor: '#e2e8f0', textColor: '#334155' },
  { id: 'birthdays', name: "Tug'ilgan kun / Sovg'a", icon: 'Gift', bgColor: '#fae8ff', textColor: '#c026d3' },
  { id: 'unplanned', name: 'Kutilmagan', icon: 'AlertCircle', bgColor: '#e5e7eb', textColor: '#374151' },
];

export const STORAGE_KEY = 'uzbek_expenses';
