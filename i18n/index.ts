import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { DEFAULT_LANGUAGE, isLanguageCode, LOCALE_MAP, type LanguageCode } from './languages';

import en from '../locales/en.json';
import uz from '../locales/uz.json';
import ru from '../locales/ru.json';
import ko from '../locales/ko.json';
import zh from '../locales/zh.json';
import hi from '../locales/hi.json';
import es from '../locales/es.json';
import ar from '../locales/ar.json';
import fr from '../locales/fr.json';
import bn from '../locales/bn.json';
import pt from '../locales/pt.json';
import ur from '../locales/ur.json';
import id from '../locales/id.json';
import de from '../locales/de.json';
import ja from '../locales/ja.json';
import tr from '../locales/tr.json';
import vi from '../locales/vi.json';
import it from '../locales/it.json';
import fa from '../locales/fa.json';
import pl from '../locales/pl.json';
import uk from '../locales/uk.json';
import th from '../locales/th.json';
import nl from '../locales/nl.json';
import ms from '../locales/ms.json';
import tl from '../locales/tl.json';

const resources = {
  en: { translation: en },
  uz: { translation: uz },
  ru: { translation: ru },
  ko: { translation: ko },
  zh: { translation: zh },
  hi: { translation: hi },
  es: { translation: es },
  ar: { translation: ar },
  fr: { translation: fr },
  bn: { translation: bn },
  pt: { translation: pt },
  ur: { translation: ur },
  id: { translation: id },
  de: { translation: de },
  ja: { translation: ja },
  tr: { translation: tr },
  vi: { translation: vi },
  it: { translation: it },
  fa: { translation: fa },
  pl: { translation: pl },
  uk: { translation: uk },
  th: { translation: th },
  nl: { translation: nl },
  ms: { translation: ms },
  tl: { translation: tl },
};

function detectDeviceLanguage(): LanguageCode {
  const locales = Localization.getLocales();
  const deviceLang = locales[0]?.languageCode?.toLowerCase();

  if (deviceLang && isLanguageCode(deviceLang)) {
    return deviceLang;
  }

  // Map common variants
  const variantMap: Record<string, LanguageCode> = {
    'zh-hans': 'zh',
    'zh-hant': 'zh',
    'pt-br': 'pt',
    'pt-pt': 'pt',
  };

  const fullTag = locales[0]?.languageTag?.toLowerCase();
  if (fullTag && variantMap[fullTag]) {
    return variantMap[fullTag];
  }

  return DEFAULT_LANGUAGE;
}

export const LOCALE_STORAGE_KEY = 'xarajat_locale_pref';
export const LOCALE_CHOSEN_KEY = 'xarajat_locale_chosen';

let initialized = false;

export function initI18n(language: LanguageCode) {
  if (initialized) {
    i18n.changeLanguage(language);
    return i18n;
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });

  initialized = true;
  return i18n;
}

export function getDeviceLanguage(): LanguageCode {
  return detectDeviceLanguage();
}

export function getLocaleTag(code: LanguageCode): string {
  return LOCALE_MAP[code] ?? LOCALE_MAP.en;
}

export { i18n };
export default i18n;
