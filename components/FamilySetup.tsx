import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Family } from '../types/family';

type FamilySetupProps = {
  isSyncEnabled: boolean;
  onCreateFamily: (name: string) => Promise<Family>;
  onJoinFamily: (inviteCode: string) => Promise<Family>;
};

export function FamilySetup({ isSyncEnabled, onCreateFamily, onJoinFamily }: FamilySetupProps) {
  const { theme } = useTheme();
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
    <View style={[styles.container, { paddingTop: insets.top + 48, backgroundColor: theme.background_base }]}>
      <View style={styles.hero}>
        <Image
          source={require('../assets/mark.png')}
          style={styles.logoMark}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.text_primary }]}>Xarajat</Text>
        <Text style={[styles.subtitle, { color: theme.text_secondary }]}>
          Oilaviy byudjetni birgalikda boshqaring. Barcha a'zolar bir xil ma'lumotlarni ko'radi.
        </Text>
      </View>

      <View style={[styles.modeToggle, { backgroundColor: theme.surface_secondary }]}>
        <Pressable
          style={[styles.modeButton, mode === 'create' && [styles.modeButtonActive, { backgroundColor: theme.surface }]]}
          onPress={() => setMode('create')}
        >
          <Text style={[styles.modeText, { color: theme.text_secondary }, mode === 'create' && { color: theme.brand_primary }]}>
            Oila yaratish
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === 'join' && [styles.modeButtonActive, { backgroundColor: theme.surface }]]}
          onPress={() => setMode('join')}
        >
          <Text style={[styles.modeText, { color: theme.text_secondary }, mode === 'join' && { color: theme.brand_primary }]}>
            Qo'shilish
          </Text>
        </Pressable>
      </View>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: theme.danger + '10' }]}>
          <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
        </View>
      ) : null}

      {mode === 'create' ? (
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text_primary }]}>Oila nomi</Text>
          <TextInput
            value={familyName}
            onChangeText={setFamilyName}
            placeholder="Masalan: Karimovlar"
            placeholderTextColor={theme.text_secondary + '80'}
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text_primary }]}
          />
        </View>
      ) : (
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text_primary }]}>Taklif kodi</Text>
          <TextInput
            value={inviteCode}
            onChangeText={setInviteCode}
            placeholder="FAM-7X2K"
            placeholderTextColor={theme.text_secondary + '80'}
            autoCapitalize="characters"
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text_primary }]}
          />
        </View>
      )}

      {!isSyncEnabled ? (
        <Text style={[styles.syncHint, { color: theme.text_secondary }]}>
          Sinxronizatsiya hozircha o'chiq. Supabase sozlasangiz, oila a'zolari bir xil ma'lumotlarni ko'radi.
        </Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          { backgroundColor: theme.brand_primary },
          pressed && styles.submitButtonPressed
        ]}
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
    paddingHorizontal: 32,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoMark: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  modeButtonActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorBox: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  syncHint: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  submitText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
