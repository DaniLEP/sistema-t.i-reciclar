
import { useState, useEffect } from "react"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { db } from "../../../../firebase"
import { ref, push, get, update } from "firebase/database"
import { Label } from "../../../components/ui/label"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Printer, Save, ArrowLeft, CheckCircle, AlertCircle, Info, Loader2, Package } from "lucide-react"

// Opções de seleção
const cores = ["Escolha uma cor", "Preto", "Ciano", "Magenta", "Amarelo"]
const impressoras = ["Escolha uma Impressora", "HP", "BROTHER"]

function Notification({ message, tipo = "info", onClose }) {
  const configs = {
    info: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-800",
      icon: Info,
      iconColor: "text-blue-600",
    },
    success: {
      bg: "bg-green-50 border-green-200",
      text: "text-green-800",
      icon: CheckCircle,
      iconColor: "text-green-600",
    },
    error: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-800",
      icon: AlertCircle,
      iconColor: "text-red-600",
    },
  }

  const config = configs[tipo]
  const IconComponent = config.icon

  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timeout)
  }, [message, onClose])

  if (!message) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg border ${config.bg} z-50 max-w-md`}
    >
      <div className="flex items-center gap-3">
        <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
        <span className={`font-medium ${config.text}`}>{message}</span>
      </div>
    </motion.div>
  )
}

export default function CadastroToner() {
  const [formData, setFormData] = useState({
    cor: cores[0],
    sku: "",
    impressora: impressoras[0],
    quantidade: 1,
  })

  const [notif, setNotif] = useState({ message: "", tipo: "info" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantidade" ? Number(value) : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { sku, cor, impressora, quantidade } = formData

    if (!sku || quantidade < 1 || cor === cores[0] || impressora === impressoras[0]) {
      setNotif({
        message: "Todos os campos obrigatórios devem ser preenchidos.",
        tipo: "error",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const snapshot = await get(ref(db, "toners"))
      const dados = snapshot.val() || {}
      const tonerExistenteEntry = Object.entries(dados).find(
        ([, val]) => val.sku === sku && val.impressora === impressora && val.cor === cor,
      )

      if (tonerExistenteEntry) {
        const [id, tonerExistente] = tonerExistenteEntry
        const novaQuantidade = (tonerExistente.quantidade || 0) + quantidade
        await update(ref(db, `toners/${id}`), { quantidade: novaQuantidade })
        setNotif({
          message: `Quantidade atualizada para ${novaQuantidade}.`,
          tipo: "success",
        })
      } else {
        await push(ref(db, "toners"), { cor, sku, impressora, quantidade })
        setNotif({
          message: "Toner cadastrado com sucesso!",
          tipo: "success",
        })
      }

      setFormData({
        cor: cores[0],
        sku: "",
        impressora: impressoras[0],
        quantidade: 1,
      })
    } catch (error) {
      console.error("Erro ao cadastrar toner:", error)
      setNotif({ message: "Erro ao cadastrar toner.", tipo: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClasses =
    "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
  const labelClasses = "block text-gray-700 font-medium mb-2 text-sm"

  return (
    <>
      <AnimatePresence>
        {notif.message && (
          <Notification
            message={notif.message}
            tipo={notif.tipo}
            onClose={() => setNotif({ message: "", tipo: "info" })}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <motion.div
          className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
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
                <h2 className="text-2xl font-bold text-white">Cadastro de Toner</h2>
                <p className="text-indigo-100 text-sm">Gerencie o estoque de toners para impressoras</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Informações do Produto */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Informações do Produto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className={labelClasses}>
                    SKU <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    required
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="Digite o SKU do toner"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <Label className={labelClasses}>
                    Cor <span className="text-red-500">*</span>
                  </Label>
                  <select name="cor" value={formData.cor} onChange={handleChange} className={inputClasses}>
                    {cores.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Compatibilidade e Estoque */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Compatibilidade e Estoque
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className={labelClasses}>
                    Impressora <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="impressora"
                    value={formData.impressora}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    {impressoras.map((imp) => (
                      <option key={imp} value={imp}>
                        {imp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className={labelClasses}>
                    Quantidade <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      required
                      type="number"
                      name="quantidade"
                      min={1}
                      value={formData.quantidade}
                      onChange={handleChange}
                      className={`${inputClasses} pl-10`}
                      placeholder="Quantidade em estoque"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo do Cadastro */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Resumo do Cadastro
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">SKU:</span>
                  <span className="font-medium text-gray-800">{formData.sku || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Cor:</span>
                  <span className="font-medium text-gray-800">{formData.cor}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Impressora:</span>
                  <span className="font-medium text-gray-800">{formData.impressora}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Quantidade:</span>
                  <span className="font-medium text-gray-800">{formData.quantidade}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
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
                    Cadastrar Toner
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={() => navigate("/register-option")}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-3 px-8 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 font-semibold py-4 rounded-xl text-sm transition-all duration-200 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  )
}
