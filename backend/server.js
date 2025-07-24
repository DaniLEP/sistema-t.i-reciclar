import express from "express"
import cors from "cors"
import fetch from "node-fetch"
import { WebSocketServer } from "ws"

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get("/check-impressora", async (req, res) => {
  const { ip } = req.query
  if (!ip) return res.status(400).json({ error: "IP obrigatório" })

  try {
    const response = await fetch(`http://${ip}`, { timeout: 2000 })
    if (response.ok) {
      return res.json({ status: "online" })
    }
    return res.json({ status: "offline" })
  } catch (error) {
    return res.json({ status: "offline" })
  }
})

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})

// Cria WebSocket server ligado ao mesmo HTTP server
const wss = new WebSocketServer({ server })

// Função para checar status da impressora (reuso da lógica)
async function checarStatusImpressora(ip) {
  try {
    const response = await fetch(`http://${ip}`, { timeout: 2000 })
    return response.ok ? "online" : "offline"
  } catch {
    return "offline"
  }
}

wss.on("connection", (ws) => {
  console.log("Cliente WS conectado")

  ws.on("message", async (msg) => {
    // Espera mensagem JSON { type: "check", ip: "192.168.1.22" }
    let data
    try {
      data = JSON.parse(msg)
    } catch {
      return
    }
    if (data.type === "check" && data.ip) {
      const status = await checarStatusImpressora(data.ip)
      ws.send(JSON.stringify({ type: "status", ip: data.ip, status }))
    }
  })

  ws.on("close", () => {
    console.log("Cliente WS desconectado")
  })
})
