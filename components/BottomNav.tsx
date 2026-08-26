import { Home, List, PieChart, PlusCircle, UsersRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

type Tab = 'home' | 'stats' | 'add' | 'history' | 'members';

type BottomNavProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

type NavItemProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
};

function NavItem({ label, active, onPress, children }: NavItemProps) {
  const { theme } = useTheme();
  return (
    <Pressable style={styles.navItem} onPress={onPress}>
      {children}
      <Text style={[
        styles.navLabel,
        { color: theme.text_secondary },
        active && { color: theme.brand_primary }
      ]}>{label}</Text>
    </Pressable>
  );
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[
      styles.container,
      {
        paddingBottom: Math.max(insets.bottom, 12),
        backgroundColor: theme.surface,
        borderTopColor: theme.border
      }
    ]}>
      <NavItem
        label={t('nav.home')}
        active={activeTab === 'home'}
        onPress={() => onTabChange('home')}
      >
        <Home size={20} color={activeTab === 'home' ? theme.brand_primary : theme.text_secondary} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
      </NavItem>

      <NavItem
        label={t('nav.stats')}
        active={activeTab === 'stats'}
        onPress={() => onTabChange('stats')}
      >
        <PieChart size={20} color={activeTab === 'stats' ? theme.brand_primary : theme.text_secondary} strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
      </NavItem>

      <View style={styles.centerSlot}>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: theme.brand_primary, borderColor: theme.surface },
            pressed && styles.addButtonPressed
          ]}
          onPress={() => onTabChange('add')}
        >
          <PlusCircle size={28} color="#ffffff" strokeWidth={2.5} />
        </Pressable>
      </View>

      <NavItem
        label={t('nav.history')}
        active={activeTab === 'history'}
        onPress={() => onTabChange('history')}
      >
        <List size={20} color={activeTab === 'history' ? theme.brand_primary : theme.text_secondary} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
      </NavItem>

      <NavItem
        label={t('nav.members')}
        active={activeTab === 'members'}
        onPress={() => onTabChange('members')}
      >
        <UsersRound size={20} color={activeTab === 'members' ? theme.brand_primary : theme.text_secondary} strokeWidth={activeTab === 'members' ? 2.5 : 2} />
      </NavItem>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    marginTop: -28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonPressed: {
    transform: [{ scale: 0.9 }],
  },
});
