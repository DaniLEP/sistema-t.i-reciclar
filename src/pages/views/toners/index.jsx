import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ref, onValue, update } from "firebase/database"
import { motion } from "framer-motion"
import { Palette, Printer, ArrowLeft, AlertTriangle } from "lucide-react"
import { db } from "../../../../firebase"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card,CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

export default function ConsultaToners() {
  const [toners, setToners] = useState([]) 
  const [resumo, setResumo] = useState({})
  const [filtroImpressora, setFiltroImpressora] = useState("TODAS")
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onValue(ref(db, "toners"), (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const lista = Object.entries(data).map(([id, toner]) => ({ id, ...toner })); setToners(lista)
        const agrupado = lista.reduce((acc, item) => {
        const key = item.impressora; acc[key] = (acc[key] || 0) + (item.quantidade || 0); return acc}, {}); setResumo(agrupado)} 
      else {setToners([]); setResumo({})}
    })
    return () => unsub()
  }, [])

  const impressorasUnicas = [...new Set(toners.map((t) => t.impressora))]
  const tonersFiltrados = filtroImpressora === "TODAS" ? toners : toners.filter((t) => t.impressora === filtroImpressora)
  const handleRetiradaToner = async (id, quantidadeAtual) => {
    if (quantidadeAtual <= 0) return
    const novaQuantidade = quantidadeAtual - 1
    try {await update(ref(db, `toners/${id}`), { quantidade: novaQuantidade })} 
    catch (error) {console.error("Erro ao atualizar quantidade:", error)}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4 sm:p-6">
      <motion.div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-8 overflow-hidden" initial={{ opacity: 0, y: 30 }}animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Palette className="w-7 h-7 text-gray-700" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800"> Consulta de Toners</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate("/views")} className="flex items-center gap-2 text-gray-600 hover:text-gray-800"><ArrowLeft className="w-5 h-5" />Voltar</Button>
        </div>

        {/* Filtro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-gray-600" />
            <Label htmlFor="filtro-impressora" className="text-sm font-medium text-gray-700">Filtrar por Impressora:</Label>
            <Select value={filtroImpressora} onValueChange={setFiltroImpressora}>
              <SelectTrigger id="filtro-impressora" className="w-[180px]">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas</SelectItem>{impressorasUnicas.map((imp) => (<SelectItem key={imp} value={imp}>{imp}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(resumo).map(([impressora, total]) => (
            <Card key={impressora} className="bg-gray-50 text-gray-900 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="p-0 pb-2"><CardTitle className="text-lg font-semibold text-gray-700">Impressora {impressora} </CardTitle></CardHeader>
              <CardContent className="p-0"><p className="text-sm text-gray-600">{total} toner(s) no total</p></CardContent>
            </Card>
          ))}
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="py-3 px-4">Cor</TableHead>
                <TableHead className="py-3 px-4">SKU</TableHead>
                <TableHead className="py-3 px-4">Impressora</TableHead>
                <TableHead className="py-3 px-4 text-center">Quantidade</TableHead>
                <TableHead className="py-3 px-4 text-center">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tonersFiltrados.length > 0 ? (
                tonersFiltrados.map((toner) => (
                  <React.Fragment key={toner.id}>
                    <TableRow className="border-b hover:bg-gray-50 transition-colors">
                      <TableCell className="py-2 px-4 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-gray-300"style={{backgroundColor:
                          { preto: "#000000", magenta: "#FF00FF", ciano: "#00FFFF", amarelo: "#FFFF00",}[toner.cor?.toLowerCase()] || "transparent"}}/>{toner.cor}</TableCell>
                      <TableCell className="py-2 px-4">{toner.sku}</TableCell>
                      <TableCell className="py-2 px-4">{toner.impressora}</TableCell>
                      <TableCell className="py-2 px-4 text-center"><Badge variant="outline" className="text-base">{toner.quantidade}</Badge></TableCell>
                      <TableCell className="py-2 px-4 text-center">
                        <Button variant="destructive" size="sm" onClick={() => handleRetiradaToner(toner.id, toner.quantidade)}disabled={toner.quantidade === 0}>Retirar</Button>
                      </TableCell>
                    </TableRow>
                    {toner.quantidade <= 1 && (
                      <TableRow className="bg-yellow-50 border-b">
                        <TableCell colSpan={5} className="py-2 px-4 text-sm text-yellow-800 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />Estoque mínimo para o toner{" "}
                          <span className="font-semibold">{toner.cor?.toUpperCase()}</span> ({toner.sku}) da impressora{" "}
                          <span className="font-semibold">{toner.impressora}</span>.
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (<TableRow><TableCell colSpan={5} className="text-center py-6 text-gray-500"> Nenhum toner encontrado.</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  )
}
