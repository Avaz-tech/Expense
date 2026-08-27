import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowRight, Calendar, Check, List, Trash2, User, Users, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { Expense, Stats } from '../types';
import { formatDisplayDate } from '../utils/dates';
import { CategoryIcon } from './CategoryIcon';

type HistoryProps = {
  stats: Stats;
  onDeleteMany: (ids: string[]) => Promise<void>;
  onEdit: (expense: Expense) => void;
};

export function History({ stats, onDeleteMany, onEdit }: HistoryProps) {
  const { theme } = useTheme();
  const { formatMoney } = useCurrency();
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedCount = selectedIds.size;

  const exitSelection = () => {
    setIsSelecting(false);
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enterSelection = (id: string) => {
    setIsSelecting(true);
    setSelectedIds(new Set([id]));
  };

  const handlePress = (expense: Expense) => {
    if (isSelecting) {
      toggleSelection(expense.id);
      return;
    }
    onEdit(expense);
  };

  const handleLongPress = (expense: Expense) => {
    if (isSelecting) {
      toggleSelection(expense.id);
      return;
    }
    enterSelection(expense.id);
  };

  const confirmBulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    Alert.alert(
      t('common.delete'),
      t('history.deleteConfirm', { count: ids.length }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await onDeleteMany(ids);
            exitSelection();
          },
        },
      ]
    );
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
        {isSelecting ? (
          <>
            <Pressable onPress={exitSelection} hitSlop={8}>
              <Text style={[styles.cancelText, { color: theme.brand_primary }]}>{t('common.cancel')}</Text>
            </Pressable>
            <Text style={[styles.title, styles.titleCenter, { color: theme.text_primary }]}>
              {t('history.selected', { count: selectedCount })}
            </Text>
            <Pressable
              onPress={confirmBulkDelete}
              disabled={selectedCount === 0}
              style={({ pressed }) => [
                styles.deleteAction,
                { backgroundColor: theme.danger + '15', opacity: selectedCount === 0 ? 0.4 : pressed ? 0.7 : 1 },
              ]}
            >
              <Trash2 size={16} color={theme.danger} />
            </Pressable>
          </>
        ) : (
          <>
            <Text style={[styles.title, styles.titleLeft, { color: theme.text_primary }]}>
              {t('history.title')}
            </Text>
            <View style={styles.headerActions}>
              {(startDate || endDate) && (
                <Pressable onPress={clearFilters} style={[styles.clearFilter, { backgroundColor: theme.danger + '15' }]}>
                  <X size={14} color={theme.danger} />
                  <Text style={[styles.clearText, { color: theme.danger }]}>{t('common.clear')}</Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </View>

      {!isSelecting && filteredDates.length > 0 ? (
        <Text style={[styles.hintText, { color: theme.text_secondary }]}>
          {t('history.longPressHint')}
        </Text>
      ) : null}

      <View style={[styles.filterBar, { backgroundColor: theme.surface_secondary }]}>
        <Pressable
          onPress={() => setActivePicker('start')}
          style={[
            styles.dateBtn,
            { backgroundColor: theme.surface },
            activePicker === 'start' && { borderColor: theme.brand_primary, backgroundColor: theme.brand_primary + '10' },
          ]}
        >
          <Calendar size={14} color={startDate ? theme.brand_primary : theme.text_secondary} />
          <Text style={[styles.dateBtnText, { color: theme.text_secondary }, startDate && { color: theme.brand_primary }]}>
            {startDate ? formatDisplayDate(startDate) : t('history.from')}
          </Text>
        </Pressable>

        <ArrowRight size={14} color={theme.border} />

        <Pressable
          onPress={() => setActivePicker('end')}
          style={[
            styles.dateBtn,
            { backgroundColor: theme.surface },
            activePicker === 'end' && { borderColor: theme.brand_primary, backgroundColor: theme.brand_primary + '10' },
          ]}
        >
          <Calendar size={14} color={endDate ? theme.brand_primary : theme.text_secondary} />
          <Text style={[styles.dateBtnText, { color: theme.text_secondary }, endDate && { color: theme.brand_primary }]}>
            {endDate ? formatDisplayDate(endDate) : t('history.to')}
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
          <Text style={[styles.doneBtnText, { color: theme.brand_primary }]}>{t('common.done')}</Text>
        </Pressable>
      ) : null}

      {filteredDates.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.emptyIconWrap, { backgroundColor: theme.surface_secondary }]}>
            <List size={32} color={theme.text_secondary} opacity={0.5} />
          </View>
          <Text style={[styles.emptyText, { color: theme.text_secondary }]}>
            {startDate || endDate ? t('history.noExpensesInRange') : t('history.noExpensesYet')}
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
                    const isSelected = selectedIds.has(expense.id);

                    return (
                      <Pressable
                        key={expense.id}
                        onPress={() => handlePress(expense)}
                        onLongPress={() => handleLongPress(expense)}
                        style={[
                          styles.expenseCard,
                          {
                            backgroundColor: isSelected ? theme.brand_primary + '10' : theme.surface,
                            borderColor: isSelected ? theme.brand_primary : theme.border,
                          },
                        ]}
                      >
                        {isSelecting ? (
                          <View
                            style={[
                              styles.checkbox,
                              {
                                borderColor: isSelected ? theme.brand_primary : theme.border,
                                backgroundColor: isSelected ? theme.brand_primary : 'transparent',
                              },
                            ]}
                          >
                            {isSelected ? <Check size={12} color="#ffffff" strokeWidth={3} /> : null}
                          </View>
                        ) : null}

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
                            {expense.spenderName ? expense.spenderName : t('common.unknown')}
                            {expense.note ? ` · ${expense.note}` : ''}
                          </Text>
                        </View>

                        <Text style={[styles.amountText, { color: theme.text_primary }]}>
                          -{formatMoney(expense.amount)}
                        </Text>
                      </Pressable>
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
    marginBottom: 8,
    minHeight: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  titleLeft: {
    flex: 1,
  },
  titleCenter: {
    flex: 1,
    textAlign: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 80,
  },
  deleteAction: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    marginLeft: 'auto',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 80,
    justifyContent: 'flex-end',
  },
  hintText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
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
    borderWidth: 1.5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
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
    fontWeight: '500',
    marginTop: 2,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
    flexShrink: 0,
  },
});
