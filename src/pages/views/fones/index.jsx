"use client"

import { useEffect, useState } from "react"
import { getDatabase, ref, onValue, update } from "firebase/database"
import { app } from "../../../../firebase"
import {
  ArrowLeft,
  HeadsetIcon,
  X,
  CheckCircle,
  Clock,
  Search,
  XCircle,
  Filter,
  Download,
  Eye,
  Edit3,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as XLSX from "xlsx"
import TermoEmprestimo from "@/pages/termo"

const STATUS_OPTIONS = ["Disponível", "Quebrado", "Emprestado", "Não encontrado"]

const STATUS_CONFIG = {
  Disponível: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
    bgColor: "bg-emerald-500",
  },
  Quebrado: {
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
    bgColor: "bg-red-500",
  },
  Emprestado: {
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
    bgColor: "bg-blue-500",
  },
  "Não encontrado": {
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Search,
    bgColor: "bg-amber-500",
  },
}

const StatusCard = ({ status, count, config }) => {
  const IconComponent = config.icon

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-5 rounded-2xl border-2 ${config.color} transition-all duration-300 hover:shadow-lg cursor-pointer`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 ${config.bgColor} rounded-xl`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium opacity-80">{status}</p>
          <p className="text-3xl font-bold">{count}</p>
        </div>
      </div>
    </motion.div>
  )
}

