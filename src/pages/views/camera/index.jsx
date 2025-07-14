"use client"

import { useEffect, useState } from "react"
import { getDatabase, ref, onValue, update } from "firebase/database"
import { app } from "../../../../firebase"
import { ArrowLeft, X, CameraIcon, CheckCircle, Clock, Search, Wrench, XCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const STATUS_OPTIONS = ["Disponível", "Quebrado", "Emprestado", "Manutenção", "Não encontrado"]

const STATUS_CONFIG = {
  Disponível: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  Quebrado: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  Emprestado: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
  Manutenção: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Wrench },
  "Não encontrado": { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Search },
}

export default function VisualizarCamera() {
  const [tablets, setTablets] = useState([])
  const [modalTablet, setModalTablet] = useState(null)
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [motivoReadonly, setMotivoReadonly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const db = getDatabase(app)
    const tabletsRef = ref(db, "cameras")
    const unsubscribe = onValue(tabletsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const tabletsArray = Object.entries(data).map(([id, tablet]) => ({
          id,
          ...tablet,
          status: tablet.status || "Disponível",
          motivo: tablet.motivo || "",
        }))
        setTablets(tabletsArray)
      } else {
        setTablets([])
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const statusCount = STATUS_OPTIONS.reduce((acc, status) => {
    acc[status] = tablets.filter((t) => t.status === status).length
    return acc
  }, {})

  const updateTabletData = async (tabletId, statusToSave, motivoToSave = "") => {
    const db = getDatabase(app)
    const tabletRef = ref(db, `cameras/${tabletId}`)
    try {
      await update(tabletRef, { status: statusToSave, motivo: motivoToSave })
      toast.success("Câmera atualizada com sucesso!")
      setModalTablet(null)
      setModalMotivoOpen(false)
      setMotivo("")
      setMotivoReadonly(false)
    } catch (error) {
      toast.error("Erro ao atualizar câmera: " + error.message)
    }
  }

  const handleSalvarStatus = () => {
    if (modalTablet.status === "Quebrado" || modalTablet.status === "Emprestado") {
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
    setMotivoReadonly(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando câmeras...</p>
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
              <CameraIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Câmeras Cadastradas</h2>
              <p className="text-indigo-100 text-sm">Gerencie o status e informações das câmeras</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Status Overview */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo por Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

          {/* Cameras Grid */}
          {tablets.length === 0 ? (
            <div className="text-center py-12">
              <CameraIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Nenhuma câmera cadastrada</p>
              <p className="text-gray-400 text-sm">As câmeras cadastradas aparecerão aqui</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {tablets.map((tablet, index) => {
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
                    {/* Image and Status */}
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                        {tablet.fotoBase64 ? (
                          <img
                            src={tablet.fotoBase64 || "/placeholder.svg"}
                            alt={`Foto da câmera ${tablet.patrimonio}`}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <CameraIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 text-lg">{tablet.patrimonio}</h3>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color} flex items-center gap-1`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {tablet.status}
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Marca:</span> {tablet.marca}
                          </p>
                          <p>
                            <span className="font-medium">Modelo:</span> {tablet.modelo}
                          </p>
                          <p>
                            <span className="font-medium">Local:</span> {tablet.local}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {tablet.responsavel && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Responsável:</span> {tablet.responsavel}
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
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CameraIcon className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-bold text-white">Detalhes da Câmera</h3>
                  </div>
                  <button
                    className="text-white hover:text-gray-200 transition-colors"
                    onClick={() => setModalTablet(null)}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Image and Basic Info */}
                <div className="flex gap-6 mb-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {modalTablet.fotoBase64 ? (
                      <img
                        src={modalTablet.fotoBase64 || "/placeholder.svg"}
                        alt={`Foto da câmera ${modalTablet.patrimonio}`}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <CameraIcon className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">{modalTablet.patrimonio}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                      <div>
                        <span className="text-gray-500 block">Projeto:</span>
                        <span className="font-medium text-gray-800">{modalTablet.projeto}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Informações Fiscais */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Informações Fiscais
                    </h5>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500 block">Nota Fiscal:</span>
                        <span className="font-medium text-gray-800">{modalTablet.notaFiscal || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">NCM:</span>
                        <span className="font-medium text-gray-800">{modalTablet.NCM || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">VR-BEM:</span>
                        <span className="font-medium text-gray-800">{modalTablet.vrbem || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Ano:</span>
                        <span className="font-medium text-gray-800">{modalTablet.ano || "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Informações Adicionais
                    </h5>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500 block">Data Cadastro:</span>
                        <span className="font-medium text-gray-800">{modalTablet.dataCadastro || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Parceiro:</span>
                        <span className="font-medium text-gray-800">{modalTablet.parceiro || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Projeto/Edital/Convênio:</span>
                        <span className="font-medium text-gray-800">{modalTablet.projetoEditalConvenio || "—"}</span>
                      </div>
                      {modalTablet.motivo && (
                        <div>
                          <span className="text-gray-500 block">Motivo:</span>
                          <span className="font-medium text-gray-800">{modalTablet.motivo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {modalTablet.obs && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <h5 className="font-semibold text-gray-800 mb-2">Observações</h5>
                    <p className="text-sm text-gray-600">{modalTablet.obs}</p>
                  </div>
                )}

                {/* Status Update */}
                <div className="border-t border-gray-200 pt-6">
                  <h5 className="font-semibold text-gray-800 mb-4">Atualizar Status</h5>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <select
                        value={modalTablet.status}
                        onChange={(e) => setModalTablet((prev) => ({ ...prev, status: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      >
                        {STATUS_OPTIONS.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleSalvarStatus}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Salvar Status
                    </button>
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
              <h4 className="text-xl font-bold mb-4 text-gray-800">Informe o motivo ou responsável</h4>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                readOnly={motivoReadonly}
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
