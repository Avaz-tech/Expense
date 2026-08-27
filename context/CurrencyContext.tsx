import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type CurrencyCode = string;

export const CURRENCY_STORAGE_KEY = '@xarajat_currency';

type CurrencyContextType = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  formatMoney: (amount: number | string) => string;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const formatMoneyWithCurrency = (amount: number | string, currency: CurrencyCode): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  
  // Format the number with spaces for thousands
  const formattedNumber = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const prefixes: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', INR: '₹', BRL: 'R$',
    MXN: '$', PHP: '₱', KRW: '₩', THB: '฿', VND: '₫'
  };

  const suffixes: Record<string, string> = {
    RUB: ' ₽', UZS: " so'm", UAH: ' ₴', PLN: ' zł', TRY: ' ₺', IDR: ' Rp'
  };

  if (prefixes[currency]) {
    return `${prefixes[currency]}${formattedNumber}`;
  } else if (suffixes[currency]) {
    return `${formattedNumber}${suffixes[currency]}`;
  }
  
  // Fallback for currencies without special symbols
  return `${formattedNumber} ${currency}`;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('UZS');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
        if (savedCurrency) {
          setCurrencyState(savedCurrency);
        }
      } catch (error) {
        console.error('Failed to load currency from storage', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadCurrency();
  }, []);

  const setCurrency = async (newCurrency: CurrencyCode) => {
    try {
      setCurrencyState(newCurrency);
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    } catch (error) {
      console.error('Failed to save currency to storage', error);
    }
  };

  const formatMoney = (amount: number | string) => {
    return formatMoneyWithCurrency(amount, currency);
  };

  // We only render children once the currency is loaded to prevent hydration flashes
  if (!isLoaded) return null;

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatMoney }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
