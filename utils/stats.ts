import { CATEGORIES } from '../constants/categories';
import { Expense, MemberTotal, Stats } from '../types';
import { getStartOfWeek, getTodayDateString } from './dates';

export const buildCategoryTotals = () => {
  const totals: Record<string, number> = {};
  CATEGORIES.forEach((category) => {
    totals[category.id] = 0;
  });
  return totals;
};

export const sortCategories = (categoryTotals: Record<string, number>) => {
  return Object.keys(categoryTotals)
    .map((id) => {
      const category = CATEGORIES.find((item) => item.id === id)!;
      return {
        ...category,
        total: categoryTotals[id],
      };
    })
    .filter((category) => category.total > 0)
    .sort((a, b) => b.total - a.total);
};

export const buildMemberTotals = (
  expenses: Expense[],
  filter: (expense: Expense) => boolean
): MemberTotal[] => {
  const totals: Record<string, { total: number; count: number }> = {};

  expenses.forEach((expense) => {
    if (!filter(expense)) {
      return;
    }

    const name = expense.spenderName?.trim() || 'Noma\'lum';
    const amount = parseFloat(expense.amount) || 0;

    if (!totals[name]) {
      totals[name] = { total: 0, count: 0 };
    }

    totals[name].total += amount;
    totals[name].count += 1;
  });

  return Object.entries(totals)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);
};

export const calculateStats = (expenses: Expense[]): Stats => {
  const today = getTodayDateString();
  const currentMonthPrefix = today.substring(0, 7);
  const startOfWeek = getStartOfWeek();

  let todayTotal = 0;
  let monthTotal = 0;
  let weekTotal = 0;

  const monthCategoryTotals = buildCategoryTotals();
  const weekCategoryTotals = buildCategoryTotals();

  expenses.forEach((expense) => {
    const amount = parseFloat(expense.amount) || 0;

    if (expense.date === today) {
      todayTotal += amount;
    }

    if (expense.date.startsWith(currentMonthPrefix)) {
      monthTotal += amount;
      if (monthCategoryTotals[expense.categoryId] !== undefined) {
        monthCategoryTotals[expense.categoryId] += amount;
      }
    }

    if (expense.date >= startOfWeek && expense.date <= today) {
      weekTotal += amount;
      if (weekCategoryTotals[expense.categoryId] !== undefined) {
        weekCategoryTotals[expense.categoryId] += amount;
      }
    }
  });

  const groupedHistory = expenses.reduce<Stats['groupedHistory']>((acc, expense) => {
    if (!acc[expense.date]) {
      acc[expense.date] = { total: 0, items: [] };
    }
    acc[expense.date].items.push(expense);
    acc[expense.date].total += parseFloat(expense.amount) || 0;
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

  return {
    todayTotal,
    monthTotal,
    weekTotal,
    sortedCategories: sortCategories(monthCategoryTotals),
    weekSortedCategories: sortCategories(weekCategoryTotals),
    groupedHistory,
    sortedDates,
    memberTotals: buildMemberTotals(
      expenses,
      (expense) => expense.date.startsWith(currentMonthPrefix)
    ),
    weekMemberTotals: buildMemberTotals(
      expenses,
      (expense) => expense.date >= startOfWeek && expense.date <= today
    ),
  };
};
