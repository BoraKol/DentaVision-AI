const express = require('express');
const router = express.Router();
const {
    receiveWebhook,
    sendMessage,
    getChatHistory,
    getStatus,
    connect,
    disconnect
} = require('../controllers/whatsappController');
const { protect } = require('../middleware/auth');

// Webhook endpoint (Public)
router.post('/webhook', receiveWebhook);

// WhatsApp Connection Management (Protected)
router.get('/status', protect, getStatus);
router.post('/connect', protect, connect);
router.post('/disconnect', protect, disconnect);

// Protected API routes for frontend
router.post('/send', protect, sendMessage);
router.get('/:patientId/history', protect, getChatHistory);

module.exports = router;
