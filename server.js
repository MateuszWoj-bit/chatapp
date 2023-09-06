const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

const socket = io.connect('https://us-central1-fir-50d89.cloudfunctions.net/socketServer');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('disconnect', reason => {
  console.log(`Disconnected from WebSocket server: ${reason}`);
});
