import { useEffect, useState } from "react"
import { ref, get } from "firebase/database"
import { db } from "../../../firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

function formatTime(timestamp) {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "agora"
  if (minutes < 60) return `${minutes} min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}

const paths = [
  { path: "notebooks", type: "Notebook" },
  { path: "tablets", type: "Tablet" },
  { path: "cameras", type: "Câmera" },
  { path: "impressoras", type: "Impressora" },
  { path: "toners", type: "Toner" },
]

export function RecentActivity() {
  const [activities, setActivities] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      const allItems = []

      for (const { path, type } of paths) {
        const snapshot = await get(ref(db, path))
        const data = snapshot.val()

        if (data) {
          Object.entries(data).forEach(([id, item]) => {
            if (item.status === "emprestado") {
              allItems.push({
                id,
                type,
                user: item.user || "Desconhecido",
                status: item.status,
                createdAt: item.createdAt || 0,
              })
            }
          })
        }
      }

      const sorted = allItems
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)

      setActivities(sorted)
    }

    fetchAll()
  }, [])

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Empréstimos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum item emprestado no momento.</p>
        )}
        {activities.map((activity) => (
          <div
            key={activity.id + activity.type}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">{activity.type}</div>
              <div className="text-xs text-gray-500">por {activity.user}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {activity.status}
              </Badge>
              <span className="text-xs text-gray-400">{formatTime(activity.createdAt)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
