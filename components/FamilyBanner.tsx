import { Copy, LogOut, Moon, Sun } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Family } from '../types/family';

type FamilyBannerProps = {
  family: Family;
  isSyncEnabled: boolean;
  onLeaveFamily: () => void;
};

export function FamilyBanner({ family, isSyncEnabled, onLeaveFamily }: FamilyBannerProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const copyInviteCode = async () => {
    await Clipboard.setStringAsync(family.inviteCode);
    Alert.alert(t('family.copied'), t('family.copiedMessage', { code: family.inviteCode }));
  };

  const confirmLeave = () => {
    Alert.alert(
      t('family.leaveTitle'),
      t('family.leaveMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('family.leave'), style: 'destructive', onPress: onLeaveFamily },
      ]
    );
  };

  return (
    <View style={[
      styles.container,
      {
        paddingTop: Math.max(insets.top, 10),
        backgroundColor: theme.surface,
        borderBottomColor: theme.border
      }
    ]}>
      <View style={styles.info}>
        <Text style={[styles.familyName, { color: theme.text_primary }]}>{family.name}</Text>
        {isSyncEnabled ? (
          <Pressable style={styles.codeRow} onPress={copyInviteCode}>
            <Text style={[styles.codeLabel, { color: theme.brand_primary }]}>{t('family.inviteCode', { code: family.inviteCode })}</Text>
            <Copy size={12} color={theme.brand_primary} />
          </Pressable>
        ) : (
          <Text style={[styles.offlineText, { color: theme.text_secondary }]}>{t('family.offlineMode')}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.iconButton, { backgroundColor: theme.surface_secondary }]} onPress={toggleTheme}>
          {isDark ? (
            <Sun size={18} color={theme.warning} />
          ) : (
            <Moon size={18} color={theme.brand_primary} />
          )}
        </Pressable>

        <Pressable style={[styles.iconButton, { backgroundColor: theme.surface_secondary }]} onPress={confirmLeave}>
          <LogOut size={18} color={theme.text_secondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  info: {
    flex: 1,
  },
  familyName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  offlineText: {
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 10,
    borderRadius: 12,
  },
});
