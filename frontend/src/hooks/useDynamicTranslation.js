import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateDynamicText } from '../services/dynamicTranslationService';

export const useDynamicTranslation = (text, sourceLanguage = 'auto') => {
  const { currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    let active = true;

    const translate = async () => {
      if (!text || currentLanguage === sourceLanguage) {
        setTranslatedText(text);
        return;
      }

      try {
        const output = await translateDynamicText({
          text,
          fromLang: sourceLanguage,
          toLang: currentLanguage,
        });
        if (active) setTranslatedText(output);
      } catch (error) {
        console.error('Dynamic translation failed:', error);
        if (active) setTranslatedText(text);
      }
    };

    translate();
    return () => {
      active = false;
    };
  }, [text, sourceLanguage, currentLanguage]);

  return translatedText;
};
