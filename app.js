const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const http = require('http');  // Import http module for socket.io
const socketIo = require('socket.io');  // Import socket.io
const cors = require('cors');
const path = require('path');
const sequelize = require('./util/database');
const User = require('./models/User');
const Forgotpasswords = require('./models/forgotPassword');
const Message = require('./models/Message');
const Group = require("./models/Group");
const GroupMembers = require('./models/GroupMembers');
const ArchivedChat = require('./models/archived-chat');

const cronService = require('./services/cron');
cronService.job.start();

const chatRoute = require('./routes/chat');
const userRoute = require('./routes/users');
const groupRoute = require("./routes/group");
const resetPasswordRoutes = require('./routes/resetpassword')

const app = express();
const server = http.createServer(app);  // Create an HTTP server
const io = socketIo(server);  // Initialize socket.io with the server

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login','login.html'));  // Serve 'login.html' from 'public/login' folder
});
app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', userRoute);
app.use('/chat', chatRoute);
app.use('/group', groupRoute);
app.use('/password', resetPasswordRoutes);

// Define the relationships
User.hasMany(Forgotpasswords);
Forgotpasswords.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });

User.belongsToMany(Group, {
  through: GroupMembers,
  foreignKey: 'userId',
   as: 'members'
});

Group.belongsToMany(User, {
  through: GroupMembers,
  foreignKey: 'groupId',
   as: 'members'
});

User.hasMany(Message, {
  foreignKey: 'senderId',
  as: 'messagesSent',
});

Group.hasMany(Message, {
  foreignKey: 'groupId',
  as: 'messages',
});

Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender',
});

Message.belongsTo(Group, {
  foreignKey: 'groupId',
  as: 'group',
});

Message.hasOne(ArchivedChat, { foreignKey: 'messageId' });
ArchivedChat.belongsTo(Message, { foreignKey: 'messageId' });


// Socket.IO Setup
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for the event to get messages for a group
  socket.on('getMessages', async (groupName) => {
    try {
      // Fetch the group from the database
      const group = await Group.findOne({ where: { name: groupName } });

      if (!group) {
        socket.emit('messages', { error: 'Group not found' });
        return;
      }

      // Fetch messages for the group from the database
      const messages = await Message.findAll({
        where: { groupId: group.id },
        include: [
          {
            model: User,
            as: 'sender', // Assuming 'sender' is an alias for the User model
            attributes: ['name'], // Get only the 'name' of the sender
          },
        ],
        order: [['createdAt', 'ASC']], // Order messages by createdAt
      });

      // Send the messages back to the client
      const messageData = messages.map((message) => ({
        name: message.sender.name,
        message: message.message,
        file: message.file,
      }));

      io.emit('messages', messageData);
    } catch (error) {
      console.error('Error fetching messages:', error);
      socket.emit('messages', { error: 'Failed to fetch messages' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Sync database and start server
sequelize.sync() 
  .then(() => {
    // Use `server.listen` to use both Express and Socket.IO together
    server.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.error('Error syncing the database:', err);
  });
