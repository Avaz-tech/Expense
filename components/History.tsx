import { List } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { Stats } from '../types';
import { formatDisplayDate } from '../utils/dates';
import { formatMoney } from '../utils/formatMoney';
import { CategoryIcon } from './CategoryIcon';

type HistoryProps = {
  stats: Stats;
  onDelete: (id: string) => void;
};

export function History({ stats, onDelete }: HistoryProps) {
  const confirmDelete = (id: string) => {
    Alert.alert("O'chirish", "Rostdan ham ushbu xarajatni o'chirmoqchimisiz?", [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: "O'chirish", style: 'destructive', onPress: () => onDelete(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xarajatlar tarixi</Text>

      {stats.sortedDates.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <List size={32} color="#d1d5db" />
          </View>
          <Text style={styles.emptyText}>Hozircha xarajatlar yo'q</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {stats.sortedDates.map((date) => {
            const dayData = stats.groupedHistory[date];

            return (
              <View key={date} style={styles.dayGroup}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>{formatDisplayDate(date)}</Text>
                  <Text style={styles.dayTotal}>{formatMoney(dayData.total)}</Text>
                </View>

                <View style={styles.dayItems}>
                  {dayData.items.map((expense) => {
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
                            {expense.scope === 'personal' ? (
                              <View style={styles.personalBadge}>
                                <Text style={styles.personalBadgeText}>Shaxsiy</Text>
                              </View>
                            ) : null}
                            {expense.scope === 'family' ? (
                              <View style={styles.familyBadge}>
                                <Text style={styles.familyBadgeText}>Oilaviy</Text>
                              </View>
                            ) : null}
                          </View>
                          <Text style={styles.expenseNote} numberOfLines={1}>
                            {expense.spenderName ? `${expense.spenderName}` : "Noma'lum"}
                            {expense.note ? ` · ${expense.note}` : ''}
                          </Text>
                        </View>

                        <View style={styles.amountWrap}>
                          <Text style={styles.amountText}>-{formatMoney(expense.amount)}</Text>
                        </View>

                        <Pressable style={styles.deleteButton} onPress={() => confirmDelete(expense.id)}>
                          <Text style={styles.deleteText}>O'chirish</Text>
                        </Pressable>
                      </View>
                    );
                  })}
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
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  list: {
    gap: 24,
  },
  dayGroup: {
    gap: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dayTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  dayItems: {
    gap: 12,
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
    overflow: 'hidden',
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
    flexWrap: 'wrap',
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flexShrink: 1,
  },
  personalBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  personalBadgeText: {
    color: '#2563eb',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  familyBadge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  familyBadgeText: {
    color: '#9333ea',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  expenseNote: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  amountWrap: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
