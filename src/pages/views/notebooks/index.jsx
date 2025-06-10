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
      const arr = Object.entries(data).map(([id, v]) => ({ id, ...v, status: v.status || "Disponível", motivo: v.motivo || "", }));
      setNotebooks(arr); });
    return () => unsubscribe();
  }, []);

  const abrirModal = (item) => { setSelecionado(item); setModalAberto(true); };
  const fecharModal = () => { setModalAberto(false); setSelecionado(null);};
  const fecharMotivo = () => {setModalMotivo(false); setMotivo(""); };

  const atualizarFirebase = async (id, status, motivoTexto) => {
    try {const db = getDatabase(app);
    await update(ref(db, `notebooks/${id}`), { status, motivo: motivoTexto });} 
    catch (e) { console.error("Erro ao atualizar notebook:", e); }
  };

  const alterarStatus = (novo) => {
    if (!selecionado) return;
    if (["Emprestado", "Quebrado", "Manutencao"].includes(novo)) 
      {setStatusNovo(novo);  setModalMotivo(true);} 
    else {const atualizado = { ...selecionado, status: novo, motivo: "" };
      setSelecionado(atualizado); atualizarFirebase(selecionado.id, novo, "");
       setNotebooks((old) => old.map((n) => (n.id === selecionado.id ? atualizado : n)));
    }
  };

  const salvarMotivo = () => {
    if (!selecionado || !motivo.trim()) return;
    const atualizado = { ...selecionado, status: statusNovo, motivo: motivo.trim() };
    setSelecionado(atualizado); atualizarFirebase(selecionado.id, statusNovo, motivo.trim());
    setNotebooks((old) => old.map((n) => (n.id === selecionado.id ? atualizado : n)));
    setModalMotivo(false); setMotivo("");
  };

  const notebooksFiltrados = useMemo(() => {
    const lf = filtro.toLowerCase();
    return notebooks
      .filter(({ modelo, marca, patrimonio, status }) => {
        const textoOk =
          modelo?.toLowerCase()?.includes(lf) || marca?.toLowerCase()?.includes(lf) || patrimonio?.toLowerCase()?.includes(lf);
          const statusOk = !filtroStatus || status === filtroStatus;
        return textoOk && statusOk;
      })
      .sort((a, b) => (a.modelo || "").localeCompare(b.modelo || ""));
  }, [filtro, filtroStatus, notebooks]);

  const contagem = useMemo(() => {
    const cnt = { Disponível: 0, Emprestado: 0, Quebrado: 0, Manutencao: 0, naoEncontrado: 0,};
    notebooks.forEach((n) => {if (cnt[n.status] >= 0) cnt[n.status]++; });
    return cnt; }, [notebooks]);
    
  const voltarPagina = () => navigate("/views");

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6">
      <motion.div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 overflow-x-auto"
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>     
        <div className="flex justify-end mb-8">
          <button onClick={voltarPagina}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-400 transition-colors font-semibold"><ArrowLeft className="w-5 h-5" />Voltar</button>
        </div>
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-6">
          <Laptop className="w-7 h-7 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-800">Notebooks Cadastrados</h2>
        </div> 
    
        {/* Filtros */}
        <input type="text" placeholder="Pesquisar por modelo, marca ou patrimônio..."
          className="w-full mb-4 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          value={filtro} onChange={(e) => setFiltro(e.target.value)} />
        <select className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600"
          value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="">Todos os Status</option> {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option> ))}
        </select>
        {/* Contagem */}
        <div className="flex gap-2 mb-4">
          <div className="bg-green-100 p-2 rounded flex-1 text-center">Disponível: {contagem.Disponível}</div>
          <div className="bg-yellow-100 p-2 rounded flex-1 text-center">Emprestado: {contagem.Emprestado}</div>
          <div className="bg-red-100 p-2 rounded flex-1 text-center">Quebrado: {contagem.Quebrado}</div>
          <div className="bg-blue-200 p-2 rounded flex-1 text-center">Em Manutenção: {contagem.Manutencao}</div>
          <div className="bg-orange-900 p-2 rounded flex-1 text-center text-white">Não Encontrado: {contagem.naoEncontrado}</div>
        </div>
        {/* Tabela */}
        {notebooksFiltrados.length === 0 ? (
          <p className="text-gray-600 text-center">Nenhum notebook encontrado.</p>
        ) : (
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-2 border text-center">Foto</th>
                <th className="p-2 border text-center">Patrimônio</th>
                <th className="p-2 border text-center">Marca</th>
                <th className="p-2 border text-center">Modelo</th>
                <th className="p-2 border text-center">Local</th>
                <th className="p-2 border text-center">Projeto</th>
                <th className="p-2 border text-center">Nota Fiscal</th>
                <th className="p-2 border text-center">Observações</th>
                <th className="p-2 border text-center">Status</th>
                <th className="p-2 border text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {notebooksFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-2 border text-center">
                    {item.fotoBase64 ? (
                      <img src={item.fotoBase64} className="max-w-[100px] max-h-[80px] object-contain mx-auto" />
                    ) : <span className="text-gray-400 italic">Sem foto</span>}
                  </td>
                  <td className="p-2 border text-center">{item.patrimonio || "-"}</td>
                  <td className="p-2 border text-center">{item.marca || "-"}</td>
                  <td className="p-2 border text-center">{item.modelo || "-"}</td>
                  <td className="p-2 border text-center">{item.local || "-"}</td>
                  <td className="p-2 border text-center">{item.projeto || "-"}</td>
                  <td className="p-2 border text-center">{item.notaFiscal || "-"}</td>
                  <td className="p-2 border text-center max-w-[250px] truncate" title={item.obs || ""}>{item.obs || "-"} </td>
                  <td className="p-2 border text-center">
                    <span className={`inline-block rounded px-2 py-1 font-semibold text-xs ${item.status === "Disponível" ? "bg-green-200 text-green-800" : item.status === "Emprestado" ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"}`}
                      title={item.motivo || ""}>{item.status}</span></td>
                  <td className="p-2 border text-center">
                    <button onClick={() => abrirModal(item)} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition">Ver Mais</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
        {/* MODAL DE DETALHES */}
        <AnimatePresence>
          {modalAberto && selecionado && (
            <motion.div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative p-6"
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                {/* Botão fechar */}
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition" onClick={fecharModal} aria-label="Fechar modal"><X className="w-6 h-6" /></button>
                {/* Título */}
                <h3 className="text-3xl font-semibold text-indigo-700 mb-6 text-center"> Detalhes do Notebook</h3>
                {/* Conteúdo principal */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Foto */}
                  <div className="flex-shrink-0 w-full md:w-56 h-40 md:h-56 rounded-lg overflow-hidden border border-gray-300 shadow-sm mx-auto md:mx-0">
                    {selecionado.fotoBase64 ? (
                      <img src={selecionado.fotoBase64} alt={`Foto do notebook ${selecionado.modelo || selecionado.patrimonio}`} className="w-full h-full object-contain bg-gray-50"/>
                    ) : (<div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 italic">Sem foto</div>)}
                  </div>
                  {/* Informações */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-gray-700 text-sm">
                    <p><strong>Patrimônio:</strong> {selecionado.patrimonio || "-"}</p>
                    <p><strong>Marca:</strong> {selecionado.marca || "-"}</p>
                    <p><strong>Modelo:</strong> {selecionado.modelo || "-"}</p>
                    <p><strong>Local:</strong> {selecionado.local || "-"}</p>
                    <p><strong>Projeto:</strong> {selecionado.projeto || "-"}</p>
                    <p><strong>Parceiro:</strong> {selecionado.parceiro || "-"}</p>
                    <p><strong>Nº Série:</strong> {selecionado.quantidade || "-"}</p>
                    <p><strong>Nota Fiscal:</strong> {selecionado.notaFiscal || "-"}</p>
                    <p><strong>NCM:</strong> {selecionado.NCM || "-"}</p>
                    <p><strong>VR-BEM:</strong> {selecionado.vrbem || "-"}</p>
                    <p><strong>Data de Cadastro:</strong> {formatDate(selecionado.dataCadastro || "-")}</p>
                    <p><strong>Ano:</strong> {selecionado.ano || "-"}</p>
                    <p><strong>Status:</strong><span  className={`ml-2 inline-block px-2 py-1 rounded text-xs font-semibold ${
                        selecionado.status === "Disponível"
                          ? "bg-green-200 text-green-800" : selecionado.status === "Emprestado" ? "bg-yellow-200 text-yellow-800"
                          : selecionado.status === "Quebrado" ? "bg-red-200 text-red-800" : selecionado.status === "Manutencao" 
                          ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600" }`}title={selecionado.motivo || ""}>    {selecionado.status} </span>
                    </p>{selecionado.motivo && (<p className="sm:col-span-2"><strong>Motivo:</strong> {selecionado.motivo}</p>)}
                    <p className="sm:col-span-2"><strong>Observações:</strong> {selecionado.obs || "-"}</p>
                  </div>
                </div>
                {/* Alterar Status */}
                <div className="mt-8">
                  <label className="block mb-2 font-medium text-gray-700">Alterar Status</label>
                  <select value={selecionado.status} monChange={(e) => alterarStatus(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 transition">
                    {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option> ))}</select>
                </div>
              </motion.div>
            </motion.div> )}
        </AnimatePresence>
      {/* MODAL DE MOTIVO */}
      <AnimatePresence>
        {modalMotivo && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full relative" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
              <button className="absolute top-3 right-3 text-gray-500 hover:text-black" onClick={fecharMotivo}><X /></button>
              <h3 className="text-xl font-bold mb-4 text-red-700">Informe o motivo da alteração</h3>
              <textarea className="w-full h-28 p-2 border rounded focus:ring-2 focus:ring-red-500 resize-none" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Digite o motivo..." />
              <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={fecharMotivo}>Cancelar</button>
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={salvarMotivo}>Salvar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
