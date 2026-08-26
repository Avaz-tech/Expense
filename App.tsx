import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AddExpense } from './components/AddExpense';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { FamilyBanner } from './components/FamilyBanner';
import { FamilySetup } from './components/FamilySetup';
import { History } from './components/History';
import { LegalView } from './components/LegalView';
import { MembersView } from './components/MembersView';
import { StatsView } from './components/StatsView';
import { LEGACY_EXPENSES_KEY } from './constants/storage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useExpenses } from './hooks/useExpenses';
import { useFamily } from './hooks/useFamily';
import { Expense } from './types';
import { calculateStats } from './utils/stats';
import { initI18n, getDeviceLanguage, LOCALE_CHOSEN_KEY } from './i18n';
import { LanguageCode } from './i18n/languages';

type Tab = 'home' | 'stats' | 'add' | 'history' | 'members' | 'privacy' | 'terms';

function ScrollableScreen({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background_base }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

function AppContent() {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [i18nLoaded, setI18nLoaded] = useState(false);
  
  const { family, isLoaded: familyLoaded, isSyncEnabled, createFamily, joinFamilyByCode, joinFamilyByNameAndPin, checkFamilyNameAvailable, leaveFamily } =
    useFamily();
  const { expenses, isLoaded: expensesLoaded, isSyncing, addExpense, updateExpense, deleteExpenses } =
    useExpenses(family?.id ?? null);

  const stats = useMemo(() => calculateStats(expenses), [expenses]);

  useEffect(() => {
    async function setupI18n() {
      try {
        const saved = await AsyncStorage.getItem(LOCALE_CHOSEN_KEY);
        const code = (saved as LanguageCode) || getDeviceLanguage();
        initI18n(code);
      } catch (e) {
        initI18n(getDeviceLanguage());
      } finally {
        setI18nLoaded(true);
      }
    }
    setupI18n();
  }, []);

  const handleAddExpense = async (expenseData: Parameters<typeof addExpense>[0]) => {
    await addExpense(expenseData);
    setActiveTab('home');
  };

  const handleUpdateExpense = async (
    id: string,
    expenseData: Parameters<typeof updateExpense>[1]
  ) => {
    await updateExpense(id, expenseData);
    setEditingExpense(null);
    setActiveTab('history');
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setActiveTab('add');
  };

  const handleCancelExpenseForm = () => {
    const returnTab = editingExpense ? 'history' : 'home';
    setEditingExpense(null);
    setActiveTab(returnTab);
  };

  const handleLeaveFamily = async () => {
    await leaveFamily();
    await AsyncStorage.removeItem(LEGACY_EXPENSES_KEY);
    setActiveTab('home');
  };

  if (!i18nLoaded || !familyLoaded || !expensesLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.surface }]}>
        <ActivityIndicator size="large" color={theme.brand_primary} />
      </View>
    );
  }

  if (!family) {
    return (
      <SafeAreaProvider>
        <View style={[styles.app, { backgroundColor: theme.background_base }]}>
          <StatusBar style={isDark ? "light" : "dark"} />
          <FamilySetup
            isSyncEnabled={isSyncEnabled}
            onCreateFamily={createFamily}
            onJoinFamilyByCode={joinFamilyByCode}
            onJoinFamilyByNameAndPin={joinFamilyByNameAndPin}
            onCheckFamilyNameAvailable={checkFamilyNameAvailable}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={[styles.app, { backgroundColor: theme.background_base }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <FamilyBanner
          family={family}
          isSyncEnabled={isSyncEnabled}
          onLeaveFamily={handleLeaveFamily}
        />

        {activeTab === 'home' && (
          <ScrollableScreen>
            <Dashboard stats={stats} expenses={expenses} />
          </ScrollableScreen>
        )}

        {activeTab === 'stats' && (
          <ScrollableScreen>
            <StatsView stats={stats} expenses={expenses} />
          </ScrollableScreen>
        )}

        {activeTab === 'add' && (
          <AddExpense
            key={editingExpense?.id ?? 'new'}
            expense={editingExpense ?? undefined}
            onSave={(expenseData) =>
              editingExpense
                ? handleUpdateExpense(editingExpense.id, expenseData)
                : handleAddExpense(expenseData)
            }
            onCancel={handleCancelExpenseForm}
          />
        )}

        {activeTab === 'history' && (
          <ScrollableScreen>
            <History stats={stats} onDeleteMany={deleteExpenses} onEdit={handleEditExpense} />
          </ScrollableScreen>
        )}

        {activeTab === 'members' && (
          <ScrollableScreen>
            <MembersView stats={stats} expenses={expenses} onNavigate={setActiveTab} />
          </ScrollableScreen>
        )}

        {activeTab === 'privacy' && (
          <LegalView type="privacy" onBack={() => setActiveTab('members')} />
        )}

        {activeTab === 'terms' && (
          <LegalView type="terms" onBack={() => setActiveTab('members')} />
        )}

        {(activeTab !== 'add' && activeTab !== 'privacy' && activeTab !== 'terms') && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}

        {isSyncing ? (
          <View style={[styles.syncBadge, { backgroundColor: theme.brand_primary }]}>
            <ActivityIndicator size="small" color="#ffffff" />
          </View>
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  syncBadge: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
