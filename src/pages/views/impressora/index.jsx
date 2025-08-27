import { useEffect, useState, useMemo } from "react"
import { getDatabase, ref, onValue, update } from "firebase/database"
import { app } from "../../../../firebase"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  HelpCircle,
  Calendar,
  MapPin,
  Printer,
  DollarSign,
  Hash,
  Building,
  Users,
  FileText,
  Eye,
  EyeOff,
  X,
  Save,
  Edit3,
  Lock,
  ImageIcon,
  Info,
  Search,
  Filter,
  Download,
  RefreshCw,
  Copy,
  Activity,
  CheckCheck,
  AlertTriangle,
  Loader2,
  Sparkles,
  Command,
} from "lucide-react"

const CONEXAO_CONFIG = {
  online: {
    cor: "border-emerald-400/50",
    corFundo: "from-emerald-50 to-green-50",
    corStatus: "bg-emerald-100 text-emerald-800",
    icone: <CheckCircle className="text-emerald-500 w-5 h-5" />,
    iconeGrande: <Wifi className="text-emerald-500 w-8 h-8" />,
    texto: "Online",
    pulso: "animate-pulse bg-emerald-400",
    gradient: "from-emerald-500 to-green-500",
  },
  offline: {
    cor: "border-red-400/50",
    corFundo: "from-red-50 to-rose-50",
    corStatus: "bg-red-100 text-red-800",
    icone: <XCircle className="text-red-500 w-5 h-5" />,
    iconeGrande: <WifiOff className="text-red-500 w-8 h-8" />,
    texto: "Offline",
    pulso: "bg-red-400",
    gradient: "from-red-500 to-rose-500",
  },
  indefinido: {
    cor: "border-slate-300/50",
    corFundo: "from-slate-50 to-gray-50",
    corStatus: "bg-slate-100 text-slate-700",
    icone: <AlertCircle className="text-slate-500 w-5 h-5" />,
    iconeGrande: <HelpCircle className="text-slate-500 w-8 h-8" />,
    texto: "Indefinido",
    pulso: "bg-slate-400",
    gradient: "from-slate-500 to-gray-500",
  },
}

