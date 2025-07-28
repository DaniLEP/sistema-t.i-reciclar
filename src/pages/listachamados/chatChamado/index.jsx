// "use client"

// import { useEffect, useState, useRef } from "react"
// import { useParams } from "react-router-dom"
// import { getDatabase, ref, onValue, push, update } from "firebase/database"

// import { Card, CardContent, CardHeader } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Send, Clock, Settings, MessageCircle } from "lucide-react"
// import { cn } from "@/lib/utils"

// export default function ChatChamado() {
//   const { id } = useParams()
//   const [mensagens, setMensagens] = useState([])
//   const [novaMensagem, setNovaMensagem] = useState("")
//   const [statusChamado, setStatusChamado] = useState("carregando")
//   const [titulo, setTitulo] = useState("")
//   const [isLoading, setIsLoading] = useState(true)
//   const mensagensEndRef = useRef(null)
//   const inputRef = useRef(null)

//   useEffect(() => {
//     if (!id) return

//     const db = getDatabase()
//     setIsLoading(true)

//     const chamadoRef = ref(db, `chamados/${id}`)
//     const unsubscribeChamado = onValue(chamadoRef, (snapshot) => {
//       const data = snapshot.val()
//       if (data) {
//         setTitulo(data.titulo || `Chamado #${id}`)
//         setStatusChamado(data.status || "aberto")
//       }
//       setIsLoading(false)
//     })

//     const mensagensRef = ref(db, `chamados/${id}/mensagens`)
//     const unsubscribeMsgs = onValue(mensagensRef, (snapshot) => {
//       const data = snapshot.val()
//       if (data) {
//         const lista = Object.entries(data).map(([msgId, msg]) => ({
//           id: msgId,
//           ...msg,
//         }))
//         setMensagens(lista.sort((a, b) => a.timestamp - b.timestamp))
//       } else {
//         setMensagens([])
//       }
//     })

//     return () => {
//       unsubscribeChamado()
//       unsubscribeMsgs()
//     }
//   }, [id])

//   useEffect(() => {
//     mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [mensagens])

//   const enviarMensagem = async () => {
//     if (novaMensagem.trim() === "" || statusChamado === "fechado") return

//     const db = getDatabase()
//     const mensagensRef = ref(db, `chamados/${id}/mensagens`)

//     await push(mensagensRef, {
//       texto: novaMensagem.trim(),
//       autor: "admin",
//       timestamp: Date.now(),
//     })

//     setNovaMensagem("")
//     inputRef.current?.focus()
//   }

//   const alterarStatus = async (novoStatus) => {
//     const db = getDatabase()
//     const chamadoRef = ref(db, `chamados/${id}`)

//     await update(chamadoRef, {
//       status: novoStatus,
//       updatedAt: Date.now(),
//     })

//     if (novoStatus === "fechado") {
//       const mensagensRef = ref(db, `chamados/${id}/mensagens`)
//       await push(mensagensRef, {
//         texto: "Este chamado foi encerrado pelo administrador.",
//         autor: "sistema",
//         timestamp: Date.now(),
//       })
//     }
//   }

//   const formatarData = (timestamp) => {
//     const data = new Date(timestamp)
//     const hoje = new Date()
//     const ontem = new Date(hoje)
//     ontem.setDate(hoje.getDate() - 1)

//     if (data.toDateString() === hoje.toDateString()) {
//       return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
//     } else if (data.toDateString() === ontem.toDateString()) {
//       return `Ontem ${data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
//     } else {
//       return data.toLocaleString("pt-BR", {
//         day: "2-digit",
//         month: "2-digit",
//         hour: "2-digit",
//         minute: "2-digit",
//       })
//     }
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "aberto":
//         return "bg-green-100 text-green-800 border-green-200"
//       case "andamento":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200"
//       case "fechado":
//         return "bg-red-100 text-red-800 border-red-200"
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200"
//     }
//   }

