import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom"; // <-- Importa useNavigate

export default function VisualizacaoImpressoras() {
  const [impressoras, setImpressoras] = useState([]);
  const [selecionada, setSelecionada] = useState(null);

  const navigate = useNavigate(); // <-- hook para navegação

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

  const closeModal = () => setSelecionada(null);

  // Função para voltar página anterior
  const voltarPagina = () => {
    navigate("/views");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 transition-colors duration-300">
      <div className="p-8 min-h-screen flex flex-col max-w-7xl mx-auto">
        {/* Botão voltar */}
        <button
          onClick={voltarPagina}
          className="flex items-center gap-2 mb-8 text-indigo-300 hover:text-indigo-100 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
          aria-label="Voltar para página anterior"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <h1 className="text-4xl font-extrabold mb-12 text-center tracking-tight select-none text-white">
          Impressoras Cadastradas
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 flex-grow">
          {impressoras.map((imp) => (
            <motion.div
              key={imp.id}
              whileHover={{ scale: 1.04 }}
              whileFocus={{ scale: 1.04 }}
              tabIndex={0}
              className="cursor-pointer rounded-xl bg-white shadow-sm shadow-gray-300 overflow-hidden outline-none focus:ring-4 focus:ring-indigo-400 transition-transform duration-200"
              onClick={() => setSelecionada(imp)}
              onKeyDown={(e) => e.key === "Enter" && setSelecionada(imp)}
              role="button"
              aria-label={`Ver detalhes da impressora ${imp.marca} modelo ${imp.modelo}`}
            >
              {imp.fotoBase64 ? (
                <img
                  src={imp.fotoBase64}
                  alt={`Foto da impressora ${imp.marca} modelo ${imp.modelo}`}
                  className="w-full h-auto object-contain rounded-t-xl bg-gray-50"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center rounded-t-xl select-none text-sm italic bg-gray-100 text-gray-400">
                  Sem imagem
                </div>
              )}

              <div className="p-5 flex flex-col">
                <div>
                  <h3 className="text-xl font-semibold truncate text-gray-900">{imp.marca}</h3>
                  <p className="text-sm mt-1 truncate text-gray-700">{imp.modelo}</p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="mt-45 w-full py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelecionada(imp);
                  }}
                  aria-label={`Ver mais detalhes da impressora ${imp.marca} modelo ${imp.modelo}`}
                >
                  Ver mais
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selecionada && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-modal="true"
              role="dialog"
              aria-labelledby="modal-title"
            >
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={(e, info) => {
                  if (info.offset.y > 120) {
                    closeModal();
                  }
                }}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white text-gray-900 shadow-gray-300 focus:outline-none"
                tabIndex={-1}
              >
                <div className="w-full flex justify-center py-3">
                  <div className="w-16 h-1.5 rounded-full bg-gray-300" />
                </div>

                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 rounded-full p-1 text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                  aria-label="Fechar detalhes da impressora"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="p-8 space-y-6">
                  <h2
                    id="modal-title"
                    className="text-3xl font-extrabold flex items-center gap-3 select-none text-gray-900"
                  >
                    <Printer className="w-7 h-7 text-indigo-600" />
                    {selecionada.marca} - {selecionada.modelo}
                  </h2>

                  {selecionada.fotoBase64 ? (
                    <img
                      src={selecionada.fotoBase64}
                      alt={`Foto da impressora ${selecionada.marca} modelo ${selecionada.modelo}`}
                      className="w-full h-64 object-cover rounded-xl shadow-md"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center rounded-xl select-none text-sm italic bg-gray-100 text-gray-400">
                      Sem imagem disponível
                    </div>
                  )}

                  <div className="space-y-2 text-base leading-relaxed text-gray-800">
                    <p>
                      <strong>Patrimônio:</strong> {selecionada.patrimonio || "N/A"}
                    </p>
                    <p>
                      <strong>Tipo de Cor:</strong> {selecionada.tipoCor || "N/A"}
                    </p>
                    <p>
                      <strong>Nota Fiscal:</strong> {selecionada.notaFiscal || "N/A"}
                    </p>
                    <p>
                      <strong>Local:</strong> {selecionada.local || "N/A"}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={closeModal}
                      className="px-5 py-3 rounded-md text-base font-semibold bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-white transition-colors"
                    >
                      Fechar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
