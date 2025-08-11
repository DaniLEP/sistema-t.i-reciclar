"use client"

import { useEffect, useState } from "react"
import { db } from "../../../firebase"
import { getDatabase, onValue, ref, remove, update, set, onDisconnect, serverTimestamp } from "firebase/database"
import { auth } from "../../../firebase"
import { onAuthStateChanged } from "firebase/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Trash2,
  UserCheck,
  UserX,
  ArrowLeft,
  UserPlus,
  Search,
  Users,
  UserCheck2,
  UserMinus,
  Filter,
  MoreVertical,
  Mail,
  Shield,
  Clock,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [filteredUsuarios, setFilteredUsuarios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null })
  const navigate = useNavigate()

  // Atualiza presença do usuário logado
  useEffect(() => {
    const db = getDatabase()
    const connectedRef = ref(db, ".info/connected")

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return

      const statusRef = ref(db, `usuarios/${user.uid}`)

      onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === false) return

        onDisconnect(statusRef)
          .update({ online: false, lastSeen: serverTimestamp() })
          .then(() => {
            set(statusRef, {
              uid: user.uid,
              nome: user.displayName || " ",
              email: user.email || "",
              funcao: " ", // ajuste conforme sua lógica
              online: true,
              lastSeen: serverTimestamp(),
              ativo: true,
            })
          })
      })
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const unsubscribe = onValue(ref(db, "usuarios"), (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const lista = Object.values(data)
        setUsuarios(lista)
        setFilteredUsuarios(lista)
      } else {
        setUsuarios([])
        setFilteredUsuarios([])
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    let filtered = usuarios

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.funcao.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter((user) => {
        if (statusFilter === "ativo") return user.ativo
        if (statusFilter === "inativo") return !user.ativo
        if (statusFilter === "online") return user.online
        return true
      })
    }

    setFilteredUsuarios(filtered)
  }, [usuarios, searchTerm, statusFilter])

  const deletarUsuario = async (uid, nome) => {
    try {
      await remove(ref(db, `usuarios/${uid}`))
      toast.success(`Usuário ${nome} removido com sucesso.`)
      setDeleteDialog({ open: false, user: null })
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
      toast.error("Erro ao excluir usuário.")
    }
  }

  const alterarStatus = async (uid, ativo, nome) => {
    try {
      await update(ref(db, `usuarios/${uid}`), { ativo: !ativo })
      toast.success(`Usuário ${nome} ${!ativo ? "ativado" : "desativado"} com sucesso.`)
    } catch (error) {
      console.error("Erro ao alterar status:", error)
      toast.error("Erro ao alterar status.")
    }
  }

  const getStats = () => {
    const total = usuarios.length
    const ativos = usuarios.filter((u) => u.ativo).length
    const online = usuarios.filter((u) => u.online).length
    return { total, ativos, online }
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600 mx-auto" />
          <p className="text-gray-600 text-lg">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
                <p className="text-gray-600 mt-1">Gerencie todos os usuários do sistema</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/admin/usuarios/registro")}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total de Usuários</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Usuários Ativos</p>
                  <p className="text-3xl font-bold">{stats.ativos}</p>
                </div>
                <UserCheck2 className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Online Agora</p>
                  <p className="text-3xl font-bold">{stats.online}</p>
                </div>
                <div className="relative">
                  <Users className="w-8 h-8 text-purple-200" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, email ou função..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os usuários</SelectItem>
                  <SelectItem value="ativo">Apenas ativos</SelectItem>
                  <SelectItem value="inativo">Apenas inativos</SelectItem>
                  <SelectItem value="online">Online agora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        {filteredUsuarios.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-12 text-center">
              <UserMinus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== "todos" ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "todos"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando o primeiro usuário ao sistema"}
              </p>
              {!searchTerm && statusFilter === "todos" && (
                <Button onClick={() => navigate("/admin/usuarios/registro")} className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Usuário
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsuarios.map((user) => (
              <Card key={user.uid} className="shadow-sm hover:shadow-md transition-all duration-200 border-0 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {user.nome.charAt(0).toUpperCase()}
                        </div>
                        {user.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">{user.nome}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={user.ativo ? "default" : "secondary"}
                            className={
                              user.ativo
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {user.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                          {user.online && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              Online
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => alterarStatus(user.uid, user.ativo, user.nome)}>
                          {user.ativo ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Desativar usuário
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Ativar usuário
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteDialog({ open: true, user })}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir usuário
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>{user.funcao}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {user.online ? (
                          <span className="text-green-600 font-medium">Online agora</span>
                        ) : (
                          <span>Offline</span>
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{deleteDialog.user?.nome}</strong>? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletarUsuario(deleteDialog.user?.uid, deleteDialog.user?.nome)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir usuário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
