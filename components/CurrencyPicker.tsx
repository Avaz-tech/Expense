import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CurrencyCode, useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

export function CurrencyPicker() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const [modalVisible, setModalVisible] = useState(false);

  const currencies: { code: string; label: string }[] = [
    { code: 'USD', label: 'USD ($) - United States' },
    { code: 'EUR', label: 'EUR (€) - Eurozone' },
    { code: 'GBP', label: 'GBP (£) - United Kingdom' },
    { code: 'JPY', label: 'JPY (¥) - Japan' },
    { code: 'CNY', label: 'CNY (¥) - China' },
    { code: 'INR', label: 'INR (₹) - India' },
    { code: 'UZS', label: "UZS (so'm) - Uzbekistan" },
    { code: 'RUB', label: 'RUB (₽) - Russia' },
    { code: 'BRL', label: 'BRL (R$) - Brazil' },
    { code: 'MXN', label: 'MXN ($) - Mexico' },
    { code: 'SAR', label: 'SAR - Saudi Arabia' },
    { code: 'AED', label: 'AED - United Arab Emirates' },
    { code: 'BDT', label: 'BDT - Bangladesh' },
    { code: 'PKR', label: 'PKR - Pakistan' },
    { code: 'IDR', label: 'IDR (Rp) - Indonesia' },
    { code: 'KRW', label: 'KRW (₩) - South Korea' },
    { code: 'TRY', label: 'TRY (₺) - Turkey' },
    { code: 'VND', label: 'VND (₫) - Vietnam' },
    { code: 'IRR', label: 'IRR - Iran' },
    { code: 'PLN', label: 'PLN (zł) - Poland' },
    { code: 'UAH', label: 'UAH (₴) - Ukraine' },
    { code: 'THB', label: 'THB (฿) - Thailand' },
    { code: 'MYR', label: 'MYR - Malaysia' },
    { code: 'PHP', label: 'PHP (₱) - Philippines' },
  ];

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code);
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        style={[styles.button, { backgroundColor: theme.surface }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.buttonText, { color: theme.text_primary }]}>
          {currency}
        </Text>
        <ChevronDown size={14} color={theme.text_secondary} />
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text_primary }]}>
              {t('common.currencySelect', 'Select Currency')}
            </Text>
            <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
              {currencies.map((item) => (
                <Pressable
                  key={item.code}
                  style={[
                    styles.optionButton,
                    currency === item.code && { backgroundColor: theme.brand_primary + '15' },
                  ]}
                  onPress={() => handleSelect(item.code)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.text_primary },
                      currency === item.code && { color: theme.brand_primary, fontWeight: '700' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
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
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '80%',
  },
  scrollArea: {
    maxHeight: '100%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
