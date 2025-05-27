import { useState } from "react";
import { Input } from "../../../components/ui/input/input";
import { Button } from "../../../components/ui/button/button";
import { database } from "../../../../firebase";
import { ref, push, get, update } from "firebase/database";
import { Label } from "../../../components/ui/label/label";
import { useNavigate } from "react-router-dom";

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
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white font-semibold ${bgColors[tipo]} z-50`}
    >
      {message}
    </div>
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
      const snapshot = await get(ref(database, "toners"));
      const dados = snapshot.val() || {};

      const tonerExistenteEntry = Object.entries(dados).find(
        ([, val]) => val.sku === sku && val.impressora === impressora && val.cor === cor
      );

      if (tonerExistenteEntry) {
        const [id, tonerExistente] = tonerExistenteEntry;
        const novaQuantidade = (tonerExistente.quantidade || 0) + quantidade;
        await update(ref(database, "toners/" + id), { quantidade: novaQuantidade });
        setNotif({ message: `Quantidade atualizada para ${novaQuantidade}`, tipo: "success" });
      } else {
        await push(ref(database, "toners"), { cor, sku, impressora, quantidade });
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

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-gray-900 p-6">
        <div className="bg-white p-9 rounded-lg shadow-lg w-full max-w-6xl">
          <h2 className="text-center text-4xl font-bold text-gray-700 mb-6">
            Cadastro de Toner de Impressora
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label className="block mb-1 font-medium">Cor</Label>
              <select
                name="cor"
                value={formData.cor}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                {cores.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="block mb-1 font-medium">SKU</Label>
              <Input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="Digite o SKU"
                className="w-full border px-3 py-2 rounded bg-white"
                required
              />
            </div>

            <div>
              <Label className="block mb-1 font-medium">Impressora Designada</Label>
              <select
                name="impressora"
                value={formData.impressora}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                {impressoras.map((imp) => (
                  <option key={imp} value={imp}>{imp}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="block mb-1 font-medium">Quantidade</Label>
              <Input
                type="number"
                name="quantidade"
                min={1}
                value={formData.quantidade}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>

            <div className="col-span-1 md:col-span-2 mt-4 flex flex-col gap-4 md:flex-row md:justify-center md:gap-6">
              <Button
                type="submit"
                className="bg-blue-600 text-white rounded px-6 py-3 hover:bg-blue-700 transition w-full md:w-auto"
              >
                Cadastrar
              </Button>

              <Button
                type="button"
                onClick={() => navigate("/register-option")}
                className="bg-gradient-to-r from-red-400 to-red-900 text-white rounded px-6 py-3 hover:bg-red-700 transition w-full md:w-auto"
              >
                Voltar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
