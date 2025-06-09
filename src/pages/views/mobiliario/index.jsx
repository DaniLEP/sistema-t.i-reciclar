import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, off, update } from "firebase/database";
import { app } from "../../../../firebase";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {  ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function formatDate(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString; // verifica corretamente
  return d.toLocaleDateString("pt-BR");
}


export default function VisualizarMobiliario() {
  const [moveis, setMoveis] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

useEffect(() => {
  const db = getDatabase(app);
  const refMoveis = ref(db, "moveis");

  const unsubscribe = onValue(refMoveis, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const arrayMoveis = Object.entries(data).map(([id, val]) => ({
        id,
        ...val,
      }));
      setMoveis(arrayMoveis);
    } else {
      setMoveis([]);
    }
  });

  return () => unsubscribe();
}, []);


useEffect(() => {
  function handleKeyDown(e) {
    if (e.key === "Escape" && isModalOpen) {
      closeModal();
    }
  }
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [isModalOpen]);


  // Pesquisa geral (pesquisa em todos os campos texto)
const filteredMoveis = moveis.filter((item) => {
  const searchLower = search.toLowerCase();
  return (
    (item.ambienteAtual?.toLowerCase().includes(searchLower) ||
      (item.notaFiscal || "").toLowerCase().includes(searchLower) ||
      (item.descricao || "").toLowerCase().includes(searchLower) ||
      (item.projeto || "").toLowerCase().includes(searchLower) ||
      (item.patrimonio || "").toLowerCase().includes(searchLower))
  );
});

const exportToExcel = () => {
  // Criar uma cópia dos dados filtrados, removendo campos que não quer exportar (ex: fotoBase64)
  const dataToExport = filteredMoveis.map(({ fotoBase64, id, ...rest }) => rest);

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Mobiliario");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // Criar Blob e salvar arquivo com file-saver
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(data, "Patrimonio-2025.xlsx");
};


  const openModal = (item) => {
    setSelectedItem(item);
    setEditData(item);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

const handleSave = async () => {
  if (!selectedItem?.id) return;

  const db = getDatabase(app);
  try {
    await update(ref(db, `moveis/${selectedItem.id}`), editData);
    setMoveis((old) =>
      old.map((m) => (m.id === selectedItem.id ? { ...m, ...editData } : m))
    );
    setSelectedItem({ ...selectedItem, ...editData });
    setIsEditing(false);
    alert("Dados salvos com sucesso!");
  } catch (error) {
    alert("Erro ao salvar: " + error.message);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Visualizar Mobiliário</h1>

        {/* Input único de pesquisa */}
        <input
          type="text"
          placeholder="Pesquisar por ambiente, nota fiscal, descrição, projeto ou patrimônio..."
          className="w-full mb-6 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Pesquisar mobiliário"
        />

        {/* Tabela */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-20">Foto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Patrimônio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Ambiente Atual</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Projeto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Nota Fiscal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-28">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMoveis.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                    Nenhum mobiliário encontrado.
                  </td>
                </tr>
              ) : (
                filteredMoveis.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      {item.fotoBase64 ? (
                        <img
                          src={item.fotoBase64}
                          alt={`Foto do mobiliário ${item.patrimonio}`}
                          className="h-12 w-12 object-cover rounded-md border border-gray-300"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs">
                          Sem foto
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{item.patrimonio}</td>
                    <td className="px-4 py-3 truncate max-w-xs" title={item.descricao}>{item.descricao}</td>
                    <td className="px-4 py-3">{item.ambienteAtual}</td>
                    <td className="px-4 py-3">{item.projeto}</td>
                    <td className="px-4 py-3">{item.notaFiscal}</td>
                    <td className="px-4 py-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal(item)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm font-semibold shadow-md"
                        aria-label={`Ver mais detalhes do mobiliário ${item.patrimonio}`}
                      >
                        Ver mais
                      </motion.button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

         <motion.button onClick={() => navigate("/views")} whileHover={{scale: 1.1, backgroundColor: "#4f46e5", color: "white"}} whileTap={{ scale: 0.95 }}   aria-label="Voltar"title="Voltar"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 font-semibold shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 bg-white hover:bg-indigo-600 hover:text-white select-none mt-10">
                      <ArrowLeft size={20} />Voltar</motion.button>{" "}
<button
  onClick={exportToExcel}
  className="mb-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold shadow"
  aria-label="Exportar lista para Excel"
>
  Exportar Excel
</button>

{/* Modal */}
{isModalOpen && selectedItem && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onClick={closeModal}
  >
    <motion.div
      className="bg-white rounded-xl max-w-lg w-full p-6 relative shadow-xl max-h-[90vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label="Fechar modal"
      >
        ✕
      </button>

      <h2 id="modal-title" className="text-2xl font-bold mb-4 text-gray-800">
        Detalhes do Mobiliário
      </h2>

      {/* Conteúdo com scroll */}
      <div className="overflow-y-auto pr-2 flex-grow">
        <div className="mb-4 flex justify-center">
          {editData.fotoBase64 ? (
            <img
              src={editData.fotoBase64}
              alt={`Foto do mobiliário ${editData.patrimonio}`}
              className="max-h-48 rounded-md object-contain border border-gray-300"
            />
          ) : (
            <div className="h-48 w-full bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-lg">
              Sem foto
            </div>
          )}
        </div>

        <div className="space-y-4 text-gray-700 text-sm">
          {Object.entries(editData).map(([key, value]) => {
            if (key === "fotoBase64" || key === "id") return null;

            const isDateField =
              key.toLowerCase().includes("data") ||
              key.toLowerCase().includes("date") ||
              key.toLowerCase().includes("vencimento") ||
              key.toLowerCase().includes("registro");

            const label = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());

            if (isEditing) {
              return (
                <div key={key} className="flex flex-col">
                  <label className="font-semibold mb-1 text-gray-900" htmlFor={key}>
                    {label}:
                  </label>
                  <input
                    id={key}
                    name={key}
                    type={isDateField ? "date" : "text"}
                    value={
                      isDateField && value
                        ? new Date(value).toISOString().slice(0, 10)
                        : value || ""
                    }
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              );
            } else {
              return (
                <div key={key} className="flex gap-2">
                  <span className="font-semibold w-40">{label}:</span>
                  <span>{isDateField ? formatDate(value) : value || "-"}</span>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Botões Editar / Salvar */}
      <div className="mt-6 flex justify-end gap-4">
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-semibold shadow"
            aria-label="Editar dados do mobiliário"
          >
            Editar
          </button>
        )}
        {isEditing && (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-semibold"
              aria-label="Cancelar edição"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold shadow"
              aria-label="Salvar dados do mobiliário"
            >
              Salvar
            </button>
          </>
        )}
      </div>
    </motion.div>
  </div>
)}

      </div>
    </div>
  );
}
