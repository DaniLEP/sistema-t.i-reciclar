import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { app } from "../../../../firebase";
import { ArrowLeft, X, CameraIcon, TabletSmartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const STATUS_OPTIONS = ["Disponível", "Quebrado", "Emprestado", "Manutenção", "Não encontrado"];

export default function VisualizarCamera() {
  const [tablets, setTablets] = useState([]);
  const [modalTablet, setModalTablet] = useState(null);
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [motivoReadonly, setMotivoReadonly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase(app);
    const tabletsRef = ref(db, "cameras");

    const unsubscribe = onValue(tabletsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tabletsArray = Object.entries(data).map(([id, tablet]) => ({
          id,
          ...tablet,
          status: tablet.status || "Disponível",
          motivo: tablet.motivo || "",
        }));
        setTablets(tabletsArray);
      } else {
        setTablets([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const statusCount = STATUS_OPTIONS.reduce((acc, status) => {
    acc[status] = tablets.filter((t) => t.status === status).length;
    return acc;
  }, {});

  const updateTabletData = async (tabletId, statusToSave, motivoToSave = "") => {
    const db = getDatabase(app);
    const tabletRef = ref(db, `cameras/${tabletId}`);
    try {
      await update(tabletRef, { status: statusToSave, motivo: motivoToSave });
      toast.success("Câmera atualizada com sucesso!");
      setModalTablet(null);
      setModalMotivoOpen(false);
      setMotivo("");
      setMotivoReadonly(false);
    } catch (error) {
      toast.error("Erro ao atualizar câmera: " + error.message);
    }
  };

  const handleSalvarStatus = () => {
    if (modalTablet.status === "Quebrado" || modalTablet.status === "Emprestado") {
      setMotivo(modalTablet.motivo || "");
      setMotivoReadonly(!!modalTablet.motivo);
      setModalMotivoOpen(true);
    } else {
      updateTabletData(modalTablet.id, modalTablet.status, "");
    }
  };

  const handleSalvarMotivo = () => {
    if (motivo.trim() === "") {
      toast.warning("Por favor, preencha o motivo ou responsável.");
      return;
    }
    updateTabletData(modalTablet.id, modalTablet.status, motivo.trim());
    setMotivoReadonly(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6 flex flex-col items-center">
      <ToastContainer position="top-right" autoClose={4000} />
      <motion.div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <CameraIcon className="w-7 h-7 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-800">Câmeras Cadastradas</h2>
        </div>

        <div className="flex gap-6 mb-8 text-gray-700 font-semibold flex-wrap">
          {STATUS_OPTIONS.map((status) => (
            <div key={status} className="px-4 py-2 bg-indigo-100 rounded-lg">
              {status}: <span className="text-indigo-700">{statusCount[status]}</span>
            </div>
          ))}
        </div>

        {tablets.length === 0 ? (
          <p className="text-gray-600">Nenhuma câmera ou periférico cadastrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tablets.map((tablet) => (
              <div key={tablet.id} className="border border-gray-300 rounded-lg p-4 shadow-sm flex gap-4">
                <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {tablet.fotoBase64 ? (
                    <img src={tablet.fotoBase64} alt={`Foto do tablet ${tablet.patrimonio}`} className="object-cover w-full h-full" />
                  ) : (
                    <TabletSmartphone className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <p><strong>Patrimônio:</strong> {tablet.patrimonio}</p>
                    <p><strong>Marca:</strong> {tablet.marca}</p>
                    <p><strong>Local:</strong> {tablet.local}</p>
                    <p><strong>Modelo:</strong> {tablet.modelo}</p>
                    <p><strong>Responsável:</strong> {tablet.responsavel}</p>
                    <p><strong>Status:</strong>{" "}
                      <span className={`font-semibold ${tablet.status === "Disponível" ? "text-green-600" : tablet.status === "Quebrado" ? "text-red-600" : "text-yellow-600"}`}>
                        {tablet.status}
                      </span>
                    </p>
                  </div>
                  <button onClick={() => setModalTablet(tablet)}
                    className="mt-3 self-start px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition">
                    Ver mais
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/views")}
          className="mt-8 w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg text-sm shadow-md transition flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </motion.button>
      </motion.div>

      {/* Modal Detalhes */}
      {modalTablet && (
        <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setModalTablet(null)}>
          <motion.div className="bg-white rounded-lg max-w-lg w-full p-6 relative"
            initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-gray-600 hover:text-gray-900" onClick={() => setModalTablet(null)}>
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold mb-4">Detalhes da Câmera</h3>
            <div className="mb-4 flex gap-4">
              <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {modalTablet.fotoBase64 ? (
                  <img src={modalTablet.fotoBase64} alt={`Foto do tablet ${modalTablet.patrimonio}`} className="object-cover w-full h-full" />
                ) : (
                  <TabletSmartphone className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div>
                <p><strong>Patrimônio:</strong> {modalTablet.patrimonio}</p>
                <p><strong>Marca:</strong> {modalTablet.marca}</p>
                <p><strong>Local:</strong> {modalTablet.local}</p>
                <p><strong>Modelo:</strong> {modalTablet.modelo}</p>
                <p><strong>Nota Fiscal:</strong> {modalTablet.notaFiscal}</p>
                <p><strong>Projeto:</strong> {modalTablet.projeto}</p>
                <p><strong>Motivo:</strong> {modalTablet.motivo || "-"}</p>
                {modalTablet.obs && <p><strong>Obs:</strong> {modalTablet.obs}</p>}
                <p><strong>Data Cadastro:</strong> {modalTablet.dataCadastro}</p>
                <p><strong>Parceiro:</strong> {modalTablet.parceiro}</p>
                <p><strong>NCM:</strong> {modalTablet.NCM}</p>
                <p><strong>VR-BEM:</strong> {modalTablet.vrbem}</p>
                <p><strong>Projeto/Edital/Convênio:</strong> {modalTablet.projetoEditalConvenio}</p>
                <p><strong>Ano:</strong> {modalTablet.ano}</p>
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block font-semibold mb-2">Status:</label>
              <select id="status" value={modalTablet.status} onChange={(e) => setModalTablet((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {STATUS_OPTIONS.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>{statusOption}</option>
                ))}
              </select>
            </div>
            <button onClick={handleSalvarStatus}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition">
              Salvar Status
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Motivo */}
      {modalMotivoOpen && (
        <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setModalMotivoOpen(false)}>
          <motion.div className="bg-white rounded-lg max-w-md w-full p-6"
            initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()}>
            <h4 className="text-xl font-bold mb-4">Informe o motivo ou responsável</h4>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              readOnly={motivoReadonly}
              rows={4}
            />
            {!motivoReadonly && (
              <button onClick={handleSalvarMotivo}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition">
                Salvar Motivo
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
