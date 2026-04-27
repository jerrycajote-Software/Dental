const express = require('express');
const router = express.Router();
const { getMedicalRecords, getMedicalRecordById, createMedicalRecord, updateMedicalRecord } = require('../controllers/medicalController');

router.get('/records', getMedicalRecords);
router.get('/records/:id', getMedicalRecordById);
router.post('/records', createMedicalRecord);
router.put('/records/:id', updateMedicalRecord);

module.exports = router;