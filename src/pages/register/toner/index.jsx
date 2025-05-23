import { useState, useEffect } from "react";
import { database } from "../../../../firebase"; // ajuste caminho conforme seu projeto
import {
  ref,
  push,
  get,
  update,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";

const cores = ["Preto", "Ciano", "Magenta", "Amarelo"];
const impressoras = ["HP", "BROTHER"];

export default function CadastroToner() {
  const [formData, setFormData] = useState({
    cor: cores[0],
    sku: "",
    impressora: impressoras[0],
    quantidade: 1,
  });

  const [modalAberto, setModalAberto] = useState(false);
  const [tonersCadastrados, setTonersCadastrados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Função para carregar toners já cadastrados do Firebase
  async function carregarToners() {
    setLoading(true);
    try {
      const snapshot = await get(ref(database, "toners"));
      const dados = snapshot.val() || {};
      // Transforma objeto em array com id e dados
      const lista = Object.entries(dados).map(([key, val]) => ({
        id: key,
        ...val,
      }));
      setTonersCadastrados(lista);
    } catch (error) {
      console.error("Erro ao carregar toners:", error);
    }
    setLoading(false);
  }

  // Abre modal e carrega toners
  function abrirModal() {
    setModalAberto(true);
    carregarToners();
  }

  // Seleciona toner no modal e preenche formulário
  function selecionarToner(toner) {
    setFormData((prev) => ({
      ...prev,
      sku: toner.sku,
      cor: toner.cor,
      impressora: toner.impressora,
    }));
    setModalAberto(false);
  }

  // Handle form input change
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantidade" ? Number(value) : value,
    }));
  }

  // Submit do formulário
  async function handleSubmit(e) {
    e.preventDefault();
    const { sku, cor, impressora, quantidade } = formData;

    if (!sku || quantidade < 1) {
      alert("SKU e quantidade válidos são obrigatórios.");
      return;
    }

    try {
      // Consultar se já existe toner com mesmo sku + impressora + cor
      const snapshot = await get(ref(database, "toners"));
      const dados = snapshot.val() || {};

      // Buscar toner que bate os 3 critérios
      const tonerExistenteEntry = Object.entries(dados).find(
        ([key, val]) =>
          val.sku === sku &&
          val.impressora === impressora &&
          val.cor === cor
      );

      if (tonerExistenteEntry) {
        // Atualizar quantidade somando
        const [id, tonerExistente] = tonerExistenteEntry;
        const novaQuantidade = (tonerExistente.quantidade || 0) + quantidade;

        await update(ref(database, "toners/" + id), {
          quantidade: novaQuantidade,
        });

        alert(`Quantidade atualizada para ${novaQuantidade}`);
      } else {
        // Criar novo toner
        await push(ref(database, "toners"), {
          cor,
          sku,
          impressora,
          quantidade,
        });
        alert("Toner cadastrado com sucesso!");
      }

      // Resetar formulário
      setFormData({
        cor: cores[0],
        sku: "",
        impressora: impressoras[0],
        quantidade: 1,
      });
    } catch (error) {
      console.error("Erro ao cadastrar toner:", error);
      alert("Erro ao cadastrar toner.");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Cadastro de Toner de Impressora
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Cor</label>
          <select
            name="cor"
            value={formData.cor}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            {cores.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            SKU (Clique para escolher existente)
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            readOnly
            onClick={abrirModal}
            placeholder="Clique para escolher"
            className="w-full border px-3 py-2 rounded cursor-pointer bg-gray-50"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Impressora Designada</label>
          <select
            name="impressora"
            value={formData.impressora}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            {impressoras.map((imp) => (
              <option key={imp} value={imp}>
                {imp}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Quantidade</label>
          <input
            type="number"
            name="quantidade"
            min={1}
            value={formData.quantidade}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Salvar Toner
        </button>
      </form>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-auto">
            <h3 className="text-xl font-semibold mb-4">Toners Cadastrados</h3>
            {loading ? (
              <p>Carregando...</p>
            ) : tonersCadastrados.length === 0 ? (
              <p>Nenhum toner cadastrado ainda.</p>
            ) : (
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Cor</th>
                    <th className="border px-2 py-1">SKU</th>
                    <th className="border px-2 py-1">Impressora</th>
                    <th className="border px-2 py-1">Quantidade</th>
                    <th className="border px-2 py-1">Selecionar</th>
                  </tr>
                </thead>
                <tbody>
                  {tonersCadastrados.map((t) => (
                    <tr key={t.id}>
                      <td className="border px-2 py-1">{t.cor}</td>
                      <td className="border px-2 py-1">{t.sku}</td>
                      <td className="border px-2 py-1">{t.impressora}</td>
                      <td className="border px-2 py-1">{t.quantidade}</td>
                      <td className="border px-2 py-1 text-center">
                        <button
                          onClick={() => selecionarToner(t)}
                          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                        >
                          Selecionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button
              onClick={() => setModalAberto(false)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
