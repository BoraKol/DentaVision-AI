const express = require('express');
const router = express.Router();
const {
    receiveWebhook,
    sendMessage,
    getChatHistory
} = require('../controllers/whatsappController');
const { protect } = require('../middleware/auth');

// Webhook endpoint (Public, usually authenticated via Meta/Provider signature, simplified for mock)
router.post('/webhook', receiveWebhook);

// Protected API routes for frontend
router.post('/send', protect, sendMessage);
router.get('/:patientId/history', protect, getChatHistory);

module.exports = router;
