import { User, Users } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../constants/categories';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { Expense, Stats } from '../types';
import { formatDisplayDate } from '../utils/dates';
import { CategoryIcon } from './CategoryIcon';

type DashboardProps = {
  stats: Stats;
  expenses: Expense[];
};

export function Dashboard({ stats, expenses }: DashboardProps) {
  const { theme } = useTheme();
  const { formatMoney } = useCurrency();
  const { t } = useTranslation();
  const recentExpenses = expenses.slice(0, 5);

  return (
    <View>
      <View style={[styles.header, { backgroundColor: theme.brand_primary }]}>
        <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.75)' }]}>{t('dashboard.monthExpenses')}</Text>
        <Text style={styles.headerTotal}>{formatMoney(stats.monthTotal)}</Text>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Text style={[styles.summaryLabel, { color: 'rgba(255,255,255,0.85)' }]}>{t('dashboard.thisWeek')}</Text>
            <Text style={styles.summaryValue}>{formatMoney(stats.weekTotal)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Text style={[styles.summaryLabel, { color: 'rgba(255,255,255,0.85)' }]}>{t('dashboard.today')}</Text>
            <Text style={styles.summaryValue}>{formatMoney(stats.todayTotal)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.text_primary }]}>{t('dashboard.recentExpenses')}</Text>

        {recentExpenses.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.emptyText, { color: theme.text_secondary }]}>{t('dashboard.noExpenses')}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {recentExpenses.map((expense) => {
              const category =
                CATEGORIES.find((item) => item.id === expense.categoryId) ||
                CATEGORIES[CATEGORIES.length - 1];

              return (
                <View key={expense.id} style={[styles.expenseCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={[styles.iconWrap, { backgroundColor: theme.surface_secondary }]}>
                    <CategoryIcon name={category.icon} size={20} color={theme.text_primary} />
                  </View>

                  <View style={styles.expenseInfo}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.expenseTitle, { color: theme.text_primary }]} numberOfLines={1}>
                        {t(`categories.${category.id}`)}
                      </Text>
                      {expense.scope === 'personal' && <User size={10} color={theme.brand_primary} />}
                      {expense.scope === 'family' && <Users size={10} color={theme.brand_secondary} />}
                    </View>
                    <Text style={[styles.expenseNote, { color: theme.text_secondary }]} numberOfLines={1}>
                      {expense.spenderName ? `${expense.spenderName} · ` : ''}
                      {expense.note || t('common.noNote')}
                    </Text>
                  </View>

                  <View style={styles.amountWrap}>
                    <Text style={[styles.amountText, { color: theme.danger }]}>-{formatMoney(expense.amount)}</Text>
                    <Text style={[styles.dateText, { color: theme.text_secondary }]}>{formatDisplayDate(expense.date)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTotal: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: -1,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  emptyState: {
    paddingVertical: 48,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    gap: 12,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  expenseInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  expenseNote: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  amountWrap: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
});
