"use client"

import { useEffect, useState } from "react"
import { getDatabase, ref, onValue, update } from "firebase/database"
import { app } from "../../../../firebase"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Search, Download, Edit3, Save, X, Package, FileText, MapPin } from "lucide-react"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function formatDate(dateString) {
  if (!dateString) return "-"
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return dateString // verifica corretamente
  return d.toLocaleDateString("pt-BR")
}

export default function VisualizarMobiliario() {
  const [moveis, setMoveis] = useState([])
  const [search, setSearch] = useState("")
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const db = getDatabase(app)
    const refMoveis = ref(db, "moveis")
    const unsubscribe = onValue(refMoveis, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const arrayMoveis = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }))
        setMoveis(arrayMoveis)
      } else {
        setMoveis([])
      }
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isModalOpen) {
        closeModal()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen])

  // Pesquisa geral (pesquisa em todos os campos texto)
  const filteredMoveis = moveis.filter((item) => {
    const searchLower = search.toLowerCase()
    return (
      item.ambienteAtual?.toLowerCase().includes(searchLower) ||
      (item.notaFiscal || "").toLowerCase().includes(searchLower) ||
      (item.descricao || "").toLowerCase().includes(searchLower) ||
      (item.projeto || "").toLowerCase().includes(searchLower) ||
      (item.patrimonio || "").toLowerCase().includes(searchLower)
    )
  })

  // Estatísticas
  const stats = {
    total: moveis.length,
    comFoto: moveis.filter((item) => item.fotoBase64).length,
    projetos: [...new Set(moveis.map((item) => item.projeto).filter(Boolean))].length,
    ambientes: [...new Set(moveis.map((item) => item.ambienteAtual).filter(Boolean))].length,
  }

  const exportToExcel = () => {
    // Criar uma cópia dos dados filtrados, removendo campos que não quer exportar (ex: fotoBase64)
    const dataToExport = filteredMoveis.map(({ fotoBase64, id, ...rest }) => rest)
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mobiliario")
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })
    // Criar Blob e salvar arquivo com file-saver
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    saveAs(data, "Patrimonio-2025.xlsx")
    toast.success("Arquivo Excel exportado com sucesso!")
  }

  const openModal = (item) => {
    setSelectedItem(item)
    setEditData(item)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedItem(null)
    setIsModalOpen(false)
    setIsEditing(false)
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    if (!selectedItem?.id) return
    const db = getDatabase(app)
    try {
      await update(ref(db, `moveis/${selectedItem.id}`), editData)
      setMoveis((old) => old.map((m) => (m.id === selectedItem.id ? { ...m, ...editData } : m)))
      setSelectedItem({ ...selectedItem, ...editData })
      setIsEditing(false)
      toast.success("Dados salvos com sucesso!")
    } catch (error) {
      toast.error("Erro ao salvar: " + error.message)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mobiliário...</p>
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
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Visualizar Mobiliário</h1>
              <p className="text-indigo-100 text-sm">Gerencie e visualize o patrimônio mobiliário</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Statistics */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-800">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">Total de Itens</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-green-50 border-green-200 text-green-800">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">Com Foto</p>
                    <p className="text-2xl font-bold">{stats.comFoto}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-purple-50 border-purple-200 text-purple-800">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">Projetos</p>
                    <p className="text-2xl font-bold">{stats.projetos}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-orange-50 border-orange-200 text-orange-800">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">Ambientes</p>
                    <p className="text-2xl font-bold">{stats.ambientes}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar por ambiente, nota fiscal, descrição, projeto ou patrimônio..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Pesquisar mobiliário"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={exportToExcel}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
              aria-label="Exportar lista para Excel"
            >
              <Download className="w-5 h-5" />
              Exportar Excel
            </motion.button>
          </div>

          {/* Results Info */}
          {search && (
            <div className="mb-4 text-sm text-gray-600">
              Mostrando {filteredMoveis.length} de {moveis.length} itens
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider w-20">
                      Foto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Patrimônio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Ambiente Atual
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Projeto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Nota Fiscal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider w-32">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMoveis.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                          {search ? "Nenhum item encontrado para sua pesquisa" : "Nenhum mobiliário cadastrado"}
                        </p>
                        {search && (
                          <p className="text-gray-400 text-sm mt-2">Tente usar termos diferentes na pesquisa</p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredMoveis.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          {item.fotoBase64 ? (
                            <img
                              src={item.fotoBase64 || "/placeholder.svg"}
                              alt={`Foto do mobiliário ${item.patrimonio}`}
                              className="h-16 w-16 object-cover rounded-lg border border-gray-300 shadow-sm"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{item.patrimonio}</td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className="max-w-xs truncate" title={item.descricao}>
                            {item.descricao}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{item.ambienteAtual}</td>
                        <td className="px-6 py-4 text-gray-700">{item.projeto}</td>
                        <td className="px-6 py-4 text-gray-700">{item.notaFiscal}</td>
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openModal(item)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-200"
                            aria-label={`Ver mais detalhes do mobiliário ${item.patrimonio}`}
                          >
                            Ver mais
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Back Button */}
          <motion.button
            onClick={() => navigate("/views")}
            whileTap={{ scale: 0.95 }}
            className="mt-8 flex items-center gap-3 px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl text-sm transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </motion.button>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-white" />
                    <h2 id="modal-title" className="text-xl font-bold text-white">
                      Detalhes do Mobiliário
                    </h2>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200 transition-colors"
                    aria-label="Fechar modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex flex-col h-full max-h-[calc(90vh-80px)]">
                <div className="overflow-y-auto p-6 flex-grow">
                  {/* Image */}
                  <div className="mb-6 flex justify-center">
                    {editData.fotoBase64 ? (
                      <img
                        src={editData.fotoBase64 || "/placeholder.svg"}
                        alt={`Foto do mobiliário ${editData.patrimonio}`}
                        className="max-h-64 max-w-full rounded-xl object-contain border border-gray-300 shadow-sm"
                      />
                    ) : (
                      <div className="h-64 w-full bg-gray-100 rounded-xl flex items-center justify-center border border-gray-300">
                        <div className="text-center">
                          <Package className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Sem foto disponível</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(editData).map(([key, value]) => {
                      if (key === "fotoBase64" || key === "id") return null
                      const isDateField =
                        key.toLowerCase().includes("data") ||
                        key.toLowerCase().includes("date") ||
                        key.toLowerCase().includes("vencimento") ||
                        key.toLowerCase().includes("registro")
                      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())

                      if (isEditing) {
                        return (
                          <div key={key} className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700" htmlFor={key}>
                              {label}:
                            </label>
                            <input
                              id={key}
                              name={key}
                              type={isDateField ? "date" : "text"}
                              value={isDateField && value ? new Date(value).toISOString().slice(0, 10) : value || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        )
                      } else {
                        return (
                          <div key={key} className="space-y-1">
                            <span className="block text-sm font-semibold text-gray-700">{label}:</span>
                            <span className="block text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border">
                              {isDateField ? formatDate(value) : value || "—"}
                            </span>
                          </div>
                        )
                      }
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <div className="flex justify-end gap-3">
                    {!isEditing ? (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEditClick}
                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200"
                        aria-label="Editar dados do mobiliário"
                      >
                        <Edit3 className="w-4 h-4" />
                        Editar
                      </motion.button>
                    ) : (
                      <>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                          aria-label="Cancelar edição"
                        >
                          Cancelar
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSave}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200"
                          aria-label="Salvar dados do mobiliário"
                        >
                          <Save className="w-4 h-4" />
                          Salvar
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
