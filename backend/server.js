import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.send("OK"));

app.get("/check-impressora", async (req, res) => {
  const { ip } = req.query;
  if (!ip) return res.status(400).json({ error: "IP obrigatório" });
  try {
    const response = await fetch(`http://${ip}`, { timeout: 2000 });
    return res.json({ status: response.ok ? "online" : "offline" });
  } catch {
    return res.json({ status: "offline" });
  }
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("WS client connected");

  ws.on("message", async (msg) => {
    const { ip } = JSON.parse(msg);
    let status = "offline";

    try {
      const response = await fetch(`http://${ip}`, { timeout: 2000 });
      if (response.ok) status = "online";
    } catch {}

    ws.send(JSON.stringify({ ip, status }));
  });
});

server.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});
