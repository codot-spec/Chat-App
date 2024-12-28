const User = require('../models/users');
const bcrypt = require('bcryptjs');


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
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error in adding user:", err);
    res.status(500).json({ message: "Failed to add user" });
  }
};
