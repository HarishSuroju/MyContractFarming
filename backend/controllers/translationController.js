const { translate } = require('../services/translationService');

const translateDynamicText = async (req, res) => {
  try {
    const { text, fromLang = 'auto', toLang } = req.body;

    if (!text || !toLang) {
      return res.status(400).json({
        status: 'error',
        message: 'text and toLang are required',
      });
    }

    const result = await translate(text, fromLang, toLang);

    res.status(200).json({
      status: 'success',
      data: {
        text,
        fromLang,
        toLang,
        translatedText: result.translatedText,
        cacheHit: result.cacheHit,
      },
    });
  } catch (error) {
    console.error('Dynamic translation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to translate text',
    });
  }
};

module.exports = { translateDynamicText };