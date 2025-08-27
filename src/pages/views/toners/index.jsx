"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { ref, onValue, update, push } from "firebase/database"
import { motion, AnimatePresence } from "framer-motion"
import {
  Palette,
  Printer,
  ArrowLeft,
  AlertTriangle,
  Search,
  RefreshCw,
  Package,
  TrendingDown,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  CheckSquare,
  Minus,
  Calendar,
  BarChart3,
  X,
  Plus,
  Eye,
  ShoppingCart,
  History,
  FileText,
} from "lucide-react"
import { db } from "../../../../firebase"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function ConsultaToners() {
  const [toners, setToners] = useState([])
  const [resumo, setResumo] = useState({})
  const [filtroImpressora, setFiltroImpressora] = useState("TODAS")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const [selectedToners, setSelectedToners] = useState(new Set())
  const [sortBy, setSortBy] = useState("impressora")
  const [sortOrder, setSortOrder] = useState("asc")
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, data: null })
  const [notifications, setNotifications] = useState([])
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [bulkAction, setBulkAction] = useState("")
  const [activeTab, setActiveTab] = useState("inventory")
  const [withdrawHistory, setWithdrawHistory] = useState([])

  const [withdrawMode, setWithdrawMode] = useState(false)
  const [withdrawQuantities, setWithdrawQuantities] = useState({})
  const [quickFilters, setQuickFilters] = useState({
    lowStock: false,
    recentlyUsed: false,
    neverUsed: false,
  })

  const addNotification = useCallback((message, type = "info") => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type, timestamp: new Date() }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)
  }, [])

  const handleGoBack = () => {
    if (typeof window !== "undefined") {
      window.history.back()
    }
  }

  useEffect(() => {
    setLoading(true)
    setError(null)

    const tonersUnsub = onValue(
      ref(db, "toners"),
      (snapshot) => {
        try {
          const data = snapshot.val()
          if (data) {
            const lista = Object.entries(data).map(([id, toner]) => ({
              id,
              ...toner,
              ultimaRetirada: toner.ultimaRetirada ? new Date(toner.ultimaRetirada) : null,
            }))

            setToners(lista)

            const agrupado = lista.reduce((acc, item) => {
              const key = item.impressora
              acc[key] = (acc[key] || 0) + (item.quantidade || 0)
              return acc
            }, {})

            setResumo(agrupado)
            setLastRefresh(new Date())
          } else {
            setToners([])
            setResumo({})
          }
        } catch (err) {
          setError("Erro ao carregar dados dos toners")
          console.error("Erro ao processar dados:", err)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError("Erro ao conectar com o banco de dados")
        setLoading(false)
        console.error("Erro Firebase:", err)
      },
    )

    const historyUnsub = onValue(ref(db, "withdraw_history"), (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const history = Object.entries(data)
          .map(([id, record]) => ({
            id,
            ...record,
            timestamp: new Date(record.timestamp),
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
        setWithdrawHistory(history)
      }
    })

    return () => {
      tonersUnsub()
      historyUnsub()
    }
  }, [])

  const impressorasUnicas = [...new Set(toners.map((t) => t.impressora))].sort()

  const handleCustomWithdraw = async (id, currentQuantity, tonerInfo, customQuantity) => {
    if (currentQuantity < customQuantity || isUpdating || customQuantity <= 0) return

    setIsUpdating(true)
    const newQuantity = currentQuantity - customQuantity

    try {
      await update(ref(db, `toners/${id}`), {
        quantidade: newQuantity,
        ultimaRetirada: new Date().toISOString(),
      })

      await push(ref(db, "withdraw_history"), {
        tonerId: id,
        tonerInfo: {
          cor: tonerInfo.cor,
          sku: tonerInfo.sku,
          impressora: tonerInfo.impressora,
        },
        quantidadeRetirada: customQuantity,
        quantidadeAnterior: currentQuantity,
        quantidadeNova: newQuantity,
        timestamp: new Date().toISOString(),
        usuario: "Sistema",
      })

      addNotification(
        `${customQuantity} toner(s) ${tonerInfo.cor} (${tonerInfo.sku}) retirado(s) com sucesso`,
        "success",
      )

      if (newQuantity <= 1) {
        addNotification(`⚠️ Estoque crítico: ${tonerInfo.cor} (${tonerInfo.sku}) - ${tonerInfo.impressora}`, "warning")
      }

      // Limpar quantidade personalizada após retirada
      setWithdrawQuantities((prev) => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })
    } catch (error) {
      setError(`Erro ao retirar toner ${tonerInfo.cor} (${tonerInfo.sku})`)
      addNotification(`Erro ao retirar toner: ${error.message}`, "error")
      console.error("Erro ao atualizar quantidade:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const applyQuickFilter = (filterType) => {
    setQuickFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }))
  }

  const tonersFiltrados = useMemo(() => {
    const filtered = toners.filter((toner) => {
      const matchesImpressora = filtroImpressora === "TODAS" || toner.impressora === filtroImpressora
      const matchesSearch =
        searchTerm === "" ||
        toner.cor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toner.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toner.impressora?.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtros rápidos
      const matchesLowStock = !quickFilters.lowStock || toner.quantidade <= 1
      const matchesRecentlyUsed =
        !quickFilters.recentlyUsed ||
        (toner.ultimaRetirada && new Date() - toner.ultimaRetirada < 7 * 24 * 60 * 60 * 1000) // últimos 7 dias
      const matchesNeverUsed = !quickFilters.neverUsed || !toner.ultimaRetirada

      return matchesImpressora && matchesSearch && matchesLowStock && matchesRecentlyUsed && matchesNeverUsed
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal
      switch (sortBy) {
        case "quantidade":
          aVal = a.quantidade || 0
          bVal = b.quantidade || 0
          break
        case "cor":
          aVal = a.cor || ""
          bVal = b.cor || ""
          break
        case "sku":
          aVal = a.sku || ""
          bVal = b.sku || ""
          break
        case "ultimaRetirada":
          aVal = a.ultimaRetirada || new Date(0)
          bVal = b.ultimaRetirada || new Date(0)
          break
        default:
          aVal = a.impressora || ""
          bVal = b.impressora || ""
      }

      if (typeof aVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal
    })

    return filtered
  }, [toners, filtroImpressora, searchTerm, quickFilters, sortBy, sortOrder])

  const handleRetiradaToner = async (id, quantidadeAtual, tonerInfo, quantidade = 1) => {
    if (quantidadeAtual < quantidade || isUpdating) return

    setIsUpdating(true)
    const novaQuantidade = quantidadeAtual - quantidade

    try {
      await update(ref(db, `toners/${id}`), {
        quantidade: novaQuantidade,
        ultimaRetirada: new Date().toISOString(),
      })

      await push(ref(db, "withdraw_history"), {
        tonerId: id,
        tonerInfo: {
          cor: tonerInfo.cor,
          sku: tonerInfo.sku,
          impressora: tonerInfo.impressora,
        },
        quantidadeRetirada: quantidade,
        quantidadeAnterior: quantidadeAtual,
        quantidadeNova: novaQuantidade,
        timestamp: new Date().toISOString(),
        usuario: "Sistema", // Could be enhanced with user authentication
      })

      addNotification(`${quantidade} toner(s) ${tonerInfo.cor} (${tonerInfo.sku}) retirado(s) com sucesso`, "success")

      if (novaQuantidade <= 1) {
        addNotification(`⚠️ Estoque crítico: ${tonerInfo.cor} (${tonerInfo.sku}) - ${tonerInfo.impressora}`, "warning")
      }
    } catch (error) {
      setError(`Erro ao retirar toner ${tonerInfo.cor} (${tonerInfo.sku})`)
      addNotification(`Erro ao retirar toner: ${error.message}`, "error")
      console.error("Erro ao atualizar quantidade:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBulkWithdraw = async () => {
    if (selectedToners.size === 0) return

    setConfirmDialog({
      open: true,
      action: "bulkWithdraw",
      data: {
        count: selectedToners.size,
        toners: Array.from(selectedToners).map((id) => toners.find((t) => t.id === id)),
      },
    })
  }

  const executeBulkWithdraw = async () => {
    setIsUpdating(true)
    let successCount = 0
    let errorCount = 0

    for (const tonerId of selectedToners) {
      const toner = toners.find((t) => t.id === tonerId)
      if (toner && toner.quantidade > 0) {
        try {
          await handleRetiradaToner(tonerId, toner.quantidade, toner, 1)
          successCount++
        } catch {
          errorCount++
        }
      }
    }

    setSelectedToners(new Set())
    addNotification(
      `Operação concluída: ${successCount} sucessos, ${errorCount} erros`,
      errorCount > 0 ? "warning" : "success",
    )
    setIsUpdating(false)
  }

  const exportToCSV = () => {
    const headers = ["Cor", "SKU", "Impressora", "Quantidade", "Última Retirada"]
    const csvContent = [
      headers.join(","),
      ...tonersFiltrados.map((toner) =>
        [
          toner.cor,
          toner.sku,
          toner.impressora,
          toner.quantidade,
          toner.ultimaRetirada ? toner.ultimaRetirada.toLocaleDateString() : "Nunca",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `toners_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    addNotification("Relatório exportado com sucesso", "success")
  }

  const getColorStyle = (cor) => {
    const colorMap = {
      preto: "#000000",
      magenta: "#FF00FF",
      ciano: "#00FFFF",
      amarelo: "#FFFF00",
    }
    return colorMap[cor?.toLowerCase()] || "#6B7280"
  }

  const getTotalToners = () => {
    return Object.values(resumo).reduce((total, quantidade) => total + quantidade, 0)
  }

  const getLowStockCount = () => {
    return toners.filter((toner) => toner.quantidade <= 1).length
  }

  const toggleTonerSelection = (tonerId) => {
    const newSelected = new Set(selectedToners)
    if (newSelected.has(tonerId)) {
      newSelected.delete(tonerId)
    } else {
      newSelected.add(tonerId)
    }
    setSelectedToners(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedToners.size === tonersFiltrados.length) {
      setSelectedToners(new Set())
    } else {
      setSelectedToners(new Set(tonersFiltrados.map((t) => t.id)))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-700 p-4 sm:p-6 flex items-center justify-center">
        <motion.div
          className="flex items-center gap-3 text-white"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-lg">Carregando sistema de toners...</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-700 p-4 sm:p-6">
      {/* ... existing notifications code ... */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, x: "100%" }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <Alert
              className={`${
                notification.type === "error"
                  ? "border-red-500 bg-red-50"
                  : notification.type === "warning"
                    ? "border-yellow-500 bg-yellow-50"
                    : notification.type === "success"
                      ? "border-green-500 bg-green-50"
                      : "border-blue-500 bg-blue-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <AlertDescription className="text-sm">{notification.message}</AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Palette className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">Sistema de Toners</h1>
                <p className="text-blue-100 mt-1">
                  Consulta e Retirada de Cartuchos • {getTotalToners()} toners disponíveis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={withdrawMode ? "secondary" : "outline"}
                onClick={() => setWithdrawMode(!withdrawMode)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {withdrawMode ? "Sair do Modo Retirada" : "Modo Retirada"}
              </Button>
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100">
              <TabsTrigger value="inventory" className="flex items-center gap-2 data-[state=active]:bg-white">
                <Eye className="w-4 h-4" />
                Consultar Toners
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="flex items-center gap-2 data-[state=active]:bg-white">
                <Minus className="w-4 h-4" />
                Retirar Toners
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-white">
                <FileText className="w-4 h-4" />
                Relatórios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-6">
              {/* Cards de resumo melhorados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Total de Toners
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-900">{getTotalToners()}</p>
                    <p className="text-xs text-blue-600 mt-1">em {impressorasUnicas.length} impressoras</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" />
                      Estoque Normal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-900">{toners.filter((t) => t.quantidade > 1).length}</p>
                    <p className="text-xs text-green-600 mt-1">toners disponíveis</p>
                  </CardContent>
                </Card>

                {getLowStockCount() > 0 && (
                  <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        Estoque Crítico
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-red-900">{getLowStockCount()}</p>
                      <p className="text-xs text-red-600 mt-1">requer atenção</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Última Atualização
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold text-purple-900">{lastRefresh.toLocaleTimeString()}</p>
                    <p className="text-xs text-purple-600 mt-1">{lastRefresh.toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Filtros principais */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Printer className="w-5 h-5 text-gray-600" />
                        <Label className="text-sm font-medium">Impressora:</Label>
                        <Select value={filtroImpressora} onValueChange={setFiltroImpressora}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TODAS">Todas as impressoras</SelectItem>
                            {impressorasUnicas.map((imp) => (
                              <SelectItem key={imp} value={imp}>
                                {imp}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <Label className="text-sm font-medium">Ordenar:</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="impressora">Impressora</SelectItem>
                            <SelectItem value="cor">Cor</SelectItem>
                            <SelectItem value="sku">SKU</SelectItem>
                            <SelectItem value="quantidade">Quantidade</SelectItem>
                            <SelectItem value="ultimaRetirada">Última Retirada</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        >
                          {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 max-w-sm flex-1">
                        <Search className="w-4 h-4 text-gray-500" />
                        <Input
                          placeholder="Buscar por cor, SKU ou impressora..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Filtros rápidos */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Filtros Rápidos:</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={quickFilters.lowStock ? "default" : "outline"}
                          size="sm"
                          onClick={() => applyQuickFilter("lowStock")}
                          className="text-xs"
                        >
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Estoque Baixo
                        </Button>
                        <Button
                          variant={quickFilters.recentlyUsed ? "default" : "outline"}
                          size="sm"
                          onClick={() => applyQuickFilter("recentlyUsed")}
                          className="text-xs"
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Usados Recentemente
                        </Button>
                        <Button
                          variant={quickFilters.neverUsed ? "default" : "outline"}
                          size="sm"
                          onClick={() => applyQuickFilter("neverUsed")}
                          className="text-xs"
                        >
                          <Package className="w-3 h-3 mr-1" />
                          Nunca Utilizados
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setQuickFilters({ lowStock: false, recentlyUsed: false, neverUsed: false })
                            setSearchTerm("")
                            setFiltroImpressora("TODAS")
                          }}
                          className="text-xs text-gray-500"
                        >
                          Limpar Filtros
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de toners */}
              <div className="overflow-x-auto rounded-lg border shadow-sm bg-white">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="py-4 px-4 font-semibold">Cor</TableHead>
                      <TableHead className="py-4 px-4 font-semibold">SKU</TableHead>
                      <TableHead className="py-4 px-4 font-semibold">Impressora</TableHead>
                      <TableHead className="py-4 px-4 text-center font-semibold">Quantidade</TableHead>
                      <TableHead className="py-4 px-4 text-center font-semibold">Última Retirada</TableHead>
                      <TableHead className="py-4 px-4 text-center font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {tonersFiltrados.length > 0 ? (
                        tonersFiltrados.map((toner, index) => (
                          <motion.tr
                            key={toner.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-b hover:bg-gray-50 transition-colors"
                          >
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                                  style={{ backgroundColor: getColorStyle(toner.cor) }}
                                />
                                <span className="font-medium capitalize">{toner.cor}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4 font-mono text-sm">{toner.sku}</TableCell>
                            <TableCell className="py-4 px-4 font-medium">{toner.impressora}</TableCell>
                            <TableCell className="py-4 px-4 text-center">
                              <Badge
                                variant={
                                  toner.quantidade <= 1
                                    ? "destructive"
                                    : toner.quantidade <= 3
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-base px-3 py-1"
                              >
                                {toner.quantidade}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-center text-sm text-gray-600">
                              {toner.ultimaRetirada ? (
                                <div>
                                  <div>{toner.ultimaRetirada.toLocaleDateString()}</div>
                                  <div className="text-xs text-gray-400">
                                    {toner.ultimaRetirada.toLocaleTimeString()}
                                  </div>
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Nunca
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-4 px-4 text-center">
                              {toner.quantidade <= 1 ? (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Crítico
                                </Badge>
                              ) : toner.quantidade <= 3 ? (
                                <Badge variant="secondary" className="text-xs">
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                  Baixo
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  <CheckSquare className="w-3 h-3 mr-1" />
                                  Normal
                                </Badge>
                              )}
                            </TableCell>
                          </motion.tr>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="flex flex-col items-center gap-3 text-gray-500">
                              <Package className="w-12 h-12 text-gray-300" />
                              <div>
                                <p className="text-lg font-medium">Nenhum toner encontrado</p>
                                <p className="text-sm">Tente ajustar os filtros de busca</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {tonersFiltrados.length > 0 && (
                <div className="text-center text-sm text-gray-600">
                  Mostrando {tonersFiltrados.length} de {toners.length} toners
                </div>
              )}
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Minus className="w-5 h-5" />
                    Retirada de Toners
                  </CardTitle>
                  <p className="text-sm text-gray-600">Selecione os toners e quantidades para retirada do estoque</p>
                </CardHeader>
                <CardContent>
                  {selectedToners.size > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-800">
                            {selectedToners.size} toner(s) selecionado(s) para retirada
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleBulkWithdraw}
                            disabled={isUpdating}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Minus className="w-4 h-4 mr-1" />
                            Retirar Selecionados
                          </Button>
                          <Button variant="outline" onClick={() => setSelectedToners(new Set())}>
                            Limpar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedToners.size === tonersFiltrados.length && tonersFiltrados.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Toner</TableHead>
                          <TableHead className="text-center">Disponível</TableHead>
                          <TableHead className="text-center">Quantidade a Retirar</TableHead>
                          <TableHead className="text-center">Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tonersFiltrados.map((toner) => (
                          <TableRow key={toner.id} className="hover:bg-gray-50">
                            <TableCell>
                              <Checkbox
                                checked={selectedToners.has(toner.id)}
                                onCheckedChange={() => toggleTonerSelection(toner.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-5 h-5 rounded-full border-2"
                                  style={{ backgroundColor: getColorStyle(toner.cor) }}
                                />
                                <div>
                                  <div className="font-medium capitalize">{toner.cor}</div>
                                  <div className="text-sm text-gray-500">
                                    {toner.sku} • {toner.impressora}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={toner.quantidade <= 1 ? "destructive" : "outline"}>
                                {toner.quantidade}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2 max-w-32 mx-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const current = withdrawQuantities[toner.id] || 1
                                    if (current > 1) {
                                      setWithdrawQuantities((prev) => ({
                                        ...prev,
                                        [toner.id]: current - 1,
                                      }))
                                    }
                                  }}
                                  disabled={!withdrawQuantities[toner.id] || withdrawQuantities[toner.id] <= 1}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  max={toner.quantidade}
                                  value={withdrawQuantities[toner.id] || 1}
                                  onChange={(e) => {
                                    const value = Math.min(
                                      Math.max(1, Number.parseInt(e.target.value) || 1),
                                      toner.quantidade,
                                    )
                                    setWithdrawQuantities((prev) => ({
                                      ...prev,
                                      [toner.id]: value,
                                    }))
                                  }}
                                  className="w-16 text-center"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const current = withdrawQuantities[toner.id] || 1
                                    if (current < toner.quantidade) {
                                      setWithdrawQuantities((prev) => ({
                                        ...prev,
                                        [toner.id]: current + 1,
                                      }))
                                    }
                                  }}
                                  disabled={withdrawQuantities[toner.id] >= toner.quantidade}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const quantity = withdrawQuantities[toner.id] || 1
                                  setConfirmDialog({
                                    open: true,
                                    action: "customWithdraw",
                                    data: {
                                      id: toner.id,
                                      quantidade: toner.quantidade,
                                      toner,
                                      customQuantity: quantity,
                                    },
                                  })
                                }}
                                disabled={toner.quantidade === 0 || isUpdating}
                              >
                                {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Retirar"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Relatório de estoque */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Relatório de Estoque
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total de Toners:</span>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {getTotalToners()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Impressoras Ativas:</span>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {impressorasUnicas.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Estoque Normal:</span>
                      <Badge variant="outline" className="text-lg px-3 py-1 bg-green-50 text-green-700">
                        {toners.filter((t) => t.quantidade > 3).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Estoque Baixo:</span>
                      <Badge variant="outline" className="text-lg px-3 py-1 bg-yellow-50 text-yellow-700">
                        {toners.filter((t) => t.quantidade > 1 && t.quantidade <= 3).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Estoque Crítico:</span>
                      <Badge variant="destructive" className="text-lg px-3 py-1">
                        {getLowStockCount()}
                      </Badge>
                    </div>
                    <Separator />
                    <Button onClick={exportToCSV} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Relatório Completo
                    </Button>
                  </CardContent>
                </Card>

                {/* Histórico de retiradas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Últimas Retiradas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {withdrawHistory.length > 0 ? (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {withdrawHistory.slice(0, 10).map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: getColorStyle(record.tonerInfo.cor) }}
                              />
                              <div>
                                <p className="text-sm font-medium">
                                  {record.tonerInfo.cor} ({record.tonerInfo.sku})
                                </p>
                                <p className="text-xs text-gray-600">
                                  {record.quantidadeRetirada} retirado(s) • {record.tonerInfo.impressora}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">{record.timestamp.toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">{record.timestamp.toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Nenhuma retirada registrada</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "withdraw"
                ? "Confirmar Retirada"
                : confirmDialog.action === "customWithdraw"
                  ? "Confirmar Retirada Personalizada"
                  : "Confirmar Retirada em Lote"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "withdraw" ? (
                confirmDialog.data ? (
                  <div className="space-y-2">
                    <p>
                      Deseja retirar <strong>1 toner</strong> do estoque?
                    </p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p>
                        <strong>Toner:</strong> {confirmDialog.data.toner?.cor} ({confirmDialog.data.toner?.sku})
                      </p>
                      <p>
                        <strong>Impressora:</strong> {confirmDialog.data.toner?.impressora}
                      </p>
                      <p>
                        <strong>Quantidade atual:</strong> {confirmDialog.data.quantidade}
                      </p>
                      <p>
                        <strong>Nova quantidade:</strong> {confirmDialog.data.quantidade - 1}
                      </p>
                    </div>
                  </div>
                ) : null
              ) : confirmDialog.action === "customWithdraw" ? (
                confirmDialog.data ? (
                  <div className="space-y-2">
                    <p>
                      Deseja retirar <strong>{confirmDialog.data.customQuantity} toner(s)</strong> do estoque?
                    </p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p>
                        <strong>Toner:</strong> {confirmDialog.data.toner?.cor} ({confirmDialog.data.toner?.sku})
                      </p>
                      <p>
                        <strong>Impressora:</strong> {confirmDialog.data.toner?.impressora}
                      </p>
                      <p>
                        <strong>Quantidade atual:</strong> {confirmDialog.data.quantidade}
                      </p>
                      <p>
                        <strong>Nova quantidade:</strong>{" "}
                        {confirmDialog.data.quantidade - confirmDialog.data.customQuantity}
                      </p>
                    </div>
                  </div>
                ) : null
              ) : confirmDialog.data ? (
                <div className="space-y-2">
                  <p>
                    Deseja retirar <strong>1 toner</strong> de cada um dos <strong>{confirmDialog.data.count}</strong>{" "}
                    toners selecionados?
                  </p>
                  <p className="text-sm text-gray-600">Esta ação não pode ser desfeita.</p>
                </div>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, action: null, data: null })}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDialog.action === "withdraw" && confirmDialog.data) {
                  handleRetiradaToner(confirmDialog.data.id, confirmDialog.data.quantidade, confirmDialog.data.toner)
                } else if (confirmDialog.action === "customWithdraw" && confirmDialog.data) {
                  handleCustomWithdraw(
                    confirmDialog.data.id,
                    confirmDialog.data.quantidade,
                    confirmDialog.data.toner,
                    confirmDialog.data.customQuantity,
                  )
                } else if (confirmDialog.action === "bulkWithdraw") {
                  executeBulkWithdraw()
                }
                setConfirmDialog({ open: false, action: null, data: null })
              }}
              disabled={isUpdating}
            >
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar Retirada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