// Toast Notification Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: <CheckCheck className="w-5 h-5" />,
    error: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  }

  const colors = {
    success: "bg-emerald-500 border-emerald-400",
    error: "bg-red-500 border-red-400",
    info: "bg-blue-500 border-blue-400",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-4 right-4 z-[100] ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-sm flex items-center gap-3 min-w-[300px]`}
    >
      {icons[type]}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-auto hover:bg-white/20 p-1 rounded-lg transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// Advanced Tooltip Component
function Tooltip({ text, children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div
      className="relative group cursor-default"
      onMouseEnter={() => setTimeout(() => setIsVisible(true), delay)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900/95 backdrop-blur-sm text-white text-xs px-4 py-2 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-slate-700/50"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 overflow-hidden"
        >
          <div className="h-48 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-pulse"></div>
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl animate-pulse"></div>
              <div className="h-16 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl animate-pulse"></div>
            </div>
            <div className="h-12 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl animate-pulse"></div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Advanced Search and Filter Component
function SearchAndFilter({ searchTerm, setSearchTerm, sortBy, setSortBy, filterStatus, setFilterStatus, onExport }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-lg mb-8"
    >
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar impressoras... (Ctrl+K)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white/80 backdrop-blur-sm"
          />
          {searchTerm && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Tooltip text="Filtros avançados">
            <motion.button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                isFilterOpen
                  ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                  : "bg-white/80 border-slate-200 hover:border-slate-300"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-5 h-5" />
            </motion.button>
          </Tooltip>

          <Tooltip text="Exportar dados">
            <motion.button
              onClick={onExport}
              className="p-3 rounded-xl bg-white/80 border-2 border-slate-200 hover:border-slate-300 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-5 h-5" />
            </motion.button>
          </Tooltip>

          <Tooltip text="Atualizar dados">
            <motion.button
              className="p-3 rounded-xl bg-white/80 border-2 border-slate-200 hover:border-slate-300 transition-all duration-200"
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </Tooltip>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-slate-200/50 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white/80"
                >
                  <option value="">Todos os status</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="indefinido">Indefinido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white/80"
                >
                  <option value="modelo">Modelo</option>
                  <option value="marca">Marca</option>
                  <option value="local">Local</option>
                  <option value="dataCadastro">Data de Cadastro</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div className="flex items-end">
                <motion.button
                  onClick={() => {
                    setSearchTerm("")
                    setSortBy("modelo")
                    setFilterStatus("")
                  }}
                  className="w-full p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Limpar Filtros
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Statistics Dashboard Component
function StatsDashboard({ impressoras }) {
  const stats = useMemo(() => {
    const total = impressoras.length
    const online = impressoras.filter((imp) => imp.conexao === "online").length
    const offline = impressoras.filter((imp) => imp.conexao === "offline").length
    const indefinido = impressoras.filter((imp) => imp.conexao === "indefinido").length

    return { total, online, offline, indefinido }
  }, [impressoras])

  const statCards = [
    {
      label: "Total",
      value: stats.total,
      icon: <Printer className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-500",
      bg: "from-blue-50 to-indigo-50",
    },
    {
      label: "Online",
      value: stats.online,
      icon: <Wifi className="w-6 h-6" />,
      color: "from-emerald-500 to-green-500",
      bg: "from-emerald-50 to-green-50",
    },
    {
      label: "Offline",
      value: stats.offline,
      icon: <WifiOff className="w-6 h-6" />,
      color: "from-red-500 to-rose-500",
      bg: "from-red-50 to-rose-50",
    },
    {
      label: "Indefinido",
      value: stats.indefinido,
      icon: <HelpCircle className="w-6 h-6" />,
      color: "from-slate-500 to-gray-500",
      bg: "from-slate-50 to-gray-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gradient-to-br ${stat.bg} backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
              <motion.p
                key={stat.value}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-slate-900"
              >
                {stat.value}
              </motion.p>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg`}>{stat.icon}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Enhanced Info Item Component
