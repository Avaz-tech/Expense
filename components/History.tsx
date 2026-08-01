import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowRight, Calendar, List, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { useTheme } from '../context/ThemeContext';
import { Stats } from '../types';
import { formatDisplayDate } from '../utils/dates';
import { formatMoney } from '../utils/formatMoney';
import { CategoryIcon } from './CategoryIcon';

type HistoryProps = {
  stats: Stats;
  onDelete: (id: string) => void;
};

export function History({ stats, onDelete }: HistoryProps) {
  const { theme } = useTheme();
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
        <Text style={[styles.title, { color: theme.text_primary }]}>Xarajatlar tarixi</Text>
        <View style={styles.headerActions}>
          {(startDate || endDate) && (
            <Pressable onPress={clearFilters} style={[styles.clearFilter, { backgroundColor: theme.danger + '15' }]}>
              <X size={14} color={theme.danger} />
              <Text style={[styles.clearText, { color: theme.danger }]}>Tozalash</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={[styles.filterBar, { backgroundColor: theme.surface_secondary }]}>
        <Pressable
          onPress={() => setActivePicker('start')}
          style={[
            styles.dateBtn,
            { backgroundColor: theme.surface },
            activePicker === 'start' && { borderColor: theme.brand_primary, backgroundColor: theme.brand_primary + '10' }
          ]}
        >
          <Calendar size={14} color={startDate ? theme.brand_primary : theme.text_secondary} />
          <Text style={[
            styles.dateBtnText,
            { color: theme.text_secondary },
            startDate && { color: theme.brand_primary }
          ]}>
            {startDate ? formatDisplayDate(startDate) : 'Dan...'}
          </Text>
        </Pressable>

        <ArrowRight size={14} color={theme.border} />

        <Pressable
          onPress={() => setActivePicker('end')}
          style={[
            styles.dateBtn,
            { backgroundColor: theme.surface },
            activePicker === 'end' && { borderColor: theme.brand_primary, backgroundColor: theme.brand_primary + '10' }
          ]}
        >
          <Calendar size={14} color={endDate ? theme.brand_primary : theme.text_secondary} />
          <Text style={[
            styles.dateBtnText,
            { color: theme.text_secondary },
            endDate && { color: theme.brand_primary }
          ]}>
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
          <Text style={[styles.doneBtnText, { color: theme.brand_primary }]}>Tayyor</Text>
        </Pressable>
      ) : null}

      {filteredDates.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.emptyIconWrap, { backgroundColor: theme.surface_secondary }]}>
            <List size={32} color={theme.text_secondary} opacity={0.5} />
          </View>
          <Text style={[styles.emptyText, { color: theme.text_secondary }]}>
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
                  <Text style={[styles.dayTitle, { color: theme.text_secondary }]}>{formatDisplayDate(date)}</Text>
                  <Text style={[styles.dayTotal, { color: theme.text_primary }]}>{formatMoney(dayData.total)}</Text>
                </View>

                <View style={styles.dayItems}>
                  {dayData.items.map((expense) => {
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
                              {category.name}
                            </Text>
                            {expense.scope === 'personal' ? (
                              <View style={[styles.personalBadge, { backgroundColor: theme.brand_primary + '10' }]}>
                                <Text style={[styles.personalBadgeText, { color: theme.brand_primary }]}>Shaxsiy</Text>
                              </View>
                            ) : null}
                            {expense.scope === 'family' ? (
                              <View style={[styles.familyBadge, { backgroundColor: theme.brand_secondary + '10' }]}>
                                <Text style={[styles.familyBadgeText, { color: theme.brand_secondary }]}>Oilaviy</Text>
                              </View>
                            ) : null}
                          </View>
                          <Text style={[styles.expenseNote, { color: theme.text_secondary }]} numberOfLines={1}>
                            {expense.spenderName ? `${expense.spenderName}` : "Noma'lum"}
                            {expense.note ? ` · ${expense.note}` : ''}
                          </Text>
                        </View>

                        <View style={styles.amountWrap}>
                          <Text style={[styles.amountText, { color: theme.text_primary }]}>-{formatMoney(expense.amount)}</Text>
                        </View>

                        <Pressable style={[styles.deleteButton, { backgroundColor: theme.danger + '10' }]} onPress={() => confirmDelete(expense.id)}>
                          <Text style={[styles.deleteText, { color: theme.danger }]}>O'chirish</Text>
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
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 6,
    marginBottom: 24,
    gap: 8,
  },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  doneBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  doneBtnText: {
    fontWeight: '700',
  },
  clearFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  clearText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  list: {
    gap: 24,
  },
  dayGroup: {
    gap: 14,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dayTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayTotal: {
    fontSize: 13,
    fontWeight: '700',
  },
  dayItems: {
    gap: 10,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    flexWrap: 'wrap',
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  personalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  personalBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  familyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  familyBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  expenseNote: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  amountWrap: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  deleteText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
