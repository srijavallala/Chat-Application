// Importing required modules
const express = require('express'); // Web framework for Node.js
const http = require('http'); // HTTP module to create a server
const path = require('path'); // Module to handle file paths
const { Server } = require('socket.io'); // Socket.IO for real-time communication
const mongoose = require('mongoose'); // MongoDB connection library
const Message = require('./models/Message'); // Message model to interact with MongoDB
const sanitizeHtml = require('sanitize-html'); // To sanitize user input and avoid XSS attacks
require('dotenv').config(); // To load environment variables from .env file

// Initialize express app, HTTP server, and socket.io server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (like HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB using the URI stored in environment variables
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected')) // Log success
  .catch((err) => console.error('MongoDB connection error:', err)); // Log error if connection fails

// Object to track users in each room
const usersInRooms = {};

// Function to format the chat messages (bold, italic, and links)
function formatMessage(msg) {
  msg = msg.replace(/\*([^*]+)\*/g, '<strong>$1</strong>'); // *bold*
  msg = msg.replace(/_([^_]+)_/g, '<em>$1</em>'); // _italic_
  msg = msg.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>'); // link
  return msg;
}

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New user connected'); // Log when a new user connects

  // Join room handler
  socket.on('joinRoom', async (room, username) => {
    // Check if room name and username are provided
    if (!room || !username) {
      socket.emit('joinError', 'Room name and username are required!');
      return;
    }

    // Initialize the room in the usersInRooms object if it doesn't exist
    if (!usersInRooms[room]) usersInRooms[room] = [];

    // Prevent username duplication within the same room
    if (usersInRooms[room].includes(username)) {
      socket.emit('joinError', 'Username already taken in this room.');
      return;
    }

    // Add the user to the room and join the room in socket
    usersInRooms[room].push(username);
    socket.join(room);
    socket.username = username;
    socket.room = room;

    socket.emit('joinSuccess'); // Emit join success to the user

    // Fetch previous messages from the database and send them to the user
    try {
      const previousMessages = await Message.find({ room }).sort({ timestamp: 1 }).limit(100);
      previousMessages.forEach((msg) => {
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formatted = msg.type === 'system'
          ? `${time} — ${msg.message}`
          : `${time} — ${msg.username}: ${msg.message}`;
        socket.emit('message', formatted);
      });
    } catch (error) {
      console.error('Error fetching previous messages:', error); // Log error if fetching fails
    }

    // Send welcome message (system message)
    const welcomeMessage = new Message({
      room,
      username,
      message: `Welcome ${username}!`,
      type: 'system'
    });
    await welcomeMessage.save(); // Save the welcome message to MongoDB
    socket.emit('message', `Welcome ${username}!`);

    // Notify others that a user has joined the room
    const joinMessage = new Message({
      room,
      username,
      message: `${username} has joined the room`,
      type: 'system'
    });
    await joinMessage.save(); // Save the join message to MongoDB
    socket.to(room).emit('message', `${username} has joined the room`);

    // Emit updated user list to everyone in the room
    io.to(room).emit('userList', usersInRooms[room]);
  });

  // Chat message handler
  socket.on('chatMessage', async (room, data) => {
    // Sanitize the message to prevent XSS attacks
    const sanitizedMessage = sanitizeHtml(data.message, {
      allowedTags: ['b', 'i', 'strong', 'em', 'a'],
      allowedAttributes: { 'a': ['href', 'target'] }
    });

    try {
      // Create a new message document and save it to MongoDB
      const messageDoc = new Message({
        room,
        username: data.username,
        message: sanitizedMessage,
        type: 'user'
      });

      await messageDoc.save(); // Save the message to the database

      // Format the message with timestamp
      const time = new Date(messageDoc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formattedMsg = `${time} — ${data.username}: ${formatMessage(data.message)}`;
      io.to(room).emit('message', formattedMsg); // Emit the message to the room
    } catch (error) {
      console.error('Error saving message:', error); // Log error if saving fails
    }
  });

  // Typing indicator handler
  socket.on('typing', (username) => {
    if (socket.room) {
      socket.to(socket.room).emit('typing', username); // Notify others that the user is typing
    }
  });

  // Stop typing indicator handler
  socket.on('stopTyping', () => {
    if (socket.room) {
      socket.to(socket.room).emit('stopTyping'); // Notify others to stop typing
    }
  });

  // Disconnect handler
  socket.on('disconnect', async () => {
    const room = socket.room;
    const username = socket.username;

    // If the user was part of a room, remove them from the room and update user list
    if (room && username && usersInRooms[room]) {
      usersInRooms[room] = usersInRooms[room].filter(user => user !== username);

      if (usersInRooms[room].length === 0) {
        delete usersInRooms[room]; // Delete the room if no users are left
      } else {
        // Notify the room that the user has left
        const leaveMsg = new Message({
          room,
          username,
          message: `${username} has left the room`,
          type: 'system'
        });
        await leaveMsg.save(); // Save the leave message to MongoDB

        io.to(room).emit('userList', usersInRooms[room]); // Emit updated user list
        socket.to(room).emit('message', `${username} has left the room`); // Emit leave message
      }
    }
  });
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000'); // Log server start
});
