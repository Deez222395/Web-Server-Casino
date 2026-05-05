const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

let clients = [];

function broadcast(data) {
  const msg = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on("connection", (ws) => {
  clients.push(ws);

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }

    if (data.type === "join") {
      broadcast({
        type: "system",
        text: `👤 ${data.user} joined the chat.`
      });
      return;
    }

    if (data.type === "msg") {
      broadcast({
        type: "msg",
        user: data.user,
        text: data.text,
        world: data.world || "Casino"
      });
      return;
    }
  });

  ws.on("close", () => {
    clients = clients.filter((c) => c !== ws);
  });

  ws.on("error", () => {
    clients = clients.filter((c) => c !== ws);
  });
});

console.log("✅ WebSocket Server running on port " + PORT);