import { Check, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Family } from '../types/family';
import { LanguagePicker } from './LanguagePicker';

type NameAvailability = 'idle' | 'checking' | 'available' | 'taken';

type FamilySetupProps = {
  isSyncEnabled: boolean;
  onCreateFamily: (name: string, pin: string) => Promise<Family>;
  onJoinFamilyByCode: (inviteCode: string) => Promise<Family>;
  onJoinFamilyByNameAndPin: (name: string, pin: string) => Promise<Family>;
  onCheckFamilyNameAvailable?: (name: string) => Promise<boolean | null>;
};

export function FamilySetup({
  isSyncEnabled,
  onCreateFamily,
  onJoinFamilyByCode,
  onJoinFamilyByNameAndPin,
  onCheckFamilyNameAvailable,
}: FamilySetupProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [joinMethod, setJoinMethod] = useState<'code' | 'pin'>('code');
  const [familyName, setFamilyName] = useState('');
  const [familyPin, setFamilyPin] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameAvailability, setNameAvailability] = useState<NameAvailability>('idle');
  const checkRequestId = useRef(0);

  useEffect(() => {
    if (mode !== 'create' || !isSyncEnabled || !onCheckFamilyNameAvailable) {
      setNameAvailability('idle');
      return;
    }

    const trimmedName = familyName.trim();
    if (trimmedName.length < 2) {
      setNameAvailability('idle');
      return;
    }

    setNameAvailability('checking');
    const requestId = ++checkRequestId.current;

    const timer = setTimeout(async () => {
      try {
        const isAvailable = await onCheckFamilyNameAvailable(trimmedName);
        if (requestId !== checkRequestId.current) return;

        if (isAvailable === null) {
          setNameAvailability('idle');
          return;
        }

        setNameAvailability(isAvailable ? 'available' : 'taken');
      } catch {
        if (requestId === checkRequestId.current) {
          setNameAvailability('idle');
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [familyName, mode, isSyncEnabled, onCheckFamilyNameAvailable]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'create') {
        if (!familyName.trim()) {
          setError(t('onboarding.errors.familyNameRequired'));
          return;
        }
        if (nameAvailability === 'taken') {
          setError(t('onboarding.errors.nameTaken'));
          return;
        }
        if (!familyPin.trim()) {
          setError(t('onboarding.errors.pinRequired'));
          return;
        }
        await onCreateFamily(familyName, familyPin);
      } else if (joinMethod === 'code') {
        if (!inviteCode.trim()) {
          setError(t('onboarding.errors.inviteCodeRequired'));
          return;
        }
        if (!isSyncEnabled) {
          setError(t('onboarding.errors.syncNotConfigured'));
          return;
        }
        await onJoinFamilyByCode(inviteCode);
      } else {
        if (!familyName.trim()) {
          setError(t('onboarding.errors.familyNameRequired'));
          return;
        }
        if (!familyPin.trim()) {
          setError(t('onboarding.errors.pinRequired'));
          return;
        }
        if (!isSyncEnabled) {
          setError(t('onboarding.errors.syncRequired'));
          return;
        }
        await onJoinFamilyByNameAndPin(familyName, familyPin);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: 'create' | 'join') => {
    setMode(nextMode);
    setError('');
    setNameAvailability('idle');
  };

  const nameInputBorderColor =
    nameAvailability === 'available'
      ? theme.brand_secondary
      : nameAvailability === 'taken'
        ? theme.danger
        : theme.border;

  const isCreateDisabled =
    loading || (mode === 'create' && isSyncEnabled && nameAvailability === 'taken');

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background_base }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 32, paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LanguagePicker />
        </View>

        <View style={styles.hero}>
          <Image
            source={require('../assets/mark.png')}
            style={styles.logoMark}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.text_primary }]}>Xarajat</Text>
          <Text style={[styles.subtitle, { color: theme.text_secondary }]}>
            {t('onboarding.subtitle')}
          </Text>
        </View>

        <View style={[styles.modeToggle, { backgroundColor: theme.surface_secondary }]}>
          <Pressable
            style={[styles.modeButton, mode === 'create' && [styles.modeButtonActive, { backgroundColor: theme.surface }]]}
            onPress={() => switchMode('create')}
          >
            <Text style={[styles.modeText, { color: theme.text_secondary }, mode === 'create' && { color: theme.brand_primary }]}>
              {t('onboarding.createFamily')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeButton, mode === 'join' && [styles.modeButtonActive, { backgroundColor: theme.surface }]]}
            onPress={() => switchMode('join')}
          >
            <Text style={[styles.modeText, { color: theme.text_secondary }, mode === 'join' && { color: theme.brand_primary }]}>
              {t('onboarding.join')}
            </Text>
          </Pressable>
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: theme.danger + '10' }]}>
            <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
          </View>
        ) : null}

        {mode === 'create' ? (
          <>
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text_primary }]}>{t('onboarding.familyName')}</Text>
              <View style={styles.nameInputWrap}>
                <TextInput
                  value={familyName}
                  onChangeText={setFamilyName}
                  placeholder={t('onboarding.familyNamePlaceholder')}
                  placeholderTextColor={theme.text_secondary + '80'}
                  style={[
                    styles.input,
                    styles.nameInput,
                    {
                      backgroundColor: theme.surface,
                      borderColor: nameInputBorderColor,
                      color: theme.text_primary,
                    },
                  ]}
                />
                {nameAvailability === 'checking' ? (
                  <ActivityIndicator size="small" color={theme.brand_primary} style={styles.nameStatusIcon} />
                ) : null}
                {nameAvailability === 'available' ? (
                  <Check size={18} color={theme.brand_secondary} style={styles.nameStatusIcon} />
                ) : null}
                {nameAvailability === 'taken' ? (
                  <X size={18} color={theme.danger} style={styles.nameStatusIcon} />
                ) : null}
              </View>
              {nameAvailability === 'available' ? (
                <Text style={[styles.fieldHint, { color: theme.brand_secondary }]}>
                  {t('onboarding.nameAvailable')}
                </Text>
              ) : null}
              {nameAvailability === 'taken' ? (
                <Text style={[styles.fieldHint, { color: theme.danger }]}>
                  {t('onboarding.nameTaken')}
                </Text>
              ) : null}
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text_primary }]}>{t('onboarding.familyPin')}</Text>
              <TextInput
                value={familyPin}
                onChangeText={setFamilyPin}
                placeholder={t('onboarding.pinPlaceholder')}
                placeholderTextColor={theme.text_secondary + '80'}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={8}
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text_primary }]}
              />
              <Text style={[styles.fieldHint, { color: theme.text_secondary }]}>
                {t('onboarding.pinHint')}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={[styles.joinMethodToggle, { backgroundColor: theme.surface_secondary }]}>
              <Pressable
                style={[
                  styles.joinMethodButton,
                  joinMethod === 'code' && [styles.joinMethodButtonActive, { backgroundColor: theme.surface }],
                ]}
                onPress={() => {
                  setJoinMethod('code');
                  setError('');
                }}
              >
                <Text
                  style={[
                    styles.joinMethodText,
                    { color: theme.text_secondary },
                    joinMethod === 'code' && { color: theme.brand_primary },
                  ]}
                >
                  {t('onboarding.inviteCode')}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.joinMethodButton,
                  joinMethod === 'pin' && [styles.joinMethodButtonActive, { backgroundColor: theme.surface }],
                ]}
                onPress={() => {
                  setJoinMethod('pin');
                  setError('');
                }}
              >
                <Text
                  style={[
                    styles.joinMethodText,
                    { color: theme.text_secondary },
                    joinMethod === 'pin' && { color: theme.brand_primary },
                  ]}
                >
                  {t('onboarding.familyNameAndPin')}
                </Text>
              </Pressable>
            </View>

            {joinMethod === 'code' ? (
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text_primary }]}>{t('onboarding.inviteCode')}</Text>
                <TextInput
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  placeholder={t('onboarding.inviteCodePlaceholder')}
                  placeholderTextColor={theme.text_secondary + '80'}
                  autoCapitalize="characters"
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text_primary }]}
                />
              </View>
            ) : (
              <>
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.text_primary }]}>{t('onboarding.familyName')}</Text>
                  <TextInput
                    value={familyName}
                    onChangeText={setFamilyName}
                    placeholder={t('onboarding.familyNameJoinPlaceholder')}
                    placeholderTextColor={theme.text_secondary + '80'}
                    style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text_primary }]}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.text_primary }]}>{t('onboarding.familyPin')}</Text>
                  <TextInput
                    value={familyPin}
                    onChangeText={setFamilyPin}
                    placeholder={t('onboarding.pinPlaceholder')}
                    placeholderTextColor={theme.text_secondary + '80'}
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={8}
                    style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text_primary }]}
                  />
                  <Text style={[styles.fieldHint, { color: theme.text_secondary }]}>
                    {t('onboarding.pinJoinHint')}
                  </Text>
                </View>
              </>
            )}
          </>
        )}

        {!isSyncEnabled ? (
          <Text style={[styles.syncHint, { color: theme.text_secondary }]}>
            {t('onboarding.syncHint')}
          </Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: theme.brand_primary },
            (pressed || isCreateDisabled) && styles.submitButtonPressed,
            isCreateDisabled && { opacity: 0.5 },
          ]}
          onPress={handleSubmit}
          disabled={isCreateDisabled}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>
              {mode === 'create' ? t('onboarding.createFamily') : t('onboarding.join')}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    zIndex: 10,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoMark: {
    width: 72,
    height: 72,
    marginBottom: 16,
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
    marginBottom: 24,
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
  joinMethodToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  joinMethodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  joinMethodButtonActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  joinMethodText: {
    fontSize: 13,
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
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  fieldHint: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  nameInputWrap: {
    position: 'relative',
  },
  nameInput: {
    paddingRight: 44,
  },
  nameStatusIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -9,
  },
  syncHint: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
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
