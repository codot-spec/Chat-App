const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const userAuthentication = require("../middleware/auth");

const multer = require('multer');

const storage = multer.memoryStorage();

// Initialize multer with the memory storage configuration
const upload = multer({ storage: storage });

router.post('/sendMessage',userAuthentication.authenticate,upload.single('image'),chatController.saveChat);
router.get('/messages/:groupName',userAuthentication.authenticate,chatController.getChat);

module.exports = router;

