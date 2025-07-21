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
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const chartConfig = {
  notebooks: { label: "Notebooks", color: "hsl(var(--chart-1))" },
  tablets: { label: "Tablets", color: "hsl(var(--chart-2))" },
  moveis: { label: "Móveis", color: "hsl(var(--chart-3))" },
  fones: { label: "Fones", color: "hsl(var(--chart-4))" },
  impressoras: { label: "Impressoras", color: "hsl(var(--chart-5))" },
}

export default function DashboardRealtime() {
  const [totais, setTotais] = useState({
    notebooks: 0,
    tablets: 0,
    moveis: 0,
    fones: 0,
    impressoras: 0,
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
  }

  const labels = {
    notebooks: "Notebooks",
    tablets: "Tablets",
    moveis: "Móveis",
    fones: "Fones",
    impressoras: "Impressoras",
  }

  // Escuta mudanças no Firebase em tempo real
  useEffect(() => {
    const db = getDatabase(app)
    const refs = {
      notebooks: ref(db, "notebooks"),
      tablets: ref(db, "tablets"),
      moveis: ref(db, "moveis"),
      fones: ref(db, "fones"),
      impressoras: ref(db, "impressoras"),
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

  // Atualiza histórico a cada 30s baseado nos totais
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
    value: value,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <Database className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Conectando ao Firebase</h3>
                <p className="text-muted-foreground">Carregando dados em tempo real...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header com gradiente sutil */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl"></div>
          <div className="relative bg-card/50 backdrop-blur-sm border rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      Dashboard em Tempo Real
                    </h1>
                    <p className="text-muted-foreground">Monitoramento de equipamentos em tempo real</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Ao vivo
                </Badge>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="hover:bg-primary/5 bg-transparent"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="hover:bg-primary/5 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate("/home")} className="hover:bg-primary/5">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Principais com animações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {/* Card Total Geral - Destaque especial */}
          <Card className="col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-1 relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Geral</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-primary mb-1">{totalItems}</div>
              <p className="text-xs text-muted-foreground">equipamentos registrados</p>
            </CardContent>
          </Card>

          {/* Cards individuais com cores temáticas */}
          {Object.entries(totais).map(([key, value], index) => {
            const Icon = icons[key]
            const percentage = ((value / totalItems) * 100 || 0).toFixed(1)

            return (
              <Card
                key={key}
                className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{labels[key]}</CardTitle>
                  <div className="p-2 bg-muted/50 rounded-lg group-hover:bg-muted transition-colors">
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold mb-1">{value}</div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{percentage}% do total</p>
                    <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Gráficos com melhor design */}
        <Tabs defaultValue="charts" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-muted/50">
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Gráficos
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Tendências
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Detalhes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="charts" className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Visualização de Dados
                    </CardTitle>
                    <CardDescription>Escolha o tipo de gráfico para visualizar os dados</CardDescription>
                  </div>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-[200px] bg-background/50">
                      <SelectValue placeholder="Tipo de gráfico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Gráfico de Barras
                        </div>
                      </SelectItem>
                      <SelectItem value="pie">
                        <div className="flex items-center gap-2">
                          <PieChartIcon className="h-4 w-4" />
                          Gráfico de Pizza
                        </div>
                      </SelectItem>
                      <SelectItem value="area">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Gráfico de Área
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ChartContainer config={chartConfig} className="min-h-[400px]">
                  {chartType === "bar" && (
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="var(--color-notebooks)" radius={[4, 4, 0, 0]} />
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
                        outerRadius={120}
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
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Análise de Tendências
                </CardTitle>
                <CardDescription>Histórico de mudanças nos últimos períodos</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {historico.length > 0 ? (
                  <ChartContainer config={chartConfig} className="min-h-[300px]">
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
                  <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <div className="text-center space-y-3">
                      <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto">
                        <Calendar className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="font-medium">Aguardando dados históricos</p>
                        <p className="text-sm">Os dados serão coletados a cada 30 segundos</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    Informações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Última atualização:</span>
                    </div>
                    <span className="text-sm font-medium">{lastUpdate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Status da conexão:</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Conectado
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Total de categorias:</span>
                    <span className="text-sm font-medium">{Object.keys(totais).length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Estatísticas Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Categoria com mais itens:</span>
                    <Badge variant="outline" className="font-medium">
                      {labels[Object.entries(totais).reduce((a, b) => (totais[a[0]] > totais[b[0]] ? a : b))[0]]}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Categoria com menos itens:</span>
                    <Badge variant="outline" className="font-medium">
                      {labels[Object.entries(totais).reduce((a, b) => (totais[a[0]] < totais[b[0]] ? a : b))[0]]}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Média por categoria:</span>
                    <span className="text-sm font-medium">{(totalItems / Object.keys(totais).length).toFixed(1)}</span>
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
