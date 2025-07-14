"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

export function RecentActivity() {
  const activities = [
    { type: "Notebook", user: "João Silva", time: "2 min ago", status: "completed" },
    { type: "Impressora", user: "Maria Santos", time: "5 min ago", status: "completed" },
    { type: "Tablet", user: "Pedro Costa", time: "12 min ago", status: "pending" },
    { type: "Câmera", user: "Ana Lima", time: "1h ago", status: "completed" },
  ]

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">{activity.type}</div>
              <div className="text-xs text-gray-500">by {activity.user}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={activity.status === "completed" ? "default" : "secondary"}
                className="text-xs"
              >
                {activity.status}
              </Badge>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
