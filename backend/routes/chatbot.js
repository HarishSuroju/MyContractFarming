const express = require("express");
const { handleChatbotMessage } = require("../controllers/chatbotController.js");

const router = express.Router();

router.post("/", handleChatbotMessage);

module.exports = router;