import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { FAMILY_STORAGE_KEY } from '../constants/storage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ensureAnonymousSession, getAuthUserId } from '../lib/session';
import { Family } from '../types/family';
import { generateInviteCode } from '../utils/inviteCode';
import { validatePin } from '../utils/pin';

type FamilyRpcResult = {
  id: string;
  name: string;
  invite_code: string;
};

type UseFamilyResult = {
  family: Family | null;
  isLoaded: boolean;
  isSyncEnabled: boolean;
  createFamily: (name: string, pin: string) => Promise<Family>;
  joinFamilyByCode: (inviteCode: string) => Promise<Family>;
  joinFamilyByNameAndPin: (name: string, pin: string) => Promise<Family>;
  checkFamilyNameAvailable: (name: string) => Promise<boolean | null>;
  leaveFamily: () => Promise<void>;
};

const toFamily = (row: FamilyRpcResult | { id: string; name: string; invite_code: string }): Family => ({
  id: row.id,
  name: row.name,
  inviteCode: row.invite_code,
});

const mapRpcError = (message: string): string => {
  if (message.includes('already exists') || message.includes('allaqachon mavjud')) {
    return 'Bu nomdagi oila allaqachon mavjud. "Qo\'shilish" bo\'limidan kiring.';
  }
  if (message.includes('Taklif kodi topilmadi') || message.includes('Invite code')) {
    return 'Taklif kodi topilmadi';
  }
  if (message.includes('PIN noto') || message.includes('Oila topilmadi')) {
    return 'Oila topilmadi yoki PIN noto\'g\'ri';
  }
  if (message.includes('Authentication required')) {
    return 'Kirish amalga oshmadi. Ilovani qayta oching.';
  }
  return message;
};

export function useFamily(): UseFamilyResult {
  const [family, setFamily] = useState<Family | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadFamily = async () => {
      try {
        if (isSupabaseConfigured) {
          await ensureAnonymousSession();
        }
        const saved = await AsyncStorage.getItem(FAMILY_STORAGE_KEY);
        if (saved) {
          setFamily(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load family', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadFamily();
  }, []);

  const persistFamily = useCallback(async (nextFamily: Family | null) => {
    setFamily(nextFamily);
    if (nextFamily) {
      await AsyncStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(nextFamily));
    } else {
      await AsyncStorage.removeItem(FAMILY_STORAGE_KEY);
    }
  }, []);

  const createFamily = useCallback(
    async (name: string, pin: string) => {
      const trimmedName = name.trim();
      const pinValidation = validatePin(pin);
      if (pinValidation) {
        throw new Error(pinValidation);
      }

      if (!isSupabaseConfigured || !supabase) {
        const localFamily: Family = {
          id: `local-${Date.now()}`,
          name: trimmedName,
          inviteCode: generateInviteCode(),
        };
        await persistFamily(localFamily);
        return localFamily;
      }

      await ensureAnonymousSession();

      const { data, error } = await supabase.rpc('create_family', {
        p_name: trimmedName,
        p_pin: pin.trim(),
      });

      if (error) {
        throw new Error(mapRpcError(error.message));
      }

      if (!data) {
        throw new Error('Oilani yaratib bo\'lmadi');
      }

      const created = toFamily(data as FamilyRpcResult);
      await persistFamily(created);
      return created;
    },
    [persistFamily]
  );

  const joinFamilyByCode = useCallback(
    async (inviteCode: string) => {
      const normalizedCode = inviteCode.trim().toUpperCase();

      if (!normalizedCode) {
        throw new Error('Taklif kodini kiriting');
      }

      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Bulut sinxronizatsiyasi sozlanmagan');
      }

      await ensureAnonymousSession();

      const { data, error } = await supabase.rpc('join_family_by_invite', {
        p_invite_code: normalizedCode,
      });

      if (error) {
        throw new Error(mapRpcError(error.message));
      }

      if (!data) {
        throw new Error('Taklif kodi topilmadi');
      }

      const joined = toFamily(data as FamilyRpcResult);
      await persistFamily(joined);
      return joined;
    },
    [persistFamily]
  );

  const joinFamilyByNameAndPin = useCallback(
    async (name: string, pin: string) => {
      const trimmedName = name.trim();
      const pinValidation = validatePin(pin);

      if (!trimmedName) {
        throw new Error('Oila nomini kiriting');
      }
      if (pinValidation) {
        throw new Error(pinValidation);
      }

      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Bulut sinxronizatsiyasi sozlanmagan');
      }

      await ensureAnonymousSession();

      const { data, error } = await supabase.rpc('join_family_by_name_pin', {
        p_name: trimmedName,
        p_pin: pin.trim(),
      });

      if (error) {
        throw new Error(mapRpcError(error.message));
      }

      if (!data) {
        throw new Error('Oila topilmadi yoki PIN noto\'g\'ri');
      }

      const joined = toFamily(data as FamilyRpcResult);
      await persistFamily(joined);
      return joined;
    },
    [persistFamily]
  );

  const checkFamilyNameAvailable = useCallback(async (name: string): Promise<boolean | null> => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return null;
    }

    if (!isSupabaseConfigured || !supabase) {
      return true;
    }

    await ensureAnonymousSession();

    const { data, error } = await supabase.rpc('check_family_name_available', {
      p_name: trimmedName,
    });

    if (error) {
      throw new Error(error.message);
    }

    return Boolean(data);
  }, []);

  const leaveFamily = useCallback(async () => {
    if (family && isSupabaseConfigured && supabase && !family.id.startsWith('local-')) {
      try {
        await ensureAnonymousSession();
        const userId = await getAuthUserId();
        if (userId) {
          await supabase
            .from('family_members')
            .delete()
            .eq('user_id', userId)
            .eq('family_id', family.id);
        }
      } catch (error) {
        console.error('Failed to remove family membership', error);
      }
    }
    await persistFamily(null);
  }, [family, persistFamily]);

  return {
    family,
    isLoaded,
    isSyncEnabled: isSupabaseConfigured,
    createFamily,
    joinFamilyByCode,
    joinFamilyByNameAndPin,
    checkFamilyNameAvailable,
    leaveFamily,
  };
}
