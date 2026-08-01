import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowRight, Calendar, List, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);

  const confirmDelete = (id: string) => {
    Alert.alert("O'chirish", "Rostdan ham ushbu xarajatni o'chirmoqchimisiz?", [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: "O'chirish", style: 'destructive', onPress: () => onDelete(id) },
    ]);
  };

  const handleValueChange = (_event: any, date?: Date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if (activePicker === 'start') {
        setStartDate(dateStr);
        if (endDate && dateStr > endDate) setEndDate(null);
      } else if (activePicker === 'end') {
        setEndDate(dateStr);
        if (startDate && dateStr < startDate) setStartDate(null);
      }
    }
    if (Platform.OS === 'android') setActivePicker(null);
  };

  const handleDismiss = () => {
    setActivePicker(null);
  };

  const filteredDates = useMemo(() => {
    if (!startDate && !endDate) return stats.sortedDates;
    return stats.sortedDates.filter((d) => {
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });
  }, [startDate, endDate, stats.sortedDates]);

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Xarajatlar tarixi</Text>
        <View style={styles.headerActions}>
          {(startDate || endDate) && (
            <Pressable onPress={clearFilters} style={styles.clearFilter}>
              <X size={16} color="#ef4444" />
              <Text style={styles.clearText}>Tozalash</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.filterBar}>
        <Pressable
          onPress={() => setActivePicker('start')}
          style={[styles.dateBtn, activePicker === 'start' && styles.dateBtnActive]}
        >
          <Calendar size={16} color={startDate ? '#059669' : '#6b7280'} />
          <Text style={[styles.dateBtnText, startDate && styles.dateBtnTextSelected]}>
            {startDate ? formatDisplayDate(startDate) : 'Dan...'}
          </Text>
        </Pressable>

        <ArrowRight size={16} color="#d1d5db" />

        <Pressable
          onPress={() => setActivePicker('end')}
          style={[styles.dateBtn, activePicker === 'end' && styles.dateBtnActive]}
        >
          <Calendar size={16} color={endDate ? '#059669' : '#6b7280'} />
          <Text style={[styles.dateBtnText, endDate && styles.dateBtnTextSelected]}>
            {endDate ? formatDisplayDate(endDate) : 'Gacha...'}
          </Text>
        </Pressable>
      </View>

      {activePicker && (
        <DateTimePicker
          value={
            activePicker === 'start'
              ? (startDate ? new Date(startDate) : new Date())
              : (endDate ? new Date(endDate) : new Date())
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onValueChange={handleValueChange}
          onDismiss={handleDismiss}
        />
      )}

      {Platform.OS === 'ios' && activePicker ? (
        <Pressable style={styles.doneBtn} onPress={() => setActivePicker(null)}>
          <Text style={styles.doneBtnText}>Tayyor</Text>
        </Pressable>
      ) : null}

      {filteredDates.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <List size={32} color="#d1d5db" />
          </View>
          <Text style={styles.emptyText}>
            {startDate || endDate
              ? 'Tanlangan oraliqda xarajatlar topilmadi'
              : 'Hozircha xarajatlar yo\'q'}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filteredDates.map((date) => {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
    gap: 8,
  },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateBtnActive: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  dateBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  dateBtnTextSelected: {
    color: '#059669',
  },
  doneBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  doneBtnText: {
    color: '#059669',
    fontWeight: '700',
  },
  clearFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  clearText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
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
