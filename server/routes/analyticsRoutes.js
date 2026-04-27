const express = require('express');
const router = express.Router();
const { getAnalyticsSummary, getDailyBreakdown, getCancellationRate } = require('../controllers/analyticsController');

router.get('/summary', getAnalyticsSummary);
router.get('/daily', getDailyBreakdown);
router.get('/cancellation-rate', getCancellationRate);

module.exports = router;