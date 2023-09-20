'use strict';

require ('dotenv').config();
const port = process.env.PORT || 3000;
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
app.use(cors());
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.use(express.static('frontend'));

const general = [];
const random = [];
const rooms = {};

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  // chat section 
  
  socket.on('joinRoom', (room) => {
    socket.join(room);

    if (room === 'general') {
      socket.emit('chat message', general);
    } else if (room === 'random') {
      socket.emit('chat message', random);
    }

    console.log('joined room:', room);
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected', socket.id);
  });

  socket.on('chat message general', (msg) => {
    console.log('message: ', msg);

    general.push(msg);
    msg.time = new Date().toLocaleTimeString();
    io.to('general').emit('chat message', general);

  });

  socket.on('chat message random', (msg) => {
    console.log('message: ', msg);

    random.push(msg);
    msg.time = new Date().toLocaleTimeString();
    io.to('random').emit('chat message', random);

  });

  // WebRTC section

  socket.on("join videochat room", (roomID) => {
    console.log('joined videochat room: ', roomID);
    if (rooms[roomID]) {
        rooms[roomID].push(socket.id);
    } else {
        rooms[roomID] = [socket.id];
    }
    const otherUser = rooms[roomID].find(id => id !== socket.id);
    if (otherUser) {
        socket.emit("other user", otherUser);
        socket.to(otherUser).emit("user joined", socket.id);
    }
});

socket.on("offer", payload => {
    io.to(payload.target).emit("offer", payload);
});

socket.on("answer", payload => {
    io.to(payload.target).emit("answer", payload);
});

socket.on("ice-candidate", incoming => {
    io.to(incoming.target).emit("ice-candidate", incoming.candidate);
});

});

http.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
});