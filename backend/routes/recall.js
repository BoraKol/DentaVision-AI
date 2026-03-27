const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const recallController = require('../controllers/recallController');

console.log('✅ Recall/CRM router initialized');

// All routes are protected
router.use(protect);

// @desc    Get recall candidates (patients who haven't visited)
// @route   GET /api/recall/candidates
router.get('/candidates', recallController.getRecallCandidates);

// @desc    Send WhatsApp recall reminder
// @route   POST /api/recall/send-reminder
router.post('/send-reminder', recallController.sendRecallReminder);

// @desc    Get recall statistics
// @route   GET /api/recall/stats
router.get('/stats', recallController.getRecallStats);

// @desc    Get recall logs
// @route   GET /api/recall/logs
router.get('/logs', recallController.getRecallLogs);

// @desc    Update recall log status
// @route   PUT /api/recall/logs/:id
router.put('/logs/:id', recallController.updateRecallLog);

module.exports = router;
