import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { auth, createUserWithEmailAndPassword, db } from "../../../../firebase"
import { ref, set } from "firebase/database"
import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle, Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RegistroUser() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [funcao, setFuncao] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmSenha, setConfirmSenha] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const navigate = useNavigate()

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (senha) => senha.length >= 6

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    if (!validateEmail(email)) {
      setErrorMessage("E-mail inválido.")
      return
    }
    if (!validatePassword(senha)) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.")
      return
    }
    if (senha !== confirmSenha) {
      setErrorMessage("As senhas não coincidem.")
      return
    }
    if (!funcao) {
      setErrorMessage("Selecione uma função.")
      return
    }

    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const newUser = userCredential.user
      const tipoUsuario =
        funcao === "Admin" ? "Admin" : funcao === "Cozinha" ? "Cozinha" : "T.I"

      await set(ref(db, "usuarios/" + newUser.uid), {
        nome,
        email,
        funcao: tipoUsuario,
        uid: newUser.uid,
      })

      setSuccessMessage("Usuário criado com sucesso!")
      setTimeout(() => navigate("/Verificacao_Usuario"), 2000)
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Este e-mail já está em uso.")
      } else {
        setErrorMessage(`Erro: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">
          Registro de Novo Usuário
        </h2>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Nome completo"
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu.email@exemplo.com"
            />
          </div>

          <div>
            <Label htmlFor="funcao">Função</Label>
            <Select value={funcao} onValueChange={setFuncao}>
              <SelectTrigger id="funcao">
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="T.I">T.I</SelectItem>
                <SelectItem value="Cozinha">Cozinha</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="senha">Senha</Label>
            <div className="relative">
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirm-senha">Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="confirm-senha"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmSenha}
                onChange={(e) => setConfirmSenha(e.target.value)}
                required
                placeholder="Confirme sua senha"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Carregando..." : "Criar Conta"}
              </Button>
            </motion.div>
            <Link to="/Home">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button type="button" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Voltar
                </Button>
              </motion.div>
            </Link>
          </div>
        </form>

        {errorMessage && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro!</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mt-6 bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Sucesso!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
  