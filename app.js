const express = require('express');
const app = express();

const cors = require('cors');

const sequelize = require('./util/database');
const User = require('./models/users');
const Message = require('./models/chatFront');

const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chatFront')

app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);
app.use('/chat',chatRoutes)

User.hasMany(Message);
Message.belongsTo(User);

sequelize.sync()
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.error(err);
  });
