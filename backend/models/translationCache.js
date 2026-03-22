const mongoose = require('mongoose');

const translationCacheSchema = new mongoose.Schema(
  {
    sourceText: { type: String, required: true, trim: true },
    fromLang: { type: String, required: true, default: 'auto' },
    toLang: { type: String, required: true },
    translatedText: { type: String, required: true },
    provider: { type: String, default: 'libretranslate' },
  },
  { timestamps: true }
);

translationCacheSchema.index({ sourceText: 1, fromLang: 1, toLang: 1 }, { unique: true });

module.exports = mongoose.model('TranslationCache', translationCacheSchema);