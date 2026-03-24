const express = require('express');
const router = express.Router();
const { getAIChatResponse } = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/chat', authMiddleware, getAIChatResponse);

module.exports = router;
