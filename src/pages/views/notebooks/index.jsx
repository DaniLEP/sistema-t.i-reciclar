import React, { useEffect, useState, useMemo } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, ArrowLeft, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { app } from "../../../../firebase";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";


const STATUS_OPTIONS = [
  { value: "Disponível", label: "Disponível" },
  { value: "Emprestado", label: "Emprestado" },
  { value: "Quebrado", label: "Quebrado" },
  { value: "Manutencao", label: "Manutenção" },
  { value: "naoEncontrado", label: "Não Encontrado" },
  { value: "Controlador", label: "Controlador" },
  { value: "Colaborador", label: "Colaborador(a)" },
];

function formatDate(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("pt-BR");
}

export default function VisualizarNotebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos"); // Valor padrão "todos"
  const [modalAberto, setModalAberto] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [modalMotivo, setModalMotivo] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [statusNovo, setStatusNovo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase(app);
    const refNotebooks = ref(db, "notebooks");
    const unsubscribe = onValue(refNotebooks, (snap) => {
      const data = snap.val() || {};
      const arr = Object.entries(data).map(([id, v]) => ({
        id,
        ...v,
        status: v.status || "Disponível",
        motivo: v.motivo || "",
      }));
      setNotebooks(arr);
    });
    return () => unsubscribe();
  }, []);

  const abrirModal = (item) => {
    setSelecionado(item);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setSelecionado(null);
  };

  const fecharMotivo = () => {
    setModalMotivo(false);
    setMotivo("");
  };

  const atualizarFirebase = async (id, status, motivoTexto) => {
    try {
      const db = getDatabase(app);
      await update(ref(db, `notebooks/${id}`), {
        status,
        motivo: motivoTexto,
      });
    } catch (e) {
      console.error("Erro ao atualizar notebook:", e);
    }
  };

  const alterarStatus = (novo) => {
    if (!selecionado) return;
    if (["Emprestado", "Quebrado", "Manutencao", "Controlador"].includes(novo)) {
      setStatusNovo(novo);
      setModalMotivo(true);
    } else {
      const atualizado = { ...selecionado, status: novo, motivo: "" };
      setSelecionado(atualizado);
      atualizarFirebase(selecionado.id, novo, "");
      setNotebooks((old) => old.map((n) => (n.id === selecionado.id ? atualizado : n)));
    }
  };

  const salvarMotivo = () => {
    if (!selecionado || !motivo.trim()) return;
    const atualizado = {
      ...selecionado,
      status: statusNovo,
      motivo: motivo.trim(),
    };
    setSelecionado(atualizado);
    atualizarFirebase(selecionado.id, statusNovo, motivo.trim());
    setNotebooks((old) => old.map((n) => (n.id === selecionado.id ? atualizado : n)));
    setModalMotivo(false);
    setMotivo("");
  };

  const notebooksFiltrados = useMemo(() => {
    const lf = filtro.toLowerCase();
    return notebooks
      .filter(({ modelo, marca, patrimonio, status }) => {
        const textoOk =
          modelo?.toLowerCase()?.includes(lf) ||
          marca?.toLowerCase()?.includes(lf) ||
          patrimonio?.toLowerCase()?.includes(lf);
        const statusOk = filtroStatus === "todos" || status === filtroStatus;
        return textoOk && statusOk;
      })
      .sort((a, b) => (a.modelo || "").localeCompare(b.modelo || ""));
  }, [filtro, filtroStatus, notebooks]);

  const contagem = useMemo(() => {
    const cnt = {
      Disponível: 0,
      Emprestado: 0,
      Quebrado: 0,
      Manutencao: 0,
      naoEncontrado: 0,
      Controlador: 0,
      Colaborador: 0,
    };
    notebooks.forEach((n) => {
      if (cnt[n.status] >= 0) cnt[n.status]++;
    });
    return cnt;
  }, [notebooks]);

  const voltarPagina = () => navigate("/views");

  const getStatusColor = (status) => {
    switch (status) {
      case "Disponível":
        return "bg-green-100 text-green-800";
      case "Emprestado":
        return "bg-yellow-100 text-yellow-800";
      case "Quebrado":
        return "bg-red-100 text-red-800";
      case "Manutencao":
        return "bg-blue-100 text-blue-800";
      case "naoEncontrado":
        return "bg-orange-100 text-orange-800";
      case "Controlador":
        return "bg-purple-100 text-purple-800";
      case "Colaborador":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
const exportarParaExcel = () => {
  const dadosParaExportar = notebooksFiltrados.map((item) => ({
    Patrimônio: item.patrimonio || "-",
    Marca: item.marca || "-",
    Modelo: item.modelo || "-",
    Local: item.local || "-",
    Projeto: item.projeto || "-",
    Parceiro: item.parceiro || "-",
    "Nota Fiscal": item.notaFiscal || "-",
    NCM: item.NCM || "-",
    "VR-BEM": item.vrbem || "-",
    "Data de Cadastro": formatDate(item.dataCadastro),
    Ano: item.ano || "-",
    Observações: item.obs || "-",
    Status: item.status || "-",
    Motivo: item.motivo || "-",
  }));

  const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Notebooks");

  XLSX.writeFile(wb, "notebooks.xlsx");
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4 sm:p-6">
      <motion.div
        className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Voltar + Título */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Laptop className="w-7 h-7 text-gray-700" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Notebooks Cadastrados</h2>
          </div>
          <Button
            variant="ghost"
            onClick={voltarPagina}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" /> Voltar
          </Button>
          
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Input
            type="text"
            placeholder="Pesquisar por modelo, marca ou patrimônio..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full"
          />
            <Button
            onClick={exportarParaExcel}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Exportar para Excel
          </Button>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>

        {/* Contagem */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-8">
          {Object.entries(contagem).map(([key, value]) => (
            <Card key={key} className="p-3 text-center shadow-sm">
              <CardTitle className="text-lg font-semibold text-gray-700">
                {STATUS_OPTIONS.find((opt) => opt.value === key)?.label || key}
              </CardTitle>
              <CardContent className="p-0 mt-1 text-2xl font-bold text-gray-900">{value}</CardContent>
            </Card>
          ))}
        </div>

        {/* Tabela */}
        {notebooksFiltrados.length === 0 ? (
          <p className="text-center text-gray-600 py-8">Nenhum notebook encontrado com os filtros aplicados.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  {[
                    "Patrimônio",
                    "Notebook",
                    "Marca",
                    "Modelo",
                    "Local",
                    "Projeto",
                    "Observações",
                    "Status",
                    "Ações",
                  ].map((h) => (
                    <TableHead key={h} className="text-center font-semibold text-gray-700 whitespace-nowrap">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {notebooksFiltrados.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="text-center font-medium">{item.patrimonio || "-"}</TableCell>
                    <TableCell className="text-center font-medium">{item.notebook || "-"}</TableCell>
                    <TableCell className="text-center">{item.marca || "-"}</TableCell>
                    <TableCell className="text-center">{item.modelo || "-"}</TableCell>
                    <TableCell className="text-center">{item.local || "-"}</TableCell>
                    <TableCell className="text-center">{item.projeto || "-"}</TableCell>
                    <TableCell className="text-center max-w-[200px] truncate" title={item.obs || ""}>
                      {item.obs || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`text-xs font-semibold ${getStatusColor(item.status)}`}
                        title={item.motivo || ""}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" onClick={() => abrirModal(item)}>
                        Ver Mais
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* Modal de detalhes */}
      <AnimatePresence>
        {modalAberto && selecionado && (
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogContent
              className="max-w-4xl max-h-screen overflow-y-auto p-6 sm:p-8 rounded-xl shadow-2xl"
            >
              <DialogHeader>
                <DialogTitle className="text-center text-gray-800 text-2xl sm:text-3xl font-semibold mb-4">
                  Detalhes do Notebook
                </DialogTitle>
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                    aria-label="Fechar modal"
                  >
                  </Button>
                </DialogClose>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 text-sm">
                {[
                  ["Patrimônio", selecionado.patrimonio],
                  ["Notebook", selecionado.notebook],
                  ["Marca", selecionado.marca],
                  ["Modelo", selecionado.modelo],
                  ["Local", selecionado.local],
                  ["Projeto", selecionado.projeto],
                  ["Parceiro", selecionado.parceiro],
                  ["Nota Fiscal", selecionado.notaFiscal],
                  ["NCM", selecionado.NCM],
                  ["VR‑BEM", selecionado.vrbem],
                  ["Data de Cadastro", formatDate(selecionado.dataCadastro)],
                  ["Ano", selecionado.ano],
                ].map(([label, value]) => (
                  <div key={label}>
                    <Label className="font-semibold text-gray-600">{label}:</Label>
                    <p className="text-gray-800">{value || "-"}</p>
                  </div>
                ))}

                <div>
                  <Label className="font-semibold text-gray-600">Status:</Label>
                  <Badge
                    className={`ml-2 text-sm font-semibold ${getStatusColor(selecionado.status)}`}
                    title={selecionado.motivo}
                  >
                    {selecionado.status}
                  </Badge>
                </div>

                {selecionado.motivo && (
                  <div>
                    <Label className="font-semibold text-gray-600">Motivo:</Label>
                    <p className="text-gray-800">{selecionado.motivo}</p>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <Label className="font-semibold text-gray-600">Observações:</Label>
                  <p className="text-gray-800">{selecionado.obs || "-"}</p>
                </div>
              </div>

              <div className="mt-6">
                <Label htmlFor="status-select" className="block font-semibold text-gray-700 mb-2">
                  Alterar Status
                </Label>
                <Select value={selecionado.status} onValueChange={alterarStatus}>
                  <SelectTrigger id="status-select" className="w-full">
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
      {/* Modal do motivo */}
      <AnimatePresence>
        {modalMotivo && (
          <Dialog open={modalMotivo} onOpenChange={setModalMotivo}>
            <DialogContent className="max-w-md p-6 rounded-xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-red-700 mb-2">Informe o motivo da alteração</DialogTitle>
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                    aria-label="Fechar modal"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </DialogClose>
              </DialogHeader>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Digite o motivo..."
                className="min-h-[120px] resize-y"
              />
              <DialogFooter className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={fecharMotivo}>
                  Cancelar
                </Button>
                <Button onClick={salvarMotivo} className="bg-red-600 hover:bg-red-700">
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
