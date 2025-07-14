"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, Clock, CheckCircle } from "lucide-react"

export function QuickStats() {
  const stats = [
    {
      title: "Total Registered",
      value: "1,247",
      change: "+12%",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      color: "text-green-600",
    },
    {
      title: "This Week",
      value: "89",
      change: "+23%",
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      color: "text-blue-600",
    },
    {
      title: "Active Users",
      value: "34",
      change: "+5%",
      icon: <Users className="w-5 h-5 text-purple-600" />,
      color: "text-purple-600",
    },
    {
      title: "Growth Rate",
      value: "18%",
      change: "+2%",
      icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              {stat.icon}
              <span className={`text-xs font-medium ${stat.color}`}>{stat.change}</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.title}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
