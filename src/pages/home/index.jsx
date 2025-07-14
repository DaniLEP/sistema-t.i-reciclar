"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../../components/ui/header/index"
import Footer from "../../components/ui/footer/index"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardList,
  FolderKanban,
  FilePlus2,
  User2Icon,
  SearchCheckIcon,
  ArrowRight,
  Sparkles,
} from "lucide-react"

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState(null)
  const navigate = useNavigate()

  const cards = [
    {
      title: "Registers",
      description: "Create and manage new records efficiently",
      icon: <FilePlus2 className="w-8 h-8" />,
      onClick: () => navigate("/register-option"),
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      badge: "New",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      title: "Search",
      description: "Find and filter through your data quickly",
      icon: <SearchCheckIcon className="w-8 h-8" />,
      onClick: () => navigate("/views"),
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      badge: "Popular",
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Dashboard",
      description: "View analytics and key performance metrics",
      icon: <FolderKanban className="w-8 h-8" />,
      onClick: () => navigate("/dashboard"),
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      badge: "Updated",
      badgeColor: "bg-purple-100 text-purple-700",
    },
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      icon: <User2Icon className="w-8 h-8" />,
      onClick: () => navigate("/register-user"),
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      badge: "Admin",
      badgeColor: "bg-orange-100 text-orange-700",
    },
    {
      title: "Support",
      description: "Handle customer inquiries and tickets",
      icon: <ClipboardList className="w-8 h-8" />,
      onClick: () => navigate("/chamados"),
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      textColor: "text-rose-700",
      badge: "Active",
      badgeColor: "bg-rose-100 text-rose-700",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 p-6 lg:p-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Welcome back!</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Your Control Center</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Access all your tools and manage your workflow from one central location
          </p>
        </div>

        {/* Cards Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, idx) => (
              <Card
                key={idx}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 overflow-hidden ${
                  hoveredCard === idx ? "shadow-2xl scale-105" : "shadow-md"
                }`}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={card.onClick}
              >
                <CardContent className="p-0">
                  {/* Gradient Header */}
                  <div className={`h-2 bg-gradient-to-r ${card.color}`} />

                  <div className="p-6">
                    {/* Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <div className={card.textColor}>{card.icon}</div>
                      </div>
                      <Badge variant="secondary" className={`${card.badgeColor} border-0`}>
                        {card.badge}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${card.textColor} hover:bg-transparent p-0 h-auto font-medium group-hover:gap-2 transition-all duration-300`}
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-2">2,847</div>
              <div className="text-gray-600">Total de Equipamentos</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-2">98.5%</div>
              <div className="text-gray-600">Equipamentos em Manutenção</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-2">156</div>
              <div className="text-gray-600">Equipamentos Emprestados</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-2">156</div>
              <div className="text-gray-600">Equipamentos Disponíveis</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
