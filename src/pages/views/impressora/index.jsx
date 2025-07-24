import { useEffect, useState } from "react"
import { getDatabase, ref, onValue } from "firebase/database"
import { app } from "../../../../firebase" // ajuste o caminho conforme sua estrutura
import { toast } from "react-toastify"

const CONEXAO_CONFIG = {
  Online: "bg-green-500",
  Offline: "bg-red-500",
  Indefinido: "bg-gray-400",
}

export default function VisualizacaoImpressoras() {
  const [impressoras, setImpressoras] = useState([])

  async function checarConexaoBackend(ip) {
    if (!ip) return "Indefinido"
    try {
      const res = await fetch(`http://localhost:4000/check-impressora?ip=${ip}`)
      const data = await res.json()
      return data.status === "online" ? "Online" : "Offline"
    } catch (error) {
      console.error("Erro ao checar conexão:", error)
      return "Offline"
    }
  }

  useEffect(() => {
    const db = getDatabase(app)
    const impressorasRef = ref(db, "impressoras")

    const unsubscribe = onValue(impressorasRef, async (snapshot) => {
      const data = snapshot.val()

      if (!data) {
        setImpressoras([])
        return
      }

      const lista = await Promise.all(
        Object.entries(data).map(async ([id, imp]) => {
          const conexao = await checarConexaoBackend(imp.ip)
          return { id, ...imp, conexao }
        })
      )

      setImpressoras(lista)
    })

    return () => unsubscribe()
  }, [])

  // Atualização automática a cada 60s
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!Array.isArray(impressoras)) return

      const atualizadas = await Promise.all(
        impressoras.map(async (imp) => {
          const conexao = await checarConexaoBackend(imp.ip)
          return { ...imp, conexao }
        })
      )

      setImpressoras(atualizadas)
    }, 60000)

    return () => clearInterval(interval)
  }, [impressoras])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {impressoras.map((imp) => (
        <div
          key={imp.id}
          className={`rounded-xl p-4 shadow-md text-white ${CONEXAO_CONFIG[imp.conexao] || "bg-gray-400"}`}
        >
          <p><strong>IP:</strong> {imp.ip || "Não informado"}</p>
          <p><strong>Status:</strong> {imp.status || "Indefinido"}</p>
          <p><strong>Conexão:</strong> {imp.conexao}</p>
        </div>
      ))}
    </div>
  )
}