function InfoItem({ icon, label, value, className = "", isHighlighted = false }) {
  return (
    <motion.div
      className={`relative flex items-center gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:bg-white/80 hover:border-slate-300/50 transition-all duration-200 group ${className}`}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      {isHighlighted && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <div className="flex-shrink-0 p-2 rounded-lg bg-slate-100/80 group-hover:bg-slate-200/80 transition-colors">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">{label}</p>
        <Tooltip text={value || "-"}>
          <p className="text-sm font-semibold text-slate-900 truncate">{value || "-"}</p>
        </Tooltip>
      </div>
      <motion.div
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Copy className="w-4 h-4 text-slate-400 cursor-pointer" onClick={() => navigator.clipboard.writeText(value)} />
      </motion.div>
    </motion.div>
  )
}

// Enhanced Modal Component
function Modal({ isOpen, onClose, impressora, onSave }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  useEffect(() => {
    if (impressora) {
      setEditData({ ...impressora })
      setHasChanges(false)
    }
  }, [impressora])

  useEffect(() => {
    if (impressora) {
      const changed = JSON.stringify(editData) !== JSON.stringify(impressora)
      setHasChanges(changed)
    }
  }, [editData, impressora])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({ ...impressora })
    setHasChanges(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editData)
      setIsEditing(false)
      setHasChanges(false)
    } catch (error) {
      console.error("Erro ao salvar:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  if (!isOpen || !impressora) return null

  const status = CONEXAO_CONFIG[impressora.conexao?.toLowerCase()] || CONEXAO_CONFIG.indefinido

  const tabs = [
    { id: "basic", label: "Básico", icon: <Info className="w-4 h-4" /> },
    { id: "patrimony", label: "Patrimônio", icon: <DollarSign className="w-4 h-4" /> },
    { id: "project", label: "Projeto", icon: <Users className="w-4 h-4" /> },
    { id: "notes", label: "Observações", icon: <FileText className="w-4 h-4" /> },
  ]

  const InputField = ({ label, field, icon, type = "text", disabled = false, placeholder = "", rows = 1 }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon}
        {label}
        {disabled && <Lock className="w-3 h-3 text-slate-400" />}
        {hasChanges && editData[field] !== impressora[field] && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-amber-400 rounded-full" />
        )}
      </label>
      {isEditing && !disabled ? (
        rows > 1 ? (
          <motion.textarea
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            value={editData[field] || ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
          />
        ) : (
          <motion.input
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            type={type}
            value={editData[field] || ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white/80 backdrop-blur-sm"
          />
        )
      ) : (
        <div
          className={`px-4 py-3 rounded-xl ${disabled ? "bg-slate-100/80" : "bg-white/60"} border border-slate-200/50 text-slate-900 font-medium ${
            rows > 1 ? "min-h-[80px]" : ""
          }`}
        >
          {editData[field] || "-"}
        </div>
      )}
    </div>
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <div
            className={`bg-gradient-to-r ${status.corFundo} border-b border-slate-200/50 p-6 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  {status.iconeGrande}
                </motion.div>
                <div>
                  <motion.h2
                    className="text-3xl font-bold text-slate-900 mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {impressora.modelo || "Impressora"}
                  </motion.h2>
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.corStatus} text-sm font-semibold shadow-sm`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {status.icone}
                      {status.texto}
                    </motion.div>
                    <motion.div
                      className={`w-3 h-3 rounded-full ${status.pulso} ${impressora.conexao === "online" ? "animate-pulse" : ""} shadow-lg`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                    {hasChanges && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold"
                      >
                        <Sparkles className="w-3 h-3" />
                        Alterações pendentes
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isEditing ? (
                  <motion.button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit3 className="w-5 h-5" />
                    Editar
                  </motion.button>
                ) : (
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleCancel}
                      className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      onClick={handleSave}
                      disabled={isSaving || !hasChanges}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      whileHover={{ scale: hasChanges ? 1.05 : 1 }}
                      whileTap={{ scale: hasChanges ? 0.95 : 1 }}
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      {isSaving ? "Salvando..." : "Salvar"}
                    </motion.button>
                  </div>
                )}
                <motion.button
                  onClick={onClose}
                  className="p-3 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="border-b border-slate-200/50 bg-white/80 backdrop-blur-sm">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600 bg-indigo-50/50"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  {tab.icon}
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Enhanced Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-200px)] bg-gradient-to-br from-slate-50/50 to-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-8"
              >
                {activeTab === "basic" && (
                  <div className="space-y-8">
                    {/* Imagem */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 border border-slate-200/50 shadow-inner">
                      <div className="flex items-center gap-3 mb-6">
                        <ImageIcon className="w-6 h-6 text-slate-600" />
                        <h3 className="text-xl font-bold text-slate-900">Imagem da Impressora</h3>
                      </div>
                      <div className="flex justify-center">
                        {impressora.fotoBase64 ? (
                          <motion.div
                            className="relative group"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <img
                              src={impressora.fotoBase64 || "/placeholder.svg"}
                              alt={impressora.modelo || "Impressora"}
                              className="max-h-64 object-contain rounded-2xl shadow-2xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </motion.div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <motion.div
                              animate={{ y: [0, -10, 0] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            >
                              <Printer className="w-20 h-20 mb-4" />
                            </motion.div>
                            <span className="font-semibold text-lg">Nenhuma imagem disponível</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Informações Básicas */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200/50 shadow-inner">
                      <div className="flex items-center gap-3 mb-8">
                        <Info className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-slate-900">Informações Básicas</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                          label="Modelo"
                          field="modelo"
                          icon={<Printer className="w-4 h-4 text-indigo-600" />}
                          placeholder="Digite o modelo da impressora"
                        />
                        <InputField
                          label="Marca"
                          field="marca"
                          icon={<Building className="w-4 h-4 text-green-600" />}
                          placeholder="Digite a marca"
                        />
                        <InputField
                          label="Endereço IP"
                          field="ip"
                          icon={<Hash className="w-4 h-4 text-purple-600" />}
                          placeholder="Ex: 192.168.1.100"
                        />
                        <InputField
                          label="Local"
                          field="local"
                          icon={<MapPin className="w-4 h-4 text-blue-600" />}
                          placeholder="Digite a localização"
                        />
                        <InputField
                          label="Tipo/Cor"
                          field="tipoCor"
                          icon={<Printer className="w-4 h-4 text-pink-600" />}
                          placeholder="Ex: Colorida, Monocromática"
                        />
                        <InputField
                          label="Status"
                          field="conexao"
                          icon={<Lock className="w-4 h-4 text-slate-400" />}
                          disabled={true}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "patrimony" && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-200/50 shadow-inner">
                    <div className="flex items-center gap-3 mb-8">
                      <DollarSign className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-xl font-bold text-slate-900">Informações Patrimoniais</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Patrimônio"
                        field="patrimonio"
                        icon={<Hash className="w-4 h-4 text-orange-600" />}
                        placeholder="Número do patrimônio"
                      />
                      <InputField
                        label="NCM"
                        field="NCM"
                        icon={<FileText className="w-4 h-4 text-red-600" />}
                        placeholder="Código NCM"
                      />
                      <InputField
                        label="Ano"
                        field="ano"
                        icon={<Calendar className="w-4 h-4 text-teal-600" />}
                        type="number"
                        placeholder="Ano de fabricação"
                      />
                      <InputField
                        label="Data de Cadastro"
                        field="dataCadastro"
                        icon={<Calendar className="w-4 h-4 text-cyan-600" />}
                        type="date"
                      />
                      <InputField
                        label="Nota Fiscal"
                        field="notaFiscal"
                        icon={<FileText className="w-4 h-4 text-yellow-600" />}
                        placeholder="Número da nota fiscal"
                      />
                      <InputField
                        label="Valor do Bem"
                        field="vrbem"
                        icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
                        type="number"
                        placeholder="Valor em reais"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "project" && (
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-8 border border-purple-200/50 shadow-inner">
                    <div className="flex items-center gap-3 mb-8">
                      <Users className="w-6 h-6 text-purple-600" />
                      <h3 className="text-xl font-bold text-slate-900">Informações do Projeto</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Projeto"
                        field="projeto"
                        icon={<Building className="w-4 h-4 text-pink-600" />}
                        placeholder="Nome do projeto"
                      />
                      <InputField
                        label="Parceiro"
                        field="parceiro"
                        icon={<Users className="w-4 h-4 text-violet-600" />}
                        placeholder="Nome do parceiro"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "notes" && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200/50 shadow-inner">
                    <div className="flex items-center gap-3 mb-8">
                      <FileText className="w-6 h-6 text-amber-600" />
                      <h3 className="text-xl font-bold text-slate-900">Observações</h3>
                    </div>
                    <div className="space-y-6">
                      <InputField
                        label="Motivo"
                        field="motivo"
                        icon={<AlertCircle className="w-4 h-4 text-amber-600" />}
                        placeholder="Descreva o motivo..."
                        rows={4}
                      />
                      <InputField
                        label="Observações Gerais"
                        field="obs"
                        icon={<FileText className="w-4 h-4 text-slate-600" />}
                        placeholder="Observações adicionais..."
                        rows={6}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function VisualizacaoImpressoras() {
  const [impressoras, setImpressoras] = useState([])
  const [imageErrors, setImageErrors] = useState({})
  const [expandedCards, setExpandedCards] = useState({})
  const [selectedImpressora, setSelectedImpressora] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("modelo")
  const [filterStatus, setFilterStatus] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        document.querySelector('input[placeholder*="Buscar"]')?.focus()
      }
      if (e.key === "Escape" && isModalOpen) {
        closeModal()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen])

  const showToast = (message, type = "info") => {
    setToast({ message, type, id: Date.now() })
  }
  
  const formatDate = (date) => {
    if (!date) return "--";
    try {
      const d = new Date(date);
      const day = String(d.getUTCDate()).padStart(2, "0");
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "--";
    }
  };

  const formatNotaFiscal = (nota) => {
    if (!nota) return "-"
    const num = nota.toString().replace(/\D/g, "")
    if (!num) return nota
    return Number(num).toLocaleString("pt-BR")
  }

  const formatValorBem = (valor) => {
    if (valor == null || valor === "") return "-"
    const num = Number(valor)
    if (isNaN(num)) return valor
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const formatNCM = (ncm) => {
    if (!ncm) return "-"
    const onlyDigits = ncm.toString().replace(/\D/g, "")
    return onlyDigits.padStart(8, "0")
  }

  const handleImageError = (impId) => {
    setImageErrors((prev) => ({ ...prev, [impId]: true }))
  }

  const toggleExpanded = (impId) => {
    setExpandedCards((prev) => ({ ...prev, [impId]: !prev[impId] }))
  }

  const openModal = (impressora) => {
    setSelectedImpressora(impressora)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImpressora(null)
  }

  const handleSave = async (editedData) => {
    try {
      const db = getDatabase(app)
      const impressoraRef = ref(db, `impressoras/${editedData.id}`)

      const { id, ...dataToSave } = editedData
      await update(impressoraRef, dataToSave)

      setImpressoras((prev) => prev.map((imp) => (imp.id === editedData.id ? editedData : imp)))
      setSelectedImpressora(editedData)

      showToast("Impressora atualizada com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao salvar impressora:", error)
      showToast("Erro ao salvar impressora", "error")
      throw error
    }
  }

  const handleExport = () => {
    const csvContent = [
      [
        "Modelo",
        "Marca",
        "IP",
        "Local",
        "Status",
        "Patrimônio",
        "NCM",
        "Ano",
        "Nota Fiscal",
        "Valor",
        "Projeto",
        "Parceiro",
      ].join(","),
      ...filteredAndSortedImpressoras.map((imp) =>
        [
          imp.modelo || "",
          imp.marca || "",
          imp.ip || "",
          imp.local || "",
          imp.conexao || "",
          imp.patrimonio || "",
          formatNCM(imp.NCM),
          imp.ano || "",
          formatNotaFiscal(imp.notaFiscal),
          imp.vrbem || "",
          imp.projeto || "",
          imp.parceiro || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `impressoras_${new Date().toISOString().split("T")[0]}.csv`
    link.click()

    showToast("Dados exportados com sucesso!", "success")
  }

  const filteredAndSortedImpressoras = useMemo(() => {
    const filtered = impressoras.filter((imp) => {
      const matchesSearch =
        !searchTerm ||
        Object.values(imp).some((value) => value?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = !filterStatus || imp.conexao?.toLowerCase() === filterStatus.toLowerCase()
      return matchesSearch && matchesStatus
    })

    return filtered.sort((a, b) => {
      const aValue = a[sortBy] || ""
      const bValue = b[sortBy] || ""
      return aValue.toString().localeCompare(bValue.toString())
    })
  }, [impressoras, searchTerm, sortBy, filterStatus])

  useEffect(() => {
    const db = getDatabase(app)
    const impressorasRefDB = ref(db, "impressoras")
    const unsubscribe = onValue(impressorasRefDB, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setImpressoras([])
        setIsLoading(false)
        return
      }
      const lista = Object.entries(data).map(([id, imp]) => ({
        id,
        ...imp,
        conexao: imp.status || "indefinido",
      }))
      setImpressoras(lista)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="h-8 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-lg animate-pulse mb-2 w-64"></div>
            <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-pulse w-48"></div>
          </motion.div>
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          {/* Botão de Voltar */}
          <motion.button
            onClick={() => window.history.back()}
            className="group flex items-center gap-3 mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl hover:bg-white hover:border-slate-300/50 hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              className="p-1 rounded-lg bg-slate-100/80 group-hover:bg-indigo-100 transition-colors"
              whileHover={{ rotate: -5 }}
            >
              <svg
                className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">
              Voltar
            </span>
          </motion.button>

          <div className="flex items-center gap-4 mb-4">
            <motion.div
              className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Activity className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                Painel de Impressoras
              </h1>
              <p className="text-slate-600 text-lg">Gerencie e monitore suas impressoras em tempo real</p>
            </div>
          </div>
        </motion.div>

        {/* Statistics Dashboard */}
        <StatsDashboard impressoras={impressoras} />

        {/* Search and Filter */}
        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          onExport={handleExport}
        />

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center justify-between"
        >
          <p className="text-slate-600 font-medium">
            {filteredAndSortedImpressoras.length} de {impressoras.length} impressoras
            {searchTerm && ` • Buscando por "${searchTerm}"`}
            {filterStatus && ` • Filtro: ${filterStatus}`}
          </p>
          {filteredAndSortedImpressoras.length > 0 && (
            <motion.div
              className="text-sm text-slate-500 flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Command className="w-4 h-4" />
              Pressione Ctrl+K para buscar
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAndSortedImpressoras.map((imp, index) => {
              const status = CONEXAO_CONFIG[imp.conexao.toLowerCase()] || CONEXAO_CONFIG.indefinido
              const isExpanded = expandedCards[imp.id]

              return (
                <motion.div
                  key={imp.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 100,
                  }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`group relative bg-gradient-to-br ${status.corFundo} backdrop-blur-sm rounded-3xl border-2 ${status.cor} shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer`}
                  onClick={() => openModal(imp)}
                >
                  {/* Enhanced Status Indicators */}
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    <motion.div
                      className={`w-4 h-4 rounded-full ${status.pulso} ${status.conexao === "online" ? "animate-pulse" : ""} shadow-lg`}
                      animate={{
                        scale: status.conexao === "online" ? [1, 1.3, 1] : 1,
                        opacity: status.conexao === "online" ? [1, 0.7, 1] : 1,
                      }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                  </div>

                  {/* Enhanced Header */}
                  <div className="relative h-52 bg-gradient-to-br from-white/90 to-slate-100/90 border-b border-slate-200/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
                    <div className="relative h-full flex items-center justify-center p-6">
                      {imp.fotoBase64 && !imageErrors[imp.id] ? (
                        <motion.img
                          src={imp.fotoBase64}
                          alt={imp.modelo || "Impressora"}
                          className="max-h-full max-w-full object-contain drop-shadow-2xl"
                          loading="lazy"
                          onError={() => handleImageError(imp.id)}
                          whileHover={{ scale: 1.1, rotate: 2 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      ) : (
                        <motion.div
                          className="flex flex-col items-center justify-center text-slate-400 space-y-4"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                        >
                          <Printer className="w-20 h-20" />
                          <span className="text-sm font-semibold">Sem imagem</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Enhanced Status Badge */}
                    <div className="absolute bottom-4 left-4">
                      <motion.div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.corStatus} backdrop-blur-sm shadow-lg border border-white/50`}
                        whileHover={{ scale: 1.05, y: -1 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        {status.icone}
                        <span className="text-xs font-bold">{status.texto}</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Enhanced Content */}
                  <div className="p-6 space-y-5">
                    {/* Enhanced Title */}
                    <div className="flex items-start justify-between">
                      <Tooltip text={imp.modelo || "Sem modelo"}>
                        <motion.h2
                          className="text-xl font-bold text-slate-900 truncate pr-2 group-hover:text-indigo-700 transition-colors"
                          whileHover={{ scale: 1.02 }}
                        >
                          {imp.modelo || "Sem modelo"}
                        </motion.h2>
                      </Tooltip>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpanded(imp.id)
                        }}
                        className="p-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 transition-all duration-200 shadow-sm"
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </motion.button>
                    </div>

                    {/* Enhanced Info Items */}
                    <div className="grid grid-cols-2 gap-3">
                      <InfoItem
                        icon={<MapPin className="w-4 h-4 text-blue-600" />}
                        label="Local"
                        value={imp.local}
                        isHighlighted={searchTerm && imp.local?.toLowerCase().includes(searchTerm.toLowerCase())}
                      />
                      <InfoItem
                        icon={<Hash className="w-4 h-4 text-purple-600" />}
                        label="IP"
                        value={imp.ip}
                        isHighlighted={searchTerm && imp.ip?.toLowerCase().includes(searchTerm.toLowerCase())}
                      />
                    </div>

                    {/* Enhanced Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="space-y-3 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <motion.div
                            className="grid grid-cols-1 gap-3"
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <InfoItem
                              icon={<Building className="w-4 h-4 text-green-600" />}
                              label="Marca"
                              value={imp.marca}
                              isHighlighted={searchTerm && imp.marca?.toLowerCase().includes(searchTerm.toLowerCase())}
                            />
                            <InfoItem
                              icon={<Hash className="w-4 h-4 text-orange-600" />}
                              label="Patrimônio"
                              value={imp.patrimonio}
                            />
                            <InfoItem
                              icon={<Printer className="w-4 h-4 text-indigo-600" />}
                              label="Tipo"
                              value={imp.tipoCor}
                            />
                            <InfoItem
                              icon={<FileText className="w-4 h-4 text-red-600" />}
                              label="NCM"
                              value={formatNCM(imp.NCM)}
                            />
                            <InfoItem
                              icon={<Calendar className="w-4 h-4 text-teal-600" />}
                              label="Ano"
                              value={imp.ano}
                            />
                            <InfoItem
                              icon={<Calendar className="w-4 h-4 text-cyan-600" />}
                              label="Data Cadastro"
                              value={formatDate(imp.dataCadastro)}
                            />
                            <InfoItem
                              icon={<FileText className="w-4 h-4 text-yellow-600" />}
                              label="Nota Fiscal"
                              value={formatNotaFiscal(imp.notaFiscal)}
                            />
                            <InfoItem
                              icon={<Building className="w-4 h-4 text-pink-600" />}
                              label="Projeto"
                              value={imp.projeto}
                            />
                            <InfoItem
                              icon={<Users className="w-4 h-4 text-violet-600" />}
                              label="Parceiro"
                              value={imp.parceiro}
                            />
                            <InfoItem
                              icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
                              label="Valor Bem"
                              value={formatValorBem(imp.vrbem)}
                            />
                            {imp.motivo && (
                              <InfoItem
                                icon={<AlertCircle className="w-4 h-4 text-amber-600" />}
                                label="Motivo"
                                value={imp.motivo}
                                className="col-span-full"
                              />
                            )}
                            {imp.obs && (
                              <InfoItem
                                icon={<FileText className="w-4 h-4 text-slate-600" />}
                                label="Observações"
                                value={imp.obs}
                                className="col-span-full"
                              />
                            )}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Enhanced Action Button */}
                    <motion.button
                      className="w-full mt-6 inline-flex items-center justify-center gap-3 px-6 py-4 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 shadow-xl hover:shadow-2xl group relative overflow-hidden"
                      onClick={(e) => {
                        e.stopPropagation()
                        openModal(imp)
                      }}
                      aria-label={`Ver detalhes da impressora ${imp.modelo}`}
                      type="button"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <Eye className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      Ver Detalhes
                      <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Enhanced Empty State */}
        {filteredAndSortedImpressoras.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              className="mb-6"
            >
              <Printer className="w-24 h-24 text-slate-400 mx-auto" />
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-600 mb-3">
              {searchTerm || filterStatus ? "Nenhum resultado encontrado" : "Nenhuma impressora encontrada"}
            </h3>
            <p className="text-slate-500 text-lg mb-6">
              {searchTerm || filterStatus
                ? "Tente ajustar os filtros ou termo de busca"
                : "As impressoras aparecerão aqui quando estiverem disponíveis"}
            </p>
            {(searchTerm || filterStatus) && (
              <motion.button
                onClick={() => {
                  setSearchTerm("")
                  setFilterStatus("")
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Limpar Filtros
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Enhanced Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} impressora={selectedImpressora} onSave={handleSave} />

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  )
}
