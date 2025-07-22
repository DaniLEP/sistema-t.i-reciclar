"use client"

import { useEffect, useState } from "react"
import { getDatabase, ref, onValue } from "firebase/database"
import { app } from "../../../firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts"
import {
  Laptop,
  Tablet,
  Armchair,
  Headphones,
  Printer,
  TrendingUp,
  Activity,
  BarChart3,
  PieChartIcon,
  Download,
  RefreshCw,
  Calendar,
  ArrowLeft,
  Zap,
  Database,
  Clock,
  CameraIcon,
  Wifi,
  Signal,
  Eye,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#d946ef"]

const chartConfig = {
  notebooks: { label: "Notebooks", color: "#0088FE" },
  tablets: { label: "Tablets", color: "#00C49F" },
  moveis: { label: "Móveis", color: "#FFBB28" },
  fones: { label: "Fones", color: "#FF8042" },
  impressoras: { label: "Impressoras", color: "#8884D8" },
  cameras: { label: "Câmeras", color: "#d946ef" },
}

export default function DashboardRealtime() {
  const [totais, setTotais] = useState({
    notebooks: 0,
    tablets: 0,
    moveis: 0,
    fones: 0,
    impressoras: 0,
    cameras: 0,
  })
  const navigate = useNavigate()
  const [chartType, setChartType] = useState("bar")
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [historico, setHistorico] = useState([])

  const icons = {
    notebooks: Laptop,
    tablets: Tablet,
    moveis: Armchair,
    fones: Headphones,
    impressoras: Printer,
    cameras: CameraIcon,
  }

  const labels = {
    notebooks: "Notebooks",
    tablets: "Tablets",
    moveis: "Móveis",
    fones: "Fones",
    impressoras: "Impressoras",
    cameras: "Câmeras",
  }

  const iconColors = {
    notebooks: "text-blue-600",
    tablets: "text-emerald-600",
    moveis: "text-amber-600",
    fones: "text-orange-600",
    impressoras: "text-purple-600",
    cameras: "text-pink-600",
  }

  const bgColors = {
    notebooks: "from-blue-500/10 to-blue-600/5",
    tablets: "from-emerald-500/10 to-emerald-600/5",
    moveis: "from-amber-500/10 to-amber-600/5",
    fones: "from-orange-500/10 to-orange-600/5",
    impressoras: "from-purple-500/10 to-purple-600/5",
    cameras: "from-pink-500/10 to-pink-600/5",
  }

  useEffect(() => {
    const db = getDatabase(app)
    const refs = {
      notebooks: ref(db, "notebooks"),
      tablets: ref(db, "tablets"),
      moveis: ref(db, "moveis"),
      fones: ref(db, "fones"),
      impressoras: ref(db, "impressoras"),
      cameras: ref(db, "cameras"),
    }

    const unsubscribes = []

    Object.entries(refs).forEach(([key, reference]) => {
      const unsubscribe = onValue(reference, (snapshot) => {
        const data = snapshot.val()
        const count = data ? Object.keys(data).length : 0
        setTotais((prev) => ({
          ...prev,
          [key]: count,
        }))
        setLastUpdate(new Date())
        setIsLoading(false)
      })
      unsubscribes.push(unsubscribe)
    })

    return () => unsubscribes.forEach((unsub) => unsub())
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setHistorico((prev) => {
        const newEntry = {
          time: new Date().toLocaleTimeString(),
          ...totais,
        }
        return [...prev.slice(-9), newEntry]
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [totais])

  const chartData = Object.entries(totais).map(([key, value]) => ({
    name: labels[key],
    value,
    fill: chartConfig[key]?.color || COLORS[0],
  }))

  const totalItems = Object.values(totais).reduce((acc, val) => acc + val, 0)

  const handleExport = () => {
    const dataStr = JSON.stringify(totais, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `dashboard-data-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const SkeletonCard = ({ className = "" }) => (
    <Card className={`animate-pulse ${className}`}>
      <CardHeader className="space-y-0 pb-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
          <div className="h-1.5 bg-gray-200 rounded-full w-full"></div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header Skeleton */}
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded w-80"></div>
                  <div className="h-4 bg-gray-200 rounded w-60"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-9 bg-gray-200 rounded w-24"></div>
                  <div className="h-9 bg-gray-200 rounded w-24"></div>
                  <div className="h-9 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6">
            <SkeletonCard className="col-span-1" />
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>

          {/* Loading Animation */}
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">Conectando ao Firebase</h3>
                <p className="text-gray-600">Carregando dados em tempo real...</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-blue-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                        <Activity className="h-7 w-7 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                        Dashboard em Tempo Real
                      </h1>
                      <p className="text-gray-600 text-lg">Monitoramento de equipamentos em tempo real</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <Wifi className="h-4 w-4" />
                    Ao vivo
                  </Badge>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-300 group bg-transparent"
                    >
                      <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                      Atualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      className="hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-300 bg-transparent"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/home")}
                      className="hover:bg-gray-50 hover:border-gray-200 transition-all duration-300"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 sm:gap-6">
          {/* Total Card - Special Design */}
          <Card className="col-span-1 sm:col-span-2 lg:col-span-1 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-blue-600 to-purple-600 border-0 text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-100">Total Geral</CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-white mb-2">{totalItems}</div>
              <p className="text-blue-100 text-sm">Equipamentos registrados</p>
              <div className="mt-4 flex items-center gap-2">
                <Signal className="h-4 w-4 text-green-300" />
                <span className="text-xs text-blue-100">Sistema ativo</span>
              </div>
            </CardContent>
          </Card>

          {/* Individual Category Cards */}
          {Object.entries(totais).map(([key, value], index) => {
            const Icon = icons[key]
            const percentage = ((value / totalItems) * 100 || 0).toFixed(1)
            return (
              <Card
                key={key}
                className="relative overflow-hidden group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${bgColors[key]} opacity-0 group-hover:opacity-100 transition-all duration-500`}
                ></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-100/50 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                    {labels[key]}
                  </CardTitle>
                  <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-lg transition-all duration-300">
                    <Icon
                      className={`h-5 w-5 ${iconColors[key]} group-hover:scale-110 transition-transform duration-300`}
                    />
                  </div>
                </CardHeader>

                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-105 transition-transform duration-300">
                    {value}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{percentage}% do total</p>
                      <Badge variant="outline" className="text-xs px-2 py-0.5 bg-white/50">
                        {value > 0 ? "Ativo" : "Vazio"}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${bgColors[key].replace("/10", "").replace("/5", "")} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Enhanced Tabs Section */}
        <Tabs defaultValue="charts" className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-white/80 backdrop-blur-sm border-0 shadow-lg p-1">
              <TabsTrigger
                value="charts"
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Gráficos</span>
              </TabsTrigger>
              <TabsTrigger
                value="trends"
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Tendências</span>
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Detalhes</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="charts" className="space-y-6">
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      Visualização de Dados
                    </CardTitle>
                    <CardDescription className="text-base">
                      Escolha o tipo de gráfico para visualizar os dados de forma interativa
                    </CardDescription>
                  </div>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-[220px] bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-300 transition-colors">
                      <SelectValue placeholder="Tipo de gráfico" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm">
                      <SelectItem value="bar">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                          Gráfico de Barras
                        </div>
                      </SelectItem>
                      <SelectItem value="pie">
                        <div className="flex items-center gap-3">
                          <PieChartIcon className="h-4 w-4 text-green-600" />
                          Gráfico de Pizza
                        </div>
                      </SelectItem>
                      <SelectItem value="area">
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-purple-600" />
                          Gráfico de Área
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <ChartContainer config={chartConfig} className="min-h-[450px]">
                  {chartType === "bar" && (
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="var(--color-notebooks)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  )}
                  {chartType === "pie" && (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  )}
                  {chartType === "area" && historico.length > 0 && (
                    <AreaChart data={historico}>
                      <XAxis dataKey="time" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="notebooks" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="tablets" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      <Area type="monotone" dataKey="moveis" stackId="1" stroke="#ffc658" fill="#ffc658" />
                      <Area type="monotone" dataKey="fones" stackId="1" stroke="#ff7300" fill="#ff7300" />
                      <Area type="monotone" dataKey="impressoras" stackId="1" stroke="#8dd1e1" fill="#8dd1e1" />
                    </AreaChart>
                  )}
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50/80 to-blue-50/80 border-b border-gray-100">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Análise de Tendências
                </CardTitle>
                <CardDescription className="text-base">
                  Histórico de mudanças nos últimos períodos coletados automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {historico.length > 0 ? (
                  <ChartContainer config={chartConfig} className="min-h-[350px]">
                    <AreaChart data={historico}>
                      <XAxis dataKey="time" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="notebooks"
                        stroke="var(--color-notebooks)"
                        fill="var(--color-notebooks)"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="tablets"
                        stroke="var(--color-tablets)"
                        fill="var(--color-tablets)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl w-fit mx-auto">
                        <Calendar className="h-12 w-12 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-semibold text-gray-900">Aguardando dados históricos</p>
                        <p className="text-gray-600">Os dados serão coletados automaticamente a cada 30 segundos</p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-600 font-medium">Monitoramento ativo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 border-b border-gray-100">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Database className="h-5 w-5 text-white" />
                    </div>
                    Informações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-700">Última atualização:</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 bg-white px-3 py-1 rounded-lg">
                      {lastUpdate.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-xl border border-gray-100">
                    <span className="font-medium text-gray-700">Status da conexão:</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Conectado
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-xl border border-gray-100">
                    <span className="font-medium text-gray-700">Total de categorias:</span>
                    <span className="text-lg font-bold text-purple-600">{Object.keys(totais).length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 border-b border-gray-100">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    Estatísticas Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-xl border border-gray-100">
                    <span className="font-medium text-gray-700">Categoria com mais itens:</span>
                    <Badge variant="outline" className="font-semibold bg-green-50 text-green-700 border-green-200">
                      {labels[Object.entries(totais).reduce((a, b) => (totais[a[0]] > totais[b[0]] ? a : b))[0]]}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-xl border border-gray-100">
                    <span className="font-medium text-gray-700">Categoria com menos itens:</span>
                    <Badge variant="outline" className="font-semibold bg-orange-50 text-orange-700 border-orange-200">
                      {labels[Object.entries(totais).reduce((a, b) => (totais[a[0]] < totais[b[0]] ? a : b))[0]]}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-100">
                    <span className="font-medium text-gray-700">Média por categoria:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {(totalItems / Object.keys(totais).length).toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
