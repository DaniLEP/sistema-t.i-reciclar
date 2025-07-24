
import React from "react"
import { useEffect, useState, useMemo } from "react"
import { getDatabase, ref, onValue, update } from "firebase/database"
import { motion, AnimatePresence } from "framer-motion"
import { Laptop, ArrowLeft, X, Search, Filter, Download, Eye, ChevronLeft, ChevronRight, MoreHorizontal} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { app } from "../../../../firebase"
import { useNavigate } from "react-router-dom"
import * as XLSX from "xlsx"
import { Edit, Save, Info, MapPin, FileText, MessageSquare, Hash, Tag, Cpu, Folder, Users,DollarSign, Calendar, Clock, AlertCircle, Settings, Loader2} from "lucide-react"

const STATUS_OPTIONS = [
  { value: "Disponível", label: "Disponível" },
  { value: "Emprestado", label: "Emprestado" },
  { value: "Quebrado", label: "Quebrado" },
  { value: "Manutencao", label: "Manutenção" },
  { value: "naoEncontrado", label: "Não Encontrado" },
  { value: "Controlador", label: "Controlador" },
  { value: "Colaborador", label: "Colaborador(a)" },
]

const ITEMS_PER_PAGE = 10

function formatDate(dateString) {
  if (!dateString) return "-"; const d = new Date(dateString)
  if (isNaN(d.getTime())) return dateString
  return d.toLocaleDateString("pt-BR")
}