const FoneCard = ({ fone, index, onViewDetails }) => {
  const statusConfig = STATUS_CONFIG[fone.status] || {
    color: "bg-gray-50 text-gray-700 border-gray-200",
    icon: XCircle,
    bgColor: "bg-gray-500",
  }
  const StatusIcon = statusConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 ${statusConfig.bgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
            <HeadsetIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-xl">{fone.patrimonio}</h3>
            <p className="text-sm text-gray-500 font-medium">{fone.marca}</p>
          </div>
        </div>
        <div
          className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 ${statusConfig.color} flex items-center gap-2 shadow-sm`}
        >
          <StatusIcon className="w-4 h-4" />
          {fone.status}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-5">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">Modelo:</span>
          <span className="font-semibold text-gray-800 bg-gray-50 px-3 py-1 rounded-lg">{fone.modelo}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">Local:</span>
          <span className="font-semibold text-gray-800 bg-gray-50 px-3 py-1 rounded-lg">{fone.local}</span>
        </div>
      </div>

      {/* Motivo */}
      {fone.motivo && (
        <div className="mb-5 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Motivo/Responsável:</span>
            <br />
            <span className="mt-1 block">{fone.motivo}</span>
          </p>
        </div>
      )}

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onViewDetails(fone)}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl text-sm transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        Ver Detalhes
      </motion.button>
    </motion.div>
  )
}

const FilterBar = ({ filtroStatus, setFiltroStatus, buscaTexto, setBuscaTexto, totalFones }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-800">Filtros</h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por patrimônio ou marca..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="sm:w-48">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Todos os status</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500 font-medium">
          {totalFones} fone{totalFones !== 1 ? "s" : ""} encontrado{totalFones !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  )
}

export default function VisualizarFones() {
  const [fones, setFones] = useState([])
  const [modalTablet, setModalTablet] = useState(null)
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [motivoReadonly, setMotivoReadonly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const [filtroStatus, setFiltroStatus] = useState("")
  const [buscaTexto, setBuscaTexto] = useState("")
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const db = getDatabase(app)
    const fonesRef = ref(db, "fones")
    const unsubscribe = onValue(fonesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const fonesArray = Object.entries(data).map(([id, fone]) => ({
          id,
          ...fone,
          status: fone.status || "Disponível",
          motivo: fone.motivo || "",
        }))
        setFones(fonesArray)
      } else {
        setFones([])
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const statusCount = STATUS_OPTIONS.reduce((acc, status) => {
    acc[status] = fones.filter((f) => f.status === status).length
    return acc
  }, {})

  const fonesFiltrados = fones.filter((f) => {
    const matchStatus = !filtroStatus || f.status === filtroStatus
    const matchTexto =
      !buscaTexto ||
      f.patrimonio?.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      f.marca?.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      f.modelo?.toLowerCase().includes(buscaTexto.toLowerCase())
    return matchStatus && matchTexto
  })

  const updateTabletData = async (tabletId, statusToSave, motivoToSave = "") => {
    const db = getDatabase(app)
    const tabletRef = ref(db, `fones/${tabletId}`)
    try {
      await update(tabletRef, { status: statusToSave, motivo: motivoToSave })
      toast.success("✅ Fone atualizado com sucesso!")
      setModalTablet(null)
      setModalMotivoOpen(false)
      setMotivo("")
      setMotivoReadonly(false)
    } catch (error) {
      toast.error("❌ Erro ao atualizar fone: " + error.message)
    }
  }

  const handleSalvarStatus = () => {
    if (!modalTablet) return
    if (["Quebrado", "Emprestado", "Não encontrado"].includes(modalTablet.status)) {
      setMotivo(modalTablet.motivo || "")
      setMotivoReadonly(!!modalTablet.motivo)
      setModalMotivoOpen(true)
    } else {
      updateTabletData(modalTablet.id, modalTablet.status, "")
    }
  }

  const handleSalvarMotivo = () => {
    if (motivo.trim() === "") {
      toast.warning("⚠️ Por favor, preencha o motivo ou responsável.")
      return
    }
    updateTabletData(modalTablet.id, modalTablet.status, motivo.trim())
  }

  const exportarParaExcel = () => {
    const dadosParaExportar = fonesFiltrados.map((item) => ({
      Patrimônio: item.patrimonio || "-",
      Marca: item.marca || "-",
      Modelo: item.modelo || "-",
      Local: item.local || "-",
      Status: item.status || "-",
      "Motivo/Responsável": item.motivo || "-",
    }))

    const ws = XLSX.utils.json_to_sheet(dadosParaExportar)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Fones")

    // Nome do arquivo com data
    const hoje = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")
    XLSX.writeFile(wb, `fones_${hoje}.xlsx`)

    toast.success("📊 Planilha exportada com sucesso!")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Carregando fones...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
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
      />

      <motion.div
        className="w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-8">
          <div className="flex items-center gap-4">
            <motion.div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm" whileHover={{ scale: 1.1 }}>
              <HeadsetIcon className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-white">Gerenciamento de Fones</h1>
              <p className="text-indigo-100 text-lg mt-1">Controle completo do inventário de fones de ouvido</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Status Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              Resumo por Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STATUS_OPTIONS.map((status) => {
                const config = STATUS_CONFIG[status] || {
                  color: "bg-gray-50 text-gray-700 border-gray-200",
                  icon: XCircle,
                  bgColor: "bg-gray-500",
                }
                return <StatusCard key={status} status={status} count={statusCount[status]} config={config} />
              })}
            </div>
          </div>

          {/* Filtros */}
          <FilterBar
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
            buscaTexto={buscaTexto}
            setBuscaTexto={setBuscaTexto}
            totalFones={fonesFiltrados.length}
          />

          {/* Fones Grid */}
          {fones.length === 0 ? (
            <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeadsetIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-gray-600 text-xl font-semibold mb-2">Nenhum fone cadastrado</h3>
              <p className="text-gray-400">Os fones cadastrados aparecerão aqui automaticamente</p>
            </motion.div>
          ) : fonesFiltrados.length === 0 ? (
            <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-gray-600 text-xl font-semibold mb-2">Nenhum fone encontrado</h3>
              <p className="text-gray-400">Tente ajustar os filtros de busca</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {fonesFiltrados.map((fone, index) => (
                <FoneCard key={fone.id} fone={fone} index={index} onViewDetails={setModalTablet} />
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportarParaExcel}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-2xl text-sm shadow-lg transition-all duration-300 flex items-center gap-3"
            >
              <Download className="w-5 h-5" />
              Exportar para Excel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl text-sm shadow-lg transition-all duration-300 flex items-center gap-3"
            >
              <Edit3 className="w-5 h-5" />
              Termo de Empréstimo
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/views")}
              className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-2xl text-sm shadow-lg transition-all duration-300 flex items-center gap-3"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal Termo de Empréstimo */}
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

      {/* Modal Detalhes */}
      <AnimatePresence>
        {modalTablet && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalTablet(null)}
          >
            <motion.div
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <HeadsetIcon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Detalhes do Fone</h3>
                  </div>
                  <button
                    className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/20 rounded-xl"
                    onClick={() => setModalTablet(null)}
                    aria-label="Fechar"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                {/* Basic Info */}
                <div className="mb-8">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                      <HeadsetIcon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h4 className="text-3xl font-bold text-gray-800 mb-1">{modalTablet.patrimonio}</h4>
                      <p className="text-gray-600 text-lg">
                        {modalTablet.marca} - {modalTablet.modelo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Informações Básicas */}
                  <div className="space-y-6">
                    <h5 className="font-bold text-gray-800 text-lg flex items-center gap-3">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      Informações Básicas
                    </h5>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="text-gray-500 block text-sm font-medium mb-1">Patrimônio:</span>
                        <span className="font-bold text-gray-800 text-lg">{modalTablet.patrimonio}</span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="text-gray-500 block text-sm font-medium mb-1">Marca:</span>
                        <span className="font-bold text-gray-800 text-lg">{modalTablet.marca}</span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="text-gray-500 block text-sm font-medium mb-1">Modelo:</span>
                        <span className="font-bold text-gray-800 text-lg">{modalTablet.modelo}</span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="text-gray-500 block text-sm font-medium mb-1">Local:</span>
                        <span className="font-bold text-gray-800 text-lg">{modalTablet.local}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Atual */}
                  <div className="space-y-6">
                    <h5 className="font-bold text-gray-800 text-lg flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Status Atual
                    </h5>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="text-gray-500 block text-sm font-medium mb-2">Status:</span>
                        <div className="flex items-center gap-3">
                          {(() => {
                            const config = STATUS_CONFIG[modalTablet.status] || {
                              color: "bg-gray-50 text-gray-700 border-gray-200",
                              icon: XCircle,
                            }
                            const StatusIcon = config.icon
                            return (
                              <div
                                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${config.color} flex items-center gap-2`}
                              >
                                <StatusIcon className="w-4 h-4" />
                                {modalTablet.status}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                      {modalTablet.motivo && (
                        <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                          <span className="text-blue-600 block text-sm font-medium mb-2">Motivo/Responsável:</span>
                          <span className="font-semibold text-blue-800 text-lg">{modalTablet.motivo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t-2 border-gray-100 pt-8">
                  <h5 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-3">
                    <Edit3 className="w-5 h-5 text-indigo-600" />
                    Atualizar Status
                  </h5>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Novo Status:</label>
                      <select
                        value={modalTablet.status}
                        onChange={(e) =>
                          setModalTablet((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-medium"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSalvarStatus}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Salvar Alterações
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Motivo */}
      <AnimatePresence>
        {modalMotivoOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!motivoReadonly) setModalMotivoOpen(false)
            }}
          >
            <motion.div
              className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                {motivoReadonly ? "Motivo/Responsável" : "Informe o motivo ou responsável"}
              </h3>
              <textarea
                className="w-full border-2 border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm"
                rows={5}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                readOnly={motivoReadonly}
                placeholder="Ex: Emprestado para João Silva, quebrado na sala 3, perdido no laboratório..."
              />
              <div className="mt-8 flex justify-end gap-4">
                {!motivoReadonly && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setModalMotivoOpen(false)}
                    className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </motion.button>
                )}
                {!motivoReadonly ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSalvarMotivo}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg"
                  >
                    Salvar Motivo
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setModalMotivoOpen(false)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg"
                  >
                    Fechar
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
