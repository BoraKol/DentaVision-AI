const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const enabizController = require('../controllers/enabizController');

console.log('✅ E-Nabız router initialized');

// All routes are protected
router.use(protect);

// @desc    Send a specific treatment to E-Nabız
// @route   POST /api/enabiz/send/treatment/:id
// @access  Private
router.post('/send/treatment/:id', enabizController.sendTreatmentToENabiz);

// @desc    Get E-Nabız logs
// @route   GET /api/enabiz/logs
// @access  Private
router.get('/logs', enabizController.getLogs);

module.exports = router;
