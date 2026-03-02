const express = require('express');
const { translateDynamicText } = require('../controllers/translationController');

const router = express.Router();

router.post('/dynamic', translateDynamicText);

module.exports = router;