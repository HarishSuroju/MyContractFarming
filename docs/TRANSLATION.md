**Translation subsystem**

Files

- `backend/services/translationService.js`: orchestrates translation requests, checks cache, applies retries/timeouts, and falls back between providers.
- `backend/services/translationProviders.js`: provider implementations (LibreTranslate + local Argos) and circuit-breaker.
- `backend/models/translationCache.js`: Mongoose schema for cached translations (unique index on `sourceText, fromLang, toLang`).
- `backend/services/translationMetrics.js`: simple in-memory counters for provider usage and cache hits/misses.

How it works

1. Incoming request hits `POST /api/translations/dynamic`.
2. `translationService.translate()` normalizes text and checks `TranslationCache`.
3. If cache miss, it attempts providers in order (configurable): primary provider → Argos (local) → LibreTranslate.
4. Each provider call uses a timeout and retry loop; the provider has a simple circuit-breaker to avoid repeated failures.
5. On success the translation is stored in cache with `provider` info.

Environment variables

- `TRANSLATION_PROVIDER` — primary provider name (default `libre`).
- `TRANSLATION_PREFER_ARGOS` — when `true` prefer `argos` provider in fallback order (default true).
- `ARGOS_URL` — URL of local Argos translate server (default `http://localhost:8000/translate` / inside docker `http://argos:8000/translate`).
- `LIBRETRANSLATE_URL` — LibreTranslate endpoint URL.
- `LIBRETRANSLATE_API_KEY` — optional API key for LibreTranslate.
- `TRANSLATION_TIMEOUT_MS`, `TRANSLATION_RETRIES` — retry/timeouts for provider calls.
- `TRANSLATION_BREAKER_FAILURES`, `TRANSLATION_BREAKER_RESET_MS` — circuit-breaker tuning.

Self-hosting Argos / LibreTranslate

- Argos Translate: has a community Docker image and instructions — the compose file includes an `argos` service to run locally.
- LibreTranslate: you can self-host via the official Docker image or use the public endpoint (note privacy and rate limits).

Notes & recommendations

- Glossary support (term preservation) is not implemented — consider adding a glossary DB and apply term replacements before sending text to providers.
- For heavy loads, consider offloading translations to a background worker (Redis + BullMQ) and returning async job IDs.
- Export `translationMetrics.snapshot()` via an admin-only endpoint for monitoring and alerts.
