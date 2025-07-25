import { useEffect, useState } from 'react'
import { getDatabase, ref, onValue, update } from 'firebase/database'
import { useNavigate } from 'react-router-dom'

const ListaChamadosWeb = () => {
  const [chamados, setChamados] = useState([])
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const navigate = useNavigate()

  useEffect(() => {
    const db = getDatabase()
    const chamadosRef = ref(db, 'chamados')

    const unsubscribe = onValue(chamadosRef, snapshot => {
      const data = snapshot.val()
      if (data) {
        const lista = Object.entries(data).map(([id, chamado]) => ({
          id,
          ...chamado,
        }))
        setChamados(lista.sort((a, b) => b.updatedAt - a.updatedAt))
      } else {
        setChamados([])
      }
    })

    return () => unsubscribe()
  }, [])

  const fecharChamado = async id => {
    const db = getDatabase()
    const chamadoRef = ref(db, `chamados/${id}`)
    await update(chamadoRef, {
      status: 'fechado',
      updatedAt: Date.now(),
    })
  }

  const chamadosFiltrados =
    filtroStatus === 'todos'
      ? chamados
      : chamados.filter(ch => ch.status === filtroStatus)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Chamados</h1>

      {/* Filtros */}
      <div className="mb-4 flex gap-2">
        {['todos', 'aberto', 'andamento', 'fechado'].map(status => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status)}
            className={`px-4 py-2 rounded ${
              filtroStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabela de chamados */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2 border">Título</th>
              <th className="text-left p-2 border">Status</th>
              <th className="text-left p-2 border">Criado por</th>
              <th className="text-left p-2 border">Última mensagem</th>
              <th className="text-left p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {chamadosFiltrados.map(chamado => (
              <tr key={chamado.id} className="border-t">
                <td className="p-2 border">{chamado.titulo}</td>
                <td className="p-2 border capitalize">{chamado.status}</td>
                <td className="p-2 border">{chamado.criadoPor}</td>
                <td className="p-2 border">
                  {chamado.ultimaMensagem || '—'}
                </td>
                <td className="p-2 border space-x-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() =>
                      navigate(`/chat/${chamado.id}`, {
                        state: { titulo: chamado.titulo },
                      })
                    }
                  >
                    Ver
                  </button>
                  {chamado.status !== 'fechado' && (
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => fecharChamado(chamado.id)}
                    >
                      Fechar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {chamadosFiltrados.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  Nenhum chamado encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ListaChamadosWeb