export default function VisualizarNotebooks() {
  const [notebooks, setNotebooks] = useState([])
  const [filtro, setFiltro] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [modalAberto, setModalAberto] = useState(false)
  const [selecionado, setSelecionado] = useState(null)
  const [modalMotivo, setModalMotivo] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [statusNovo, setStatusNovo] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState("table") // "table" ou "cards"
  const navigate = useNavigate()
  const [modoEdicao, setModoEdicao] = useState(false)
  const [dadosEdicao, setDadosEdicao] = useState({})
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  useEffect(() => {
    const db = getDatabase(app)
    const refNotebooks = ref(db, "notebooks")
    const unsubscribe = onValue(refNotebooks, (snap) => {
      const data = snap.val() || {}
      const arr = Object.entries(data).map(([id, v]) => ({ id, ...v, status: v.status || "Disponível", motivo: v.motivo || "",
      })); setNotebooks(arr)})
    return () => unsubscribe()
  }, [])
  const abrirModal = (item) => { setSelecionado(item);  setModalAberto(true)}
  const fecharModal = () => {setModalAberto(false); setSelecionado(null); setModoEdicao(false); setDadosEdicao({});}
  const iniciarEdicao = () => {setDadosEdicao({ ...selecionado });setModoEdicao(true)}
  const cancelarEdicao = () => { setModoEdicao(false); setDadosEdicao({}) }
  const salvarEdicao = async () => {
    if (!selecionado || salvandoEdicao) return;
    setSalvandoEdicao(true);
    try {
      const db = getDatabase(app)
      await update(ref(db, `notebooks/${selecionado.id}`), { ...dadosEdicao,dataUltimaEdicao: new Date().toISOString(),})
      // Atualizar estado local
      const atualizado = { ...dadosEdicao, dataUltimaEdicao: new Date().toISOString() }
      setSelecionado(atualizado); setNotebooks((old) => old.map((n) => (n.id === selecionado.id ? atualizado : n)))
      setModoEdicao(false); setDadosEdicao({})
    } catch (error) {console.error("Erro ao salvar alterações:", error)
      alert("Erro ao salvar alterações. Tente novamente.")
    } finally {setSalvandoEdicao(false) }
  }

  const handleInputChange = (campo, valor) => {setDadosEdicao((prev) => ({...prev,[campo]: valor,}))}
  const fecharMotivo = () => {setModalMotivo(false); setMotivo("")}
  const atualizarFirebase = async (id, status, motivoTexto) => {
    try {
      const db = getDatabase(app)
      await update(ref(db, `notebooks/${id}`), {status, motivo: motivoTexto, })
    } catch (e) { console.error("Erro ao atualizar notebook:", e) }
  }

  const alterarStatus = (novo) => {
    if (!selecionado) return
    if (["Emprestado", "Quebrado", "Manutencao", "Controlador", "Colaborador"].includes(novo)) {
      setStatusNovo(novo); setModalMotivo(true);
    } else { const atualizado = { ...selecionado, status: novo, motivo: "" }
      setSelecionado(atualizado); atualizarFirebase(selecionado.id, novo, "");
      setNotebooks((old) => old.map((n) => (n.id === selecionado.id ? atualizado : n)))
    }
  }

  const salvarMotivo = () => {
    if (!selecionado || !motivo.trim()) return
    const atualizado = { ...selecionado, status: statusNovo, motivo: motivo.trim(),}
    setSelecionado(atualizado); atualizarFirebase(selecionado.id, statusNovo, motivo.trim());
    setNotebooks((old) => old.map((n) => (n.id === selecionado.id ? atualizado : n)));
    setModalMotivo(false); setMotivo("");
  }

  const notebooksFiltrados = useMemo(() => {
    const lf = filtro.toLowerCase()
    return notebooks
      .filter(({ modelo, marca, patrimonio, status }) => {
        const textoOk = modelo?.toLowerCase()?.includes(lf) ||  marca?.toLowerCase()?.includes(lf) || patrimonio?.toLowerCase()?.includes(lf)
        const statusOk = filtroStatus === "todos" || status === filtroStatus
        return textoOk && statusOk
      }).sort((a, b) => (a.modelo || "").localeCompare(b.modelo || ""))
  }, [filtro, filtroStatus, notebooks])

  // Paginação
  const totalPages = Math.ceil(notebooksFiltrados.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentItems = notebooksFiltrados.slice(startIndex, endIndex)
  // Reset página quando filtros mudam
  useEffect(() => {setCurrentPage(1)}, [filtro, filtroStatus])
  const contagem = useMemo(() => {
    const cnt = { Disponível: 0, Emprestado: 0, Quebrado: 0, Manutencao: 0, naoEncontrado: 0, Controlador: 0, Colaborador: 0}
    notebooks.forEach((n) => {if (cnt[n.status] >= 0) cnt[n.status]++ })
    return cnt
  }, [notebooks])
  const voltarPagina = () => navigate("/views")
  const getStatusColor = (status) => {
    switch (status) {
      case "Disponível": return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "Emprestado": return "bg-amber-100 text-amber-800 border-amber-200"
      case "Quebrado": return "bg-red-100 text-red-800 border-red-200"
      case "Manutencao": return "bg-blue-100 text-blue-800 border-blue-200"
      case "naoEncontrado": return "bg-orange-100 text-orange-800 border-orange-200"
      case "Controlador": return "bg-purple-100 text-purple-800 border-purple-200"
      case "Colaborador": return "bg-indigo-100 text-indigo-800 border-indigo-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const exportarParaExcel = () => {
    const dadosParaExportar = notebooksFiltrados.map((item) => ({  Patrimônio: item.patrimonio || "-", 
       Marca: item.marca || "-", Modelo: item.modelo || "-", Local: item.local || "-", Projeto: item.projeto || "-", 
       Parceiro: item.parceiro || "-", "Nota Fiscal": item.notaFiscal || "-", NCM: item.NCM || "-", 
       "VR-BEM": item.vrbem || "-", "Data de Cadastro": formatDate(item.dataCadastro), Ano: item.ano || "-", Observações: item.obs || "-", 
       Status: item.status || "-", Motivo: item.motivo || "-",}))
    const ws = XLSX.utils.json_to_sheet(dadosParaExportar)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Notebooks")
    XLSX.writeFile(wb, "notebooks.xlsx")
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    if (endPage - startPage + 1 < maxVisiblePages) {startPage = Math.max(1, endPage - maxVisiblePages + 1)}
    for (let i = startPage; i <= endPage; i++) {pages.push(i) }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}  disabled={currentPage === 1} className="flex items-center gap-1"><ChevronLeft className="w-4 h-4" />Anterior</Button>
        <div className="flex items-center gap-1">
          {startPage > 1 && (
            <><Button variant={1 === currentPage ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(1)}> 1</Button>{startPage > 2 && <MoreHorizontal className="w-4 h-4 text-gray-400" />}</>
          )}
          {pages.map((page) => (
            <Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className="min-w-[40px]" > {page}</Button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <MoreHorizontal className="w-4 h-4 text-gray-400" />}
              <Button variant={totalPages === currentPage ? "default" : "outline"}size="sm" onClick={() => setCurrentPage(totalPages)}>{totalPages}
              </Button>
            </>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
        disabled={currentPage === totalPages} className="flex items-center gap-1" >Próxima<ChevronRight className="w-4 h-4" /></Button>
      </div>
    )
  }

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {currentItems.map((item, index) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}>
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg font-semibold text-gray-800 truncate"> {item.modelo || "Modelo não informado"}</CardTitle>
                  </div>
                  <Badge className={`text-xs font-medium border ${getStatusColor(item.status)}`}>{item.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Patrimônio:</span>
                    <p className="text-gray-800 truncate">{item.patrimonio || "-"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Marca:</span>
                    <p className="text-gray-800 truncate">{item.marca || "-"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Local:</span>
                    <p className="text-gray-800 truncate">{item.local || "-"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Projeto:</span>
                    <p className="text-gray-800 truncate">{item.projeto || "-"}</p>
                  </div>
                </div>
                {item.obs && (
                  <div><span className="font-medium text-gray-600 text-sm">Observações:</span>
                  <p className="text-gray-800 text-sm line-clamp-2">{item.obs}</p>
                  </div>
                )}
                <Button onClick={() => abrirModal(item)}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white" size="sm">
                  <Eye className="w-4 h-4 mr-2" />Ver Detalhes</Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <motion.div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 overflow-hidden" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Header */}
        <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg"> <Laptop className="w-6 h-6 text-white" /></div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Notebooks Cadastrados</h2>
              <p className="text-gray-600 text-sm">
                {notebooksFiltrados.length} notebook{notebooksFiltrados.length !== 1 ? "s" : ""} encontrado 
                {notebooksFiltrados.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button variant="outline"onClick={voltarPagina}
            className="flex items-center gap-2 hover:bg-gray-50 border-gray-200 bg-transparent"> <ArrowLeft className="w-4 h-4" /> Voltar</Button>
        </motion.div>

        {/* Filtros */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input type="text" placeholder="Pesquisar notebooks..." value={filtro}
              onChange={(e) => setFiltro(e.target.value)} className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"/>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="pl-10 border-gray-200 focus:border-blue-500"><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                {STATUS_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={exportarParaExcel} className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg">
            <Download className="w-4 h-4 mr-2" />Exportar Excel</Button>
          <div className="flex gap-2">
            <Button variant={viewMode === "table" ? "default" : "outline"} onClick={() => setViewMode("table")} size="sm"className="flex-1">Tabela</Button>
            <Button variant={viewMode === "cards" ? "default" : "outline"} onClick={() => setViewMode("cards")} size="sm" className="flex-1" >Cards</Button>
          </div>
        </motion.div>

        {/* Contagem de Status */}
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}>
          {Object.entries(contagem).map(([key, value], index) => (
            <motion.div key={key} initial={{ opacity: 0, scale: 0.9 }}animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}>
              <Card className="text-center hover:shadow-md transition-all duration-300 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-4">
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mb-2 ${getStatusColor(key)}`}>{STATUS_OPTIONS.find((opt) => opt.value === key)?.label || key} </div>
                  <div className="text-2xl font-bold text-gray-900">{value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Conteúdo Principal */}
        <motion.div initial={{ opacity: 0, y: 20 }}  animate={{ opacity: 1, y: 0 }}  transition={{ duration: 0.5, delay: 0.4 }}>
          {notebooksFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <Laptop className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhum notebook encontrado</p>
              <p className="text-gray-400 text-sm">Tente ajustar os filtros de pesquisa</p>
            </div> ) : viewMode === "cards" ? (  renderCards() ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <Table>
                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <TableRow>
                    {[ "Patrimônio", "Notebook", "Marca", "Modelo", "Local", "Projeto", "Observações", "Status", "Ações",
                    ].map((h) => (<TableHead key={h} className="text-center font-semibold text-gray-700 whitespace-nowrap">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {currentItems.map((item, index) => (
                      <motion.tr key={item.id}initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }} className="hover:bg-blue-50/50 transition-colors duration-200">
                        <TableCell className="text-center font-medium">{item.patrimonio || "-"}</TableCell>
                        <TableCell className="text-center font-medium">{item.notebook || "-"}</TableCell>
                        <TableCell className="text-center">{item.marca || "-"}</TableCell>
                        <TableCell className="text-center">{item.modelo || "-"}</TableCell>
                        <TableCell className="text-center">{item.local || "-"}</TableCell>
                        <TableCell className="text-center">{item.projeto || "-"}</TableCell>
                        <TableCell className="text-center max-w-[200px] truncate" title={item.obs || ""}>{item.obs || "-"}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs font-medium border ${getStatusColor(item.status)}`} title={item.motivo || ""}>{item.status}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="outline" size="sm"
                            onClick={() => abrirModal(item)} className="hover:bg-blue-50 hover:border-blue-300"><Eye className="w-4 h-4 mr-1" />Ver Mais</Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}

          {/* Paginação */}
          {renderPagination()}
        </motion.div>
      </motion.div>

      {/* Modal de detalhes melhorado */}
      <AnimatePresence>
        {modalAberto && selecionado && (
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 rounded-2xl shadow-2xl border-0">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="flex flex-col h-full">
                {/* Header do Modal */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative">
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></Button>
                  </DialogClose>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Laptop className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{modoEdicao ? "Editando Notebook" : "Detalhes do Notebook"}</h2>
                        <p className="text-blue-100 text-sm"> {selecionado.modelo || "Modelo não informado"} • {selecionado.marca || "Marca não informada"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={`text-sm font-medium border-2 ${getStatusColor(selecionado.status)} bg-white`}>{selecionado.status}</Badge>
                      {!modoEdicao && (
                        <Button onClick={iniciarEdicao} variant="secondary" size="sm"className="bg-white/20 hover:bg-white/30 text-white border-white/30" >
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Modal */}
                <div className="flex-1 overflow-y-auto p-6">
                  {modoEdicao ? (
                    /* Modo de Edição */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Informações Básicas */}
                        <Card className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Info className="w-4 h-4" /> Informações Básicas </h3>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="patrimonio" className="text-sm font-medium text-gray-600">Patrimônio *</Label>
                              <Input  id="patrimonio" value={dadosEdicao.patrimonio || ""}
                                onChange={(e) => handleInputChange("patrimonio", e.target.value)} className="mt-1"placeholder="Número do patrimônio" />
                            </div>
                            <div>
                              <Label htmlFor="notebook" className="text-sm font-medium text-gray-600"> Notebook</Label>
                              <Input id="notebook" value={dadosEdicao.notebook || ""}
                                onChange={(e) => handleInputChange("notebook", e.target.value)}className="mt-1" placeholder="Nome/Identificação do notebook"/>
                            </div>
                            <div>
                              <Label htmlFor="marca" className="text-sm font-medium text-gray-600"> Marca *</Label>
                              <Input  id="marca" value={dadosEdicao.marca || ""}
                                onChange={(e) => handleInputChange("marca", e.target.value)} className="mt-1"placeholder="Marca do notebook"/>
                            </div>
                            <div>
                              <Label htmlFor="modelo" className="text-sm font-medium text-gray-600">Modelo *</Label>
                              <Input id="modelo"value={dadosEdicao.modelo || ""}
                                onChange={(e) => handleInputChange("modelo", e.target.value)}className="mt-1"placeholder="Modelo do notebook"/>
                            </div>
                            <div>
                              <Label htmlFor="ano" className="text-sm font-medium text-gray-600">Ano</Label>
                              <Input id="ano"type="number" value={dadosEdicao.ano || ""} onChange={(e) => handleInputChange("ano", e.target.value)} 
                                className="mt-1"  placeholder="Ano de fabricação" min="2000" max={new Date().getFullYear()}/>
                            </div>
                          </div>
                        </Card>

                        {/* Localização e Projeto */}
                        <Card className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> Localização e Projeto</h3>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="local" className="text-sm font-medium text-gray-600">Local</Label>
                              <Input id="local" value={dadosEdicao.local || ""}
                                onChange={(e) => handleInputChange("local", e.target.value)}  className="mt-1" placeholder="Localização atual"/>
                            </div>
                            <div>
                              <Label htmlFor="projeto" className="text-sm font-medium text-gray-600">Projeto</Label>
                              <Input  id="projeto" value={dadosEdicao.projeto || ""}
                                onChange={(e) => handleInputChange("projeto", e.target.value)} className="mt-1" placeholder="Projeto associado" />
                            </div>
                            <div>
                              <Label htmlFor="parceiro" className="text-sm font-medium text-gray-600">Parceiro</Label>
                              <Input id="parceiro" value={dadosEdicao.parceiro || ""}
                                onChange={(e) => handleInputChange("parceiro", e.target.value)} className="mt-1" placeholder="Parceiro responsável" />
                            </div>
                          </div>
                        </Card>

                        {/* Informações Fiscais */}
                        <Card className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"> <FileText className="w-4 h-4" />Informações Fiscais</h3>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="notaFiscal" className="text-sm font-medium text-gray-600">Nota Fiscal</Label>
                              <Input id="notaFiscal" value={dadosEdicao.notaFiscal || ""}
                                 onChange={(e) => handleInputChange("notaFiscal", e.target.value)} className="mt-1"placeholder="Número da nota fiscal" />
                            </div>
                            <div>
                              <Label htmlFor="NCM" className="text-sm font-medium text-gray-600">NCM</Label>
                              <Input id="NCM" value={dadosEdicao.NCM || ""}
                                onChange={(e) => handleInputChange("NCM", e.target.value)} className="mt-1" placeholder="Código NCM"/>
                            </div>
                            <div>
                              <Label htmlFor="vrbem" className="text-sm font-medium text-gray-600">VR-BEM</Label>
                              <Input id="vrbem" value={dadosEdicao.vrbem || ""}
                                onChange={(e) => handleInputChange("vrbem", e.target.value)} className="mt-1" placeholder="Valor do bem" />
                            </div>
                          </div>
                        </Card>

                        {/* Observações */}
                        <Card className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"> <MessageSquare className="w-4 h-4" />Observações</h3>
                          <Textarea value={dadosEdicao.obs || ""} onChange={(e) => handleInputChange("obs", e.target.value)}
                            placeholder="Observações adicionais..." className="min-h-[120px] resize-y"/>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    /* Modo de Visualização */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { label: "Patrimônio", value: selecionado.patrimonio, icon: Hash },
                          { label: "Notebook", value: selecionado.notebook, icon: Laptop },
                          { label: "Marca", value: selecionado.marca, icon: Tag },
                          { label: "Modelo", value: selecionado.modelo, icon: Cpu },
                          { label: "Local", value: selecionado.local, icon: MapPin },
                          { label: "Projeto", value: selecionado.projeto, icon: Folder },
                          { label: "Parceiro", value: selecionado.parceiro, icon: Users },
                          { label: "Nota Fiscal", value: selecionado.notaFiscal, icon: FileText },
                          { label: "NCM", value: selecionado.NCM, icon: Hash },
                          { label: "VR‑BEM", value: selecionado.vrbem, icon: DollarSign },
                          { label: "Data de Cadastro", value: formatDate(selecionado.dataCadastro), icon: Calendar },
                          { label: "Ano", value: selecionado.ano, icon: Clock },
                        ].map(({ label, value, icon: Icon }) => (
                          <Card key={label} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Icon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  {label}
                                </Label>
                                <p className="text-gray-900 font-medium truncate" title={value || "-"}>
                                  {value || "-"}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                        {selecionado.motivo && (
                          <Card className="p-4 md:col-span-2 lg:col-span-3 bg-amber-50 border-amber-200">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-amber-100 rounded-lg"><AlertCircle className="w-4 h-4 text-amber-600" /></div>
                              <div>
                                <Label className="text-xs font-medium text-amber-700 uppercase tracking-wide"> Motivo do Status </Label>
                                <p className="text-amber-900 font-medium mt-1">{selecionado.motivo}</p>
                              </div>
                            </div>
                          </Card>
                        )}

                        <Card className="p-4 md:col-span-2 lg:col-span-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <MessageSquare className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide"> Observações</Label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{selecionado.obs || "Nenhuma observação registrada."}</p>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Seção de Alteração de Status */}
                      <Card className="p-6 bg-gray-50">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"> <Settings className="w-4 h-4" /> Alterar Status </h3>
                        <Select value={selecionado.status} onValueChange={alterarStatus}>
                          <SelectTrigger className="w-full max-w-md bg-white"><SelectValue placeholder="Selecione um status" /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(opt.value).split(" ")[0]}`} />{opt.label}</div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Footer do Modal */}
                <div className="border-t bg-gray-50 p-6">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {selecionado.dataUltimaEdicao && ( <span>Última edição: {formatDate(selecionado.dataUltimaEdicao)}</span> )}
                    </div>

                    <div className="flex gap-3">
                      {modoEdicao ? (
                        <>
                          <Button variant="outline" onClick={cancelarEdicao} disabled={salvandoEdicao}>Cancelar</Button>
                          <Button onClick={salvarEdicao} disabled={salvandoEdicao} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                            {salvandoEdicao ? (
                              <> <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando... </>
                            ) : (<> <Save className="w-4 h-4 mr-2" /> Salvar Alterações</>)}
                          </Button>
                        </>
                      ) : ( <Button variant="outline" onClick={fecharModal}>Fechar</Button> )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
      {/* Modal do motivo */}
      <AnimatePresence>
        {modalMotivo && (
          <Dialog open={modalMotivo} onOpenChange={setModalMotivo}>
            <DialogContent className="max-w-md p-0 rounded-2xl shadow-2xl border-0">
              <motion.div initial={{ opacity: 0, scale: 0.95 }}animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }} className="p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl font-bold text-red-700 mb-2"> Informe o motivo da alteração</DialogTitle>
                  <DialogClose asChild>
                    <Button variant="ghost"  size="icon"
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></Button>
                  </DialogClose>
                </DialogHeader>
                <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Digite o motivo da alteração..."
                  className="min-h-[120px] resize-y border-gray-200 focus:border-red-500 focus:ring-red-500"/>
                <DialogFooter className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={fecharMotivo}> Cancelar</Button>
                  <Button onClick={salvarMotivo} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">Salvar Alteração</Button>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}