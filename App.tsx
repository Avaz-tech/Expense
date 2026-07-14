import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AddExpense } from './components/AddExpense';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { MembersView } from './components/MembersView';
import { StatsView } from './components/StatsView';
import { STORAGE_KEY } from './constants/categories';
import { Expense } from './types';
import { calculateStats } from './utils/stats';

type Tab = 'home' | 'stats' | 'add' | 'history' | 'members';

function ScrollableScreen({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setExpenses(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load expenses', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadExpenses();
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)).catch((error) => {
      console.error('Failed to save expenses', error);
    });
  }, [expenses, isLoaded]);

  const stats = useMemo(() => calculateStats(expenses), [expenses]);

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    setExpenses((prev) => [{ ...expenseData, id: Date.now().toString() }, ...prev]);
    setActiveTab('home');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.app}>
        <StatusBar style="dark" />

        {activeTab === 'home' && (
          <ScrollableScreen>
            <Dashboard stats={stats} expenses={expenses} />
          </ScrollableScreen>
        )}

        {activeTab === 'stats' && (
          <ScrollableScreen>
            <StatsView stats={stats} />
          </ScrollableScreen>
        )}

        {activeTab === 'add' && (
          <AddExpense onSave={handleAddExpense} onCancel={() => setActiveTab('home')} />
        )}

        {activeTab === 'history' && (
          <ScrollableScreen>
            <History stats={stats} onDelete={handleDeleteExpense} />
          </ScrollableScreen>
        )}

        {activeTab === 'members' && (
          <ScrollableScreen>
            <MembersView stats={stats} />
          </ScrollableScreen>
        )}

        {activeTab !== 'add' && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
});
