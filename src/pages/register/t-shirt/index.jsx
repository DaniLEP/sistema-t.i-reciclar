"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Shirt,
  Plus,
  Trash2,
  Edit3,
  Search,
  Package,
  AlertTriangle,
  Eye,
  X,
  Save,
  Loader2,
  BarChart3,
  Grid3X3,
  List,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { db } from "../../../../firebase"
import { onValue, ref, set, push, remove, update } from "firebase/database"
import { useNavigate } from "react-router-dom"

const TAMANHOS = ["PP", "P", "M", "G", "GG", "XG", "2XG", "3XG"]
const CORES_PREDEFINIDAS = [
  "Branco",
  "Preto",
  "Azul",
  "Vermelho",
  "Verde",
  "Amarelo",
  "Rosa",
  "Roxo",
  "Laranja",
  "Cinza",
  "Marrom",
  "Bege",
]

export default function CamisetasCadastro() {
  const [formulario, setFormulario] = useState({
    tamanho: "",
    modelo: "",
    cor: "",
    quantidade: 1,
  })

  const [camisetas, setCamisetas] = useState([])
  const [editando, setEditando] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [busca, setBusca] = useState("")
  const [filtroTamanho, setFiltroTamanho] = useState("")
  const [filtroCor, setFiltroCor] = useState("")
  const [viewMode, setViewMode] = useState("grid") // grid ou list
  const [modalDetalhes, setModalDetalhes] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()


  useEffect(() => {
    const camisetasRef = ref(db, "camisetas")
    const unsubscribe = onValue(camisetasRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const lista = Object.entries(data).map(([id, item]) => ({
          ...item,
          id,
        }))
        setCamisetas(lista)
      } else {
        setCamisetas([])
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formulario.tamanho || !formulario.modelo || !formulario.cor) {
      alert("Por favor, preencha todos os campos!")
      return
    }

    setSalvando(true)
    try {
      const novaCamiseta = {
        ...formulario,
        quantidade: Number.parseInt(formulario.quantidade),
        dataCadastro: new Date().toISOString(),
        dataUltimaEdicao: new Date().toISOString(),
      }

      if (editando) {
        const camisetaRef = ref(db, `camisetas/${editando}`)
        await update(camisetaRef, novaCamiseta)
        setEditando(null)
      } else {
        const camisetasRef = ref(db, "camisetas")
        const novaRef = push(camisetasRef)
        await set(novaRef, novaCamiseta)
      }

      setFormulario({ tamanho: "", modelo: "", cor: "", quantidade: 1 })
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar. Tente novamente.")
    } finally {
      setSalvando(false)
    }
  }

  const handleEditar = (grupo) => {
    setFormulario({
      tamanho: grupo.tamanho,
      modelo: grupo.modelo,
      cor: grupo.cor,
      quantidade: grupo.quantidade,
    })
    setEditando(grupo.ids[0])
  }

  const handleExcluir = async (grupo) => {
    if (
      window.confirm(`Deseja excluir todas as camisetas ${grupo.modelo} cor ${grupo.cor} tamanho ${grupo.tamanho}?`)
    ) {
      try {
        for (const id of grupo.ids) {
          const camisetaRef = ref(db, `camisetas/${id}`)
          await remove(camisetaRef)
        }
      } catch (error) {
        console.error("Erro ao excluir:", error)
        alert("Erro ao excluir. Tente novamente.")
      }
    }
  }

  const camisetasAgrupadas = useMemo(() => {
    return camisetas.reduce((acc, camiseta) => {
      const chave = `${camiseta.tamanho}-${camiseta.modelo}-${camiseta.cor}`
      if (acc[chave]) {
        acc[chave].quantidade += camiseta.quantidade
        acc[chave].ids.push(camiseta.id)
      } else {
        acc[chave] = {
          tamanho: camiseta.tamanho,
          modelo: camiseta.modelo,
          cor: camiseta.cor,
          quantidade: camiseta.quantidade,
          ids: [camiseta.id],
          dataCadastro: camiseta.dataCadastro,
        }
      }
      return acc
    }, {})
  }, [camisetas])

  const camisetasFiltradas = useMemo(() => {
    return Object.values(camisetasAgrupadas).filter((grupo) => {
      const matchBusca =
        grupo.modelo.toLowerCase().includes(busca.toLowerCase()) ||
        grupo.cor.toLowerCase().includes(busca.toLowerCase())
      const matchTamanho = !filtroTamanho || grupo.tamanho === filtroTamanho
      const matchCor = !filtroCor || grupo.cor === filtroCor

      return matchBusca && matchTamanho && matchCor
    })
  }, [camisetasAgrupadas, busca, filtroTamanho, filtroCor])

  // Paginação
  const totalPages = Math.ceil(camisetasFiltradas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = camisetasFiltradas.slice(startIndex, startIndex + itemsPerPage)

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [busca, filtroTamanho, filtroCor])

  const estatisticas = useMemo(() => {
    const grupos = Object.values(camisetasAgrupadas)
    return {
      totalCamisetas: grupos.reduce((sum, grupo) => sum + grupo.quantidade, 0),
      totalModelos: new Set(grupos.map((g) => g.modelo)).size,
      totalCores: new Set(grupos.map((g) => g.cor)).size,
      estoquesBaixos: grupos.filter((g) => g.quantidade <= 5).length,
    }
  }, [camisetasAgrupadas])

  const getTamanhoColor = (tamanho) => {
    const cores = {
      PP: "bg-purple-100 text-purple-800 border-purple-300",
      P: "bg-pink-100 text-pink-800 border-pink-300",
      M: "bg-green-100 text-green-800 border-green-300",
      G: "bg-yellow-100 text-yellow-800 border-yellow-300",
      GG: "bg-blue-100 text-blue-800 border-blue-300",
      XG: "bg-red-100 text-red-800 border-red-300",
      "2XG": "bg-orange-100 text-orange-800 border-orange-300",
      "3XG": "bg-teal-100 text-teal-800 border-teal-300",
    }
    return cores[tamanho] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  const getCorColor = (cor) => {
    const cores = {
      Branco: "bg-gray-100 text-gray-800",
      Preto: "bg-gray-800 text-white",
      Azul: "bg-blue-500 text-white",
      Vermelho: "bg-red-500 text-white",
      Verde: "bg-green-500 text-white",
      Amarelo: "bg-yellow-400 text-gray-800",
      Rosa: "bg-pink-400 text-white",
      Roxo: "bg-purple-500 text-white",
      Laranja: "bg-orange-500 text-white",
      Cinza: "bg-gray-400 text-white",
      Marrom: "bg-amber-700 text-white",
      Bege: "bg-amber-100 text-amber-800",
    }
    return cores[cor] || "bg-gray-200 text-gray-800"
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm rounded-lg ${
                  currentPage === page ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próxima
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando camisetas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Shirt className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Controle de Camisetas
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Gerencie seu estoque de camisetas de forma inteligente</p>
             <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate("/register-option")}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-3 px-8 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 font-semibold py-4 rounded-xl text-sm transition-all duration-200 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </motion.button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Camisetas</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.totalCamisetas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shirt className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Modelos Únicos</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.totalModelos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Cores Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.totalCores}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Estoque Baixo</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.estoquesBaixos}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Formulário de Cadastro */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {editando ? "Editar Camiseta" : "Nova Camiseta"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="modelo" className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    id="modelo"
                    name="modelo"
                    value={formulario.modelo}
                    onChange={handleInputChange}
                    placeholder="Ex: Polo, Básica, Estampada..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cor" className="block text-sm font-medium text-gray-700 mb-2">
                    Cor *
                  </label>
                  <select
                    id="cor"
                    name="cor"
                    value={formulario.cor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Selecione a cor</option>
                    {CORES_PREDEFINIDAS.map((cor) => (
                      <option key={cor} value={cor}>
                        {cor}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tamanho" className="block text-sm font-medium text-gray-700 mb-2">
                    Tamanho *
                  </label>
                  <select
                    id="tamanho"
                    name="tamanho"
                    value={formulario.tamanho}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Selecione o tamanho</option>
                    {TAMANHOS.map((tamanho) => (
                      <option key={tamanho} value={tamanho}>
                        {tamanho}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    id="quantidade"
                    name="quantidade"
                    value={formulario.quantidade}
                    onChange={handleInputChange}
                    min="1"
                    max="999"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={salvando}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {salvando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        {editando ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editando ? "Atualizar" : "Cadastrar"}
                      </>
                    )}
                  </button>

                  {editando && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditando(null)
                        setFormulario({ tamanho: "", modelo: "", cor: "", quantidade: 1 })
                      }}
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Lista de Camisetas */}
          <div className="lg:col-span-3">
            {/* Filtros e Controles */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Estoque ({camisetasFiltradas.length} {camisetasFiltradas.length === 1 ? "item" : "itens"})
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por modelo ou cor..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <select
                  value={filtroTamanho}
                  onChange={(e) => setFiltroTamanho(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos os tamanhos</option>
                  {TAMANHOS.map((tamanho) => (
                    <option key={tamanho} value={tamanho}>
                      {tamanho}
                    </option>
                  ))}
                </select>

                <select
                  value={filtroCor}
                  onChange={(e) => setFiltroCor(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas as cores</option>
                  {CORES_PREDEFINIDAS.map((cor) => (
                    <option key={cor} value={cor}>
                      {cor}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid/Lista de Camisetas */}
            {currentItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  {camisetasFiltradas.length === 0 ? "Nenhuma camiseta encontrada" : "Nenhuma camiseta cadastrada"}
                </h3>
                <p className="text-gray-500">
                  {camisetasFiltradas.length === 0
                    ? "Tente ajustar os filtros de busca."
                    : "Comece cadastrando sua primeira camiseta."}
                </p>
              </div>
            ) : (
              <>
                <div
                  className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
                >
                  {currentItems.map((grupo, index) => (
                    <div
                      key={index}
                      className={`bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group ${
                        viewMode === "list" ? "p-4" : "p-6"
                      }`}
                    >
                      {viewMode === "grid" ? (
                        // Vista em Grid
                        <>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                                <Shirt className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg">{grupo.modelo}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${getCorColor(grupo.cor)}`}
                                  />
                                  <span className="text-sm text-gray-600">{grupo.cor}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-1">
                              <button
                                onClick={() => setModalDetalhes(grupo)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditar(grupo)}
                                className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleExcluir(grupo)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border mb-4 ${getTamanhoColor(grupo.tamanho)}`}
                          >
                            Tamanho {grupo.tamanho}
                          </div>

                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-medium">Quantidade:</span>
                              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {grupo.quantidade}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>Status:</span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  grupo.quantidade > 10
                                    ? "bg-green-100 text-green-800"
                                    : grupo.quantidade > 5
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {grupo.quantidade > 10 ? "Alto" : grupo.quantidade > 5 ? "Médio" : "Baixo"}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        // Vista em Lista
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Shirt className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{grupo.modelo}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <div className={`w-3 h-3 rounded-full ${getCorColor(grupo.cor)}`} />
                                  {grupo.cor}
                                </div>
                                <div
                                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getTamanhoColor(grupo.tamanho)}`}
                                >
                                  {grupo.tamanho}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">{grupo.quantidade}</div>
                              <div className="text-xs text-gray-500">unidades</div>
                            </div>

                            <div className="flex gap-1">
                              <button
                                onClick={() => setModalDetalhes(grupo)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditar(grupo)}
                                className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleExcluir(grupo)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {modalDetalhes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Detalhes da Camiseta</h3>
              <button
                onClick={() => setModalDetalhes(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shirt className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{modalDetalhes.modelo}</h4>
                  <p className="text-gray-600">Modelo da camiseta</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-4 h-4 rounded-full ${getCorColor(modalDetalhes.cor)}`} />
                    <span className="font-medium text-gray-900">{modalDetalhes.cor}</span>
                  </div>
                  <p className="text-sm text-gray-600">Cor</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div
                    className={`inline-flex px-2 py-1 rounded-full text-sm font-medium border mb-2 ${getTamanhoColor(modalDetalhes.tamanho)}`}
                  >
                    {modalDetalhes.tamanho}
                  </div>
                  <p className="text-sm text-gray-600">Tamanho</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    {modalDetalhes.quantidade}
                  </div>
                  <p className="text-gray-600">Unidades em estoque</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    handleEditar(modalDetalhes)
                    setModalDetalhes(null)
                  }}
                  className="flex-1 bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg hover:bg-yellow-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    handleExcluir(modalDetalhes)
                    setModalDetalhes(null)
                  }}
                  className="flex-1 bg-red-100 text-red-800 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
