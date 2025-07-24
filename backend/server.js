import express from "express"
import cors from "cors"
import fetch from "node-fetch"

const app = express()
// Use porta do ambiente ou 4000 como fallback
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})