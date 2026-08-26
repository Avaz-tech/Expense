export function validatePin(pin: string): string | null {
  const trimmed = pin.trim();
  if (trimmed.length < 4 || trimmed.length > 8) {
    return 'PIN 4–8 raqamdan iborat bo\'lishi kerak';
  }
  if (!/^\d+$/.test(trimmed)) {
    return 'PIN faqat raqamlardan iborat bo\'lishi kerak';
  }
  return null;
}
