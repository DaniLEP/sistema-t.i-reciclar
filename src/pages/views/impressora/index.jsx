"use client"

import { useState, useEffect } from "react"
import { getDatabase, ref, onValue, update } from "firebase/database"
import { app } from "../../../../firebase"
import { motion, AnimatePresence } from "framer-motion"
import { Printer, X, ArrowLeft, CheckCircle, XCircle, Wrench } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const STATUS_OPTIONS = ["Funcionando", "Quebrado", "Em manutenção"]

const STATUS_CONFIG = {
  Funcionando: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  Quebrado: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  "Em manutenção": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Wrench },
}

export default function VisualizacaoImpressoras() {
  const [impressoras, setImpressoras] = useState([])
  const [selecionada, setSelecionada] = useState(null)
  const [showMotivoModal, setShowMotivoModal] = useState(false)
  const [novoStatus, setNovoStatus] = useState("")
  const [motivo, setMotivo] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const db = getDatabase(app)
    const impressorasRef = ref(db, "impressoras")
    onValue(impressorasRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const lista = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
          status: value.status || "Funcionando",
        }))
        setImpressoras(lista)
      } else {
        setImpressoras([])
      }
      setIsLoading(false)
    })
  }, [])

  const statusCount = STATUS_OPTIONS.reduce((acc, status) => {
    acc[status] = impressoras.filter((imp) => (imp.status || "Funcionando") === status).length
    return acc
  }, {})

  const closeModal = () => {
    setSelecionada(null)
    setShowMotivoModal(false)
    setMotivo("")
    setNovoStatus("")
  }

  const handleStatusChange = (e) => {
    const valor = e.target.value
    setNovoStatus(valor)
    if (valor === "Quebrado" || valor === "Em manutenção") {
      setShowMotivoModal(true)
    } else {
      salvarStatus(valor, "")
    }
  }

  const salvarStatus = (status, motivoTexto) => {
    if (!selecionada) return
    const db = getDatabase(app)
    const impressoraRef = ref(db, `impressoras/${selecionada.id}`)
    update(impressoraRef, {
      status,
      motivo: motivoTexto || "",
    })
      .then(() => {
        setSelecionada((prev) => ({
          ...prev,
          status,
          motivo: motivoTexto || "",
        }))
        toast.success("Status da impressora atualizado com sucesso!")
        setShowMotivoModal(false)
        setMotivo("")
        setNovoStatus("")
      })
      .catch((error) => {
        toast.error("Erro ao atualizar status: " + error.message)
      })
  }

  const voltarPagina = () => navigate("/views")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando impressoras...</p>
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
              <Printer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Impressoras Cadastradas</h2>
              <p className="text-indigo-100 text-sm">Gerencie o status e informações das impressoras</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Status Overview */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo por Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Impressoras Grid */}
          {impressoras.length === 0 ? (
            <div className="text-center py-12">
              <Printer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Nenhuma impressora cadastrada</p>
              <p className="text-gray-400 text-sm">As impressoras cadastradas aparecerão aqui</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {impressoras.map((imp, index) => {
                const status = imp.status || "Funcionando"
                const statusConfig = STATUS_CONFIG[status]
                const StatusIcon = statusConfig.icon
                return (
                  <motion.div
                    key={imp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => setSelecionada(imp)}
                  >
                    {/* Image */}
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      {imp.fotoBase64 ? (
                        <img
                          src={imp.fotoBase64 || "/placeholder.svg"}
                          alt={`${imp.marca} ${imp.modelo}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Printer className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Header with Status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-lg truncate">{imp.marca}</h3>
                          <p className="text-sm text-gray-500 truncate">{imp.modelo}</p>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color} flex items-center gap-1 ml-2 flex-shrink-0`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status}
                        </div>
                      </div>

                      {/* Motivo if exists */}
                      {imp.motivo && (
                        <div className="mb-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-xs text-yellow-800">
                            <span className="font-medium">Motivo:</span> {imp.motivo}
                          </p>
                        </div>
                      )}

                      {/* Action Button */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelecionada(imp)
                        }}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Ver Detalhes
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Back Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={voltarPagina}
            className="mt-8 flex items-center justify-center gap-3 px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl text-sm transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </motion.button>
        </div>
      </motion.div>

      {/* Modal Principal */}
      <AnimatePresence>
        {selecionada && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Printer className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-bold text-white">
                      {selecionada.marca} - {selecionada.modelo}
                    </h2>
                  </div>
                  <button onClick={closeModal} className="text-white hover:text-gray-200 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Image and Basic Info */}
                <div className="flex gap-6 mb-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {selecionada.fotoBase64 ? (
                      <img
                        src={selecionada.fotoBase64 || "/placeholder.svg"}
                        alt={`${selecionada.marca} ${selecionada.modelo}`}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Printer className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {selecionada.marca} {selecionada.modelo}
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500 text-sm">Status atual:</span>
                        <div className="flex items-center gap-2 mt-1">
                          {(() => {
                            const status = selecionada.status || "Funcionando"
                            const config = STATUS_CONFIG[status]
                            const StatusIcon = config.icon
                            return (
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color} flex items-center gap-2`}
                              >
                                <StatusIcon className="w-4 h-4" />
                                {status}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                      {selecionada.motivo && (
                        <div>
                          <span className="text-gray-500 text-sm block">Motivo:</span>
                          <p className="text-gray-800 font-medium">{selecionada.motivo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Atualizar Status</h4>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Novo Status:</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        onChange={handleStatusChange}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Selecione o novo status
                        </option>
                        <option value="Funcionando">Funcionando</option>
                        <option value="Quebrado">Quebrado</option>
                        <option value="Em manutenção">Em manutenção</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={closeModal}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition-all duration-200"
                  >
                    Fechar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal do Motivo */}
      <AnimatePresence>
        {showMotivoModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowMotivoModal(false)
              setNovoStatus("")
              setMotivo("")
            }}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-md p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800">Informe o motivo</h3>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Descreva o motivo do status selecionado..."
                rows={4}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all duration-200"
                  onClick={() => {
                    setShowMotivoModal(false)
                    setNovoStatus("")
                    setMotivo("")
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                  onClick={() => salvarStatus(novoStatus, motivo)}
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
