const chatFront = require('../models/chatFront');
const User = require('../models/users');
const sequelize = require('../util/database');

// Add a new message
exports.addMessage = async (req, res, next) => {
    const { message } = req.body;
    try {
        const newMessage = await chatFront.create({
            message: message,
            name: req.user.name // Assumes the 'req.user' contains the user's details after authentication
        });

        res.status(201).json({
            message: newMessage.message,
            name: newMessage.name
        });
    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({ message: 'Error adding message', error: error.message });
    }
};

// Get all messages
exports.getMessages = async (req, res) => {
    try {
        const messages = await chatFront.findAll({
            order: [['createdAt', 'ASC']], // Messages sorted by time in ascending order
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};
