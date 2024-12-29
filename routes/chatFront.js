const express = require('express');
const chatController = require('../controllers/chatFront');


const router = express.Router();

router.post('/message',chatController.addMessage);

module.exports = router;