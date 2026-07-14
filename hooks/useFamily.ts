import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { FAMILY_STORAGE_KEY } from '../constants/storage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Family } from '../types/family';
import { generateInviteCode } from '../utils/inviteCode';

type UseFamilyResult = {
  family: Family | null;
  isLoaded: boolean;
  isSyncEnabled: boolean;
  createFamily: (name: string) => Promise<Family>;
  joinFamily: (inviteCode: string) => Promise<Family>;
  leaveFamily: () => Promise<void>;
};

const toFamily = (row: { id: string; name: string; invite_code: string }): Family => ({
  id: row.id,
  name: row.name,
  inviteCode: row.invite_code,
});

export function useFamily(): UseFamilyResult {
  const [family, setFamily] = useState<Family | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadFamily = async () => {
      try {
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
    async (name: string) => {
      if (!isSupabaseConfigured || !supabase) {
        const localFamily: Family = {
          id: `local-${Date.now()}`,
          name: name.trim(),
          inviteCode: generateInviteCode(),
        };
        await persistFamily(localFamily);
        return localFamily;
      }

      let inviteCode = generateInviteCode();
      let attempts = 0;

      while (attempts < 5) {
        const { data, error } = await supabase
          .from('families')
          .insert({ name: name.trim(), invite_code: inviteCode })
          .select('id, name, invite_code')
          .single();

        if (!error && data) {
          const created = toFamily(data);
          await persistFamily(created);
          return created;
        }

        if (error?.code === '23505') {
          inviteCode = generateInviteCode();
          attempts += 1;
          continue;
        }

        throw new Error(error?.message ?? 'Oilani yaratib bo\'lmadi');
      }

      throw new Error('Taklif kodi yaratib bo\'lmadi');
    },
    [persistFamily]
  );

  const joinFamily = useCallback(
    async (inviteCode: string) => {
      const normalizedCode = inviteCode.trim().toUpperCase();

      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Bulut sinxronizatsiyasi sozlanmagan');
      }

      const { data, error } = await supabase
        .from('families')
        .select('id, name, invite_code')
        .eq('invite_code', normalizedCode)
        .single();

      if (error || !data) {
        throw new Error('Taklif kodi topilmadi');
      }

      const joined = toFamily(data);
      await persistFamily(joined);
      return joined;
    },
    [persistFamily]
  );

  const leaveFamily = useCallback(async () => {
    await persistFamily(null);
  }, [persistFamily]);

  return {
    family,
    isLoaded,
    isSyncEnabled: isSupabaseConfigured,
    createFamily,
    joinFamily,
    leaveFamily,
  };
}
