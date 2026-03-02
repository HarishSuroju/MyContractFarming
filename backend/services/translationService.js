const TranslationCache = require('../models/TranslationCache');

const LIBRETRANSLATE_URL =
  process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate';
const GOOGLE_TRANSLATE_URL =
  process.env.GOOGLE_TRANSLATE_URL || 'https://translation.googleapis.com/language/translate/v2';

async function callLibreTranslate(text, fromLang, toLang) {
  const body = {
    q: text,
    source: fromLang || 'auto',
    target: toLang,
    format: 'text',
  };

  if (process.env.LIBRETRANSLATE_API_KEY) {
    body.api_key = process.env.LIBRETRANSLATE_API_KEY;
  }

  const response = await fetch(LIBRETRANSLATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`LibreTranslate failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data.translatedText;
}

async function callGoogleTranslate(text, fromLang, toLang) {
  if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
    throw new Error('Missing GOOGLE_TRANSLATE_API_KEY');
  }

  const payload = {
    q: text,
    target: toLang,
    format: 'text',
    key: process.env.GOOGLE_TRANSLATE_API_KEY,
  };

  if (fromLang && fromLang !== 'auto') {
    payload.source = fromLang;
  }

  const response = await fetch(GOOGLE_TRANSLATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Translate failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data?.data?.translations?.[0]?.translatedText;
}

async function executeProvider(text, fromLang, toLang) {
  const preferredProvider = (process.env.TRANSLATION_PROVIDER || 'libretranslate').toLowerCase();

  if (preferredProvider === 'google') {
    const translatedText = await callGoogleTranslate(text, fromLang, toLang);
    return { translatedText, provider: 'google' };
  }

  const translatedText = await callLibreTranslate(text, fromLang, toLang);
  return { translatedText, provider: 'libretranslate' };
}

async function translate(text, fromLang = 'auto', toLang) {
  const normalizedText = text?.trim();
  if (!normalizedText) throw new Error('Text is required for translation');
  if (!toLang) throw new Error('Target language is required');

  const existing = await TranslationCache.findOne({
    sourceText: normalizedText,
    fromLang,
    toLang,
  });

  if (existing) {
    return { translatedText: existing.translatedText, cacheHit: true, provider: existing.provider };
  }

  const { translatedText, provider } = await executeProvider(normalizedText, fromLang, toLang);

  await TranslationCache.findOneAndUpdate(
    { sourceText: normalizedText, fromLang, toLang },
    { sourceText: normalizedText, fromLang, toLang, translatedText, provider },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { translatedText, cacheHit: false, provider };
}

module.exports = {
  translate,
};
