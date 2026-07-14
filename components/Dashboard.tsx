import { User, Users } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { Expense, Stats } from '../types';
import { formatDisplayDate } from '../utils/dates';
import { formatMoney } from '../utils/formatMoney';
import { CategoryIcon } from './CategoryIcon';

type DashboardProps = {
  stats: Stats;
  expenses: Expense[];
};

export function Dashboard({ stats, expenses }: DashboardProps) {
  const recentExpenses = expenses.slice(0, 5);

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Shu oygi xarajatlar</Text>
        <Text style={styles.headerTotal}>{formatMoney(stats.monthTotal)}</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Shu hafta</Text>
            <Text style={styles.summaryValue}>{formatMoney(stats.weekTotal)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Bugun</Text>
            <Text style={styles.summaryValue}>{formatMoney(stats.todayTotal)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Oxirgi xarajatlar</Text>

        {recentExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Hali xarajatlar yo'q.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {recentExpenses.map((expense) => {
              const category =
                CATEGORIES.find((item) => item.id === expense.categoryId) ||
                CATEGORIES[CATEGORIES.length - 1];

              return (
                <View key={expense.id} style={styles.expenseCard}>
                  <View style={[styles.iconWrap, { backgroundColor: category.bgColor }]}>
                    <CategoryIcon name={category.icon} size={24} color={category.textColor} />
                  </View>

                  <View style={styles.expenseInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.expenseTitle} numberOfLines={1}>
                        {category.name}
                      </Text>
                      {expense.scope === 'personal' && <User size={12} color="#3b82f6" />}
                      {expense.scope === 'family' && <Users size={12} color="#a855f7" />}
                    </View>
                    <Text style={styles.expenseNote} numberOfLines={1}>
                      {expense.spenderName ? `${expense.spenderName} · ` : ''}
                      {expense.note || 'Izohsiz'}
                    </Text>
                  </View>

                  <View style={styles.amountWrap}>
                    <Text style={styles.amountText}>-{formatMoney(expense.amount)}</Text>
                    <Text style={styles.dateText}>{formatDisplayDate(expense.date)}</Text>
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
    backgroundColor: '#059669',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerSubtitle: {
    color: '#d1fae5',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTotal: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  summaryLabel: {
    color: '#ecfdf5',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 40,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  list: {
    gap: 16,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  expenseInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flexShrink: 1,
  },
  expenseNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  amountWrap: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
});
