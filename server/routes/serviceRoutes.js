const express = require('express');
const router = express.Router();
const { getServices, getDentists } = require('../controllers/serviceController');

router.get('/', getServices);
router.get('/dentists', getDentists);

module.exports = router;
