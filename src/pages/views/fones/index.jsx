"use client"

import { useEffect, useState } from "react"
import { getDatabase, ref, onValue, update } from "firebase/database"
import { app } from "../../../../firebase"
import { ArrowLeft, HeadsetIcon, X, CheckCircle, Clock, Search, XCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const STATUS_OPTIONS = ["Disponível", "Quebrado", "Emprestado", "Não encontrado"]

const STATUS_CONFIG = {
  Disponível: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  Quebrado: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  Emprestado: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
  "Não encontrado": { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Search },
}

export default function VisualizarFones() {
  const [fones, setFones] = useState([])
  const [modalTablet, setModalTablet] = useState(null)
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [motivoReadonly, setMotivoReadonly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const db = getDatabase(app)
    const fonesRef = ref(db, "fones")
    const unsubscribe = onValue(fonesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const FonesArray = Object.entries(data).map(([id, tablet]) => ({
          id,
          ...tablet,
          status: tablet.status || "Disponível",
          motivo: tablet.motivo || "",
        }))
        setFones(FonesArray)
      } else {
        setFones([])
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const statusCount = STATUS_OPTIONS.reduce((acc, status) => {
    acc[status] = fones.filter((t) => t.status === status).length
    return acc
  }, {})

  const updateTabletData = async (tabletId, statusToSave, motivoToSave = "") => {
    const db = getDatabase(app)
    const tabletRef = ref(db, `fones/${tabletId}`)
    try {
      await update(tabletRef, { status: statusToSave, motivo: motivoToSave })
      toast.success("Fone atualizado com sucesso!")
      setModalTablet(null)
      setModalMotivoOpen(false)
      setMotivo("")
      setMotivoReadonly(false)
    } catch (error) {
      toast.error("Erro ao atualizar fone: " + error.message)
    }
  }

  const handleSalvarStatus = () => {
    if (!modalTablet) return
    if (["Quebrado", "Emprestado", "Nao Encontrado"].includes(modalTablet.status)) {
      setMotivo(modalTablet.motivo || "")
      setMotivoReadonly(!!modalTablet.motivo)
      setModalMotivoOpen(true)
    } else {
      updateTabletData(modalTablet.id, modalTablet.status, "")
    }
  }

  const handleSalvarMotivo = () => {
    if (motivo.trim() === "") {
      toast.warning("Por favor, preencha o motivo ou responsável.")
      return
    }
    updateTabletData(modalTablet.id, modalTablet.status, motivo.trim())
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando fones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <ToastContainer position="top-right" autoClose={4000} />

      <motion.div
        className="w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <HeadsetIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Fones Cadastrados</h2>
              <p className="text-indigo-100 text-sm">Gerencie o status e informações dos fones de ouvido</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Status Overview */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo por Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATUS_OPTIONS.map((status) => {
                const config = STATUS_CONFIG[status]
                const IconComponent = config.icon
                return (
                  <div
                    key={status}
                    className={`p-4 rounded-xl border ${config.color} transition-all duration-200 hover:shadow-md`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5" />
                      <div>
                        <p className="text-sm font-medium">{status}</p>
                        <p className="text-2xl font-bold">{statusCount[status]}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Fones Grid */}
          {fones.length === 0 ? (
            <div className="text-center py-12">
              <HeadsetIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Nenhum fone cadastrado</p>
              <p className="text-gray-400 text-sm">Os fones cadastrados aparecerão aqui</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {fones.map((tablet, index) => {
                const statusConfig = STATUS_CONFIG[tablet.status]
                const StatusIcon = statusConfig.icon
                return (
                  <motion.div
                    key={tablet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Header with Icon and Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <HeadsetIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">{tablet.patrimonio}</h3>
                          <p className="text-sm text-gray-500">{tablet.marca}</p>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color} flex items-center gap-1`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {tablet.status}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Modelo:</span>
                        <span className="font-medium text-gray-800">{tablet.modelo}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Local:</span>
                        <span className="font-medium text-gray-800">{tablet.local}</span>
                      </div>
                    </div>

                    {/* Motivo if exists */}
                    {tablet.motivo && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Motivo/Responsável:</span> {tablet.motivo}
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => setModalTablet(tablet)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Ver Detalhes
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Back Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/views")}
            className="mt-8 flex items-center justify-center gap-3 px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl text-sm transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </motion.button>
        </div>
      </motion.div>

      {/* Modal Detalhes */}
      <AnimatePresence>
        {modalTablet && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalTablet(null)}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HeadsetIcon className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-bold text-white">Detalhes do Fone</h3>
                  </div>
                  <button
                    className="text-white hover:text-gray-200 transition-colors"
                    onClick={() => setModalTablet(null)}
                    aria-label="Fechar"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Basic Info */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <HeadsetIcon className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800">{modalTablet.patrimonio}</h4>
                      <p className="text-gray-600">
                        {modalTablet.marca} - {modalTablet.modelo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Informações Básicas */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Informações Básicas
                    </h5>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500 block">Patrimônio:</span>
                        <span className="font-medium text-gray-800">{modalTablet.patrimonio}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Marca:</span>
                        <span className="font-medium text-gray-800">{modalTablet.marca}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Modelo:</span>
                        <span className="font-medium text-gray-800">{modalTablet.modelo}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Local:</span>
                        <span className="font-medium text-gray-800">{modalTablet.local}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Atual */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Status Atual
                    </h5>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500 block">Status:</span>
                        <div className="flex items-center gap-2 mt-1">
                          {(() => {
                            const config = STATUS_CONFIG[modalTablet.status]
                            const StatusIcon = config.icon
                            return (
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color} flex items-center gap-1`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {modalTablet.status}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                      {modalTablet.motivo && (
                        <div>
                          <span className="text-gray-500 block">Motivo/Responsável:</span>
                          <span className="font-medium text-gray-800">{modalTablet.motivo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t border-gray-200 pt-6">
                  <h5 className="font-semibold text-gray-800 mb-4">Atualizar Status</h5>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Novo Status:</label>
                      <select
                        value={modalTablet.status}
                        onChange={(e) => setModalTablet((prev) => ({ ...prev, status: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleSalvarStatus}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Salvar Status
                      </button>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalMotivoOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800">Informe o Motivo ou Responsável</h3>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                readOnly={motivoReadonly}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                rows={4}
                placeholder="Descreva o motivo ou informe o responsável..."
              />
              {!motivoReadonly && (
                <button
                  onClick={handleSalvarMotivo}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Salvar Motivo
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
