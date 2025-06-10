import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import { ref, onValue, update } from "firebase/database";
import { motion } from "framer-motion";
import { Palette, Printer, ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ConsultaToners() {
  const [toners, setToners] = useState([]);
  const [resumo, setResumo] = useState({});
  const [filtroImpressora, setFiltroImpressora] = useState("TODAS");

  useEffect(() => {
    const unsub = onValue(ref(db, "toners"), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data).map(([id, toner]) => ({ id, ...toner }));
        setToners(lista);
        const agrupado = lista.reduce((acc, item) => {
          const key = item.impressora;
          acc[key] = (acc[key] || 0) + (item.quantidade || 0);
          return acc;
        }, {});
        setResumo(agrupado);
      } else {
        setToners([]);
        setResumo({});
      }
    });
    return () => unsub();
  }, []);

  const navigate = useNavigate();
  const impressorasUnicas = [...new Set(toners.map(t => t.impressora))];
  const tonersFiltrados = filtroImpressora === "TODAS"
    ? toners
    : toners.filter(t => t.impressora === filtroImpressora);

  const handleRetiradaToner = async (id, quantidadeAtual) => {
    if (quantidadeAtual <= 0) return;

    const novaQuantidade = quantidadeAtual - 1;

    try {
      await update(ref(db, `toners/${id}`), {
        quantidade: novaQuantidade,
      });
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6">
      <motion.div
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-8 h-8 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-800">Consulta de Toners</h2>
        </div>

        {/* Filtro de impressora */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600" />
            <label htmlFor="filtro" className="text-sm font-medium text-gray-700">Filtrar por Impressora:</label>
            <select
              id="filtro"
              value={filtroImpressora}
              onChange={(e) => setFiltroImpressora(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="TODAS">Todas</option>
              {impressorasUnicas.map((imp) => (
                <option key={imp} value={imp}>{imp}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumo por impressora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(resumo).map(([impressora, total]) => (
            <motion.div
              key={impressora}
              className="bg-indigo-100 text-indigo-900 p-4 rounded-xl shadow hover:scale-[1.02] transition-transform"
              whileHover={{ scale: 1.03 }}
            >
              <h4 className="text-lg font-semibold">Impressora {impressora}</h4>
              <p className="text-sm">{total} toner(s) no total</p>
            </motion.div>
          ))}
        </div>

        {/* Tabela de toners */}
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="w-full text-left border border-gray-200 bg-white">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-3 px-4">Cor</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Impressora</th>
                <th className="py-3 px-4">Quantidade</th>
                <th className="py-3 px-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {tonersFiltrados.length > 0 ? (
                tonersFiltrados.map((toner) => (
                  <React.Fragment key={toner.id}>
                    <tr className="border-b hover:bg-indigo-50 transition">
                      <td className="py-2 px-4 flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{
                            backgroundColor: {
                              preto: "#000000",
                              magenta: "#FF00FF",
                              ciano: "#00FFFF",
                              amarelo: "#FFFF00",
                            }[toner.cor.toLowerCase()] || "transparent",
                          }}
                        ></span>
                        {toner.cor}
                      </td>
                      <td className="py-2 px-4">{toner.sku}</td>
                      <td className="py-2 px-4">{toner.impressora}</td>
                      <td className="py-2 px-4">{toner.quantidade}</td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => handleRetiradaToner(toner.id, toner.quantidade)}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition"
                          disabled={toner.quantidade === 0}
                        >
                          Retirar
                        </button>
                      </td>
                    </tr>
                    {toner.quantidade <= 1 && (
                      <tr className="bg-yellow-100 border-b">
                        <td colSpan={5} className="py-2 px-4 text-sm text-yellow-800 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          Estoque mínimo para o toner <strong>{toner.cor.toUpperCase()}</strong> ({toner.sku}) da impressora <strong>{toner.impressora}</strong>.
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    Nenhum toner encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Botão Voltar */}
        <motion.button
          onClick={() => navigate("/views")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Voltar"
          title="Voltar"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 font-semibold shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 bg-white hover:bg-indigo-600 hover:text-white select-none mt-10"
        >
          <ArrowLeft size={20} />
          Voltar
        </motion.button>
      </motion.div>
    </div>
  );
}
