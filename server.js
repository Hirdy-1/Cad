// server.js
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let channels = {}; // { channelName: [ws, ws, ...] }

wss.on("connection", (ws) => {
  let currentChannel = null;

  ws.on("message", (data) => {
    const msg = JSON.parse(data);

    if (msg.type === "join") {
      currentChannel = msg.channel;
      channels[currentChannel] = channels[currentChannel] || [];
      channels[currentChannel].push(ws);
      return;
    }

    if (!currentChannel || !channels[currentChannel]) return;

    channels[currentChannel]
      .filter(client => client !== ws && client.readyState === WebSocket.OPEN)
      .forEach(client => client.send(JSON.stringify(msg)));
  });

  ws.on("close", () => {
    if (!currentChannel || !channels[currentChannel]) return;
    channels[currentChannel] = channels[currentChannel].filter(c => c !== ws);
  });
});

console.log("Signaling server running on :8080");
