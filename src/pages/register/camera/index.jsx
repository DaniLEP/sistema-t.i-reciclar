"use client"

import { useState } from "react"
import { getDatabase, ref, push } from "firebase/database"
import { app } from "../../../../firebase"
import { motion, AnimatePresence } from "framer-motion"
import { Save, ArrowLeft, Camera, CheckCircle, AlertCircle, Loader2, Upload, FileImage } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function CadastroCamera() {
  const [form, setForm] = useState({
    patrimonio: "",
    marca: "",
    modelo: "",
    local: "",
    notaFiscal: "",
    obs: "",
    projeto: "",
    fotoBase64: "",
    status: "Disponível",
    dataCadastro: "",
    NCM: "",
    vrbem: "",
    parceiro: "",
    projetoEditalConvenio: "",
    ano: "",
    responsavel: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, fotoBase64: reader.result }))
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

    const db = getDatabase(app)
    const tabletRef = ref(db, "cameras")

    try {
      await push(tabletRef, form)
      showNotification("Câmera cadastrada com sucesso!", "success")
      setForm({
        patrimonio: "",
        marca: "",
        modelo: "",
        local: "",
        notaFiscal: "",
        obs: "",
        projeto: "",
        fotoBase64: "",
        status: "Disponível",
        dataCadastro: "",
        NCM: "",
        vrbem: "",
        parceiro: "",
        projetoEditalConvenio: "",
        ano: "",
        responsavel: "",
      })
    } catch (error) {
      showNotification("Erro ao cadastrar: " + error.message, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const basicFields = [
    { label: "Patrimônio", name: "patrimonio", placeholder: "Ex: CAM001", required: true },
    { label: "Marca", name: "marca", placeholder: "Ex: Canon, Sony, Nikon", required: true },
    { label: "Modelo", name: "modelo", placeholder: "Ex: EOS R5, A7 III", required: true },
    { label: "Local", name: "local", placeholder: "Ex: Sala 101, Estúdio", required: true },
    { label: "Nota Fiscal", name: "notaFiscal", placeholder: "Ex: NF123456", required: true },
    { label: "Parceiro", name: "parceiro", placeholder: "Nome do parceiro", required: true },
    { label: "Responsável", name: "responsavel", placeholder: "Nome do responsável", required: true },
  ]

  const additionalFields = [
    { label: "NCM", name: "NCM", placeholder: "Código NCM", required: false },
    { label: "VR-BEM", name: "vrbem", placeholder: "Valor do bem", required: false },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - 15 + i)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 py-8 px-4">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 max-w-sm"
          >
            <div
              className={`flex items-center gap-3 p-4 rounded-xl shadow-lg backdrop-blur-sm border ${
                notification.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              )}
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Cadastro de Câmera</h1>
                <p className="text-slate-300 mt-1">Registre novos equipamentos fotográficos no sistema</p>
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Basic Information Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-slate-800">Informações Básicas</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {basicFields.map((field, index) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="space-y-2"
                    >
                      <label className="block text-sm font-medium text-slate-700">
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
                          className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                    transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed
                                    hover:border-slate-400 placeholder:text-slate-400"
                        />
                        {form[field.name] && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Project and Date Information */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-slate-800">Projeto e Datas</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Data de Cadastro */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Data de Cadastro <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dataCadastro"
                      value={form.dataCadastro}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                transition-all duration-200 disabled:bg-slate-50"
                    />
                  </div>

                  {/* Ano */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Ano <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="ano"
                      value={form.ano}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                transition-all duration-200 disabled:bg-slate-50"
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
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Projeto <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="projeto"
                      value={form.projeto}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                transition-all duration-200 disabled:bg-slate-50"
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
              </motion.section>

              {/* Additional Information */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-slate-800">Informações Adicionais</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {additionalFields.map((field, index) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="space-y-2"
                    >
                      <label className="block text-sm font-medium text-slate-700">{field.label}</label>
                      <input
                        type="text"
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        disabled={isSubmitting}
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700
                                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                  transition-all duration-200 disabled:bg-slate-50 hover:border-slate-400
                                  placeholder:text-slate-400"
                      />
                    </motion.div>
                  ))}

                  {/* Observações */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Observações</label>
                    <textarea
                      name="obs"
                      value={form.obs}
                      onChange={handleChange}
                      placeholder="Informações adicionais sobre a câmera..."
                      disabled={isSubmitting}
                      rows={4}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                transition-all duration-200 disabled:bg-slate-50 hover:border-slate-400
                                resize-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </motion.section>

              {/* Photo Upload Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-slate-800">Foto do Equipamento</h2>
                </div>

                <div className="space-y-4">
                  {!form.fotoBase64 ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-slate-100 rounded-full">
                            <Upload className="w-8 h-8 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-slate-700">Clique para selecionar uma foto</p>
                            <p className="text-sm text-slate-500 mt-1">PNG, JPG ou JPEG até 10MB</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileImage className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-slate-900">Foto carregada com sucesso</h3>
                          <p className="text-sm text-slate-500 mt-1">Prévia da imagem selecionada</p>
                        </div>
                        <div className="flex-shrink-0">
                          <img
                            src={form.fotoBase64 || "/placeholder.svg"}
                            alt="Foto da câmera"
                            className="w-24 h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, fotoBase64: "" }))}
                        className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remover foto
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.section>

              {/* Status Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">
                    Status: <span className="font-semibold">{form.status}</span>
                  </span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-3 flex-1 bg-blue-600 hover:bg-blue-700
                            text-white font-medium py-3.5 px-6 rounded-lg shadow-sm hover:shadow-md
                            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Cadastrar Câmera
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate("/register-option")}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-3 px-6 bg-slate-100 hover:bg-slate-200
                            text-slate-700 font-medium py-3.5 rounded-lg shadow-sm hover:shadow-md
                            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                            focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
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
