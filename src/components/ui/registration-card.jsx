"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Plus, Clock } from "lucide-react"

export function RegistrationCard({
  titulo,
  descricao,
  emoji,
  categoria,
  isPopular,
  recentCount,
  onClick,
}) {
  const [isHovered, setIsHovered] = useState(false)

  const getCategoryColor = (cat) => {
    const colors = {
      hardware: "from-blue-500 to-blue-600",
      mobile: "from-green-500 to-green-600",
      office: "from-purple-500 to-purple-600",
      audio: "from-orange-500 to-orange-600",
      navigation: "from-gray-500 to-gray-600",
    }
    return colors[cat] || colors.hardware
  }

  const getCategoryBadgeColor = (cat) => {
    const colors = {
      hardware: "bg-blue-50 text-blue-700 border-blue-200",
      mobile: "bg-green-50 text-green-700 border-green-200",
      office: "bg-purple-50 text-purple-700 border-purple-200",
      audio: "bg-orange-50 text-orange-700 border-orange-200",
      navigation: "bg-gray-50 text-gray-700 border-gray-200",
    }
    return colors[cat] || colors.hardware
  }

  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl border-0 overflow-hidden bg-white ${
        isHovered ? "scale-105 shadow-2xl" : "shadow-lg hover:shadow-xl"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Gradient header */}
        <div className={`h-2 bg-gradient-to-r ${getCategoryColor(categoria)}`} />

        <div className="p-6">
          {/* Header with emoji and badges */}
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{emoji}</div>
              {isPopular && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className={`${getCategoryBadgeColor(categoria)} text-xs font-medium`}>
                {categoria}
              </Badge>
              {isPopular && (
                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Popular</Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {titulo}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{descricao}</p>
          </div>

          {/* Stats */}
          {recentCount !== undefined && recentCount > 0 && (
            <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{recentCount} registered this week</span>
            </div>
          )}

          {/* Action area */}
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              className={`bg-gradient-to-r ${getCategoryColor(categoria)} hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
            >
              <Plus className="w-4 h-4 mr-1" />
              Register Now
            </Button>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
