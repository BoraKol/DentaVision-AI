const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', analysisController.createAnalysis);
router.get('/patient/:patientId', analysisController.getPatientAnalyses);

module.exports = router;
