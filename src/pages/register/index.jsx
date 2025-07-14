import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { SearchBar } from "../../components/ui/search-bar"
import { BreadcrumbNav } from "../../components/ui/breadcrumb-nav"
import { RegistrationCard } from "../../components/ui/registration-card"
import { QuickStats } from "../../components/ui/quick-stats"
import { RecentActivity } from "../../components/ui/recent-activity"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Grid3X3, List, Zap, BookOpen, HelpCircle } from "lucide-react"

const opcoesCadastro = [
  {
    id: "toner",
    titulo: "Cadastro de Toner",
    descricao: "Cadastre cores, SKUs e impressoras para toners com controle de estoque integrado.",
    emoji: "🎨",
    rota: "/register-toner",
    categoria: "hardware",
    isPopular: true,
    recentCount: 23,
  },
  {
    id: "impressora",
    titulo: "Cadastro de Impressora",
    descricao: "Cadastre impressoras designadas com especificações técnicas completas.",
    emoji: "🖨️",
    rota: "/register-impressora",
    categoria: "hardware",
    isPopular: true,
    recentCount: 15,
  },
  {
    id: "tablet",
    titulo: "Cadastro de Tablet",
    descricao: "Cadastre seus tablets disponíveis e suas especificações técnicas detalhadas.",
    emoji: "📱",
    rota: "/register-tablet",
    categoria: "mobile",
    recentCount: 8,
  },
  {
    id: "notebook",
    titulo: "Cadastro de Notebook",
    descricao: "Cadastre seus notebooks disponíveis com especificações de hardware completas.",
    emoji: "💻",
    rota: "/register-notebook",
    categoria: "hardware",
    recentCount: 12,
  },
  {
    id: "mobiliario",
    titulo: "Cadastro de Mobiliário",
    descricao: "Cadastre os móveis e suas especificações para controle patrimonial.",
    emoji: "🏠",
    rota: "/register-mobiliaria",
    categoria: "office",
    recentCount: 5,
  },
  {
    id: "camera",
    titulo: "Cadastro de Câmeras",
    descricao: "Cadastre câmeras e seus periféricos com controle de qualidade.",
    emoji: "📷",
    rota: "/register-camera",
    categoria: "hardware",
    recentCount: 7,
  },
  {
    id: "fone",
    titulo: "Cadastro de Fone de Ouvido",
    descricao: "Cadastre fones de ouvidos com especificações técnicas e controle de distribuição.",
    emoji: "🎧",
    rota: "/register-fone",
    categoria: "audio",
    recentCount: 3,
  },
  {
    id: "outro",
    titulo: "Voltar para Home",
    descricao: "Retorne para a página principal do sistema de gestão.",
    emoji: "↩️",
    rota: "/Home",
    categoria: "navigation",
  },
]

export default function HomeRegister() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const navigate = useNavigate()

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return opcoesCadastro

    return opcoesCadastro.filter(
      (opcao) =>
        opcao.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opcao.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opcao.categoria.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%239C92AC fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

      <div className="relative z-10 p-6 lg:p-8">
        {/* Navigation */}
        <div className="max-w-7xl mx-auto">
          <BreadcrumbNav onHomeClick={() => navigate("/Home")} />
        </div>

        {/* Header */}
        <header className="max-w-7xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium text-white/90">Equipment Registration</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Equipment Registration
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Choose an option below to start registering new equipment in your inventory
          </p>

          <SearchBar onSearch={setSearchQuery} placeholder="Search registration types..." />
        </header>

        {/* Quick Stats */}
        <div className="max-w-7xl mx-auto mb-8">
          <QuickStats />
        </div>

        {/* Controls */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm font-medium">
                {filteredOptions.length} registration types available
              </span>
              {searchQuery && (
                <span className="text-yellow-300 text-sm">Filtered by: "{searchQuery}"</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="text-white hover:bg-white/20"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="text-white hover:bg-white/20"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Registration Cards */}
          <div className="lg:col-span-3">
            {filteredOptions.length > 0 ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 lg:grid-cols-2"
                }`}
              >
                {filteredOptions.map((opcao) => (
                  <RegistrationCard
                    key={opcao.id}
                    {...opcao}
                    onClick={() => navigate(opcao.rota)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-white mb-2">No registration types found</h3>
                <p className="text-white/70 mb-6">
                  Try adjusting your search terms or browse all available options
                </p>
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <RecentActivity />

            {/* Quick Help */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Need Help?</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Get started with our registration guides and best practices.
                </p>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
