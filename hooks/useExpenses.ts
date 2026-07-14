import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Expense } from '../types';
import { DbExpense } from '../types/family';

const toExpense = (row: DbExpense): Expense => ({
  id: row.id,
  amount: row.amount,
  categoryId: row.category_id,
  date: row.date,
  note: row.note,
  scope: row.scope,
  spenderName: row.spender_name,
});

const toDbExpense = (expense: Omit<Expense, 'id'>, familyId: string) => ({
  family_id: familyId,
  amount: expense.amount,
  category_id: expense.categoryId,
  date: expense.date,
  note: expense.note,
  scope: expense.scope,
  spender_name: expense.spenderName,
});

type UseExpensesResult = {
  expenses: Expense[];
  isLoaded: boolean;
  isSyncing: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
};

export function useExpenses(familyId: string | null): UseExpensesResult {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadExpenses = useCallback(async () => {
    if (!familyId) {
      setExpenses([]);
      setIsLoaded(true);
      return;
    }

    if (!isSupabaseConfigured || !supabase || familyId.startsWith('local-')) {
      setIsLoaded(true);
      return;
    }

    setIsSyncing(true);

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setExpenses((data ?? []).map(toExpense));
    } catch (error) {
      console.error('Failed to load expenses', error);
    } finally {
      setIsSyncing(false);
      setIsLoaded(true);
    }
  }, [familyId]);

  useEffect(() => {
    setIsLoaded(false);
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    if (!familyId || !isSupabaseConfigured || !supabase || familyId.startsWith('local-')) {
      return;
    }

    const channel = supabase
      .channel(`expenses-${familyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `family_id=eq.${familyId}`,
        },
        () => {
          loadExpenses();
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [familyId, loadExpenses]);

  const addExpense = useCallback(
    async (expense: Omit<Expense, 'id'>) => {
      if (!familyId) {
        return;
      }

      if (!isSupabaseConfigured || !supabase || familyId.startsWith('local-')) {
        const localExpense: Expense = {
          ...expense,
          id: Date.now().toString(),
        };
        setExpenses((prev) => [localExpense, ...prev]);
        return;
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert(toDbExpense(expense, familyId))
        .select('*')
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? 'Xarajat saqlanmadi');
      }

      setExpenses((prev) => [toExpense(data), ...prev]);
    },
    [familyId]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      if (!familyId) {
        return;
      }

      if (!isSupabaseConfigured || !supabase || familyId.startsWith('local-')) {
        setExpenses((prev) => prev.filter((expense) => expense.id !== id));
        return;
      }

      const { error } = await supabase.from('expenses').delete().eq('id', id).eq('family_id', familyId);

      if (error) {
        throw new Error(error.message);
      }

      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    },
    [familyId]
  );

  return {
    expenses,
    isLoaded,
    isSyncing,
    addExpense,
    deleteExpense,
  };
}
