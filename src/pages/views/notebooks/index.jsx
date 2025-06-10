import { useEffect, useState, useMemo } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { app } from "../../../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [filtroStatus, setFiltroStatus] = useState("");
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

    if (
      ["Emprestado", "Quebrado", "Manutencao", "Controlador"].includes(novo)
    ) {
      setStatusNovo(novo);
      setModalMotivo(true);
    } else {
      const atualizado = { ...selecionado, status: novo, motivo: "" };
      setSelecionado(atualizado);
      atualizarFirebase(selecionado.id, novo, "");
      setNotebooks((old) =>
        old.map((n) => (n.id === selecionado.id ? atualizado : n))
      );
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
    setNotebooks((old) =>
      old.map((n) => (n.id === selecionado.id ? atualizado : n))
    );
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
        const statusOk = !filtroStatus || status === filtroStatus;
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
    };
    notebooks.forEach((n) => {
      if (cnt[n.status] >= 0) cnt[n.status]++;
    });
    return cnt;
  }, [notebooks]);

  const voltarPagina = () => navigate("/views");

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6">
      <motion.div
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 overflow-x-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Voltar + Título */}
        <div className="flex justify-end mb-8">
          <button
            onClick={voltarPagina}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-400 font-semibold"
          >
            <ArrowLeft /> Voltar
          </button>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <Laptop />
          <h2 className="text-3xl font-bold">Notebooks Cadastrados</h2>
        </div>

        {/* Filtros */}
        <input
          type="text"
          placeholder="Pesquisar por modelo, marca ou patrimônio..."
          className="w-full mb-4 p-3 rounded border focus:ring-2 focus:ring-indigo-600"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <select
          className="mb-4 p-2 border rounded focus:ring-2 focus:ring-indigo-600"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os Status</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Contagem */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {Object.entries(contagem).map(([key, value]) => (
            <div
              key={key}
              className={`p-2 flex-1 text-center rounded ${
                {
                  Disponível: "bg-green-100",
                  Emprestado: "bg-yellow-100",
                  Quebrado: "bg-red-100",
                  Manutencao: "bg-blue-200",
                  naoEncontrado: "bg-orange-900 text-white",
                  Controlador: "bg-pink-900 text-white",
                }[key] || "bg-gray-200"
              }`}
            >
              {key}: {value}
            </div>
          ))}
        </div>

        {/* Tabela */}
        {notebooksFiltrados.length === 0 ? (
          <p className="text-center text-gray-600">Nenhum notebook encontrado.</p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Foto",
                  "Patrimônio",
                  "Marca",
                  "Modelo",
                  "Local",
                  "Projeto",
                  "Nota Fiscal",
                  "Observações",
                  "Status",
                  "Ações",
                ].map((h) => (
                  <th key={h} className="p-2 border text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notebooksFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-2 border text-center">
                    <span className="italic text-gray-400">Sem foto</span>
                  </td>
                  <td className="p-2 border text-center">
                    {item.patrimonio || "-"}
                  </td>
                  <td className="p-2 border text-center">{item.marca || "-"}</td>
                  <td className="p-2 border text-center">{item.modelo || "-"}</td>
                  <td className="p-2 border text-center">{item.local || "-"}</td>
                  <td className="p-2 border text-center">{item.projeto || "-"}</td>
                  <td className="p-2 border text-center">
                    {item.notaFiscal || "-"}
                  </td>
                  <td
                    className="p-2 border text-center max-w-[250px] truncate"
                    title={item.obs || ""}
                  >
                    {item.obs || "-"}
                  </td>
                  <td className="p-2 border text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        item.status === "Disponível"
                          ? "bg-green-200 text-green-800"
                          : item.status === "Emprestado"
                          ? "bg-yellow-200 text-yellow-800"
                          : item.status === "Quebrado"
                          ? "bg-red-200 text-red-800"
                          : item.status === "Manutencao"
                          ? "bg-blue-200 text-blue-800"
                          : item.status === "naoEncontrado"
                          ? "bg-orange-900 text-white"
                          : item.status === "Controlador"
                          ? "bg-pink-200 text-pink-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                      title={item.motivo || ""}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => abrirModal(item)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Ver Mais
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Modal de detalhes */}
      <AnimatePresence>
        {modalAberto && selecionado && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative p-6"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button
                onClick={fecharModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                aria-label="Fechar modal"
              >
                <X />
              </button>
              <h3 className="text-center text-indigo-700 text-3xl font-semibold mb-6">
                Detalhes do Notebook
              </h3>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 w-full md:w-56 h-56 rounded-lg border shadow-sm overflow-hidden mx-auto md:mx-0 bg-gray-100 text-gray-400 flex items-center justify-center italic">
                  Sem foto
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 text-sm">
                  {[
                    ["Patrimônio", selecionado.patrimonio],
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
                    <p key={label}>
                      <strong>{label}:</strong> {value || "-"}
                    </p>
                  ))}

                  <p className="sm:col-span-2">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`ml-2 inline-block px-2 py-1 rounded text-xs font-semibold ${
                        selecionado.status === "Disponível"
                          ? "bg-green-200 text-green-800"
                          : selecionado.status === "Emprestado"
                          ? "bg-yellow-200 text-yellow-800"
                          : selecionado.status === "Quebrado"
                          ? "bg-red-200 text-red-800"
                          : selecionado.status === "Manutencao"
                          ? "bg-blue-200 text-blue-800"
                          : selecionado.status === "naoEncontrado"
                          ? "bg-orange-900 text-white"
                          : "bg-pink-200 text-pink-800"
                      }`}
                      title={selecionado.motivo}
                    >
                      {selecionado.status}
                    </span>
                  </p>

                  {selecionado.motivo && (
                    <p className="sm:col-span-2">
                      <strong>Motivo:</strong> {selecionado.motivo}
                    </p>
                  )}
                  <p className="sm:col-span-2">
                    <strong>Observações:</strong> {selecionado.obs || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <label className="block font-medium mb-2">
                  Alterar Status
                </label>
                <select
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-600"
                  value={selecionado.status}
                  onChange={(e) => alterarStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal do motivo */}
      <AnimatePresence>
        {modalMotivo && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
            >
              <button
                onClick={fecharMotivo}
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
              >
                <X />
              </button>
              <h3 className="text-xl text-red-700 font-bold mb-4">
                Informe o motivo da alteração
              </h3>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Digite o motivo..."
                className="w-full h-28 p-2 border rounded focus:ring-2 focus:ring-red-500 resize-none"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={fecharMotivo}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarMotivo}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
