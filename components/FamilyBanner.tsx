import { Copy, LogOut } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Family } from '../types/family';

type FamilyBannerProps = {
  family: Family;
  isSyncEnabled: boolean;
  onLeaveFamily: () => void;
};

export function FamilyBanner({ family, isSyncEnabled, onLeaveFamily }: FamilyBannerProps) {
  const copyInviteCode = async () => {
    await Clipboard.setStringAsync(family.inviteCode);
    Alert.alert('Nusxa olindi', `${family.inviteCode} taklif kodi nusxalandi`);
  };

  const confirmLeave = () => {
    Alert.alert(
      'Oiladan chiqish',
      'Chiqsangiz, bu telefondagi oila ma\'lumotlari ko\'rinmaydi. Davom etasizmi?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        { text: 'Chiqish', style: 'destructive', onPress: onLeaveFamily },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.familyName}>{family.name}</Text>
        {isSyncEnabled ? (
          <Pressable style={styles.codeRow} onPress={copyInviteCode}>
            <Text style={styles.codeLabel}>Taklif kodi: {family.inviteCode}</Text>
            <Copy size={14} color="#047857" />
          </Pressable>
        ) : (
          <Text style={styles.offlineText}>Offline rejim</Text>
        )}
      </View>
      <Pressable style={styles.leaveButton} onPress={confirmLeave}>
        <LogOut size={18} color="#6b7280" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ecfdf5',
    borderBottomWidth: 1,
    borderBottomColor: '#d1fae5',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  info: {
    flex: 1,
  },
  familyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065f46',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  codeLabel: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  offlineText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  leaveButton: {
    padding: 8,
  },
});
