import { ChevronLeft, ChevronRight, UsersRound } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { Expense, Stats, StatsPeriod } from '../types';
import { getMonthName, getMonthOffset, getTodayDateString } from '../utils/dates';
import { buildMemberTotals } from '../utils/stats';
import { CurrencyPicker } from './CurrencyPicker';
import { LanguagePicker } from './LanguagePicker';

type MembersViewProps = {
  stats: Stats;
  expenses: Expense[];
  onNavigate: (tab: any) => void;
};

export function MembersView({ stats, expenses, onNavigate }: MembersViewProps) {
  const { theme } = useTheme();
  const { formatMoney } = useCurrency();
  const { t } = useTranslation();
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
      <Text style={[styles.title, { color: theme.text_primary }]}>{t('members.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.text_secondary }]}>{t('members.subtitle')}</Text>

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

      {members.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <UsersRound size={40} color={theme.text_secondary} opacity={0.5} />
          <Text style={[styles.emptyText, { color: theme.text_secondary }]}>{t('common.noData')}</Text>
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
                    <View style={[styles.avatar, { backgroundColor: theme.brand_primary + '10' }]}>
                      <Text style={[styles.avatarText, { color: theme.brand_primary }]}>{initial}</Text>
                    </View>
                    <View>
                      <Text style={[styles.memberName, { color: theme.text_primary }]}>{member.name}</Text>
                      <Text style={[styles.memberCount, { color: theme.text_secondary }]}>{t('members.expenseCount', { count: member.count })}</Text>
                    </View>
                  </View>
                  <Text style={[styles.memberTotal, { color: theme.text_primary }]}>{formatMoney(member.total)}</Text>
                </View>

                <View style={[styles.progressTrack, { backgroundColor: theme.surface_secondary }]}>
                  <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: theme.brand_primary }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={[styles.preferencesCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.preferenceRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.preferenceLabel, { color: theme.text_primary }]}>{t('common.languageSelect', 'Language')}</Text>
          <LanguagePicker />
        </View>
        <View style={styles.preferenceRow}>
          <Text style={[styles.preferenceLabel, { color: theme.text_primary }]}>{t('common.currencySelect', 'Currency')}</Text>
          <CurrencyPicker />
        </View>
      </View>

      <View style={styles.legalSection}>
        <Pressable onPress={() => onNavigate('privacy')} style={styles.legalButton}>
          <Text style={[styles.legalText, { color: theme.brand_primary }]}>{t('members.privacyPolicy')}</Text>
        </Pressable>
        <Text style={[styles.legalDivider, { color: theme.text_secondary }]}>•</Text>
        <Pressable onPress={() => onNavigate('terms')} style={styles.legalButton}>
          <Text style={[styles.legalText, { color: theme.brand_primary }]}>{t('members.termsOfService')}</Text>
        </Pressable>
      </View>
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    gap: 28,
  },
  memberRow: {
    gap: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
  },
  memberCount: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  memberTotal: {
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
  legalSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
    gap: 12,
  },
  legalButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  legalText: {
    fontSize: 13,
    fontWeight: '600',
  },
  legalDivider: {
    fontSize: 14,
  },
  preferencesCard: {
    marginTop: 32,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  preferenceLabel: {
    fontSize: 15,
    fontWeight: '600',
  }
});
