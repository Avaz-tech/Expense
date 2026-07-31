import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ChevronLeft, User, Users } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORIES } from '../constants/categories';
import { ExpenseScope } from '../types';
import { getTodayDateString } from '../utils/dates';
import { CategoryIcon } from './CategoryIcon';

type AddExpenseProps = {
  onSave: (expenseData: {
    amount: string;
    categoryId: string;
    date: string;
    note: string;
    scope: ExpenseScope;
    spenderName: string;
  }) => void;
  onCancel: () => void;
};

export function AddExpense({ onSave, onCancel }: AddExpenseProps) {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [spenderName, setSpenderName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');
  const [scope, setScope] = useState<ExpenseScope>('family');
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const selectedDate = new Date(`${date}T12:00:00`);

  const handleDateChange = (_event: DateTimePickerEvent, nextDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (nextDate) {
      setDate(nextDate.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = () => {
    // Sanitize: strip commas and spaces so "1,000" parses correctly as 1000
    const sanitizedAmount = amount.replace(/[,\s]/g, '');
    const parsedAmount = parseFloat(sanitizedAmount);

    if (!sanitizedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Summani kiriting!');
      return;
    }
    if (!categoryId) {
      setError('Kategoriyani tanlang!');
      return;
    }
    if (!spenderName.trim()) {
      setError('Ismni kiriting!');
      return;
    }

    onSave({ amount: sanitizedAmount, categoryId, date, note, scope, spenderName: spenderName.trim() });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 24) }]}>
        <Pressable style={styles.backButton} onPress={onCancel}>
          <ChevronLeft size={24} color="#4b5563" />
        </Pressable>
        <Text style={styles.title}>Xarajat qo'shish</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Summa (so'm)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#d1d5db"
            style={styles.amountInput}
            autoFocus
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kim sarfladi?</Text>
          <TextInput
            value={spenderName}
            onChangeText={setSpenderName}
            placeholder="Masalan: Muje, Ona, Otam..."
            placeholderTextColor="#9ca3af"
            style={styles.nameInput}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kim uchun?</Text>
          <View style={styles.scopeToggle}>
            <Pressable
              style={[styles.scopeButton, scope === 'family' && styles.scopeButtonActive]}
              onPress={() => setScope('family')}
            >
              <Users size={16} color={scope === 'family' ? '#059669' : '#6b7280'} />
              <Text style={[styles.scopeText, scope === 'family' && styles.scopeTextActive]}>
                Oilaviy
              </Text>
            </Pressable>
            <Pressable
              style={[styles.scopeButton, scope === 'personal' && styles.scopeButtonActive]}
              onPress={() => setScope('personal')}
            >
              <User size={16} color={scope === 'personal' ? '#059669' : '#6b7280'} />
              <Text style={[styles.scopeText, scope === 'personal' && styles.scopeTextActive]}>
                Shaxsiy
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kategoriyalar</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => {
              const isSelected = categoryId === category.id;
              return (
                <Pressable
                  key={category.id}
                  style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                  onPress={() => setCategoryId(category.id)}
                >
                  <View
                    style={[
                      styles.categoryIconCircle,
                      {
                        backgroundColor: isSelected ? '#10b981' : category.bgColor,
                      },
                    ]}
                  >
                    <CategoryIcon
                      name={category.icon}
                      size={20}
                      color={isSelected ? '#ffffff' : category.textColor}
                    />
                  </View>
                  <Text
                    style={[styles.categoryName, isSelected && styles.categoryNameSelected]}
                    numberOfLines={2}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sana</Text>
          <Pressable style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{date.split('-').reverse().join('.')}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}
          {Platform.OS === 'ios' && showDatePicker ? (
            <Pressable style={styles.dateDoneButton} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.dateDoneText}>Tayyor</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Izoh (ixtiyoriy)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Nima uchun xarajat qilindi?"
            placeholderTextColor="#9ca3af"
            style={styles.noteInput}
          />
        </View>

        <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>Saqlash</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topBar: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 999,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  topBarSpacer: {
    width: 40,
  },
  form: {
    padding: 24,
    paddingBottom: 120,
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
    fontWeight: '500',
    textAlign: 'center',
  },
  amountSection: {
    marginBottom: 32,
  },
  amountLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  amountInput: {
    textAlign: 'center',
    fontSize: 40,
    fontWeight: '700',
    color: '#059669',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  scopeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  scopeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  scopeButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  scopeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  scopeTextActive: {
    color: '#059669',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
  categoryCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
    color: '#4b5563',
    lineHeight: 14,
  },
  categoryNameSelected: {
    color: '#047857',
  },
  dateInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dateDoneButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateDoneText: {
    color: '#059669',
    fontWeight: '600',
  },
  noteInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  nameInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  saveButton: {
    backgroundColor: '#059669',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  saveButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
