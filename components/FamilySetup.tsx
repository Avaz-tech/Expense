import { Users } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Family } from '../types/family';

type FamilySetupProps = {
  isSyncEnabled: boolean;
  onCreateFamily: (name: string) => Promise<Family>;
  onJoinFamily: (inviteCode: string) => Promise<Family>;
};

export function FamilySetup({ isSyncEnabled, onCreateFamily, onJoinFamily }: FamilySetupProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'create') {
        if (!familyName.trim()) {
          setError('Oila nomini kiriting');
          return;
        }
        await onCreateFamily(familyName);
      } else {
        if (!inviteCode.trim()) {
          setError('Taklif kodini kiriting');
          return;
        }
        if (!isSyncEnabled) {
          setError('Bulut sinxronizatsiyasi sozlanmagan. .env faylini to\'ldiring.');
          return;
        }
        await onJoinFamily(inviteCode);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <Users size={36} color="#059669" />
        </View>
        <Text style={styles.title}>Oilaviy xarajatlar</Text>
        <Text style={styles.subtitle}>
          Oila yarating yoki taklif kodi bilan qo'shiling. Barcha a'zolar bir xil ma'lumotlarni ko'radi.
        </Text>
      </View>

      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeButton, mode === 'create' && styles.modeButtonActive]}
          onPress={() => setMode('create')}
        >
          <Text style={[styles.modeText, mode === 'create' && styles.modeTextActive]}>
            Oila yaratish
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === 'join' && styles.modeButtonActive]}
          onPress={() => setMode('join')}
        >
          <Text style={[styles.modeText, mode === 'join' && styles.modeTextActive]}>
            Qo'shilish
          </Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {mode === 'create' ? (
        <View style={styles.field}>
          <Text style={styles.label}>Oila nomi</Text>
          <TextInput
            value={familyName}
            onChangeText={setFamilyName}
            placeholder="Masalan: Karimovlar"
            placeholderTextColor="#9ca3af"
            style={styles.input}
          />
        </View>
      ) : (
        <View style={styles.field}>
          <Text style={styles.label}>Taklif kodi</Text>
          <TextInput
            value={inviteCode}
            onChangeText={setInviteCode}
            placeholder="FAM-7X2K"
            placeholderTextColor="#9ca3af"
            autoCapitalize="characters"
            style={styles.input}
          />
        </View>
      )}

      {!isSyncEnabled ? (
        <Text style={styles.syncHint}>
          Sinxronizatsiya hozircha o'chiq. Supabase sozlasangiz, oila a'zolari telefonlarida bir xil ma'lumotlarni ko'radi.
        </Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitText}>
            {mode === 'create' ? 'Oila yaratish' : 'Qo\'shilish'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeButtonActive: {
    backgroundColor: '#ffffff',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeTextActive: {
    color: '#059669',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  syncHint: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 18,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#059669',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  submitText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
