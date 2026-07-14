export type ExpenseScope = 'family' | 'personal';

export type Expense = {
  id: string;
  amount: string;
  categoryId: string;
  date: string;
  note: string;
  scope: ExpenseScope;
  spenderName: string;
};

export type MemberTotal = {
  name: string;
  total: number;
  count: number;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  bgColor: string;
  textColor: string;
};

export type CategoryTotal = Category & {
  total: number;
};

export type StatsPeriod = 'month' | 'week';

export type Stats = {
  todayTotal: number;
  monthTotal: number;
  weekTotal: number;
  sortedCategories: CategoryTotal[];
  weekSortedCategories: CategoryTotal[];
  groupedHistory: Record<
    string,
    {
      total: number;
      items: Expense[];
    }
  >;
  sortedDates: string[];
  memberTotals: MemberTotal[];
  weekMemberTotals: MemberTotal[];
};
