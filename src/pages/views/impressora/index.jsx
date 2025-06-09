import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database"; // <-- adicionado update
import { app } from "../../../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function VisualizacaoImpressoras() {
  const [impressoras, setImpressoras] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [showMotivoModal, setShowMotivoModal] = useState(false);
  const [novoStatus, setNovoStatus] = useState("");
  const [motivo, setMotivo] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase(app);
    const impressorasRef = ref(db, "impressoras");

    onValue(impressorasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setImpressoras(lista);
      } else {
        setImpressoras([]);
      }
    });
  }, []);

  const closeModal = () => {
    setSelecionada(null);
    setShowMotivoModal(false);
    setMotivo("");
    setNovoStatus("");
  };

  const handleStatusChange = (e) => {
    const valor = e.target.value;
    setNovoStatus(valor);
    if (valor === "Quebrado" || valor === "Em manutenção") {
      setShowMotivoModal(true);
    } else {
      salvarStatus(valor, "");
    }
  };

  const salvarStatus = (status, motivoTexto) => {
    if (!selecionada) return;

    const db = getDatabase(app);
    const impressoraRef = ref(db, `impressoras/${selecionada.id}`);

    update(impressoraRef, {
      status,
      motivo: motivoTexto || "",
    }).then(() => {
      setSelecionada((prev) => ({
        ...prev,
        status,
        motivo: motivoTexto || "",
      }));
      setShowMotivoModal(false);
      setMotivo("");
      setNovoStatus("");
    });
  };

  const voltarPagina = () => navigate("/views");

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 transition-colors duration-300">
      <div className="p-8 min-h-screen flex flex-col max-w-7xl mx-auto">
        <button
          onClick={voltarPagina}
          className="flex items-center gap-2 mb-8 text-indigo-300 hover:text-indigo-100 transition-colors font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <h1 className="text-4xl font-extrabold mb-12 text-center text-white">Impressoras Cadastradas</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {impressoras.map((imp) => (
            <motion.div
              key={imp.id}
              whileHover={{ scale: 1.04 }}
              onClick={() => setSelecionada(imp)}
              className="cursor-pointer rounded-xl bg-white shadow-sm overflow-hidden"
            >
              {imp.fotoBase64 ? (
                <img
                  src={imp.fotoBase64}
                  className="w-full h-auto object-contain bg-gray-50"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400">
                  Sem imagem
                </div>
              )}
              <div className="p-5">
                <h3 className="text-xl font-semibold truncate">{imp.marca}</h3>
                <p className="text-sm truncate">{imp.modelo}</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 w-full py-2 rounded bg-indigo-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelecionada(imp);
                  }}
                >
                  Ver mais
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal Principal */}
        <AnimatePresence>
          {selecionada && (
            <motion.div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
              <motion.div
                className="bg-white p-8 rounded-2xl w-full max-w-lg relative"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
              >
                <button onClick={closeModal} className="absolute top-4 right-4">
                  <X />
                </button>

                <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                  <Printer /> {selecionada.marca} - {selecionada.modelo}
                </h2>

                <div className="space-y-2 text-gray-700">
                  <p><strong>Status atual:</strong> {selecionada.status || "Funcionando"}</p>
                  {selecionada.motivo && (
                    <p><strong>Motivo:</strong> {selecionada.motivo}</p>
                  )}

                  <label className="block mt-4">
                    <span className="font-medium">Alterar Status:</span>
                    <select
                      className="mt-1 w-full p-2 border border-gray-300 rounded"
                      onChange={handleStatusChange}
                      defaultValue=""
                    >
                      <option value="" disabled>Selecione o novo status</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Quebrado">Quebrado</option>
                      <option value="Em manutenção">Em manutenção</option>
                    </select>
                  </label>

                  <div className="mt-6 flex justify-end">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={closeModal}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Fechar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal do Motivo */}
        <AnimatePresence>
          {showMotivoModal && (
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <motion.div
                className="bg-white p-6 rounded-xl w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h3 className="text-lg font-semibold mb-4">Informe o motivo</h3>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded h-28"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Descreva o motivo do status selecionado..."
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    onClick={() => {
                      setShowMotivoModal(false);
                      setNovoStatus("");
                      setMotivo("");
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => salvarStatus(novoStatus, motivo)}
                  >
                    Salvar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
