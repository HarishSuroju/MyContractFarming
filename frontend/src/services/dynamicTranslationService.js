import { translationAPI } from './api';

const memoryCache = new Map();

const getCacheKey = (text, fromLang, toLang) => `${fromLang}:${toLang}:${text}`;

export const translateDynamicText = async ({ text, fromLang = 'auto', toLang }) => {
  const normalizedText = text?.trim();
  if (!normalizedText || !toLang) return text;

  const cacheKey = getCacheKey(normalizedText, fromLang, toLang);
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  const response = await translationAPI.translateDynamic({
    text: normalizedText,
    fromLang,
    toLang,
  });

  const translated = response?.data?.data?.translatedText || normalizedText;
  memoryCache.set(cacheKey, translated);
  return translated;
};
