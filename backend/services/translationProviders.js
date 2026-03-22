const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate';

// Simple in-memory circuit-breaker per provider
const breakerState = {}; // { [provider]: { failures, openUntil } }
const BREAKER_FAILURES = parseInt(process.env.TRANSLATION_BREAKER_FAILURES || '5', 10);
const BREAKER_RESET_MS = parseInt(process.env.TRANSLATION_BREAKER_RESET_MS || '60000', 10);

function isBreakerOpen(provider) {
  const st = breakerState[provider];
  if (!st) return false;
  if (st.openUntil && Date.now() < st.openUntil) return true;
  return false;
}

function recordFailure(provider) {
  const st = breakerState[provider] || { failures: 0 };
  st.failures = (st.failures || 0) + 1;
  if (st.failures >= BREAKER_FAILURES) {
    st.openUntil = Date.now() + BREAKER_RESET_MS;
    st.failures = 0; // reset failure counter after tripping
    console.warn(`Circuit breaker opened for provider ${provider} until ${new Date(st.openUntil).toISOString()}`);
  }
  breakerState[provider] = st;
}

function recordSuccess(provider) {
  breakerState[provider] = { failures: 0 };
}

async function fetchWithTimeout(url, opts = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function callLibreTranslate(text, fromLang, toLang, timeoutMs = 5000) {
  const provider = 'libre';
  if (isBreakerOpen(provider)) {
    throw new Error('Circuit breaker open for LibreTranslate');
  }

  const body = {
    q: text,
    source: fromLang || 'auto',
    target: toLang,
    format: 'text',
  };

  if (process.env.LIBRETRANSLATE_API_KEY) {
    body.api_key = process.env.LIBRETRANSLATE_API_KEY;
  }

  try {
    const response = await fetchWithTimeout(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, timeoutMs);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`LibreTranslate failed: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    recordSuccess(provider);
    return data.translatedText;
  } catch (err) {
    recordFailure(provider);
    throw err;
  }
}

const ARGOS_URL = process.env.ARGOS_URL || 'http://localhost:8000/translate';

async function callArgosTranslate(text, fromLang, toLang, timeoutMs = 5000) {
  const provider = 'argos';
  if (isBreakerOpen(provider)) {
    throw new Error('Circuit breaker open for Argos Translate');
  }

  const body = {
    text,
    source: fromLang || 'auto',
    target: toLang,
  };

  try {
    const response = await fetchWithTimeout(ARGOS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, timeoutMs);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Argos Translate failed: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    // Expecting { translatedText }
    const translated = data.translatedText || data.translation || data.result || '';
    recordSuccess(provider);
    return translated;
  } catch (err) {
    recordFailure(provider);
    throw err;
  }
}

module.exports = {
  libre: {
    translate: (text, from, to, opts = {}) => callLibreTranslate(text, from, to, opts.timeoutMs),
  },
  argos: {
    translate: (text, from, to, opts = {}) => callArgosTranslate(text, from, to, opts.timeoutMs),
  }
};

