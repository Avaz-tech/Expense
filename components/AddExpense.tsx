import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, ChevronLeft, User, Users } from 'lucide-react-native';
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
import { useTheme } from '../context/ThemeContext';
import { Expense, ExpenseScope } from '../types';
import { getTodayDateString } from '../utils/dates';
import { CategoryIcon } from './CategoryIcon';

type ExpenseFormData = {
  amount: string;
  categoryId: string;
  date: string;
  note: string;
  scope: ExpenseScope;
  spenderName: string;
};

type AddExpenseProps = {
  expense?: Expense;
  onSave: (expenseData: ExpenseFormData) => void;
  onCancel: () => void;
};

export function AddExpense({ expense, onSave, onCancel }: AddExpenseProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isEditing = Boolean(expense);
  const [amount, setAmount] = useState(expense?.amount ?? '');
  const [spenderName, setSpenderName] = useState(expense?.spenderName ?? '');
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? '');
  const [date, setDate] = useState(expense?.date ?? getTodayDateString());
  const [note, setNote] = useState(expense?.note ?? '');
  const [scope, setScope] = useState<ExpenseScope>(expense?.scope ?? 'family');
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const selectedDate = new Date(`${date}T12:00:00`);

  const handleDateChange = (_event: any, nextDate?: Date) => {
    if (nextDate) {
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  const handleDismiss = () => {
    setShowDatePicker(false);
  };

  const handleSubmit = () => {
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
      style={[styles.container, { backgroundColor: theme.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 24), borderBottomColor: theme.border }]}>
        <Pressable style={[styles.backButton, { backgroundColor: theme.surface_secondary }]} onPress={onCancel}>
          <ChevronLeft size={20} color={theme.text_primary} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text_primary }]}>
          {isEditing ? 'Xarajatni tahrirlash' : "Xarajat qo'shish"}
        </Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: theme.danger + '10' }]}>
            <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.amountSection}>
          <Text style={[styles.amountLabel, { color: theme.text_secondary }]}>Summa (so'm)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.text_secondary + '50'}
            style={[styles.amountInput, { color: theme.brand_primary }]}
            autoFocus={!isEditing}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.text_primary }]}>Kim sarfladi?</Text>
          <TextInput
            value={spenderName}
            onChangeText={setSpenderName}
            placeholder="Ismingiz..."
            placeholderTextColor={theme.text_secondary + '80'}
            style={[styles.nameInput, { backgroundColor: theme.surface_secondary, borderColor: theme.border, color: theme.text_primary }]}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.text_primary }]}>Kim uchun?</Text>
          <View style={[styles.scopeToggle, { backgroundColor: theme.surface_secondary }]}>
            <Pressable
              style={[styles.scopeButton, scope === 'family' && [styles.scopeButtonActive, { backgroundColor: theme.surface }]]}
              onPress={() => setScope('family')}
            >
              <Users size={16} color={scope === 'family' ? theme.brand_primary : theme.text_secondary} />
              <Text style={[styles.scopeText, { color: theme.text_secondary }, scope === 'family' && { color: theme.brand_primary }]}>
                Oilaviy
              </Text>
            </Pressable>
            <Pressable
              style={[styles.scopeButton, scope === 'personal' && [styles.scopeButtonActive, { backgroundColor: theme.surface }]]}
              onPress={() => setScope('personal')}
            >
              <User size={16} color={scope === 'personal' ? theme.brand_primary : theme.text_secondary} />
              <Text style={[styles.scopeText, { color: theme.text_secondary }, scope === 'personal' && { color: theme.brand_primary }]}>
                Shaxsiy
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.text_primary }]}>Kategoriyalar</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => {
              const isSelected = categoryId === category.id;
              return (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    { backgroundColor: theme.surface_secondary, borderColor: theme.border },
                    isSelected && { borderColor: theme.brand_primary, backgroundColor: theme.brand_primary + '05' }
                  ]}
                  onPress={() => setCategoryId(category.id)}
                >
                  <View
                    style={[
                      styles.categoryIconCircle,
                      {
                        backgroundColor: isSelected ? theme.brand_primary : theme.surface,
                      },
                    ]}
                  >
                    <CategoryIcon
                      name={category.icon}
                      size={18}
                      color={isSelected ? '#ffffff' : theme.text_primary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryName,
                      { color: theme.text_secondary },
                      isSelected && { color: theme.brand_primary }
                    ]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.text_primary }]}>Sana</Text>
          <Pressable
            style={[styles.dateInput, { backgroundColor: theme.surface_secondary, borderColor: theme.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateText, { color: theme.text_primary }]}>{date.split('-').reverse().join('.')}</Text>
            <Calendar size={18} color={theme.brand_primary} />
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onValueChange={handleDateChange}
              onDismiss={handleDismiss}
            />
          )}
          {Platform.OS === 'ios' && showDatePicker ? (
            <Pressable style={styles.dateDoneButton} onPress={() => setShowDatePicker(false)}>
              <Text style={[styles.dateDoneText, { color: theme.brand_primary }]}>Tayyor</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.text_primary }]}>Izoh (ixtiyoriy)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Xarajat haqida..."
            placeholderTextColor={theme.text_secondary + '80'}
            style={[styles.noteInput, { backgroundColor: theme.surface_secondary, borderColor: theme.border, color: theme.text_primary }]}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: theme.brand_primary },
            pressed && styles.saveButtonPressed
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.saveButtonText}>{isEditing ? 'Yangilash' : 'Saqlash'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 10,
    borderRadius: 12,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  topBarSpacer: {
    width: 40,
  },
  form: {
    padding: 20,
    paddingBottom: 120,
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
  amountSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    minWidth: 200,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  scopeToggle: {
    flexDirection: 'row',
    borderRadius: 14,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scopeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  categoryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '700',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dateDoneButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateDoneText: {
    fontWeight: '700',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
