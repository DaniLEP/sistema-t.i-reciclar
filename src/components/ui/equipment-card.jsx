import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Eye } from "lucide-react"

export function EquipmentCard({ titulo, descricao, emoji, categoria, onClick }) {
  const [isHovered, setIsHovered] = useState(false)

  const getCategoryColor = (cat) => {
    const colors = {
      hardware: "bg-blue-100 text-blue-700 border-blue-200",
      mobile: "bg-green-100 text-green-700 border-green-200",
      office: "bg-purple-100 text-purple-700 border-purple-200",
      audio: "bg-orange-100 text-orange-700 border-orange-200",
      navigation: "bg-gray-100 text-gray-700 border-gray-200",
    }
    return colors[cat] || colors.hardware
  }

  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-sm ${
        isHovered ? "scale-105 shadow-2xl" : "shadow-lg hover:shadow-xl"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Gradient accent */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="p-6">
          {/* Header with emoji and category */}
          <div className="flex items-start justify-between mb-4">
            <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{emoji}</div>
            <Badge variant="outline" className={`${getCategoryColor(categoria)} text-xs font-medium`}>
              {categoria}
            </Badge>
          </div>

          {/* Content */}
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {titulo}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{descricao}</p>
          </div>

          {/* Action area */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
