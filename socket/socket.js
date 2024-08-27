const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);
  
  // Notify that the user is connected
  socket.emit("user-connected");

  // Add user to the online users list
  socket.on("user-online", (user) => {
    if (user && !onlineUsers.includes(user)) {
      onlineUsers.push(user);
      io.emit("users-online", onlineUsers); // Emit to all clients
    }
  });

  // Remove user from the online users list
  socket.on("user-loggedout", (username) => {
    onlineUsers = onlineUsers.filter(usr => usr !== username);
    io.emit("users-online", onlineUsers); // Emit updated list to all clients
  });

  // Handle sending and receiving messages
  socket.on('send-message', (message) => {
    io.to(message.receiver_id).emit("receive-message", message); // Emit message to receiver
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter(user => user !== socket.id);
    io.emit("users-online", onlineUsers); // Emit updated list to all clients
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
