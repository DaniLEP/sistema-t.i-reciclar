import React from "react"
import { useEffect, useState, useMemo } from "react"
import { getDatabase, ref, onValue, update } from "firebase/database"
import { TabletSmartphone,ArrowLeft, X,Download,Search, Filter,Grid3X3,List,SortAsc, SortDesc,Eye,Edit3,CheckCircle2, AlertCircle, Clock, Wrench, 
  UserCheck, Users,MapPin,TrendingUp,Zap } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion"
import { ToastContainer, toast } from "react-toastify"
import * as XLSX from "xlsx"
import "react-toastify/dist/ReactToastify.css"
import { app } from "../../../../firebase"
import { Input } from "@/components/ui/input"
import TermoEmprestimo from "@/pages/termo"

const STATUS_OPTIONS = [ "Disponível", "Quebrado","Manutenção","Emprestado","Não encontrado", "Controlador", "Colaborador"]

const STATUS_CONFIG = {
  Disponível: { color: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100", icon: CheckCircle2, gradient: "from-emerald-400 to-emerald-600",},
  Quebrado: { color: "bg-red-50 text-red-700 border-red-200 shadow-red-100", icon: AlertCircle, radient: "from-red-400 to-red-600", },
  Emprestado: { color: "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100", icon: Clock, gradient: "from-amber-400 to-amber-600", },
  Manutenção: { color: "bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100", icon: Wrench, gradient: "from-blue-400 to-blue-600" },
  "Não encontrado": { color: "bg-gray-50 text-gray-700 border-gray-200 shadow-gray-100", icon: Search, gradient: "from-gray-400 to-gray-600", },
  Controlador: { color: "bg-purple-50 text-purple-700 border-purple-200 shadow-purple-100", icon: UserCheck, gradient: "from-purple-400 to-purple-600", },
  Colaborador: { color: "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-100", icon: Users, gradient: "from-indigo-400 to-indigo-600",},
}

const SORT_OPTIONS = [
  { value: "patrimonio", label: "Patrimônio" },
  { value: "marca", label: "Marca" },
  { value: "modelo", label: "Modelo" },
  { value: "local", label: "Local" },
  { value: "status", label: "Status" },
]

export default function VisualizarTablets() {
  const [tablets, setTablets] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalTablet, setModalTablet] = useState(null)
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [motivoReadonly, setMotivoReadonly] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("Todos")
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("patrimonio")
  const [sortOrder, setSortOrder] = useState("asc")
  const [selectedTablets, setSelectedTablets] = useState(new Set())
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)

  // Animação do contador
  const springConfig = { stiffness: 100, damping: 30 }
  const totalCount = useSpring(0, springConfig)
  const statusCount = useMemo(() => {
    return STATUS_OPTIONS.reduce((acc, status) => { acc[status] = tablets.filter((t) => t.status === status).length; return acc }, {})
  }, [tablets])
  const filteredAndSortedTablets = useMemo(() => {
    const filtered = tablets.filter((tablet) => {
      const matchesSearch =
        tablet.patrimonio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tablet.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tablet.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tablet.local?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterStatus === "Todos" || tablet.status === filterStatus
      return matchesSearch && matchesFilter
    })

    return filtered.sort((a, b) => {
      const aValue = a[sortBy]?.toString().toLowerCase() || ""
      const bValue = b[sortBy]?.toString().toLowerCase() || ""
      const comparison = aValue.localeCompare(bValue)
      return sortOrder === "asc" ? comparison : -comparison
    })
  }, [tablets, searchTerm, filterStatus, sortBy, sortOrder])

  const updateTabletData = async (tabletId, statusToSave, motivoToSave = "") => {
    const db = getDatabase(app)
    const tabletRef = ref(db, `tablets/${tabletId}`)
    try {
      await update(tabletRef, {status: statusToSave, motivo: motivoToSave,})
      toast.success("Tablet atualizado com sucesso!", {icon: "🎉",style: { background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", color: "white",},})
      setModalTablet(null); setModalMotivoOpen(false); setMotivo(""); setMotivoReadonly(false)
    } catch (error) { toast.error("Erro ao atualizar tablet: " + error.message)}
  }

  const handleSalvarStatus = () => {
    if (!modalTablet) return
    const statusNormalized = modalTablet.status.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    if ( ["quebrado", "emprestado", "manutencao", "naoencontrado", "controlador", "colaborador"].includes(statusNormalized)
    ) {setMotivo(modalTablet.motivo || ""); setMotivoReadonly(!!modalTablet.motivo); setModalMotivoOpen(true)
    } else {updateTabletData(modalTablet.id, modalTablet.status, "")}
  }

  const handleSalvarMotivo = () => {
    if (motivo.trim() === "") { toast.warning("Por favor, preencha o motivo ou responsável.")
      return;} updateTabletData(modalTablet.id, modalTablet.status, motivo.trim())
  }

  const exportToExcel = () => {
    if (tablets.length === 0) {toast.warning("Não há dados para exportar."); return}
    const worksheetData = filteredAndSortedTablets.map(({ patrimonio, marca, modelo, local, status, motivo }) => ({Patrimônio: patrimonio, Marca: marca, Modelo: modelo,Local: local,Status: status,Motivo: motivo || "", }))
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tablets")
    XLSX.writeFile(workbook, `tablets_${new Date().toISOString().split("T")[0]}.xlsx`)
    toast.success("Exportação concluída com sucesso!")
  }

  const toggleSort = (field) => {
    if (sortBy === field) {setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
    else {setSortBy(field); setSortOrder("asc") }
  }

  // Skeleton Loading Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
        <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  )

  useEffect(() => {
    const db = getDatabase(app)
    const tabletsRef = ref(db, "tablets")
    const unsubscribe = onValue(tabletsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {const tabletsArray = Object.entries(data).map(([id, tablet]) => ({
          id, ...tablet, status: tablet.status || "Disponível", motivo: tablet.motivo || "",})); setTablets(tabletsArray); totalCount.set(tabletsArray.length)
      } else {setTablets([]); totalCount.set(0) }
      setLoading(false);
    })
    return () => unsubscribe()
  }, [totalCount])

  const tabletCountText = useTransform(totalCount, (value) => `${Math.round(value)} dispositivos cadastrados`)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"> {[...Array(6)].map((_, i) => (<SkeletonCard key={i} /> ))}</div>
        </div>
      </div>
    )
  }

  return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
  <ToastContainer
    position="top-right"
    autoClose={4000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    toastStyle={{
      borderRadius: "16px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    }}
  />

  <motion.div
    className="w-full max-w-7xl mx-auto"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {/* Enhanced Header */}
    <motion.div
      className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8 overflow-hidden"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg"
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <TabletSmartphone className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                Gestão de Tablets
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <motion.p className="text-gray-600 text-lg">{tabletCountText}</motion.p>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </motion.div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={() => navigate("/views")}
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100/80 backdrop-blur-sm hover:bg-gray-200/80 text-gray-700 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" /> Voltar
            </motion.button>

            {tablets.length > 0 && (
              <motion.button
                onClick={exportToExcel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Download className="w-5 h-5" /> Exportar ({filteredAndSortedTablets.length})
              </motion.button>
            )}
                                      <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowForm(true)}
                          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl text-sm shadow-lg transition-all duration-300 flex items-center gap-3"
                        >
                          <Edit3 className="w-5 h-5" />
                          Termo de Empréstimo
                        </motion.button>

          </div>
        </div>
      </div>
    </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Termo de Empréstimo</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/20 rounded-xl"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <TermoEmprestimo />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Enhanced Status Overview */}
        <motion.div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}  animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Status Overview</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {STATUS_OPTIONS.map((status, index) => {
              const config = STATUS_CONFIG[status]
              const IconComponent = config.icon
              const count = statusCount[status]
              const isActive = filterStatus === status

              return (
                <motion.div key={status} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: index * 0.05 }} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}
                  className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    isActive ? `${config.color} shadow-lg ring-2 ring-offset-2 ring-indigo-500` : `${config.color} hover:shadow-lg` }`}
                  onClick={() => setFilterStatus(filterStatus === status ? "Todos" : status)}>
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent className="w-5 h-5" />
                    <motion.div className="text-2xl font-bold" key={count} initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }} >{count}</motion.div>
                  </div>
                  <div className="text-xs font-semibold leading-tight">{status}</div>
                  {isActive && (
                    <motion.div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20"
                      layoutId="activeStatus"transition={{ type: "spring", stiffness: 500, damping: 30 }}/>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Enhanced Controls */}
        <motion.div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input type="text" placeholder="Buscar por patrimônio, marca, modelo ou local..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm" />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-10 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm min-w-[180px]">
                <option value="Todos">Todos os Status</option>
                {STATUS_OPTIONS.map((status) => (<option key={status} value={status}>{status} </option>))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm">
                {SORT_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
              </select>
              <motion.button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="p-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 bg-white/50 backdrop-blur-sm">
                {sortOrder === "asc" ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              </motion.button>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <motion.button onClick={() => setViewMode("grid")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-2xl transition-all duration-300 ${
                  viewMode === "grid" ? "bg-indigo-500 text-white shadow-lg" : "border-2 border-gray-200 hover:bg-gray-50 bg-white/50 backdrop-blur-sm"}`}>
                <Grid3X3 className="w-5 h-5" /></motion.button>
              <motion.button onClick={() => setViewMode("list")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-2xl transition-all duration-300 ${viewMode === "list" ? "bg-indigo-500 text-white shadow-lg" : "border-2 border-gray-200 hover:bg-gray-50 bg-white/50 backdrop-blur-sm"}`}>
                <List className="w-5 h-5" /></motion.button>
            </div>
          </div>
        </motion.div>

        {/* Results Info */}
        {searchTerm || filterStatus !== "Todos" ? (
          <motion.div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} >
            <p className="text-blue-800 font-medium">
              Mostrando {filteredAndSortedTablets.length} de {tablets.length} tablets
              {searchTerm && ` para "${searchTerm}"`}
              {filterStatus !== "Todos" && ` com status "${filterStatus}"`}
            </p>
          </motion.div>) : null}

        {/* Enhanced Tablets Display */}
        {filteredAndSortedTablets.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-16 text-center">
            <motion.div animate={{  rotate: [0, 10, -10, 0], scale: [1, 1.1, 1], }}
              transition={{duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut",}}
              className="p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
              <TabletSmartphone className="w-16 h-16 text-gray-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4"> {tablets.length === 0 ? "Nenhum tablet cadastrado" : "Nenhum tablet encontrado"}</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              {tablets.length === 0 ? "Comece cadastrando seu primeiro tablet para começar a gerenciar seu inventário": "Tente ajustar os filtros de busca ou limpar os termos de pesquisa"}
            </p>
            {(searchTerm || filterStatus !== "Todos") && (
              <motion.button onClick={() => {setSearchTerm(""); setFilterStatus("Todos")}} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="mt-6 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-semibold transition-all duration-300">Limpar Filtros </motion.button>
            )}
          </motion.div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
            <AnimatePresence mode="popLayout">
              {filteredAndSortedTablets.map((tablet, index) => {
                const config = STATUS_CONFIG[tablet.status]
                const IconComponent = config.icon
                return (
                  <motion.div key={tablet.id}layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }} transition={{duration: 0.4, delay: index * 0.02,layout: { type: "spring", stiffness: 500, damping: 30 },}}
                    whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 },}}
                    className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500 group ${
                      viewMode === "list" ? "flex items-center p-6" : ""}`}>
                    <div className={viewMode === "grid" ? "p-6" : "flex items-center gap-6 flex-1"}>
                      <div className={`flex gap-4 ${viewMode === "grid" ? "mb-6" : ""}`}>
                        <div className={`flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300 ${viewMode === "grid" ? "w-24 h-24" : "w-16 h-16"}`}>
                          {tablet.fotoBase64 ? (<img src={tablet.fotoBase64 || "/placeholder.svg"} alt={`Tablet ${tablet.patrimonio}`} className="object-cover w-full h-full" />
                          ) : ( <TabletSmartphone className={`text-gray-400 ${viewMode === "grid" ? "w-10 h-10" : "w-8 h-8"}`} /> )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        <div className={`flex-1 min-w-0 ${viewMode === "list" ? "flex items-center justify-between" : ""}`} >
                          <div className={viewMode === "list" ? "flex-1" : ""}>
                            <div className="flex items-start justify-between mb-3">
                              <h3 className={`font-bold text-gray-900 truncate ${viewMode === "grid" ? "text-xl" : "text-lg"}`}> {tablet.patrimonio} </h3>
                              <motion.span whileHover={{ scale: 1.05 }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 shadow-sm ${config.color}`} >
                                <IconComponent className="w-3 h-3" /> {tablet.status}
                              </motion.span>
                            </div>
                            <div className={`space-y-2 text-gray-600 ${viewMode === "grid" ? "text-sm" : "text-xs"}`}>
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                <span className="font-medium">Marca:</span> {tablet.marca}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                <span className="font-medium">Modelo:</span> {tablet.modelo}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="font-medium">Local:</span> {tablet.local}
                              </div>
                            </div>
                          </div>

                          {viewMode === "list" && (
                            <motion.button onClick={() => setModalTablet(tablet)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className="ml-4 flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg"
                            >
                              <Eye className="w-4 h-4" /> Ver </motion.button>
                          )}
                        </div>
                      </div>

                      {viewMode === "grid" && (
                        <motion.button onClick={() => setModalTablet(tablet)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                          <Eye className="w-5 h-5" /> Ver Detalhes</motion.button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
      {/* Enhanced Modal Principal */}
      <AnimatePresence>
        {modalTablet && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}onClick={() => setModalTablet(null)}> <motion.div
              className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
              initial={{ scale: 0.8, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl" whileHover={{ rotate: 5, scale: 1.1 }}>
                      <TabletSmartphone className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900">Detalhes do Tablet</h3>
                      <p className="text-gray-600 mt-1">Patrimônio: {modalTablet.patrimonio}</p>
                    </div>
                  </div>
                  <motion.button className="p-3 hover:bg-gray-100 rounded-2xl transition-colors" onClick={() => setModalTablet(null)} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} aria-label="Fechar">
                    <X className="w-6 h-6 text-gray-500" />
                  </motion.button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  <motion.div className="space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex items-center justify-center relative group">
                      {modalTablet.fotoBase64 ? (
                        <img src={modalTablet.fotoBase64 || "/placeholder.svg"}alt="Foto do tablet" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"/>
                      ) : (<TabletSmartphone className="w-20 h-20 text-gray-400" />)}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </motion.div>

                  <motion.div className="space-y-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} >
                    {[
                      { label: "Patrimônio", value: modalTablet.patrimonio, icon: TabletSmartphone },
                      { label: "Marca", value: modalTablet.marca, icon: Edit3 },
                      { label: "Modelo", value: modalTablet.modelo, icon: Edit3 },
                      { label: "Local", value: modalTablet.local, icon: MapPin },
                    ].map((item, index) => (
                      <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.05 }}
                        className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                        <div className="flex items-center gap-3 mb-1">
                          <item.icon className="w-4 h-4 text-gray-500" />
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">{item.label}</label>
                        </div>
                        <p className="text-xl font-semibold text-gray-900">{item.value}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                <motion.div className="border-t border-gray-200 pt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Status Atual</label>
                      <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold border-2 ${STATUS_CONFIG[modalTablet.status].color}`}>
                        {React.createElement(STATUS_CONFIG[modalTablet.status].icon, { className: "w-4 h-4" })}{modalTablet.status}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Alterar Status</label>
                      <select
                        value={modalTablet.status} onChange={(e) => setModalTablet((prev) => ({ ...prev, status: e.target.value}))}
                        className="w-full border-2 border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm">
                        {STATUS_OPTIONS.map((option) => (<option key={option} value={option}> {option}</option>))}
                      </select>
                    </div>
                  </div>
                  <motion.button onClick={handleSalvarStatus}  whileHover={{ scale: 1.02 }}  whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl">
                      Salvar Status </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Modal Motivo */}
      <AnimatePresence>
        {modalMotivoOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalMotivoOpen(false)}>
            <motion.div
              className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full shadow-2xl border border-white/20"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
             onClick={(e) => e.stopPropagation()} >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Edit3 className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Informe o Motivo ou Responsável</h3>
                </div>
                <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} readOnly={motivoReadonly}
                  className="w-full h-40 border-2 border-gray-300 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none bg-white/80 backdrop-blur-sm"
                  placeholder="Descreva o motivo ou informe o responsável..."/>
                <motion.button onClick={handleSalvarMotivo} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"> Salvar</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


