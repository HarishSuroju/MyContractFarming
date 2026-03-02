const TranslationCache = require('../models/TranslationCache');

const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate';

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
    throw new Error(`Translation provider failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data.translatedText;
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
    return { translatedText: existing.translatedText, cacheHit: true };
  }

  const translatedText = await callLibreTranslate(normalizedText, fromLang, toLang);

  await TranslationCache.findOneAndUpdate(
    { sourceText: normalizedText, fromLang, toLang },
    { sourceText: normalizedText, fromLang, toLang, translatedText, provider: 'libretranslate' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { translatedText, cacheHit: false };
}

module.exports = {
  translate,
};