"use client"

import { useEffect, useState } from "react"
import { ref, onValue } from "firebase/database"
import { db } from "../../../../firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts"
import { format, subDays } from "date-fns"
import {
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Users,
  Activity,
  BarChart3,
  PieChartIcon,
  TrendingUpIcon,
} from "lucide-react"

const STATUS_COLORS = {
  Aberto: "#EF4444",
  "Em andamento": "#F59E0B",
  Resolvido: "#10B981", // substituindo Fechado por Resolvido
}

export default function DashboardChamados() {
  const [statusData, setStatusData] = useState([])
  const [fechadosPorDia, setFechadosPorDia] = useState([])
  const [metricas, setMetricas] = useState({
    total: 0,
    resolvidos: 0,
    pendentes: 0,
    emAndamento: 0,
    avaliacaoMedia: 0,
    tempoMedioResolucao: "0.0h",
  })
  const [chartType, setChartType] = useState("bar")

  useEffect(() => {
    const chamadosRef = ref(db, "chamados")

    const unsubscribe = onValue(
      chamadosRef,
      (snapshot) => {
        const data = snapshot.val() || {}
        const chamados = Object.values(data)

        // Atualizando chaves para refletir o novo status "Resolvido"
        const statusCount = { Aberto: 0, "Em andamento": 0, Resolvido: 0 }
        const fechadosDia = {}

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), i)
          return format(date, "dd/MM")
        }).reverse()

        last7Days.forEach((day) => {
          fechadosDia[day] = 0
        })

        let totalAvaliacoes = 0
        let somaAvaliacoes = 0
        let somaTempoResolucao = 0
        let countTempoResolucao = 0

        chamados.forEach((chamado) => {
          let status = "Aberto"

          if (chamado.mensagens) {
            const mensagensArray = Object.values(chamado.mensagens)
            if (mensagensArray.length > 0) {
              const ultimaMensagem = mensagensArray[mensagensArray.length - 1]
              if (
                ultimaMensagem &&
                typeof ultimaMensagem.texto === "string" &&
                ultimaMensagem.texto.toLowerCase().includes("foi encerrado")
              ) {
                status = "Resolvido" // aqui trocado de "Fechado" para "Resolvido"
              } else {
                status = "Em andamento"
              }
            }
          }

          statusCount[status] = (statusCount[status] || 0) + 1

          if (status === "Resolvido" && chamado.atualizadoEm) {
            const dataAtualizado = new Date(chamado.atualizadoEm)
            const dia = format(dataAtualizado, "dd/MM")
            if (fechadosDia.hasOwnProperty(dia)) {
              fechadosDia[dia]++
            }
          }

          if (status === "Resolvido" && chamado.avaliacao?.nota) {
            totalAvaliacoes++
            somaAvaliacoes += chamado.avaliacao.nota
          }

          if (
            status === "Resolvido" &&
            chamado.atualizadoEm &&
            chamado.criadoEm &&
            !isNaN(chamado.atualizadoEm) &&
            !isNaN(chamado.criadoEm)
          ) {
            const tempoMs = chamado.atualizadoEm - chamado.criadoEm
            if (tempoMs > 0) {
              somaTempoResolucao += tempoMs
              countTempoResolucao++
            }
          }
        })

        const tempoMedioHoras =
          countTempoResolucao > 0
            ? (somaTempoResolucao / countTempoResolucao / (1000 * 60 * 60)).toFixed(1)
            : "0.0"

        setStatusData(
          Object.entries(statusCount).map(([name, value]) => ({
            name,
            value,
            color: STATUS_COLORS[name],
          })),
        )

        setFechadosPorDia(
          Object.entries(fechadosDia).map(([name, value]) => ({
            name,
            value,
            resolucoes: value,
            meta: 10,
          })),
        )

        setMetricas({
          total: chamados.length,
          resolvidos: statusCount["Resolvido"],
          pendentes: statusCount["Aberto"],
          emAndamento: statusCount["Em andamento"],
          avaliacaoMedia:
            totalAvaliacoes > 0 ? (somaAvaliacoes / totalAvaliacoes).toFixed(1) : 0,
          tempoMedioResolucao: `${tempoMedioHoras}h`,
        })
      },
      (error) => {
        console.error("Erro ao ler dados do Firebase:", error)
      },
    )

    return () => unsubscribe()
  }, [])

  const renderChart = () => {
    const data =
      statusData.length > 0
        ? statusData
        : [
            { name: "Aberto", value: 0, color: STATUS_COLORS["Aberto"] },
            { name: "Em andamento", value: 0, color: STATUS_COLORS["Em andamento"] },
            { name: "Resolvido", value: 0, color: STATUS_COLORS["Resolvido"] },
          ]

    switch (chartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={40}
                paddingAngle={5}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Chamados"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fechadosPorDia}>
              <defs>
                <linearGradient id="colorResolucoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="resolucoes"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorResolucoes)"
                name="Resolvidos"
              />
              <Area
                type="monotone"
                dataKey="meta"
                stroke="#6366F1"
                fillOpacity={1}
                fill="url(#colorMeta)"
                name="Meta"
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [value, "Chamados"]} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  const getChartTitle = () => {
    switch (chartType) {
      case "pie":
        return "Distribuição de Status"
      case "area":
        return "Resolvidos últimos 7 dias vs Meta"
      default:
        return "Status dos Chamados"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Chamados</h1>
            <p className="text-gray-600 mt-1">Monitoramento em tempo real</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Activity className="w-4 h-4 text-green-500" />
              <span>Ao vivo</span>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Chamados</p>
                  <p className="text-3xl font-bold text-gray-900">{metricas.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Este mês</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolvidos</p>
                  <p className="text-3xl font-bold text-gray-900">{metricas.resolvidos}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <p className="text-xs text-green-600">+12% vs mês anterior</p>
                  </div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                  <p className="text-3xl font-bold text-gray-900">{metricas.emAndamento}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                    <p className="text-xs text-gray-500">Tempo médio: {metricas.tempoMedioResolucao}</p>
                  </div>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-3xl font-bold text-gray-900">{metricas.pendentes}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(metricas.avaliacaoMedia)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">{metricas.avaliacaoMedia}</span>
                    </div>
                  </div>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico com botões */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">{getChartTitle()}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                    className="p-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={chartType === "pie" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("pie")}
                    className="p-2"
                  >
                    <PieChartIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={chartType === "area" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("area")}
                    className="p-2"
                  >
                    <TrendingUpIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>{renderChart()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