//   const getAutorInfo = (autor) => {
//     switch (autor) {
//       case "admin":
//         return { name: "Administrador", avatar: "AD", color: "bg-blue-500" }
//       case "usuario":
//         return { name: "Usuário", avatar: "US", color: "bg-green-500" }
//       case "sistema":
//         return { name: "Sistema", avatar: "SY", color: "bg-gray-500" }
//       default:
//         return { name: "Desconhecido", avatar: "??", color: "bg-gray-400" }
//     }
//   }

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault()
//       enviarMensagem()
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Carregando chat...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="h-screen flex flex-col bg-gray-50">
//       {/* Header */}
//       <Card className="rounded-none border-x-0 border-t-0 shadow-sm">
//         <CardHeader className="pb-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <MessageCircle className="h-5 w-5 text-blue-600" />
//               </div>
//               <div>
//                 <h1 className="text-lg font-semibold text-gray-900">{titulo}</h1>
//                 <div className="flex items-center gap-2 mt-1">
//                   <Badge variant="outline" className={cn("text-xs", getStatusColor(statusChamado))}>
//                     <Clock className="h-3 w-3 mr-1" />
//                     {statusChamado.charAt(0).toUpperCase() + statusChamado.slice(1)}
//                   </Badge>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <Settings className="h-4 w-4 text-gray-500" />
//               <Select value={statusChamado} onValueChange={alterarStatus}>
//                 <SelectTrigger className="w-40">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="aberto">Aberto</SelectItem>
//                   <SelectItem value="andamento">Em Andamento</SelectItem>
//                   <SelectItem value="fechado">Fechado</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardHeader>
//       </Card>

//       {/* Área de mensagens */}
//       <div className="flex-1 overflow-hidden">
//         <ScrollArea className="h-full px-4">
//           <div className="py-4 space-y-4">
//             {mensagens.length === 0 ? (
//               <div className="text-center py-12">
//                 <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//                 <p className="text-gray-500 text-sm">Nenhuma mensagem ainda</p>
//                 <p className="text-gray-400 text-xs mt-1">Seja o primeiro a enviar uma mensagem</p>
//               </div>
//             ) : (
//               mensagens.map((msg, index) => {
//                 const autorInfo = getAutorInfo(msg.autor)
//                 const isAdmin = msg.autor === "admin"
//                 const isSistema = msg.autor === "sistema"
//                 const showAvatar = index === 0 || mensagens[index - 1].autor !== msg.autor

//                 if (isSistema) {
//                   return (
//                     <div key={msg.id} className="flex justify-center">
//                       <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full border">{msg.texto}</div>
//                     </div>
//                   )
//                 }

//                 return (
//                   <div
//                     key={msg.id}
//                     className={cn("flex gap-3 max-w-[80%]", isAdmin ? "ml-auto flex-row-reverse" : "mr-auto")}
//                   >
//                     {showAvatar ? (
//                       <Avatar className="h-8 w-8 flex-shrink-0">
//                         <AvatarFallback className={cn("text-xs text-white", autorInfo.color)}>
//                           {autorInfo.avatar}
//                         </AvatarFallback>
//                       </Avatar>
//                     ) : (
//                       <div className="w-8" />
//                     )}

//                     <div className={cn("flex flex-col", isAdmin ? "items-end" : "items-start")}>
//                       {showAvatar && (
//                         <div className={cn("flex items-center gap-2 mb-1", isAdmin && "flex-row-reverse")}>
//                           <span className="text-xs font-medium text-gray-700">{autorInfo.name}</span>
//                           <span className="text-xs text-gray-500">{formatarData(msg.timestamp)}</span>
//                         </div>
//                       )}

//                       <div
//                         className={cn(
//                           "px-4 py-2 rounded-2xl shadow-sm max-w-full break-words",
//                           isAdmin
//                             ? "bg-blue-500 text-white rounded-br-md"
//                             : "bg-white text-gray-900 border rounded-bl-md",
//                         )}
//                       >
//                         <p className="text-sm leading-relaxed">{msg.texto}</p>
//                       </div>

//                       {!showAvatar && (
//                         <span className={cn("text-xs text-gray-400 mt-1", isAdmin ? "mr-2" : "ml-2")}>
//                           {formatarData(msg.timestamp)}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 )
//               })
//             )}
//             <div ref={mensagensEndRef} />
//           </div>
//         </ScrollArea>
//       </div>

