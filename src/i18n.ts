import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Çevirileri içe aktarma
import translationEN from './locales/en/translation.json';
import translationTR from './locales/tr/translation.json';

// Kaynaklar
const resources = {
  en: {
    translation: translationEN
  },
  tr: {
    translation: translationTR
  }
};

i18n
  // Dil algılama eklentisi
  .use(LanguageDetector)
  // React için i18next başlatma
  .use(initReactI18next)
  // Başlangıç yapılandırması
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // React zaten XSS'e karşı güvenli
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
