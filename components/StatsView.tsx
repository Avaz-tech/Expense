import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { Expense, Stats, StatsPeriod } from '../types';
import { getMonthName, getMonthOffset, getTodayDateString } from '../utils/dates';
import { buildCategoryTotals, sortCategories } from '../utils/stats';
import { CategoryIcon } from './CategoryIcon';

type StatsViewProps = {
  stats: Stats;
  expenses: Expense[];
};

export function StatsView({ stats, expenses }: StatsViewProps) {
  const { theme } = useTheme();
  const { formatMoney } = useCurrency();
  const { t } = useTranslation();
  const [period, setPeriod] = useState<StatsPeriod>('month');
  const [currentMonth, setCurrentMonth] = useState(getTodayDateString().substring(0, 7));

  const filteredData = useMemo(() => {
    if (period === 'week') {
      return {
        categories: stats.weekSortedCategories,
        total: stats.weekTotal,
        label: t('stats.weekTotal'),
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
      label: t('stats.monthTotal', { month: getMonthName(currentMonth) }),
    };
  }, [period, currentMonth, stats, expenses, t]);

  const { categories, total, label } = filteredData;
  const maxTotal = categories.length > 0 ? categories[0].total : 0;

  const handlePrevMonth = () => setCurrentMonth((prev) => getMonthOffset(prev, -1));
  const handleNextMonth = () => setCurrentMonth((prev) => getMonthOffset(prev, 1));

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text_primary }]}>{t('stats.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.text_secondary }]}>{t('stats.subtitle')}</Text>

      <View style={[styles.periodToggle, { backgroundColor: theme.surface_secondary }]}>
        <Pressable
          style={[styles.periodButton, period === 'week' && [styles.periodButtonActive, { backgroundColor: theme.surface }]]}
          onPress={() => setPeriod('week')}
        >
          <Text style={[styles.periodText, { color: theme.text_secondary }, period === 'week' && { color: theme.brand_primary }]}>
            {t('stats.weekly')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.periodButton, period === 'month' && [styles.periodButtonActive, { backgroundColor: theme.surface }]]}
          onPress={() => setPeriod('month')}
        >
          <Text style={[styles.periodText, { color: theme.text_secondary }, period === 'month' && { color: theme.brand_primary }]}>
            {t('stats.monthly')}
          </Text>
        </Pressable>
      </View>

      {period === 'month' && (
        <View style={styles.monthNav}>
          <Pressable onPress={handlePrevMonth} style={[styles.navButton, { backgroundColor: theme.surface_secondary }]}>
            <ChevronLeft size={16} color={theme.brand_primary} />
          </Pressable>
          <Text style={[styles.monthLabel, { color: theme.text_primary }]}>{getMonthName(currentMonth)}</Text>
          <Pressable onPress={handleNextMonth} style={[styles.navButton, { backgroundColor: theme.surface_secondary }]}>
            <ChevronRight size={16} color={theme.brand_primary} />
          </Pressable>
        </View>
      )}

      <View style={[styles.totalCard, { backgroundColor: theme.brand_secondary + '10', borderColor: theme.brand_secondary + '15' }]}>
        <Text style={[styles.totalLabel, { color: theme.brand_secondary }]}>{label}</Text>
        <Text style={[styles.totalValue, { color: theme.text_primary }]}>{formatMoney(total)}</Text>
      </View>

      {categories.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.emptyText, { color: theme.text_secondary }]}>{t('common.noData')}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {categories.map((category) => {
            const percentage = maxTotal > 0 ? (category.total / maxTotal) * 100 : 0;

            return (
              <View key={category.id} style={styles.categoryRow}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryTitleWrap}>
                    <View style={[styles.iconWrap, { backgroundColor: theme.surface_secondary }]}>
                      <CategoryIcon name={category.icon} size={18} color={theme.text_primary} />
                    </View>
                    <Text style={[styles.categoryName, { color: theme.text_primary }]}>{t(`categories.${category.id}`)}</Text>
                  </View>
                  <Text style={[styles.categoryTotal, { color: theme.text_primary }]}>{formatMoney(category.total)}</Text>
                </View>

                <View style={[styles.progressTrack, { backgroundColor: theme.surface_secondary }]}>
                  <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: theme.brand_secondary }]} />
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
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 24,
  },
  periodToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  periodButtonActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '700',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
    minWidth: 140,
    textAlign: 'center',
  },
  navButton: {
    padding: 10,
    borderRadius: 12,
  },
  totalCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    gap: 28,
  },
  categoryRow: {
    gap: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
  },
  categoryTotal: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});
