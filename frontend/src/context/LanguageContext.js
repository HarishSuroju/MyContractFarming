import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import i18n from '../i18n';
import { authAPI } from '../services/api';
import { getToken } from '../utils/authStorage';

const DEFAULT_LANGUAGE = 'en';
const STORAGE_KEY = 'acf_language';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem(STORAGE_KEY) || i18n.language || DEFAULT_LANGUAGE
  );

  const setLanguage = async (language, shouldSyncToServer = true) => {
    if (!language) return;

    await i18n.changeLanguage(language);
    setCurrentLanguage(language);
    localStorage.setItem(STORAGE_KEY, language);

    if (shouldSyncToServer && getToken()) {
      try {
        await authAPI.updatePreferredLanguage(language);
      } catch (error) {
        console.error('Failed to sync preferred language:', error);
      }
    }
  };

  useEffect(() => {
    const hydratePreferredLanguage = async () => {
      if (!getToken()) return;

      try {
        const response = await authAPI.getProfile();
        const preferred = response?.data?.data?.user?.preferredLanguage;

        if (preferred && preferred !== currentLanguage) {
          await setLanguage(preferred, false);
        }
      } catch (error) {
        console.error('Failed to fetch preferred language:', error);
      }
    };

    hydratePreferredLanguage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(
    () => ({ currentLanguage, setLanguage }),
    [currentLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
