"use client"

import { useState } from "react"
import { getDatabase, ref, push } from "firebase/database"
import { app } from "../../../../firebase"
import { motion, AnimatePresence } from "framer-motion"
import { Printer, Save, ArrowLeft, CheckCircle, AlertCircle, Loader2, Upload, ImageIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"

export default function CadastroImpressora() {
  const [form, setForm] = useState({
    patrimonio: "",
    marca: "",
    modelo: "",
    tipoCor: "",
    notaFiscal: "",
    local: "",
    fotoBase64: "",
    obs: "",
    projeto: "",
    dataCadastro: "",
    NCM: "",
    vrbem: "",
    parceiro: "",
    projetoEditalConvenio: "",
    ano: "",
  })

  const [preview, setPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()
  const db = getDatabase(app)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, fotoBase64: reader.result }))
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const impressoraRef = ref(db, "impressoras")
      await push(impressoraRef, form)
      showNotification("Impressora cadastrada com sucesso!", "success")
      setForm({
        patrimonio: "",
        marca: "",
        modelo: "",
        tipoCor: "",
        notaFiscal: "",
        local: "",
        fotoBase64: "",
        obs: "",
        projeto: "",
        dataCadastro: "",
        NCM: "",
        vrbem: "",
        parceiro: "",
        projetoEditalConvenio: "",
        ano: "",
      })
      setPreview(null)
    } catch (error) {
      showNotification("Erro ao cadastrar: " + error.message, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const basicFields = [
    { label: "Patrimônio", name: "patrimonio", placeholder: "Ex: IMP001", required: true },
    { label: "Marca", name: "marca", placeholder: "Ex: HP, Canon, Epson", required: true },
    { label: "Modelo", name: "modelo", placeholder: "Ex: LaserJet Pro M404", required: true },
    { label: "Especificação de Cor", name: "tipoCor", placeholder: "Ex: Colorida, Monocromática", required: true },
    { label: "Nota Fiscal", name: "notaFiscal", placeholder: "Ex: NF123456", required: true },
    { label: "Parceiro", name: "parceiro", placeholder: "Nome do parceiro", required: true },
    { label: "Local", name: "local", placeholder: "Ex: Sala 101, Recepção", required: true },
  ]

  const additionalFields = [
    { label: "NCM", name: "NCM", placeholder: "Código NCM", required: false },
    { label: "VR-BEM", name: "vrbem", placeholder: "Valor do bem", required: false },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - 15 + i)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <div
              className={`flex items-center gap-3 p-4 rounded-xl shadow-lg backdrop-blur-sm ${
                notification.type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Printer className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Cadastro de Impressora</h1>
                <p className="text-indigo-100 mt-1">Registre novos equipamentos de impressão</p>
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {basicFields.map((field, index) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name={field.name}
                          value={form[field.name]}
                          onChange={handleChange}
                          required={field.required}
                          placeholder={field.placeholder}
                          disabled={isSubmitting}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 
                                   focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 
                                   transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed
                                   hover:border-gray-300"
                        />
                        {form[field.name] && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Project and Date Information */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Projeto e Datas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Data de Cadastro */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data de Cadastro <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dataCadastro"
                      value={form.dataCadastro}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 
                               focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 
                               transition-all duration-200 disabled:bg-gray-50"
                    />
                  </div>

                  {/* Ano */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ano <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="ano"
                      value={form.ano}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 
                               focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 
                               transition-all duration-200 disabled:bg-gray-50"
                    >
                      <option value="" disabled>
                        Selecione o ano
                      </option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Projeto */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Projeto <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="projeto"
                      value={form.projeto}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 
                               focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 
                               transition-all duration-200 disabled:bg-gray-50"
                    >
                      <option value="" disabled>
                        Selecione o projeto
                      </option>
                      <option value="FUMCAD">FUMCAD</option>
                      <option value="CONDECA">CONDECA</option>
                      <option value="INSTITUTO RECICLAR">INSTITUTO RECICLAR</option>
                      <option value="DOACAO">DOAÇÃO</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Additional Information */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Informações Adicionais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {additionalFields.map((field, index) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                      <input
                        type="text"
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        disabled={isSubmitting}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 
                                 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 
                                 transition-all duration-200 disabled:bg-gray-50 hover:border-gray-300"
                      />
                    </motion.div>
                  ))}

                  {/* Observações */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Observações</label>
                    <textarea
                      name="obs"
                      value={form.obs}
                      onChange={handleChange}
                      placeholder="Informações adicionais sobre a impressora..."
                      disabled={isSubmitting}
                      rows={3}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 
                               focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 
                               transition-all duration-200 disabled:bg-gray-50 hover:border-gray-300 resize-none"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Photo Upload Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Foto do Equipamento
                </h3>
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-6 text-gray-700 
                               hover:border-indigo-400 focus:border-indigo-500 transition-all duration-200
                               file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm 
                               file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {!preview && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Upload className="w-8 h-8" />
                          <span className="text-sm font-medium">Clique para selecionar uma foto</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {preview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200"
                    >
                      <ImageIcon className="w-6 h-6 text-gray-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Foto carregada com sucesso</p>
                        <p className="text-xs text-gray-500">Prévia da imagem:</p>
                      </div>
                      <img
                        src={preview || "/placeholder.svg"}
                        alt="Preview da impressora"
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Status Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">
                    Status: <span className="font-bold">Disponível</span>
                  </span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-3 flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 
                           hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl 
                           shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 
                           disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Cadastrar Impressora
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                  type="button"
                  onClick={() => navigate("/register-option")}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-3 px-8 bg-gray-100 hover:bg-gray-200 
                           text-gray-700 font-semibold py-4 rounded-xl shadow-md hover:shadow-lg 
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
