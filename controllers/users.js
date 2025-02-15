const User = require('../models/User');
const Group = require('../models/Group');
const GroupMembers = require('../models/GroupMembers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userController=require('./users');

exports.signup = async (req, res ) => {
  try {
    const { name, email, phonenumber, password } = req.body;

    if (!name || !email  || !phonenumber || !password) {
      return res.status(400).json({ message: "Name, email, phonenumber and password are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(403).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

   const newUser = await User.create({ name, email, phonenumber, password: hashedPassword});
   console.log(newUser); 
  return res.status(201).json({message: "Successfully Signed Up"});
  } catch (err) {
    console.error("Error in adding user:", err);
    res.status(500).json({ message: "Failed to add user" });
  }
};

// Generate JWT token (with isPremium field included)
exports.generateAccessToken = (id, name) => {
  return jwt.sign({ userId: id, name: name},process.env.TOKEN_SECRET);
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // User not found
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect) {
      // Password matches

      // Generate the JWT token inside this function
      const token = userController.generateAccessToken(user.id, user.name, user.email);  // <-- This line is the fix

      return res.status(200).json({
        message: 'User login successful',
        token: token,
        user: {        // Send user details
          id: user.id,
          name: user.name,
          email: user.email,  // Include email or any other relevant user data
        }
    });
    } else {
      // Incorrect password
      return res.status(401).json({ message: 'User not authorized' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all users function
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.findAll(); // This assumes you're using Sequelize. Modify as needed if using Mongoose or another ORM.

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    return res.status(200).json({ users });
  } catch (err) {
    console.error('Error in fetching users:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Edit User functionality
exports.editUser = async (req, res) => {
  try {
      const userId = req.params.userId;
      const { name, email, password, phonenumber } = req.body; // Added phoneNumber

      const user = await User.findByPk(userId);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      if (req.user.id !== user.id) {
          return res.status(403).json({ message: 'You can only edit your own profile' });
      }

      if (name) user.name = name;
      if (email) user.email = email;
      if (phonenumber) user.phonenumber = phonenumber; // Update phone number

      if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
      }

      await user.save();

      res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.userId;

  try {
      const user = await User.findByPk(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      if (req.user.id !== user.id) {
          return res.status(403).json({ message: 'You can only delete your own profile' });
      }

      // 1. Check if the user is an admin of any groups
      const groups = await Group.findAll({ where: { adminId: userId } });

      // 2. Delete the user's groups (and associated members) if they are an admin
      if (groups.length > 0) {
          for (const group of groups) {
              await GroupMembers.destroy({ where: { groupId: group.id } });
              await Group.destroy({ where: { id: group.id } });
          }
      }

      // 3. Delete the user's profile
      await user.destroy();

      res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
  }
};


exports.fetchUserProfile = async (req, res) => {
  try {
      const userId = req.params.userId;
      const user = await User.findByPk(userId);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const userProfile = {
          id: user.id,
          name: user.name,
          email: user.email,
          phonenumber: user.phonenumber, // Include phone number
      };

      res.status(200).json(userProfile);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
  }
};

