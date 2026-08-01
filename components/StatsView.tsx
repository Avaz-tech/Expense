import { ChevronLeft, ChevronRight, PieChart } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Expense, Stats, StatsPeriod } from '../types';
import { getMonthName, getMonthOffset, getTodayDateString } from '../utils/dates';
import { formatMoney } from '../utils/formatMoney';
import { buildCategoryTotals, sortCategories } from '../utils/stats';
import { CategoryIcon } from './CategoryIcon';

type StatsViewProps = {
  stats: Stats;
  expenses: Expense[];
};

export function StatsView({ stats, expenses }: StatsViewProps) {
  const [period, setPeriod] = useState<StatsPeriod>('month');
  const [currentMonth, setCurrentMonth] = useState(getTodayDateString().substring(0, 7));

  const filteredData = useMemo(() => {
    if (period === 'week') {
      return {
        categories: stats.weekSortedCategories,
        total: stats.weekTotal,
        label: 'Shu hafta jami',
      };
    }

    // Custom calculation for selected month
    const monthCategoryTotals = buildCategoryTotals();
    let monthTotal = 0;

    expenses.forEach((expense) => {
      if (expense.date.startsWith(currentMonth)) {
        const amount = parseFloat(expense.amount) || 0;
        monthTotal += amount;
        if (monthCategoryTotals[expense.categoryId] !== undefined) {
          monthCategoryTotals[expense.categoryId] += amount;
        }
      }
    });

    return {
      categories: sortCategories(monthCategoryTotals),
      total: monthTotal,
      label: `${getMonthName(currentMonth)} jami`,
    };
  }, [period, currentMonth, stats, expenses]);

  const { categories, total, label } = filteredData;
  const maxTotal = categories.length > 0 ? categories[0].total : 0;

  const handlePrevMonth = () => setCurrentMonth((prev) => getMonthOffset(prev, -1));
  const handleNextMonth = () => setCurrentMonth((prev) => getMonthOffset(prev, 1));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hisobot</Text>
      <Text style={styles.subtitle}>Xarajatlar taqsimoti</Text>

      <View style={styles.periodToggle}>
        <Pressable
          style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
          onPress={() => setPeriod('week')}
        >
          <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>
            Haftalik
          </Text>
        </Pressable>
        <Pressable
          style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
          onPress={() => setPeriod('month')}
        >
          <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>
            Oylik
          </Text>
        </Pressable>
      </View>

      {period === 'month' && (
        <View style={styles.monthNav}>
          <Pressable onPress={handlePrevMonth} style={styles.navButton}>
            <ChevronLeft size={20} color="#059669" />
          </Pressable>
          <Text style={styles.monthLabel}>{getMonthName(currentMonth)}</Text>
          <Pressable onPress={handleNextMonth} style={styles.navButton}>
            <ChevronRight size={20} color="#059669" />
          </Pressable>
        </View>
      )}

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>{label}</Text>
        <Text style={styles.totalValue}>{formatMoney(total)}</Text>
      </View>

      {categories.length === 0 ? (
        <View style={styles.emptyState}>
          <PieChart size={40} color="#d1d5db" />
          <Text style={styles.emptyText}>Ma'lumot yo'q</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {categories.map((category) => {
            const percentage = maxTotal > 0 ? (category.total / maxTotal) * 100 : 0;

            return (
              <View key={category.id} style={styles.categoryRow}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryTitleWrap}>
                    <View style={[styles.iconWrap, { backgroundColor: category.bgColor }]}>
                      <CategoryIcon name={category.icon} size={20} color={category.textColor} />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <Text style={styles.categoryTotal}>{formatMoney(category.total)}</Text>
                </View>

                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  periodButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodTextActive: {
    color: '#059669',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'capitalize',
    minWidth: 140,
    textAlign: 'center',
  },
  navButton: {
    padding: 8,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
  },
  totalCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  totalLabel: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '500',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#065f46',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    gap: 12,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  list: {
    gap: 20,
  },
  categoryRow: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  categoryTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flexShrink: 1,
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  progressTrack: {
    width: '100%',
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 999,
  },
});
