const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map(); // userId -> ws

wss.on('connection', (ws) => {
  let userId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      // 1️⃣ Register user
      if (data.type === 'register') {
        userId = data.userId;
        clients.set(userId, ws);
        console.log('User connected:', userId);
        return;
      }

      // 2️⃣ Forward signaling messages
      const targetWs = clients.get(data.to);
      if (targetWs) {
        targetWs.send(JSON.stringify(data));
      }
    } catch (err) {
      console.error('Invalid message', err);
    }
  });

  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
      console.log('User disconnected:', userId);
    }
  });
});

app.get('/', (req, res) => {
  res.send('Signaling server running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Signaling server listening on ${PORT}`);
});
