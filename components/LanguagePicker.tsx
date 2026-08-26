import AsyncStorage from '@react-native-async-storage/async-storage';
import { Globe, X } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { LOCALE_CHOSEN_KEY } from '../i18n';
import { LANGUAGES, LanguageCode } from '../i18n/languages';

export function LanguagePicker() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = async (code: LanguageCode) => {
    i18n.changeLanguage(code);
    await AsyncStorage.setItem(LOCALE_CHOSEN_KEY, code);
    setModalVisible(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.surface },
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Globe size={18} color={theme.text_secondary} />
        <Text style={[styles.buttonText, { color: theme.text_primary }]}>
          {currentLang.flag} {currentLang.code.toUpperCase()}
        </Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background_base, paddingBottom: insets.bottom + 20 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text_primary }]}>
                {t('language.title')}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={theme.text_secondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {LANGUAGES.map((lang) => {
                const isSelected = lang.code === currentLang.code;
                return (
                  <Pressable
                    key={lang.code}
                    style={({ pressed }) => [
                      styles.langItem,
                      { borderBottomColor: theme.border },
                      isSelected && { backgroundColor: theme.surface },
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => handleSelect(lang.code)}
                  >
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <View style={styles.langInfo}>
                      <Text style={[styles.langNative, { color: theme.text_primary }]}>
                        {lang.nativeName}
                      </Text>
                      <Text style={[styles.langEn, { color: theme.text_secondary }]}>
                        {lang.name}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  langFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  langInfo: {
    flex: 1,
  },
  langNative: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  langEn: {
    fontSize: 13,
  },
});
