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
];

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
      await update(ref(db, `notebooks/${id}`), { status, motivo: motivoTexto });
    } catch (e) {
      console.error("Erro ao atualizar notebook:", e);
    }
  };

  const alterarStatus = (novo) => {
    if (!selecionado) return;
    if (["Emprestado", "Quebrado", "Manutencao"].includes(novo)) {
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
    const atualizado = { ...selecionado, status: statusNovo, motivo: motivo.trim() };
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
    };
    notebooks.forEach((n) => {
      if (cnt[n.status] >= 0) cnt[n.status]++;
    });
    return cnt;
  }, [notebooks]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6">
      <motion.div
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 overflow-x-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Laptop className="w-7 h-7 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-800">Notebooks Cadastrados</h2>
          <button
            onClick={() => navigate("/views")}
            className="ml-auto text-sm font-semibold text-indigo-600 hover:underline"
          >
            <ArrowLeft className="inline w-5 h-5 mr-1" />
            Voltar
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Pesquisar..."
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-600 flex-1"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">Todos os Status</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="bg-green-100 p-2 rounded flex-1 text-center">Disponível: {contagem.Disponível}</div>
          <div className="bg-yellow-100 p-2 rounded flex-1 text-center">Emprestado: {contagem.Emprestado}</div>
          <div className="bg-red-100 p-2 rounded flex-1 text-center">Quebrado: {contagem.Quebrado}</div>
          <div className="bg-blue-200 p-2 rounded flex-1 text-center">Em Manutenção: {contagem.Manutencao}</div>
          <div className="bg-orange-900 p-2 rounded flex-1 text-center text-white">Não Encontrado: {contagem.naoEncontrado}</div>
        </div>

        {notebooksFiltrados.length === 0 ? (
          <p className="text-center text-gray-600">Nenhum notebook encontrado.</p>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Foto</th>
                <th className="p-2">Patrimônio</th>
                <th className="p-2">Marca</th>
                <th className="p-2">Modelo</th>
                <th className="p-2">Status</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {notebooksFiltrados.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50 border-b">
                  <td className="p-2 text-center">
                    {n.fotoBase64 ? (
                      <img src={n.fotoBase64} className="h-16 mx-auto object-contain" alt={n.modelo} />
                    ) : (
                      "–"
                    )}
                  </td>
                  <td className="p-2 text-center">{n.patrimonio || "–"}</td>
                  <td className="p-2 text-center">{n.marca || "–"}</td>
                  <td className="p-2 text-center">{n.modelo || "–"}</td>
                  <td className="p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        n.status === "Disponível"
                          ? "bg-green-200 text-green-800"
                          : n.status === "Emprestado"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-red-200 text-red-800"
                      }`}
                      title={n.motivo}
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => abrirModal(n)}
                      className="bg-indigo-600 px-3 py-1 text-white rounded hover:bg-indigo-700"
                    >
                      Ver Mais
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <AnimatePresence>
          {modalAberto && selecionado && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={fecharModal}
            >
              <motion.div
                className="bg-white p-6 max-w-lg w-full rounded-xl shadow-lg relative"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={fecharModal} className="absolute top-4 right-4 text-gray-600 hover:text-red-600">
                  <X size={24} />
                </button>
                <h3 className="text-xl font-semibold mb-4">Detalhes do Notebook</h3>
                <p><strong>Patrimônio:</strong> {selecionado.patrimonio}</p>
                <p><strong>Marca:</strong> {selecionado.marca}</p>
                <p><strong>Modelo:</strong> {selecionado.modelo}</p>
                <p><strong>Status Atual:</strong> {selecionado.status}</p>
                {selecionado.motivo && <p><strong>Motivo:</strong> {selecionado.motivo}</p>}
                <div className="mt-4 space-x-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => alterarStatus(opt.value)}
                      className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalMotivo && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={fecharMotivo}
            >
              <motion.div
                className="bg-white p-6 max-w-md w-full rounded-xl shadow-lg"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold mb-2">Motivo da alteração</h3>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full border rounded p-2 mb-4"
                  rows={4}
                  placeholder="Descreva o motivo..."
                />
                <div className="flex justify-end gap-2">
                  <button onClick={fecharMotivo} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
                  <button onClick={salvarMotivo} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Salvar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}