
const  Group = require("../models/Group");
const  GroupMembers = require("../models/GroupMembers");
const User = require('../models/User')
const Sequelize = require('sequelize');
const {Op} = Sequelize;

// Create a new group
exports.createGroup = async (req, res) => {
    const { groupName, members } = req.body;
    const adminId = req.user.id;

    try {
        const existingGroup = await Group.findOne({ where: { name: groupName } });
        if (existingGroup) {
            return res.status(400).json({ error: "Group with that name already exists" });
        }

        const newGroup = await Group.create({ name: groupName, adminId });

        await GroupMembers.create({ groupId: newGroup.id, userId: adminId });

        if (members && members.length > 0) { 
            for (const memberEmail of members) {
                const user = await User.findOne({ where: { email: memberEmail } });
                if (user) {
                    await GroupMembers.create({ groupId: newGroup.id, userId: user.id });
                } else {
                    console.warn(`User with email ${memberEmail} not found. Skipping.`);
                }
            }
        }

        res.status(201).json({ message: "Group created successfully", groupId: newGroup.id });

    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ error: "Failed to create group. Please check server logs for details." });
    }
};

// Get all groups

exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.findAll({
            include: [{
                model: User,
                as: "members",
                attributes: ['id','name','email'],
                through: { attributes: [] }
            }],
            order: [['createdAt', 'DESC']]
        });
        const formattedGroups = groups.map(group => {
            const admin = group.members.find(member => member.id === group.adminId); // Find admin in members

            return {
                id: group.id,
                name: group.name,
                admin: admin ? { id: admin.id, name: admin.name, email: admin.email } : null,
                members: group.members.map(member => ({ id: member.id, name: member.name, email: member.email }))
            };
        });
        res.status(200).json({ groups: formattedGroups });

    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ error: "Failed to fetch groups" });
    }
};

// Add users to a group
exports.addToGroup =  async (req, res) => {
    const { groupName, members } = req.body;
    try {
        const group = await Group.findOne({ where: { name: groupName } });
        if (!group) return res.status(404).json({ error: "Group not found" });

        if (parseInt(group.adminId) !== parseInt(req.user.id)) {
            return res.status(403).json({ error: "You are not authorized to perform this action." });
        }

        for (const email of members) {
            const user = await User.findOne({ where: { email } });
            if (user) {
                await GroupMembers.create({ groupId: group.id, userId: user.id });
            }
        }

        res.status(200).json({ message: "Users added to group successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to add users to group" });
    }
};

// View group members
exports.groupMembers = async (req, res) => {
    const { groupName } = req.params;
    try {
        const group = await Group.findOne({
            where: { name: groupName },
            include: [{  // Correct include syntax
                model: User,
                as: 'members', // Important: Use the 'as' name
                through: { attributes: [] } // Exclude join table attributes
            }]
        });

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        if (!group.members) { // Check if members exist (important!)
          console.error("Group members not found, but group exists.", group);
          return res.status(500).json({ error: "Failed to fetch group members. Members are undefined." });
        }

        res.status(200).json({ users: group.members }); // Now it should work!

    } catch (error) {
        console.error("Error in groupMembers:", error); // Log the full error object
        res.status(500).json({ error: "Failed to fetch group members" });
    }
};


//remove user from group  
exports.deleteFromGroup = async (req, res) => {
    const { groupName, members } = req.body;

    try {
        const group = await Group.findOne({ where: { name: groupName } });

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        if (parseInt(group.adminId) !== parseInt(req.user.id)) {
            return res.status(403).json({ error: "You are not authorized to perform this action." });
        }

        const users = await User.findAll({
            where: { email: { [Sequelize.Op.in]: members } },
            attributes: ['id', 'email'] // Only fetch necessary attributes
        });

        if (users.length !== members.length) { // Check if all users were found
            const notFoundEmails = members.filter(email => !users.find(user => user.email === email));
            return res.status(400).json({ error: `Users with emails ${notFoundEmails.join(", ")} not found` });
        }

        const userIds = users.map(user => user.id);

        const deletedCount = await GroupMembers.destroy({
            where: {
                groupId: group.id,
                userId: { [Op.in]: userIds }
            }
        });

        if (deletedCount > 0) {
            res.status(200).json({ message: "Users removed from group successfully" });
        } else {
            res.status(200).json({ message: "No users were removed" }); // Or 400 if no users were found to remove
        }
    } catch (error) {
        console.error("Error deleting from group:", error);
        res.status(500).json({ error: "Failed to remove users from group" });
    }
};

// Delete a group (new function)
exports.deleteGroup = async (req, res) => {
    const { groupName } = req.body; // Get the group name from the request body
    const userId = req.user.id; // Get the logged-in user's ID

    try {
        const group = await Group.findOne({ where: { name: groupName } });

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        // Check if the logged-in user is the admin of the group
        if (group.adminId!== userId) { 
            return res.status(403).json({ error: "You are not authorized to delete this group" });
        }

        // Delete all members associated with the group (optional, depends on your DB setup)
        await GroupMembers.destroy({ where: { groupId: group.id } }); 

        // Delete the group
        await Group.destroy({ where: { id: group.id } }); 

        res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ error: "Failed to delete group" });
    }
};


exports.groupDetails = async (req, res) => {
    const { groupName } = req.params;

    try {
        const group = await Group.findOne({
            where: { name: groupName },
            include: [
                {
                    model: User,
                    as: "members",
                    attributes: ['id','name', 'email'],
                    through: { attributes: [] }
                }
            ]
        });

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        const admin = group.members.find(member => member.id === group.adminId);

        res.status(200).json({
            group: {
                id: group.id,
                name: group.name,
                admin: admin ? { id: admin.id, name: admin.name, email: admin.email } : null,
                members: group.members.map(member => ({ id: member.id, name: member.name, email: member.email }))
            }
        });

    } catch (error) {
        console.error("Error in groupDetails:", error);
        res.status(500).json({ error: "Failed to fetch group details" });
    }
};