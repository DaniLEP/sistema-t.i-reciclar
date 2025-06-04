
import { useState } from "react";
import { Input } from "../../../components/ui/input/input";
import { Button } from "../../../components/ui/button/button";
import { db } from "../../../../firebase";
import { ref, push, get, update } from "firebase/database";
import { Label } from "../../../components/ui/label/label";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Printer, Save, ArrowLeft } from "lucide-react";

const cores = ["Preto", "Ciano", "Magenta", "Amarelo"];
const impressoras = ["HP", "BROTHER"];

function Notification({ message, tipo = "info", onClose }) {
  const bgColors = {
    info: "bg-blue-500",
    success: "bg-green-500",
    error: "bg-red-500",
  };

  if (!message) return null;

  setTimeout(onClose, 3000);

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md shadow-xl text-white font-medium ${bgColors[tipo]} z-50`}
    >
      {message}
    </motion.div>
  );
}

export default function CadastroToner() {
  const [formData, setFormData] = useState({
    cor: cores[0],
    sku: "",
    impressora: impressoras[0],
    quantidade: 1,
  });

  const [notif, setNotif] = useState({ message: "", tipo: "info" });
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantidade" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { sku, cor, impressora, quantidade } = formData;

    if (!sku || quantidade < 1) {
      setNotif({ message: "SKU e quantidade válidos são obrigatórios.", tipo: "error" });
      return;
    }

    try {
      const snapshot = await get(ref(db, "toners"));
      const dados = snapshot.val() || {};

      const tonerExistenteEntry = Object.entries(dados).find(
        ([, val]) => val.sku === sku && val.impressora === impressora && val.cor === cor
      );

      if (tonerExistenteEntry) {
        const [id, tonerExistente] = tonerExistenteEntry;
        const novaQuantidade = (tonerExistente.quantidade || 0) + quantidade;
        await update(ref(db, "toners/" + id), { quantidade: novaQuantidade });
        setNotif({ message: `Quantidade atualizada para ${novaQuantidade}`, tipo: "success" });
      } else {
        await push(ref(db, "toners"), { cor, sku, impressora, quantidade });
        setNotif({ message: "Toner cadastrado com sucesso!", tipo: "success" });
      }

      setFormData({ cor: cores[0], sku: "", impressora: impressoras[0], quantidade: 1 });
    } catch (error) {
      console.error("Erro ao cadastrar toner:", error);
      setNotif({ message: "Erro ao cadastrar toner.", tipo: "error" });
    }
  }

  return (
    <>
      <Notification
        message={notif.message}
        tipo={notif.tipo}
        onClose={() => setNotif({ message: "", tipo: "info" })}
      />

      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-gray-900 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-4xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center mb-10 flex items-center justify-center gap-3">
            <Printer className="text-indigo-600 w-8 h-8" />
            Cadastro de Toner
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-gray-700 mb-2">Cor</Label>
              <select
                name="cor"
                value={formData.cor}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                {cores.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="block text-gray-700 mb-2">SKU</Label>
              <Input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="Digite o SKU"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <Label className="block text-gray-700 mb-2">Impressora</Label>
              <select
                name="impressora"
                value={formData.impressora}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                {impressoras.map((imp) => (
                  <option key={imp} value={imp}>{imp}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="block text-gray-700 mb-2">Quantidade</Label>
              <Input
                type="number"
                name="quantidade"
                min={1}
                value={formData.quantidade}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 shadow-md transition flex items-center gap-2 w-full md:w-auto"
              >
                <Save className="w-5 h-5" />
                Cadastrar
              </Button>
              <Button
                type="button"
                onClick={() => navigate("/register-option")}
                className="bg-gradient-to-r from-red-500 to-red-800 hover:from-red-600 hover:to-red-900 text-white rounded-xl px-6 py-3 shadow-md transition flex items-center gap-2 w-full md:w-auto"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </>
  );
}
