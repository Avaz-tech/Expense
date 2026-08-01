import { ChevronLeft, ChevronRight, UsersRound } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Expense, Stats, StatsPeriod } from '../types';
import { getMonthName, getMonthOffset, getTodayDateString } from '../utils/dates';
import { formatMoney } from '../utils/formatMoney';
import { buildMemberTotals } from '../utils/stats';

type MembersViewProps = {
  stats: Stats;
  expenses: Expense[];
};

export function MembersView({ stats, expenses }: MembersViewProps) {
  const [period, setPeriod] = useState<StatsPeriod>('month');
  const [currentMonth, setCurrentMonth] = useState(getTodayDateString().substring(0, 7));

  const members = useMemo(() => {
    if (period === 'week') {
      return stats.weekMemberTotals;
    }

    return buildMemberTotals(expenses, (e) => e.date.startsWith(currentMonth));
  }, [period, currentMonth, stats, expenses]);

  const maxTotal = members.length > 0 ? members[0].total : 0;

  const handlePrevMonth = () => setCurrentMonth((prev) => getMonthOffset(prev, -1));
  const handleNextMonth = () => setCurrentMonth((prev) => getMonthOffset(prev, 1));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jamoa</Text>
      <Text style={styles.subtitle}>Kim qancha sarfladi</Text>

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

      {members.length === 0 ? (
        <View style={styles.emptyState}>
          <UsersRound size={40} color="#d1d5db" />
          <Text style={styles.emptyText}>Ma'lumot yo'q</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {members.map((member) => {
            const percentage = maxTotal > 0 ? (member.total / maxTotal) * 100 : 0;
            const initial = member.name.charAt(0).toUpperCase();

            return (
              <View key={member.name} style={styles.memberRow}>
                <View style={styles.memberHeader}>
                  <View style={styles.memberTitleWrap}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{initial}</Text>
                    </View>
                    <View>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberCount}>{member.count} ta xarajat</Text>
                    </View>
                  </View>
                  <Text style={styles.memberTotal}>{formatMoney(member.total)}</Text>
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
    marginBottom: 24,
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
    marginBottom: 24,
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
  memberRow: {
    gap: 8,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  memberTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '700',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  memberCount: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  memberTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  progressTrack: {
    width: '100%',
    height: 10,
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
