import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { SearchBar } from "../../components/ui/search-bar"
import { BreadcrumbNav } from "../../components/ui/breadcrumb-nav"
import { EquipmentCard } from "../../components/ui/equipment-card"
import { Button } from "@/components/ui/button"
import { Grid3X3, List, Sparkles } from "lucide-react"

const opcoesCadastro = [
  {
    id: "toner",
    titulo: "Consulta de Toner",
    descricao: "Gerencie cores, SKUs e impressoras com controle de estoque.",
    emoji: "🎨",
    rota: "/views-toners",
    categoria: "hardware",
  },
  {
    id: "impressora",
    titulo: "Consulta de Impressora",
    descricao: "Gerencie impressoras designadas e monitore seu status.",
    emoji: "🖨️",
    rota: "/views-impressora",
    categoria: "hardware",
  },
  {
    id: "tablet",
    titulo: "Consulta de Tablet",
    descricao: "Controle seus tablets e suas especificações técnicas.",
    emoji: "📱",
    rota: "/views-tablet",
    categoria: "mobile",
  },
  {
    id: "notebook",
    titulo: "Consulta de Notebook",
    descricao: "Controle seus notebooks e suas especificações.",
    emoji: "💻",
    rota: "/views-notebooks",
    categoria: "hardware",
  },
  {
    id: "camera",
    titulo: "Consulta de Câmeras",
    descricao: "Gerencie as câmeras e seus periféricos.",
    emoji: "📷",
    rota: "/views-camera",
    categoria: "hardware",
  },
  {
    id: "mobiliario",
    titulo: "Consulta Mobiliária",
    descricao: "Controle os móveis e suas especificações.",
    emoji: "🏠",
    rota: "/view-mobiliaria",
    categoria: "office",
  },
  {
    id: "fone",
    titulo: "Consulta de Fones de Ouvido",
    descricao: "Gerencie os fones de ouvido do instituto.",
    emoji: "🎧",
    rota: "/view-fone",
    categoria: "audio",
  },
  {
    id: "outro",
    titulo: "Voltar para Home",
    descricao: "Retorne para a página principal do sistema.",
    emoji: "↩️",
    rota: "/Home",
    categoria: "navigation",
  },
]

export default function HomeViews() {
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

  const categoryCounts = useMemo(() => {
    return opcoesCadastro.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1
      return acc
    }, {})
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%239C92AC fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

      <div className="relative z-10 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <BreadcrumbNav onHomeClick={() => navigate("/Home")} />
        </div>

        <header className="max-w-7xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium text-white/90">Equipment Consultation</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Equipment Consultation
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Choose an option below to view and manage your equipment inventory
          </p>

          <SearchBar onSearch={setSearchQuery} placeholder="Search equipment types..." />
        </header>

        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm font-medium">
                {filteredOptions.length} of {opcoesCadastro.length} items
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

        <main className="max-w-7xl mx-auto">
          {filteredOptions.length > 0 ? (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1 lg:grid-cols-2"
              }`}
            >
              {filteredOptions.map((opcao) => (
                <EquipmentCard
                  key={opcao.id}
                  {...opcao}
                  onClick={() => navigate(opcao.rota)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-white mb-2">No equipment found</h3>
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
        </main>

        <div className="max-w-4xl mx-auto mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div
                key={category}
                className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div className="text-2xl font-bold text-white mb-1">{count}</div>
                <div className="text-white/70 text-sm capitalize">{category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
