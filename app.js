const express = require('express');
const app = express();

const cors = require('cors');

const sequelize = require('./util/database');
const User = require('./models/users');

const userRoutes = require('./routes/users');

app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);


sequelize.sync()
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.error(err);
  });
