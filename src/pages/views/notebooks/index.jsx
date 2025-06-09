import { useEffect, useState, useMemo } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { app } from "../../../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = [
  {value: "Disponível", label: "Disponível", color: "bg-green-200 text-green-800",},
  {value: "Emprestado", label: "Emprestado", color: "bg-yellow-200 text-yellow-800",},
  {value: "Quebrado", label: "Quebrado", color: "bg-red-200 text-red-800" },
];

export default function VisualizarNotebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [notebookSelecionado, setNotebookSelecionado] = useState(null);
  const [modalMotivoAberto, setModalMotivoAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [statusParaAtualizar, setStatusParaAtualizar] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase(app);
    const notebookRef = ref(db, "notebooks");
    const unsubscribe = onValue(notebookRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data).map(([id, value]) => ({id, ...value, status: value.status || "Disponível", motivo: value.motivo || ""})); 
        setNotebooks(lista);} 
      else {setNotebooks([]);}
    });
    return () => unsubscribe();
  }, []);

  function abrirModal(notebook) {setNotebookSelecionado(notebook); setModalAberto(true);}
  function fecharModal() {setModalAberto(false); setNotebookSelecionado(null);}
  function fecharModalMotivo() {setModalMotivoAberto(false); setMotivo(""); setStatusParaAtualizar(null);}

  async function atualizarStatusFirebase(id, statusAtualizado, motivoAtualizado) {
    try {
      const db = getDatabase(app);
      const notebookRef = ref(db, `notebooks/${id}`);
      await update(notebookRef, {status: statusAtualizado, motivo: motivoAtualizado});
    } catch (error) {console.error("Erro ao atualizar status no Firebase:", error);}
  }

  function alterarStatus(novoStatus) {
    if (!notebookSelecionado) return;
    if (novoStatus === "Quebrado" || novoStatus === "Emprestado") {
      setStatusParaAtualizar(novoStatus); setModalMotivoAberto(true);return;}
      const atualizado = {...notebookSelecionado, status: novoStatus, motivo: ""};
    setNotebookSelecionado(atualizado);
    atualizarStatusFirebase(notebookSelecionado.id, novoStatus, "");
    setNotebooks((old) => old.map((n) => (n.id === notebookSelecionado.id ? atualizado : n)));
  }

  function salvarMotivo() {
    if (!notebookSelecionado || motivo.trim() === "") return;
    const atualizado = {...notebookSelecionado, status: statusParaAtualizar, motivo: motivo.trim()};
    setNotebookSelecionado(atualizado);
    atualizarStatusFirebase(notebookSelecionado.id, statusParaAtualizar, motivo.trim());
    setNotebooks((old) => old.map((n) => (n.id === notebookSelecionado.id ? atualizado : n)));
    fecharModalMotivo();
  }

  const notebooksFiltrados = useMemo(() => {
    const lowerFiltro = filtro.toLowerCase();
    return notebooks
      .filter(({ modelo, marca, patrimonio, status }) => {
        const combinaFiltroTexto = modelo?.toLowerCase().includes(lowerFiltro) || marca?.toLowerCase().includes(lowerFiltro) || patrimonio?.toLowerCase().includes(lowerFiltro);
        const combinaStatus = filtroStatus === "" || status === filtroStatus;
        return combinaFiltroTexto && combinaStatus; })
      .sort((a, b) => a.modelo.localeCompare(b.modelo));
  }, [filtro, filtroStatus, notebooks]);

  const contagemStatus = useMemo(() => {
    const contagem = {Disponível: 0, Emprestado: 0, Quebrado: 0};
    notebooks.forEach(({ status }) => {
      if (status === "Disponível") contagem["Disponível"] += 1;
      else if (status === "Emprestado") contagem["Emprestado"] += 1;
      else if (status === "Quebrado") contagem["Quebrado"] += 1;
    }); return contagem;
  }, [notebooks]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6">
      <motion.div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 overflow-x-auto"
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-6">
          <Laptop className="w-7 h-7 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-800">Notebooks Cadastrados</h2>
        </div>

        <input  type="text" placeholder="Pesquisar por modelo, marca ou patrimônio..."
          className="w-full mb-4 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Pesquisar notebooks" autoFocus/>

        <select className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600"
          value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} aria-label="Filtrar por status" >
          <option value="">Todos os Status</option>
          {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
        <div className="flex gap-2 mb-4">
          <div className="text-sm text-gray-700 bg-green-100 p-2 rounded flex-1 text-center">
            <strong>Disponíveis:</strong> {contagemStatus["Disponível"]}
          </div>
          <div className="text-sm text-gray-700 bg-yellow-100 p-2 rounded flex-1 text-center">
            <strong>Emprestados:</strong> {contagemStatus["Emprestado"]}
          </div>
          <div className="text-sm text-gray-700 bg-red-100 p-2 rounded flex-1 text-center">
            <strong>Quebrados:</strong> {contagemStatus["Quebrado"]}
          </div>
        </div>
        {notebooksFiltrados.length === 0 ? (<p className="text-gray-600 text-center">Nenhum notebook encontrado.</p> ) : (
          <>
            <Table className="w-full text-sm border border-gray-200">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="p-2 border text-center">Foto</th>
                  <th className="p-2 border text-center">Patrimônio</th>
                  <th className="p-2 border text-center">Marca</th>
                  <th className="p-2 border text-center">Modelo</th>
                  <th className="p-2 border text-center">Local</th>
                  <th className="p-2 border text-center">Projeto</th>
                  <th className="p-2 border text-center">Nº Série</th>
                  <th className="p-2 border text-center">Nota Fiscal</th>
                  <th className="p-2 border text-center">Observações</th>
                  <th className="p-2 border text-center">Status</th>
                  <th className="p-2 border text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {notebooksFiltrados.slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2 border text-center"> {item.fotoBase64 ? (
                        <img src={item.fotoBase64} alt={`Foto do notebook ${item.modelo}`} className="max-w-[100px] max-h-[80px] object-contain mx-auto"
                          loading="lazy"/>) : (<span className="text-gray-400 italic">Sem foto</span>)}</td>
                    <td className="p-2 border text-center">{item.patrimonio || "-"}</td>
                    <td className="p-2 border text-center">{item.marca || "-"}</td>
                    <td className="p-2 border text-center">{item.modelo || "-"}</td>
                    <td className="p-2 border text-center">{item.local || "-"}</td>
                    <td className="p-2 border text-center">{item.projeto || "-"}</td>
                    <td className="p-2 border text-center">{item.numeroSerie || "-"}</td>
                    <td className="p-2 border text-center">{item.notaFiscal || "-"}</td>
                    <td className="p-2 border text-center max-w-[250px] truncate" title={item.observacoes || ""}>{item.observacoes || "-"}</td>
                    <td className="p-2 border text-center">
                      <span className={`inline-block rounded px-2 py-1 font-semibold text-xs ${item.status === "Disponível" ? "bg-green-200 text-green-800" : item.status === "Emprestado" ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"}`}
                        title={item.motivo || ""}>{item.status}</span>
                    </td>
                    <td className="p-2 border text-center">
                      <button onClick={() => abrirModal(item)} aria-label={`Editar status do notebook ${item.modelo}`}
                        className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition">Ver Mais</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {notebooksFiltrados.length > 10 && (<p className="text-gray-500 text-sm mt-2">Exibindo os 10 primeiros notebooks. Refine a busca para ver mais...</p>)}
          </>
        )}

        {/* Modal principal de edição do notebook */}
        <AnimatePresence>
          {modalAberto && notebookSelecionado && (
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}onClick={fecharModal} aria-modal="true" role="dialog" aria-labelledby="modal-title">
              <motion.div className="bg-white rounded-xl max-w-5xl w-full max-h-[85vh] overflow-y-auto p-8 relative shadow-xl"
                initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(e) => e.stopPropagation()} tabIndex={-1}>
                {/* Botão fechar */}
                <button onClick={fecharModal} aria-label="Fechar modal"
                  className="absolute top-5 right-5 text-gray-600 hover:text-gray-900 transition"><X size={28} /></button>

                {/* Título */}
                <h3 id="modal-title" className="text-3xl font-bold mb-6 text-indigo-700 text-center">Detalhes do Notebook</h3>

                {/* Conteúdo em grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Foto */}
                  <div className="flex justify-center items-center"> {notebookSelecionado.fotoBase64 ? (
                    <img src={notebookSelecionado.fotoBase64} alt={`Foto do notebook ${notebookSelecionado.modelo}`}
                      className="rounded-xl shadow-lg max-h-[320px] object-contain border border-gray-300"/>) : (
                        <div className="flex justify-center items-center w-full h-64 bg-gray-100 rounded-xl border border-gray-300 text-gray-400 text-lg italic font-light">Sem Foto</div>
                      )}
                  </div>

                  {/* Informações básicas */}
                  <div className="md:col-span-2 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-gray-800 text-lg">
                      <div>
                        <span className="font-semibold text-indigo-600">Patrimônio:</span>{" "}
                        <span>{notebookSelecionado.patrimonio || "-"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-indigo-600">Marca:</span>{" "}
                        <span>{notebookSelecionado.marca || "-"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-indigo-600">Modelo:</span>{" "}
                        <span>{notebookSelecionado.modelo || "-"}</span>
                      </div>
                                            <div>
                        <span className="font-semibold text-indigo-600">Local:</span>{" "}
                        <span>{notebookSelecionado.local || "-"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-indigo-600">Projeto:</span>{" "}
                        <span>{notebookSelecionado.projeto || "-"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-indigo-600">Nº Série:</span>{" "}
                        <span>{notebookSelecionado.numeroSerie || "-"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-indigo-600">Nota Fiscal:</span>{" "}
                        <span>{notebookSelecionado.notaFiscal || "-"}</span>
                      </div>
                    </div>

                    {/* Observações */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-40 overflow-y-auto text-gray-700 whitespace-pre-wrap">
                      <h4 className="font-semibold text-indigo-600 mb-2">Observações</h4>
                      <p>{notebookSelecionado.observacoes || "Nenhuma observação registrada."}</p>
                    </div>

                    {/* Status */}
                    <div className="mt-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                      <label htmlFor="status-select" className="block font-semibold text-indigo-700 text-lg min-w-[90px]"> Status:</label>
                      <select  className="border border-indigo-400 rounded-lg px-4 py-2 text-lg font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition w-full max-w-xs"
                        id="status-select" value={notebookSelecionado.status} onChange={(e) => alterarStatus(e.target.value)} aria-describedby="status-help" >
                          {STATUS_OPTIONS.map(({ value, label }) => (<option key={value} value={value}>{label}</option>))}</select>
                    </div>

                    {/* Motivo (se aplicável) */}
                    {(notebookSelecionado.status === "Emprestado" || notebookSelecionado.status === "Quebrado") && (
                      <div className="mt-6">
                        <label className="block font-semibold text-indigo-700 mb-2">Motivo:</label>
                        <textarea className="w-full max-w-xl border border-indigo-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-4 focus:ring-indigo-300 text-gray-800"
                          readOnly value={notebookSelecionado.motivo || ""} rows={4} aria-label="Motivo do status"/>
                      </div> )}
                  </div>
                </div>
                <div className="mt-8 flex justify-center"> {/* Botão fechar */}
                  <button onClick={fecharModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition focus:outline-none focus:ring-4 focus:ring-indigo-300">Fechar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal para inserir motivo */}
        <AnimatePresence>
          {modalMotivoAberto && (
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={fecharModalMotivo} aria-modal="true" role="dialog"
              aria-labelledby="modal-motivo-title">
              <motion.div className="bg-white rounded-xl w-full max-w-md p-6 relative" initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                <button onClick={fecharModalMotivo} aria-label="Fechar modal motivo"
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X size={24} /></button>
                <h3 id="modal-motivo-title" className="text-xl font-semibold mb-4 text-indigo-700">Informe o motivo para o status "{statusParaAtualizar}"</h3>
                <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Digite o motivo aqui..." rows={5} autoFocus
                  className="w-full border border-gray-300 rounded p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-600"/>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={fecharModalMotivo} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition">Cancelar</button>
                  <button onClick={salvarMotivo} disabled={motivo.trim().length === 0}
                    className={`px-4 py-2 rounded text-white ${motivo.trim().length === 0 ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700" } transition`}>Salvar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
          <motion.button onClick={() => navigate("/views")} whileHover={{scale: 1.1, backgroundColor: "#4f46e5", color: "white"}} whileTap={{ scale: 0.95 }}   aria-label="Voltar"title="Voltar"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 font-semibold shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 bg-white hover:bg-indigo-600 hover:text-white select-none mt-10">
            <ArrowLeft size={20} />Voltar</motion.button>{" "}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
