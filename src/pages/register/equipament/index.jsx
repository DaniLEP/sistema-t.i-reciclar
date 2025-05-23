import { useState } from 'react'
import { database } from '../../../../firebase'
import { ref, push } from 'firebase/database'

const tipos = ['notebook', 'desktop', 'monitor', 'periférico']
const statusList = ['disponível', 'emprestado', 'manutenção']

export default function CadastroEquipamento() {
  const [formData, setFormData] = useState({
    tipo: 'notebook',
    nf: '',
    nome: '',
    patrimonio: '',
    status: 'disponível',
    quantidade: 1,
    obs: '',
    projeto: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await push(ref(database, 'equipamentos'), formData)
      alert('Equipamento cadastrado com sucesso!')
      setFormData({
        tipo: 'notebook',
        nf: '',
        nome: '',
        patrimonio: '',
        status: 'disponível',
        quantidade: 1,
        obs: '',
        projeto: ''
      })
    } catch (error) {
      console.error('Erro ao cadastrar:', error)
      alert('Erro ao cadastrar equipamento.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">Cadastro de Equipamento</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Tipo</label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            {tipos.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">NF</label>
          <input
            type="text"
            name="nf"
            value={formData.nf}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Nome (Notebook, etc)</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Patrimônio</label>
          <input
            type="text"
            name="patrimonio"
            value={formData.patrimonio}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            {statusList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Quantidade</label>
          <input
            type="number"
            name="quantidade"
            value={formData.quantidade}
            onChange={handleChange}
            min={1}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Observações</label>
          <textarea
            name="obs"
            value={formData.obs}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Projeto</label>
          <input
            type="text"
            name="projeto"
            value={formData.projeto}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Salvar Cadastro
        </button>
      </form>
    </div>
  )
}

