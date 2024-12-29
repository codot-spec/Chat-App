const express = require('express');
const chatController = require('../controllers/chatFront');

const router = express.Router();

const authenticateToken = require('../middleware/auth');

router.post('/message', authenticateToken, chatController.addMessage);
router.get('/messages', authenticateToken, chatController.getMessages);


module.exports = router;
