'use strict';

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const cors = require('cors');

app.use(cors());

const general = [];
const random = [];

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);


  socket.on('joinRoom', (room) => {
    socket.join(room);

    if (room === 'general') {
      socket.emit('chat message', general);
    } else if (room === 'random') {
      socket.emit('chat message', random);
    }

  console.log('joined room:', room);
});

  //socket.emit('chat message', messageHistory);

  socket.on('disconnect', () => {
    console.log('a user disconnected', socket.id);
  });

  socket.on('chat message', (msg) => {
    console.log('message: ', msg);
    if (msg.c === 'general') {
      general.push(msg);
    } else if (msg.c === 'random') {
      random.push(msg);
    }

    msg.time = new Date().toLocaleTimeString();

    if (msg.c === 'general') {
      io.to('general').emit('chat message', general);
    } else if (msg.c === 'random') {
      io.to('random').emit('chat message', random);
    }

  });
});

http.listen(3000, () => {
  console.log('listening on port 3000');
});