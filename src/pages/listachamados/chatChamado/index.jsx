import { useEffect, useState, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import {
  getDatabase,
  ref,
  onValue,
  push,
  update,
  get,
} from 'firebase/database'

const ChatChamadoWeb = () => {
  const { id } = useParams()
  const { state } = useLocation()
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [statusChamado, setStatusChamado] = useState('carregando')
  const mensagensEndRef = useRef(null)

  useEffect(() => {
    const db = getDatabase()

    // Escutar mensagens
    const mensagensRef = ref(db, `chamados/${id}/mensagens`)
    const unsubscribeMsgs = onValue(mensagensRef, snapshot => {
      const data = snapshot.val()
      if (data) {
        const lista = Object.entries(data).map(([id, msg]) => ({
          id,
          ...msg,
        }))
        setMensagens(lista.sort((a, b) => a.timestamp - b.timestamp))
      } else {
        setMensagens([])
      }
    })

    // Escutar status
    const statusRef = ref(db, `chamados/${id}/status`)
    const unsubscribeStatus = onValue(statusRef, snapshot => {
      const status = snapshot.val()
      setStatusChamado(status || 'desconhecido')
    })

    return () => {
      unsubscribeMsgs()
      unsubscribeStatus()
    }
  }, [id])

  const enviarMensagem = async () => {
    if (novaMensagem.trim() === '' || statusChamado === 'fechado') return

    const db = getDatabase()
    const mensagensRef = ref(db, `chamados/${id}/mensagens`)
    await push(mensagensRef, {
      texto: novaMensagem.trim(),
      autor: 'admin',
      timestamp: Date.now(),
    })

    setNovaMensagem('')
    mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const alterarStatus = async novoStatus => {
    const db = getDatabase()
    const chamadoRef = ref(db, `chamados/${id}`)
    await update(chamadoRef, {
      status: novoStatus,
      updatedAt: Date.now(),
    })

    setStatusChamado(novoStatus)

    // Se fechou, envia mensagem automática
    if (novoStatus === 'fechado') {
      const mensagensRef = ref(db, `chamados/${id}/mensagens`)
      await push(mensagensRef, {
        texto: 'Este chamado foi encerrado pelo administrador.',
        autor: 'sistema',
        timestamp: Date.now(),
      })
    }
  }

  const formatarData = timestamp => {
    const data = new Date(timestamp)
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="mb-4 flex justify-between items-center flex-col sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold">
            Chat: {state?.titulo || id}
          </h2>
          <p
            className={`text-sm mt-1 font-medium capitalize ${
              statusChamado === 'fechado'
                ? 'text-red-600'
                : statusChamado === 'andamento'
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}
          >
            Status: {statusChamado}
          </p>
        </div>

        <div className="mt-2 sm:mt-0">
          <label htmlFor="status-select" className="mr-2 font-semibold">
            Alterar status:
          </label>
          <select
            id="status-select"
            value={statusChamado}
            onChange={e => alterarStatus(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="aberto">Aberto</option>
            <option value="andamento">Em Andamento</option>
            <option value="fechado">Fechado</option>
          </select>
        </div>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto mb-4 border rounded p-4 bg-gray-50">
        {mensagens.map(msg => (
          <div
            key={msg.id}
            className={`mb-3 flex ${
              msg.autor === 'admin'
                ? 'justify-end'
                : msg.autor === 'sistema'
                ? 'justify-center'
                : 'justify-start'
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs shadow ${
                msg.autor === 'admin'
                  ? 'bg-blue-500 text-white'
                  : msg.autor === 'sistema'
                  ? 'bg-gray-400 text-gray-800 italic'
                  : 'bg-gray-300 text-black'
              }`}
            >
              <p className="text-sm">{msg.texto}</p>
              <p className="text-[11px] mt-1 text-right opacity-80">
                {msg.autor} — {formatarData(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={mensagensEndRef} />
      </div>

      {/* Campo de envio */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={novaMensagem}
          onChange={e => setNovaMensagem(e.target.value)}
          className="flex-1 px-4 py-2 border rounded disabled:bg-gray-200"
          placeholder={
            statusChamado === 'fechado'
              ? 'Chamado encerrado. Chat bloqueado.'
              : 'Digite sua mensagem...'
          }
          disabled={statusChamado === 'fechado'}
        />
        <button
          onClick={enviarMensagem}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={statusChamado === 'fechado'}
        >
          Enviar
        </button>
      </div>
    </div>
  )
}

export default ChatChamadoWeb
