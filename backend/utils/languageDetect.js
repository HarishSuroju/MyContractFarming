const detectLanguage = (text) => {
  if (/[ऀ-ॿ]/.test(text)) return "Hindi";
  if (/[ఀ-౿]/.test(text)) return "Telugu";
  if (/[஀-௿]/.test(text)) return "Tamil";
  return "English";
};

module.exports = { detectLanguage };