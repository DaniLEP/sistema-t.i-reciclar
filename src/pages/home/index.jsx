import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
  Laptop,
  Tablet,
  Armchair,
  Headphones,
  Printer,
  Camera,
  Activity,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Users,
  Database,
  Server,
  Wifi,
} from "lucide-react"
import { getDatabase, ref, get } from "firebase/database"
import { app } from "../../../firebase"

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [hoveredStat, setHoveredStat] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const navigate = useNavigate()

  const [totais, setTotais] = useState({
    cameras: 0,
    notebooks: 0,
    tablets: 0,
    moveis: 0,
    fones: 0,
    impressoras: 0,
  })

  const [loadingTotais, setLoadingTotais] = useState(true)
  const db = getDatabase(app)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    async function fetchTotals() {
      setLoadingTotais(true)
      const keys = ["notebooks", "tablets", "moveis", "fones", "impressoras", "cameras"]
      const promises = keys.map(async (key) => {
        const snapshot = await get(ref(db, key))
        const data = snapshot.val()
        return { key, count: data ? Object.keys(data).length : 0 }
      })
      const results = await Promise.all(promises)
      const newTotals = {}
      results.forEach(({ key, count }) => {
        newTotals[key] = count
      })
      setTotais(newTotals)
      setLoadingTotais(false)
    }
    fetchTotals()
  }, [db])

  const cards = [
    {
      title: "Asset Registration",
      description: "Register new IT equipment and manage asset lifecycle efficiently",
      icon: <FilePlus2 className="w-8 h-8" />,
      onClick: () => navigate("/register-option"),
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      badge: "New",
      badgeColor: "bg-blue-100 text-blue-700",
      hoverShadow: "shadow-blue-500/25",
      category: "Management",
    },
    {
      title: "User Profile",
      description: "Manage your account settings and IT service preferences",
      icon: <User2Icon className="w-8 h-8" />,
      onClick: () => navigate("/perfil"),
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      badge: "Personal",
      badgeColor: "bg-indigo-100 text-indigo-700",
      hoverShadow: "shadow-indigo-500/25",
      category: "Account",
    },
    {
      title: "Asset Search",
      description: "Advanced search and filtering for IT inventory management",
      icon: <SearchCheckIcon className="w-8 h-8" />,
      onClick: () => navigate("/views"),
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      badge: "Popular",
      badgeColor: "bg-emerald-100 text-emerald-700",
      hoverShadow: "shadow-emerald-500/25",
      category: "Search",
    },
    {
      title: "IT Dashboard",
      description: "Real-time analytics and performance metrics for IT operations",
      icon: <FolderKanban className="w-8 h-8" />,
      onClick: () => navigate("/dashboard"),
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      badge: "Analytics",
      badgeColor: "bg-purple-100 text-purple-700",
      hoverShadow: "shadow-purple-500/25",
      category: "Analytics",
    },
    {
      title: "User Management",
      description: "Manage user accounts, roles and IT service permissions",
      icon: <Users className="w-8 h-8" />,
      onClick: () => navigate("/register-user"),
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      badge: "Admin",
      badgeColor: "bg-orange-100 text-orange-700",
      hoverShadow: "shadow-orange-500/25",
      category: "Administration",
    },
    {
      title: "IT Support",
      description: "Handle technical support tickets and service requests",
      icon: <ClipboardList className="w-8 h-8" />,
      onClick: () => navigate("/list-chamados"),
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      textColor: "text-rose-700",
      badge: "Active",
      badgeColor: "bg-rose-100 text-rose-700",
      hoverShadow: "shadow-rose-500/25",
      category: "Support",
    },
  ]

  const statsConfig = [
    {
      key: "notebooks",
      label: "Notebooks",
      icon: Laptop,
      color: "from-blue-500 to-cyan-500",
      trend: "+12%",
      status: "operational",
    },
    {
      key: "tablets",
      label: "Tablets",
      icon: Tablet,
      color: "from-purple-500 to-pink-500",
      trend: "+8%",
      status: "operational",
    },
    {
      key: "moveis",
      label: "Mobiliários",
      icon: Armchair,
      color: "from-amber-500 to-orange-500",
      trend: "+15%",
      status: "operational",
    },
    {
      key: "fones",
      label: "Fones",
      icon: Headphones,
      color: "from-green-500 to-emerald-500",
      trend: "-3%",
      status: "maintenance",
    },
    {
      key: "impressoras",
      label: "Impressoras",
      icon: Printer,
      color: "from-indigo-500 to-purple-500",
      trend: "+5%",
      status: "operational",
    },
    {
      key: "cameras",
      label: "Câmeras",
      icon: Camera,
      color: "from-red-500 to-pink-500",
      trend: "+22%",
      status: "operational",
    },
  ]

  const SkeletonCard = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-3">
        <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
        <div className="w-full h-4 bg-gray-200 rounded"></div>
        <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Tech Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-blue-400/20 rounded-sm" />
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Hero Section */}
          <div className="text-center mb-20">
            {/* Status Badge */}
            <div
              className="inline-flex items-center gap-3 mb-8 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl"
              style={{
                transform: isVisible ? "translateY(0)" : "translateY(-20px)",
                opacity: isVisible ? 1 : 0,
                transition: "all 0.8s ease-out",
              }}
            >
              <div className="relative">
                <Shield className="w-5 h-5 text-emerald-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <span className="text-sm font-semibold text-white">System Status: All Services Online</span>
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>

            {/* Main Title */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
              style={{
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                opacity: isVisible ? 1 : 0,
                transition: "all 0.8s ease-out 0.2s",
              }}
            >
              <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                IT Management
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Control Center
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8"
              style={{
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                opacity: isVisible ? 1 : 0,
                transition: "all 0.8s ease-out 0.4s",
              }}
            >
              Centralized platform for IT asset management, user administration, and technical support operations.
              Monitor, manage, and maintain your technology infrastructure efficiently.
            </p>

            {/* System Stats */}
            <div
              className="flex items-center justify-center gap-8 flex-wrap"
              style={{
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                opacity: isVisible ? 1 : 0,
                transition: "all 0.8s ease-out 0.6s",
              }}
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                <Server className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Firebase Realtime </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30">
                <Wifi className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Secure Connection</span>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Asset Inventory Overview</h2>
              <p className="text-lg text-gray-400">Real-time equipment tracking and status monitoring</p>
            </div>

            {loadingTotais ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {statsConfig.map((stat, idx) => {
                  const IconComponent = stat.icon
                  const isHovered = hoveredStat === idx

                  return (
                    <div
                      key={stat.key}
                      className={`group relative bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer overflow-hidden ${
                        isHovered ? "scale-105 bg-white/15" : ""
                      }`}
                      onMouseEnter={() => setHoveredStat(idx)}
                      onMouseLeave={() => setHoveredStat(null)}
                      style={{
                        animationDelay: `${idx * 100}ms`,
                        transform: isVisible ? "translateY(0)" : "translateY(20px)",
                        opacity: isVisible ? 1 : 0,
                        transition: `all 0.6s ease-out ${idx * 100}ms`,
                      }}
                    >
                      {/* Background Glow Effect */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}
                      />

                      {/* Status Indicator */}
                      <div className="absolute top-3 right-3">
                        <div
                          className={`w-2 h-2 rounded-full ${stat.status === "operational" ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`}
                        />
                      </div>

                      <div className="relative z-10 flex flex-col items-center space-y-4">
                        <div
                          className={`p-4 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>

                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-bold text-white tabular-nums">{totais[stat.key]}</span>
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                stat.trend.startsWith("+")
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-red-500/20 text-red-300"
                              }`}
                            >
                              <TrendingUp className={`w-3 h-3 ${stat.trend.startsWith("-") ? "rotate-180" : ""}`} />
                              {stat.trend}
                            </div>
                          </div>
                          <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Enhanced Action Cards */}
          <div className="mb-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">IT Operations Hub</h2>
              <p className="text-lg text-gray-400">Access critical IT management tools and services</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cards.map((card, idx) => {
                const isHovered = hoveredCard === idx

                return (
                  <Card
                    key={idx}
                    className={`group cursor-pointer transition-all duration-500 border-0 overflow-hidden bg-white/10 backdrop-blur-md hover:bg-white/15 ${
                      isHovered ? `shadow-2xl scale-[1.02] ${card.hoverShadow}` : "shadow-xl"
                    }`}
                    onMouseEnter={() => setHoveredCard(idx)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={card.onClick}
                    style={{
                      animationDelay: `${idx * 150}ms`,
                      transform: isVisible ? "translateY(0)" : "translateY(30px)",
                      opacity: isVisible ? 1 : 0,
                      transition: `all 0.7s ease-out ${idx * 150}ms`,
                    }}
                  >
                    <CardContent className="p-0 relative overflow-hidden">
                      {/* Animated gradient border */}
                      <div
                        className={`h-1 bg-gradient-to-r ${card.color} group-hover:h-2 transition-all duration-300`}
                      />

                      {/* Background effects */}
                      <div
                        className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-all duration-500 transform group-hover:scale-110`}
                      />

                      {/* Tech Pattern Overlay */}
                      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                        <div className="grid grid-cols-8 gap-1 h-full p-4">
                          {Array.from({ length: 32 }).map((_, i) => (
                            <div key={i} className="border border-current rounded-sm" />
                          ))}
                        </div>
                      </div>

                      <div className="p-8 relative z-10">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                          <div
                            className={`p-4 rounded-2xl bg-gradient-to-br ${card.bgColor} border border-white/20 group-hover:scale-110 group-hover:-rotate-2 transition-all duration-300 shadow-lg`}
                          >
                            <div className={card.textColor}>{card.icon}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              variant="secondary"
                              className={`${card.badgeColor} border border-white/20 font-medium px-3 py-1.5 group-hover:scale-105 transition-all duration-300 shadow-sm`}
                            >
                              {card.badge}
                            </Badge>
                            <span className="text-xs text-gray-400 font-medium">{card.category}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-4 mb-8">
                          <h3 className="text-xl font-bold text-white group-hover:text-gray-100 transition-colors duration-300">
                            {card.title}
                          </h3>
                          <p className="text-gray-300 text-sm leading-relaxed">{card.description}</p>
                        </div>

                        {/* Action */}
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${card.textColor} hover:bg-white/10 p-0 h-auto font-semibold text-sm group-hover:gap-3 transition-all duration-300 border border-transparent hover:border-white/20 px-3 py-2 rounded-lg`}
                          >
                            Access Module
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                          </Button>

                          {/* Status Indicator */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-400">Ready</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* System Status Footer */}
          <div className="text-center py-8 border-t border-white/10">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">All Systems Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Last Updated: Just now</span>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}