//       {/* Campo de envio */}
//       <Card className="rounded-none border-x-0 border-b-0 shadow-sm">
//         <CardContent className="p-4">
//           {statusChamado === "fechado" ? (
//             <div className="text-center py-3">
//               <p className="text-sm text-gray-500">Este chamado foi encerrado</p>
//             </div>
//           ) : (
//             <div className="flex gap-2 items-end">
//               <div className="flex-1">
//                 <Input
//                   ref={inputRef}
//                   value={novaMensagem}
//                   onChange={(e) => setNovaMensagem(e.target.value)}
//                   onKeyPress={handleKeyPress}
//                   placeholder="Digite sua mensagem..."
//                   className="resize-none border-gray-200 focus:border-blue-500"
//                   disabled={statusChamado === "fechado"}
//                 />
//               </div>
//               <Button
//                 onClick={enviarMensagem}
//                 disabled={!novaMensagem.trim() || statusChamado === "fechado"}
//                 size="icon"
//                 className="h-10 w-10 bg-blue-600 hover:bg-blue-700"
//               >
//                 <Send className="h-4 w-4" />
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { getDatabase, ref, onValue, push, update } from "firebase/database"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Send,
  Clock,
  Settings,
  MessageCircle,
  AlertCircle,
  XCircle,
  MoreVertical,
  ArrowLeft,
  Paperclip,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ChatChamado() {
  const { id } = useParams()
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState("")
  const [statusChamado, setStatusChamado] = useState("carregando")
  const [titulo, setTitulo] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const mensagensEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!id) return

    const db = getDatabase()
    setIsLoading(true)

    const chamadoRef = ref(db, `chamados/${id}`)
    const unsubscribeChamado = onValue(chamadoRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setTitulo(data.titulo || `Chamado #${id}`)
        setStatusChamado(data.status || "aberto")
      }
      setIsLoading(false)
    })

    const mensagensRef = ref(db, `chamados/${id}/mensagens`)
    const unsubscribeMsgs = onValue(mensagensRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const lista = Object.entries(data).map(([msgId, msg]) => ({
          id: msgId,
          ...msg,
        }))
        setMensagens(lista.sort((a, b) => a.timestamp - b.timestamp))
      } else {
        setMensagens([])
      }
    })

    return () => {
      unsubscribeChamado()
      unsubscribeMsgs()
    }
  }, [id])

  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensagens])

  const enviarMensagem = async () => {
    if (novaMensagem.trim() === "" || statusChamado === "fechado") return

    setIsSending(true)
    const db = getDatabase()
    const mensagensRef = ref(db, `chamados/${id}/mensagens`)

    try {
      await push(mensagensRef, {
        texto: novaMensagem.trim(),
        autor: "admin",
        timestamp: Date.now(),
      })
      setNovaMensagem("")
      inputRef.current?.focus()
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
    } finally {
      setIsSending(false)
    }
  }

  const alterarStatus = async (novoStatus) => {
    const db = getDatabase()
    const chamadoRef = ref(db, `chamados/${id}`)

    try {
      await update(chamadoRef, {
        status: novoStatus,
        updatedAt: Date.now(),
      })

      if (novoStatus === "fechado") {
        const mensagensRef = ref(db, `chamados/${id}/mensagens`)
        await push(mensagensRef, {
          texto: "Este chamado foi encerrado pelo administrador.",
          autor: "sistema",
          timestamp: Date.now(),
        })
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error)
    }
  }

  const formatarData = (timestamp) => {
    const data = new Date(timestamp)
    const hoje = new Date()
    const ontem = new Date(hoje)
    ontem.setDate(hoje.getDate() - 1)

    if (data.toDateString() === hoje.toDateString()) {
      return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    } else if (data.toDateString() === ontem.toDateString()) {
      return `Ontem ${data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case "aberto":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: AlertCircle,
          label: "Aberto",
        }
      case "andamento":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
          label: "Em Andamento",
        }
      case "fechado":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
          label: "Fechado",
        }
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: Clock,
          label: "Carregando",
        }
    }
  }

  const getAutorInfo = (autor) => {
    switch (autor) {
      case "admin":
        return {
          name: "Administrador",
          avatar: "AD",
          color: "bg-gradient-to-br from-blue-500 to-blue-600",
          textColor: "text-white",
        }
      case "usuario":
        return {
          name: "Usuário",
          avatar: "US",
          color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
          textColor: "text-white",
        }
      case "sistema":
        return {
          name: "Sistema",
          avatar: "SY",
          color: "bg-gradient-to-br from-gray-500 to-gray-600",
          textColor: "text-white",
        }
      default:
        return {
          name: "Desconhecido",
          avatar: "??",
          color: "bg-gradient-to-br from-gray-400 to-gray-500",
          textColor: "text-white",
        }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviarMensagem()
    }
  }

  const handleInputChange = (e) => {
    setNovaMensagem(e.target.value)

    // Simular indicador de digitação
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-blue-400 animate-ping mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-slate-700 font-medium">Carregando chat</p>
            <p className="text-slate-500 text-sm">Conectando ao chamado...</p>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(statusChamado)
  const StatusIcon = statusConfig.icon

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header aprimorado */}
      <Card className="rounded-none border-x-0 border-t-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-slate-100"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <StatusIcon className="h-2.5 w-2.5 text-slate-600" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">{titulo}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn("text-xs font-medium px-3 py-1", statusConfig.color)}>
                      <StatusIcon className="h-3 w-3 mr-1.5" />
                      {statusConfig.label}
                    </Badge>
                    <span className="text-xs text-slate-500">ID: #{id}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                <MoreVertical className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-500" />
                <Select value={statusChamado} onValueChange={alterarStatus}>
                  <SelectTrigger className="w-44 border-slate-200 hover:border-slate-300 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aberto">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-emerald-600" />
                        Aberto
                      </div>
                    </SelectItem>
                    <SelectItem value="andamento">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        Em Andamento
                      </div>
                    </SelectItem>
                    <SelectItem value="fechado">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Fechado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Área de mensagens aprimorada */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="px-4 lg:px-6 py-6 space-y-6">
            {mensagens.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-600 font-medium">Nenhuma mensagem ainda</p>
                  <p className="text-slate-500 text-sm">Inicie a conversa enviando a primeira mensagem</p>
                </div>
              </div>
            ) : (
              mensagens.map((msg, index) => {
                const autorInfo = getAutorInfo(msg.autor)
                const isAdmin = msg.autor === "admin"
                const isSistema = msg.autor === "sistema"
                const showAvatar = index === 0 || mensagens[index - 1].autor !== msg.autor
                const isLastFromAuthor = index === mensagens.length - 1 || mensagens[index + 1].autor !== msg.autor

                if (isSistema) {
                  return (
                    <div
                      key={msg.id}
                      className="flex justify-center animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                    >
                      <div className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 text-sm px-4 py-2 rounded-full border shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                          {msg.texto}
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                      isAdmin ? "justify-end" : "justify-start",
                    )}
                  >
                    {!isAdmin && (
                      <div className="flex flex-col items-center">
                        {showAvatar ? (
                          <Avatar className="h-10 w-10 shadow-md ring-2 ring-white">
                            <AvatarFallback
                              className={cn("text-sm font-semibold", autorInfo.color, autorInfo.textColor)}
                            >
                              {autorInfo.avatar}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10" />
                        )}
                      </div>
                    )}

                    <div
                      className={cn("flex flex-col max-w-[75%] lg:max-w-[60%]", isAdmin ? "items-end" : "items-start")}
                    >
                      {showAvatar && (
                        <div className={cn("flex items-center gap-2 mb-2", isAdmin && "flex-row-reverse")}>
                          <span className="text-sm font-semibold text-slate-700">{autorInfo.name}</span>
                          <span className="text-xs text-slate-500">{formatarData(msg.timestamp)}</span>
                        </div>
                      )}

                      <div
                        className={cn(
                          "px-4 py-3 shadow-sm max-w-full break-words transition-all duration-200 hover:shadow-md",
                          isAdmin
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md"
                            : "bg-white text-slate-900 border border-slate-200 rounded-2xl rounded-bl-md hover:border-slate-300",
                          isLastFromAuthor ? "mb-1" : "mb-0.5",
                        )}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.texto}</p>
                      </div>

                      {!showAvatar && (
                        <span className={cn("text-xs text-slate-400 mt-1 px-1", isAdmin ? "text-right" : "text-left")}>
                          {formatarData(msg.timestamp)}
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex flex-col items-center">
                        {showAvatar ? (
                          <Avatar className="h-10 w-10 shadow-md ring-2 ring-white">
                            <AvatarFallback
                              className={cn("text-sm font-semibold", autorInfo.color, autorInfo.textColor)}
                            >
                              {autorInfo.avatar}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10" />
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}

            {isTyping && (
              <div className="flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <Avatar className="h-10 w-10 shadow-md ring-2 ring-white">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm font-semibold">
                    US
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={mensagensEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Campo de envio aprimorado */}
      <Card className="rounded-none border-x-0 border-b-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4 lg:p-6">
          {statusChamado === "fechado" ? (
            <div className="text-center py-6 space-y-2">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-slate-700 font-medium">Chamado encerrado</p>
              <p className="text-slate-500 text-sm">Este chamado foi finalizado e não aceita mais mensagens</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3 items-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-slate-100 flex-shrink-0"
                  disabled={statusChamado === "fechado"}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={novaMensagem}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="pr-12 py-3 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-200"
                    disabled={statusChamado === "fechado" || isSending}
                  />
                  {novaMensagem.trim() && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={enviarMensagem}
                  disabled={!novaMensagem.trim() || statusChamado === "fechado" || isSending}
                  size="icon"
                  className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl disabled:opacity-50"
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Pressione Enter para enviar</span>
                {novaMensagem.length > 0 && (
                  <span
                    className={cn(
                      "transition-colors duration-200",
                      novaMensagem.length > 500 ? "text-amber-600" : "text-slate-400",
                    )}
                  >
                    {novaMensagem.length}/1000
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
