import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { Expense } from "../types";
import { DbExpense } from "../types/family";

const LOCAL_EXPENSES_KEY_PREFIX = "local_expenses_";

const getLocalKey = (familyId: string) =>
  `${LOCAL_EXPENSES_KEY_PREFIX}${familyId}`;

const toExpense = (row: DbExpense): Expense => ({
  id: row.id,
  amount: row.amount,
  categoryId: row.category_id,
  date: row.date,
  note: row.note,
  scope: row.scope,
  spenderName: row.spender_name,
});

const toDbExpense = (expense: Omit<Expense, "id">, familyId: string) => ({
  family_id: familyId,
  amount: expense.amount,
  category_id: expense.categoryId,
  date: expense.date,
  note: expense.note,
  scope: expense.scope,
  spender_name: expense.spenderName,
});

const isLocalMode = (familyId: string) =>
  !isSupabaseConfigured || !supabase || familyId.startsWith("local-");

type UseExpensesResult = {
  expenses: Expense[];
  isLoaded: boolean;
  isSyncing: boolean;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: string, expense: Omit<Expense, "id">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  deleteExpenses: (ids: string[]) => Promise<void>;
};

export function useExpenses(familyId: string | null): UseExpensesResult {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const persistLocalExpenses = useCallback(
    async (next: Expense[]) => {
      if (!familyId) return;
      try {
        await AsyncStorage.setItem(getLocalKey(familyId), JSON.stringify(next));
      } catch (err) {
        console.error("Failed to persist local expenses", err);
      }
    },
    [familyId]
  );

  const loadExpenses = useCallback(async () => {
    if (!familyId) {
      setExpenses([]);
      setIsLoaded(true);
      return;
    }

    // --- Local / offline mode: load from AsyncStorage ---
    if (isLocalMode(familyId)) {
      try {
        const raw = await AsyncStorage.getItem(getLocalKey(familyId));
        setExpenses(raw ? JSON.parse(raw) : []);
      } catch (err) {
        console.error("Failed to load local expenses", err);
        setExpenses([]);
      } finally {
        setIsLoaded(true);
      }
      return;
    }

    // --- Supabase mode ---
    setIsSyncing(true);

    try {
      const { data, error } = await supabase!
        .from("expenses")
        .select("*")
        .eq("family_id", familyId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setExpenses((data ?? []).map(toExpense));
    } catch (error) {
      console.error("Failed to load expenses", error);
    } finally {
      setIsSyncing(false);
      setIsLoaded(true);
    }
  }, [familyId]);

  useEffect(() => {
    setIsLoaded(false);
    loadExpenses();
  }, [loadExpenses]);

  // Real-time subscription (Supabase only)
  useEffect(() => {
    if (!familyId || isLocalMode(familyId) || !supabase) {
      return;
    }

    const channel = supabase
      .channel(`expenses-${familyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `family_id=eq.${familyId}`,
        },
        () => {
          loadExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [familyId, loadExpenses]);

  const addExpense = useCallback(
    async (expense: Omit<Expense, "id">) => {
      if (!familyId) return;

      if (isLocalMode(familyId)) {
        const localExpense: Expense = {
          ...expense,
          id: Date.now().toString(),
        };
        const next = [localExpense, ...expenses];
        setExpenses(next);
        await persistLocalExpenses(next);
        return;
      }

      const { data, error } = await supabase!
        .from("expenses")
        .insert(toDbExpense(expense, familyId))
        .select("*")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Xarajat saqlanmadi");
      }

      setExpenses((prev) => [toExpense(data), ...prev]);
    },
    [familyId, expenses, persistLocalExpenses]
  );

  const updateExpense = useCallback(
    async (id: string, expense: Omit<Expense, "id">) => {
      if (!familyId) return;

      if (isLocalMode(familyId)) {
        const next = expenses.map((e) =>
          e.id === id ? { ...expense, id } : e
        );
        setExpenses(next);
        await persistLocalExpenses(next);
        return;
      }

      const { data, error } = await supabase!
        .from("expenses")
        .update(toDbExpense(expense, familyId))
        .eq("id", id)
        .eq("family_id", familyId)
        .select("*")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Xarajat yangilanmadi");
      }

      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? toExpense(data) : e))
      );
    },
    [familyId, expenses, persistLocalExpenses]
  );

  const deleteExpenses = useCallback(
    async (ids: string[]) => {
      if (!familyId || ids.length === 0) return;

      const idSet = new Set(ids);

      if (isLocalMode(familyId)) {
        const next = expenses.filter((e) => !idSet.has(e.id));
        setExpenses(next);
        await persistLocalExpenses(next);
        return;
      }

      const { error } = await supabase!
        .from("expenses")
        .delete()
        .in("id", ids)
        .eq("family_id", familyId);

      if (error) throw new Error(error.message);

      setExpenses((prev) => prev.filter((e) => !idSet.has(e.id)));
    },
    [familyId, expenses, persistLocalExpenses]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      await deleteExpenses([id]);
    },
    [deleteExpenses]
  );

  return {
    expenses,
    isLoaded,
    isSyncing,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteExpenses,
  };
}
