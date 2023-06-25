const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const socketIO = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

let goalNumber = null;
let players = [];

app.post('/api/goal', (req, res) => {
  const { goal } = req.body;
  goalNumber = goal;
  console.log('Goal set:', goal);
  res.sendStatus(200);
});

app.get('/api/players', (req, res) => {
  console.log('API request: GET /api/players');
  res.json(players);
});

app.post('/api/players', (req, res) => {
  const { name, guess } = req.body;
  const player = { id: uuidv4(), name, guess };
  players.push(player);
  io.emit('playersUpdated', players); // Emit the updated players array to all connected clients
  console.log('API request: POST /api/players', player);
  res.sendStatus(200);
});

app.get('/api/topUsers', (req, res) => {
  const sortedPlayers = [...players].sort((a, b) => a.guess - b.guess);
  const topUsers = sortedPlayers.slice(0, 3);
  console.log('API request: GET /api/topUsers');
  res.json({ topUsers });
});

app.post('/api/clearPlayers', (req, res) => {
  players = [];
  io.emit('playersUpdated', players); // Emit an empty players array to all connected clients
  console.log('API request: POST /api/clearPlayers');
  res.sendStatus(200);
});

const server = app.listen(2000, () => {
  console.log('Server is running on port 2000');
});

const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('A client connected.');

  // Send the initial players array to the client upon connection
  socket.emit('playersUpdated', players);

  socket.on('disconnect', () => {
    console.log('A client disconnected.');
  });
});
