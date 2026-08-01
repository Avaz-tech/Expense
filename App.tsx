import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AddExpense } from './components/AddExpense';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { FamilyBanner } from './components/FamilyBanner';
import { FamilySetup } from './components/FamilySetup';
import { History } from './components/History';
import { MembersView } from './components/MembersView';
import { StatsView } from './components/StatsView';
import { LEGACY_EXPENSES_KEY } from './constants/storage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useExpenses } from './hooks/useExpenses';
import { useFamily } from './hooks/useFamily';
import { calculateStats } from './utils/stats';

type Tab = 'home' | 'stats' | 'add' | 'history' | 'members';

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
  const { family, isLoaded: familyLoaded, isSyncEnabled, createFamily, joinFamily, leaveFamily } =
    useFamily();
  const { expenses, isLoaded: expensesLoaded, isSyncing, addExpense, deleteExpense } =
    useExpenses(family?.id ?? null);

  const stats = useMemo(() => calculateStats(expenses), [expenses]);

  const handleAddExpense = async (expenseData: Parameters<typeof addExpense>[0]) => {
    await addExpense(expenseData);
    setActiveTab('home');
  };

  const handleLeaveFamily = async () => {
    await leaveFamily();
    await AsyncStorage.removeItem(LEGACY_EXPENSES_KEY);
    setActiveTab('home');
  };

  if (!familyLoaded || !expensesLoaded) {
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
            onJoinFamily={joinFamily}
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
            onSave={handleAddExpense}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'history' && (
          <ScrollableScreen>
            <History stats={stats} onDelete={deleteExpense} />
          </ScrollableScreen>
        )}

        {activeTab === 'members' && (
          <ScrollableScreen>
            <MembersView stats={stats} expenses={expenses} />
          </ScrollableScreen>
        )}

        {activeTab !== 'add' && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}

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
    backgroundColor: '#f9fafb',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
