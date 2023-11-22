const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const path = require('path')

const app = express();
app.use('/sound', express.static(path.join(__dirname, 'sound')))
app.use('/run', express.static(path.join(__dirname, 'run')))
app.use('/video_proj', express.static(path.join(__dirname, 'video_proj')))
app.use('/model', express.static(path.join(__dirname, 'model')))
const server = createServer(app);
const io = new Server(server);

console.log(__dirname)

app.get('/projo', (req, res) => {
  res.sendFile(join(__dirname, '/video_proj/index.html'));
});

app.get('/a', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '/run/index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected websocket');

  socket.on('triangle', (msg) => {
    io.emit("triangle", "coucou")
  })

  socket.on('sort1', (msg) => {
    io.emit("sort1", "coucou")
  })

  socket.on('sort2', (msg) => {
    io.emit("sort2", "coucou")
  })
});

server.listen(4000, () => {
  console.log('server running at http://localhost:4000');
});