import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { app } from "../../../../firebase";
import {  ArrowLeft, HeadsetIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const STATUS_OPTIONS = ["Disponível", "Quebrado", "Emprestado", "Não encontrado"];

export default function VisualizarFones() {
  const [fones, setFones] = useState([]);
  const [modalTablet, setModalTablet] = useState(null);
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [motivoReadonly, setMotivoReadonly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase(app);
    const fonesRef = ref(db, "fones");
    const unsubscribe = onValue(fonesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) { const FonesArray = Object.entries(data).map(([id, tablet]) => ({id, ...tablet, status: tablet.status || "Disponível", motivo: tablet.motivo || "",}));
      setFones(FonesArray);} 
      else { setFones([]);}});
    return () => unsubscribe();}, []);

  const statusCount = STATUS_OPTIONS.reduce((acc, status) => {acc[status] = fones.filter((t) => t.status === status).length;  return acc;}, {});

  const updateTabletData = async (tabletId, statusToSave, motivoToSave = "") => {
    const db = getDatabase(app);
    const tabletRef = ref(db, `fones/${tabletId}`);
    try {await update(tabletRef, { status: statusToSave, motivo: motivoToSave,});
      toast.success("Tablet atualizado com sucesso!"); setModalTablet(null); setModalMotivoOpen(false); setMotivo(""); setMotivoReadonly(false);
    } 
    catch (error) {toast.error("Erro ao atualizar tablet: " + error.message);}
  };

  const handleSalvarStatus = () => {
    if (!modalTablet) return;
    if (["Quebrado", "Emprestado", "Nao Encontrado"].includes(modalTablet.status))
      {setMotivo(modalTablet.motivo || ""); setMotivoReadonly(!!modalTablet.motivo); setModalMotivoOpen(true);} 
    else {updateTabletData(modalTablet.id, modalTablet.status, "");}
  };

  const handleSalvarMotivo = () => {
    if (motivo.trim() === "") {toast.warning("Por favor, preencha o motivo ou responsável."); return;}
    updateTabletData(modalTablet.id, modalTablet.status, motivo.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6 flex flex-col items-center">
      <ToastContainer position="top-right" autoClose={4000} />
      <motion.div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-6">
          <HeadsetIcon className="w-7 h-7 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-800">Fones Cadastrados</h2>
        </div>
        <div className="flex gap-6 mb-8 text-gray-700 font-semibold">
          {STATUS_OPTIONS.map((status) => (<div key={status} className="px-4 py-2 bg-indigo-100 rounded-lg"> 
            {status}: <span className="text-indigo-700">{statusCount[status]}</span></div>))}
        </div>
        {fones.length === 0 ? (
          <p className="text-gray-600">Nenhum tablet cadastrado.</p>) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fones.map((tablet) => (
              <div key={tablet.id} className="border border-gray-300 rounded-lg p-4 shadow-sm flex gap-4">
                <div className="flex flex-col justify-between flex-grow">
                  <div>
                    <p><strong>Patrimônio:</strong> {tablet.patrimonio}</p>
                    <p><strong>Marca:</strong> {tablet.marca}</p>
                    <p><strong>Local:</strong> {tablet.local}</p>
                    <p><strong>Modelo:</strong> {tablet.modelo}</p>
                    <p><strong>Status:</strong> <span className={`font-semibold ${tablet.status === "Disponível" ? "text-green-600" : tablet.status === "Quebrado" ? "text-red-600" : "text-yellow-600"}`}>{tablet.status}</span></p>
                  </div>
                  <button onClick={() => setModalTablet(tablet)} className="mt-3 self-start px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition">Ver mais</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <motion.button onClick={() => navigate("/views")} whileTap={{ scale: 0.97 }} className="mt-8 w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg text-sm shadow-md flex items-center justify-center gap-2">
          <ArrowLeft className="w-5 h-5" />Voltar
        </motion.button>
      </motion.div>
      {/* Modal Principal */}
      {modalTablet && (
        <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalTablet(null)}>
          <motion.div className="bg-white rounded-lg max-w-lg w-full p-6 relative" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-gray-600 hover:text-gray-900" onClick={() => setModalTablet(null)} aria-label="Fechar"><X className="w-6 h-6" /></button>
            <h3 className="text-2xl font-bold mb-4">Detalhes do Tablet</h3>
            <div className="mb-4 flex gap-4">
              <div className="text-sm">
                <p><strong>Patrimônio:</strong> {modalTablet.patrimonio}</p>
                <p><strong>Marca:</strong> {modalTablet.marca}</p>
                <p><strong>Local:</strong> {modalTablet.local}</p>
                <p><strong>Modelo:</strong> {modalTablet.modelo}</p>
                <p><strong>Status atual:</strong> {modalTablet.status}</p>
                <label className="block mt-3 font-semibold">Alterar Status:</label>
                <select value={modalTablet.status} onChange={(e) => setModalTablet((prev) => ({ ...prev, status: e.target.value }))} className="w-full border border-gray-300 rounded px-2 py-1 mt-1">
                  {STATUS_OPTIONS.map((option) => (<option key={option} value={option}>{option}</option> ))}
                </select>
              </div>
            </div>
            <button onClick={handleSalvarStatus} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white w-full py-2 rounded-lg font-semibold">Salvar Status</button>
          </motion.div>
        </motion.div>
      )}
      {/* Modal Motivo */}
      {modalMotivoOpen && (
        <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalMotivoOpen(false)}>
          <motion.div className="bg-white rounded-lg max-w-md w-full p-6 relative" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Informe o Motivo ou Responsável</h3>
            <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} readOnly={motivoReadonly} className="w-full h-24 border border-gray-300 rounded p-2 mb-4" placeholder="Motivo ou responsável" />
            <button onClick={handleSalvarMotivo} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-2 rounded-lg font-semibold">Salvar</button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}