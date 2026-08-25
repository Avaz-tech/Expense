import { ChevronLeft, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type LegalViewProps = {
  type: 'privacy' | 'terms';
  onBack: () => void;
};

const PRIVACY_SECTIONS = [
  {
    title: "1. Introduction",
    content: "Welcome to Xarajat (\"we,\" \"our,\" or \"us\"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (the \"App\")."
  },
  {
    title: "2. Information We Collect",
    content: "We collect information that you voluntarily provide to us when you register for the App, such as:\n\n• Personal Information: Name, email address, and authentication credentials.\n• Financial Data: Expense amounts, categories, dates, and descriptions that you manually enter into the App to track your family expenses.\n\nWe do not link directly to your bank accounts or collect credit card information."
  },
  {
    title: "3. How We Use Your Information",
    content: "We use the information we collect primarily to provide, maintain, and improve the App, specifically to:\n\n• Create and manage your account.\n• Sync your expense data across your devices and with your designated family members.\n• Provide customer support and respond to your requests.\n• Improve the functionality and user experience of the App."
  },
  {
    title: "4. How We Share Your Information",
    content: "We may share your information in the following situations:\n\n• With Family Members: Data you enter (expenses, notes) is shared with other users who join your designated \"Family\" group within the App.\n• Service Providers: We use third-party services (such as Supabase for database and authentication hosting) to facilitate our App. These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.\n• Legal Requirements: We may disclose your information if required to do so by law or in response to valid requests by public authorities."
  },
  {
    title: "5. Security of Your Information",
    content: "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse."
  }
];

const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: "By downloading, accessing, or using Xarajat (the \"App\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to these Terms, do not use the App."
  },
  {
    title: "2. Description of Service",
    content: "Xarajat is a family expense tracking application that allows users to record, categorize, and monitor shared expenses. The App is provided for informational and personal organization purposes only and does not constitute professional financial advice."
  },
  {
    title: "3. User Accounts",
    content: "To use certain features of the App, you must register for an account. You agree to:\n\n• Provide accurate, current, and complete information during registration.\n• Maintain the security of your password and account credentials.\n• Be fully responsible for all use of your account and for any actions that take place using your account."
  },
  {
    title: "4. User Content",
    content: "You are solely responsible for all data, information, text, and other materials (\"Content\") that you upload, post, or otherwise transmit via the App. By submitting Content, you grant us a non-exclusive, worldwide, royalty-free license to use, store, and process your Content solely for the purpose of providing the App's services to you and your designated family group."
  },
  {
    title: "5. Prohibited Conduct",
    content: "You agree not to:\n\n• Use the App for any illegal or unauthorized purpose.\n• Attempt to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the App.\n• Upload invalid data, viruses, worms, or other software agents through the App.\n• Use the App to harass, abuse, or harm another person."
  }
];

export function LegalView({ type, onBack }: LegalViewProps) {
  const { theme } = useTheme();
  
  const sections = type === 'privacy' ? PRIVACY_SECTIONS : TERMS_SECTIONS;
  const isPrivacy = type === 'privacy';
  const Icon = isPrivacy ? ShieldCheck : FileText;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Pressable 
          onPress={onBack} 
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: theme.surface_secondary },
            pressed && { opacity: 0.7 }
          ]}
        >
          <ChevronLeft color={theme.text_primary} size={24} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text_primary }]}>
          {isPrivacy ? 'Maxfiylik siyosati' : 'Foydalanish shartlari'}
        </Text>
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={[styles.iconWrap, { backgroundColor: theme.brand_primary + '15' }]}>
            <Icon size={40} color={theme.brand_primary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.heroTitle, { color: theme.text_primary }]}>
            {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.text_secondary }]}>
            Last updated: August 2026
          </Text>
        </View>

        <View style={styles.sectionsContainer}>
          {sections.map((section, index) => (
            <View 
              key={index} 
              style={[
                styles.sectionCard, 
                { 
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                }
              ]}
            >
              <View style={styles.sectionHeader}>
                <CheckCircle2 size={18} color={theme.brand_primary} style={styles.sectionIcon} />
                <Text style={[styles.sectionTitle, { color: theme.text_primary }]}>
                  {section.title}
                </Text>
              </View>
              <Text style={[styles.sectionContent, { color: theme.text_secondary }]}>
                {section.content}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  sectionCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
  }
});
