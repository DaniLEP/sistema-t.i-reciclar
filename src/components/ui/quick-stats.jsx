"use client"

import { useEffect, useState } from "react"
import { ref, get } from "firebase/database"
import { db } from "../../../firebase"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, Clock, CheckCircle, Wrench } from "lucide-react"

export function QuickStats() {
  const [stats, setStats] = useState({
    total: 0,
    disponivel: 0,
    emprestado: 0,
    manutencao: 0,
    colaborador: 0,
  })

  const paths = [
    "notebooks",
    "tablets",
    "cameras",
    "impressoras",
    "toners",
  ]

  useEffect(() => {
    const fetchData = async () => {
      let total = 0
      let disponivel = 0
      let emprestado = 0
      let manutencao = 0
     let colaborador = 0

      for (const path of paths) {
        const snapshot = await get(ref(db, path))
        const data = snapshot.val()

        if (data) {
          Object.values(data).forEach((item) => {
            total++
            const status = item.status?.toLowerCase() || "disponivel"

            if (status === "emprestado") emprestado++
            else if (status === "manutencao") manutencao++
            else if (status === "colaborador") colaborador++
            else disponivel++
          })
        }
      }

      setStats({
        total,
        disponivel,
        emprestado  ,
        manutencao,
      colaborador,
      })
    }

    fetchData()
  }, [])

  const displayStats = [
    {
      title: "Cadastrados",
      value: stats.total,
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      color: "text-green-600",
    },
    {
      title: "Disponíveis",
      value: stats.disponivel,
      icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
      color: "text-blue-600",
    },
    {
      title: "Emprestados",
      value: stats.emprestado,
      icon: <Clock className="w-5 h-5 text-orange-600" />,
      color: "text-orange-600",
    },
    {
      title: "Manutenção",
      value: stats.manutencao,
      icon: <Wrench className="w-5 h-5 text-yellow-600" />,
      color: "text-yellow-600",
    },
    {
      title: "Colaboradores",
      value: stats.colaborador,
      icon: <Users className="w-5 h-5 text-purple-600" />,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {displayStats.map((stat, index) => (
        <Card key={index} className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              {stat.icon}
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.title}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
