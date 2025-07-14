"use client"

import { useState } from "react"
import { getDatabase, ref, push } from "firebase/database"
import { app } from "../../../../firebase"
import { motion, AnimatePresence } from "framer-motion"
import { Laptop, Save, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function CadastroNotebook() {
  const [form, setForm] = useState({
    patrimonio: "",
    marca: "",
    modelo: "",
    projeto: "",
    local: "",
    numeroSerie: "",
    notaFiscal: "",
    obs: "",
    fotoBase64: "",
    dataCadastro: "",
    NCM: "",
    vrbem: "",
    parceiro: "",
    projetoEditalConvenio: "",
    ano: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null
  const navigate = useNavigate()

  // Converte arquivo para base64 e salva no estado
  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;
  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     setForm((prev) => ({ ...prev, fotoBase64: reader.result }));
  //   };
  //   reader.readAsDataURL(file);
  // };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    const db = getDatabase(app)
    const notebookRef = ref(db, "notebooks")

    try {
      await push(notebookRef, form)
      setSubmitStatus("success")
      setTimeout(() => {
        setForm({
          patrimonio: "",
          marca: "",
          modelo: "",
          projeto: "",
          local: "",
          notaFiscal: "",
          obs: "",
          fotoBase64: "",
          dataCadastro: "",
          NCM: "",
          vrbem: "",
          parceiro: "",
          projetoEditalConvenio: "",
          ano: "",
        })
        setSubmitStatus(null)
      }, 2000)
    } catch (error) {
      setSubmitStatus("error")
      setTimeout(() => setSubmitStatus(null), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClasses =
    "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
  const labelClasses = "block text-gray-700 font-medium mb-2 text-sm"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <motion.div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Laptop className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Cadastro de Notebook</h2>
              <p className="text-indigo-100 text-sm">Preencha as informações do equipamento</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Informações Básicas */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelClasses}>
                  Patrimônio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="patrimonio"
                  value={form.patrimonio}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>
                  Marca <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="marca"
                  value={form.marca}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>
                  Modelo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={form.modelo}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
            </div>
          </div>

          {/* Localização e Projeto */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Localização e Projeto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Local</label>
                <input type="text" name="local" value={form.local} onChange={handleChange} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Parceiro</label>
                <input
                  type="text"
                  name="parceiro"
                  value={form.parceiro}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Projeto</label>
                <select name="projeto" value={form.projeto} onChange={handleChange} className={inputClasses}>
                  <option value="" disabled>
                    Selecione o projeto
                  </option>
                  <option value="FUMCAD">FUMCAD</option>
                  <option value="CONDECA">CONDECA</option>
                  <option value="INSTITUTO RECICLAR">INSTITUTO RECICLAR</option>
                  <option value="DOACAO">DOAÇÃO</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Ano</label>
                <select name="ano" value={form.ano} onChange={handleChange} className={inputClasses}>
                  <option value="" disabled>
                    Selecione o ano
                  </option>
                  {Array.from({ length: 30 }, (_, i) => {
                    const year = 2010 + i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Informações Fiscais */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Informações Fiscais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelClasses}>Nota Fiscal</label>
                <input
                  type="text"
                  name="notaFiscal"
                  value={form.notaFiscal}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>NCM</label>
                <input type="text" name="NCM" value={form.NCM} onChange={handleChange} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>VR-BEM</label>
                <input type="text" name="vrbem" value={form.vrbem} onChange={handleChange} className={inputClasses} />
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label className={labelClasses}>Data de Cadastro</label>
                <input
                  type="date"
                  name="dataCadastro"
                  value={form.dataCadastro}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Observações Adicionais
            </h3>
            <div>
              <label className={labelClasses}>Observações</label>
              <textarea
                name="obs"
                value={form.obs}
                onChange={handleChange}
                rows={4}
                className={`${inputClasses} resize-none`}
                placeholder="Adicione observações relevantes sobre o notebook..."
              />
            </div>
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {submitStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Notebook cadastrado com sucesso!</span>
              </motion.div>
            )}

            {submitStatus === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">Erro ao cadastrar. Tente novamente.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-3 flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-xl text-sm shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Cadastrar Notebook
                </>
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate("/register-option")}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-3 px-8 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 font-semibold py-4 rounded-xl text-sm transition-all duration-200 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
