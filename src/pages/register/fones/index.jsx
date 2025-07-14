"use client"

import { useState } from "react"
import { getDatabase, ref, push } from "firebase/database"
import { app } from "../../../../firebase"
import { motion, AnimatePresence } from "framer-motion"
import { Save, ArrowLeft, HeadsetIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function CadastroFones() {
  const [form, setForm] = useState({
    patrimonio: "",
    marca: "",
    modelo: "",
    local: "",
    notaFiscal: "",
    obs: "",
    status: "Disponível",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const db = getDatabase(app)
    const tabletRef = ref(db, "fones")

    try {
      await push(tabletRef, form)
      showNotification("Fone cadastrado com sucesso!", "success")
      setForm({
        patrimonio: "",
        marca: "",
        modelo: "",
        local: "",
        notaFiscal: "",
        obs: "",
        status: "Disponível",
      })
    } catch (error) {
      showNotification("Erro ao cadastrar: " + error.message, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formFields = [
    { label: "Patrimônio", name: "patrimonio", placeholder: "Ex: PAT001", required: true },
    { label: "Marca", name: "marca", placeholder: "Ex: Sony, JBL, Beats", required: true },
    { label: "Modelo", name: "modelo", placeholder: "Ex: WH-1000XM4", required: true },
    { label: "Local", name: "local", placeholder: "Ex: Sala 101, Almoxarifado", required: true },
    { label: "Nota Fiscal", name: "notaFiscal", placeholder: "Ex: NF123456", required: true },
    { label: "Observações", name: "obs", placeholder: "Informações adicionais (opcional)", required: false },
  ]

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
          className="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden"
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
                <HeadsetIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Cadastro de Fones</h1>
                <p className="text-indigo-100 mt-1">Registre novos equipamentos de áudio</p>
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formFields.map((field, index) => (
                  <motion.div
                    key={field.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={field.name === "obs" ? "md:col-span-2" : ""}
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
                    Status: <span className="font-bold">{form.status}</span>
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
                      Cadastrar Fone
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