// import { useState } from "react";
// import * as XLSX from "xlsx";
// import { getDatabase, ref, set } from "firebase/database";
// import { toast } from "react-toastify";
// import { Input } from "@/components/ui/input"; // ou use <input /> puro
// import { app } from "../../../../firebase"; // ajuste o caminho se necessário

// export default function CadastroProdutos() {
//   const [loading, setLoading] = useState(false);
//   const db = getDatabase(app);
//   const handleFileUpload = (e) => {
//     const file = e.target.files && e.target.files[0];
//     if (!file)  toast.error("Nenhum arquivo selecionado."); return;}
//     setLoading(true);
//     const reader = new FileReader();
//     reader.onload = function (event) {
//       try {
//         const binaryStr = event.target.result;
//         const workbook = XLSX.read(binaryStr, { type: "binary" });
//         const firstSheet = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[firstSheet];
//         const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
//         if (!jsonData || jsonData.length === 0)  {toast.error("❌ Planilha vazia ou mal formatada."); setLoading(false); return;}
//         let total = 0;
//         jsonData.forEach(async (item) => {
//           const patrimonio = item["patrimonio"] ? item["patrimonio"].toString().trim() : null;
//           if (!patrimonio) return;
//           const produto = {
//             patrimonio: patrimonio,
//             marca: item["marca"] ? item["marca"].toString().trim() : "",
//             modelo: item["modelo"] ? item["modelo"].toString().trim() : "",
//             local: item["local"] ? item["local"].toString().trim() : "",
//             status: item["status"] ? item["status"].toString().trim() : "Disponível",
//             motivo: item["motivo"] ? item["motivo"].toString().trim() : "",
//           };
//           const produtoRef = ref(db, `tablets/${patrimonio}`);
//           await set(produtoRef, produto); total++;
//           // Mostrar notificação apenas no último item
//           if (total === jsonData.length) { toast.success(`✅ ${total} registros importados com sucesso!`); setLoading(false);}
//         });
//       } catch (err) { console.error("Erro ao processar o arquivo:", err); toast.error("❌ Erro ao importar a planilha."); setLoading(false);}
//     };
//     reader.readAsBinaryString(file);
//   };
//   return (
//     <div className="my-6">
//       <label className="font-medium mb-2 block">📥 Importar planilha Excel (.xlsx ou .xls)</label>
//       <Input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} disabled={loading} />
//       {loading && (<p className="text-blue-700 mt-2">⏳ Importando dados...</p>)}
//     </div>
//   );
// }
