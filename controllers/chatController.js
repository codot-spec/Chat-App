
const  Message = require("../models/Message");
const  Group = require("../models/Group");
const  User = require("../models/User");
const { Op } = require("sequelize");
const { uploads } = require('../services/aws');


// Send a message to a group
exports.saveChat = async (req, res) => {
    const { message, groupName } = req.body;
    const imageFile = req.file;
    const senderId = req.user.id;

    try {
        const group = await Group.findOne({ where: { name: groupName } });
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        let fileUrl = null;
        if (imageFile) { // Only try to upload if a file was actually sent
            try {
                fileUrl = await uploads(imageFile); // Await the upload
            } catch (uploadError) {
                console.error("File upload error:", uploadError); // Log the upload error
                return res.status(500).json({ error: "File upload failed" }); // Return a 500 if the upload fails
            }
        }

        // If no message was provided, set a default message (e.g., "File sent")
        const messageToSave = message || "File sent";

        const newMessage = await Message.create({
            message: messageToSave,  // If the message is empty, use default text
            file: fileUrl,           // Use the file URL or null if no file
            senderId,
            groupId: group.id,
        });

        res.status(201).json({ message: "Message sent successfully", newMessage });

    } catch (error) {
        console.error("Error saving message:", error); // Log the full error object
        res.status(500).json({ error: "Failed to send message. Please check server logs." }); // More specific error message
    }
};

// Get messages for a group
exports.getChat = async (req, res) => {
    const { groupName } = req.params;

    try {
        const group = await Group.findOne({ where: { name: groupName } });
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        const messages = await Message.findAll({
            where: { groupId: group.id },
            include: [{ 
                model: User, 
                as: "sender", // Important: Use the correct alias
                attributes: ["name"] 
            }],
            order: [['createdAt', 'ASC']] // Add ordering if needed
        });

        res.status(200).json({ messages });

    } catch (error) {
        console.error("Error fetching messages:", error); // Log the full error
        res.status(500).json({ error: "Failed to fetch messages. Please check server logs." }); // More informative message
    }
};