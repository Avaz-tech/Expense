import { Home, List, PieChart, PlusCircle, UsersRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  return (
    <Pressable style={styles.navItem} onPress={onPress}>
      {children}
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <NavItem
        label="Asosiy"
        active={activeTab === 'home'}
        onPress={() => onTabChange('home')}
      >
        <Home size={22} color={activeTab === 'home' ? '#059669' : '#9ca3af'} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
      </NavItem>

      <NavItem
        label="Hisobot"
        active={activeTab === 'stats'}
        onPress={() => onTabChange('stats')}
      >
        <PieChart size={22} color={activeTab === 'stats' ? '#059669' : '#9ca3af'} strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
      </NavItem>

      <View style={styles.centerSlot}>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          onPress={() => onTabChange('add')}
        >
          <PlusCircle size={30} color="#ffffff" strokeWidth={2} />
        </Pressable>
      </View>

      <NavItem
        label="Tarix"
        active={activeTab === 'history'}
        onPress={() => onTabChange('history')}
      >
        <List size={22} color={activeTab === 'history' ? '#059669' : '#9ca3af'} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
      </NavItem>

      <NavItem
        label="Jamoa"
        active={activeTab === 'members'}
        onPress={() => onTabChange('members')}
      >
        <UsersRound size={22} color={activeTab === 'members' ? '#059669' : '#9ca3af'} strokeWidth={activeTab === 'members' ? 2.5 : 2} />
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
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
    color: '#9ca3af',
  },
  navLabelActive: {
    color: '#059669',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginTop: -24,
  },
  addButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
});
