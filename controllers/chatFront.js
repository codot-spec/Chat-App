const chatFront = require('../models/chatFront')

const sequelize = require('../util/database')

exports.addMessage = async (req, res, next ) => {
  const t = await sequelize.transaction();
  const { message } = req.body;
  
  try {
    const newMessage = await chatFront.create(
      { message, name: req.user.name },
      {transaction : t});
   
     await t.commit();
    res.status(201).json(newMessage);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Error adding expense', error: error.message });
  }
};