const axios = require("axios");
const { detectLanguage } = require("../utils/languageDetect.js");

const handleChatbotMessage = async (req, res) => {
  const message = req.body.message?.trim();
  if (!message) return res.status(400).json({ reply: "Message is empty" });

  const detectedLang = detectLanguage(message);

  try {
    // Using gemini-3-flash-preview (2026 Standard)
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await axios.post(
      API_URL,
      {
        // SYSTEM INSTRUCTIONS: Tells the bot HOW to behave
        system_instruction: {
          parts: [{
            text: `You are an expert Farming Assistant. 
            1. Always respond in ${detectedLang}.
            2. For new questions, give a short, high-level summary (max 3 sentences).
            3. If the user asks for "more detail," "explain further," or "elaborate," then provide a structured response with Markdown tables and bullet points.
            4. Keep the tone professional but accessible to farmers.`
          }]
        },
        contents: [{
          parts: [{ text: message }]
        }]
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    res.json({ reply });
  } catch (error) {
    console.error("Gemini Error:", error.response?.data || error.message);
    res.status(500).json({ reply: "The farming service is temporarily offline." });
  }
};

module.exports = { handleChatbotMessage };