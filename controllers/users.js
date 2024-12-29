const User = require('../models/users');
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
  return jwt.sign({ userId: id, name: name}, 'secretkey');
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
      const token = userController.generateAccessToken(user.id, user.name);  // <-- This line is the fix

      return res.status(200).json({
        message: 'User login successful',
        token: token // Send the token to the client
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


