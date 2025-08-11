"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, ref, onValue, push, update } from "firebase/database";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { Send, Clock, Settings, MessageCircle, AlertCircle, XCircle, MoreVertical, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AvaliacaoChamado({ uid, chamadoId, statusChamado, avaliacao, onAvaliacaoSalva }) {
  const [nota, setNota] = useState(avaliacao?.nota || 0);
  const [comentario, setComentario] = useState(avaliacao?.comentario || "");
  const [salvando, setSalvando] = useState(false);
  const podeAvaliar = statusChamado.toLowerCase() === "fechado" && !avaliacao;

  const salvarAvaliacao = async () => {
    if (nota < 1) {
      alert("Por favor, selecione uma nota.");
      return;
    }
    setSalvando(true);
    const db = getDatabase();
    const chamadoRef = ref(db, `chamados/${uid}/${chamadoId}/avaliacao`);
    try {
      await update(chamadoRef, { nota, comentario, timestamp: Date.now() });
      onAvaliacaoSalva();
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      alert("Erro ao salvar avaliação, tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  if (!podeAvaliar && !avaliacao) return null;

  return (
    <Card className="mx-4 my-4 p-4 bg-gray-50 shadow-inner rounded-md max-w-4xl">
      <CardHeader>
        <h3 className="text-lg font-semibold">Avaliação do Atendimento</h3>
      </CardHeader>
      <CardContent>
        {avaliacao ? (
          <div>
            <p className="font-semibold text-yellow-500 text-xl mb-2">
              {"★".repeat(avaliacao.nota)}{" "}
              <span className="text-gray-500">({avaliacao.nota}/5)</span>
            </p>
            {avaliacao.comentario && <p className="whitespace-pre-wrap">{avaliacao.comentario}</p>}
            <p className="text-xs text-gray-400 mt-2">
              Avaliado em{" "}
              {new Date(avaliacao.timestamp).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNota(i)}
                  className={`text-3xl ${
                    i <= nota ? "text-yellow-400" : "text-gray-300"
                  } hover:text-yellow-500 transition-colors`}
                  aria-label={`Nota ${i} estrelas`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder="Deixe um comentário (opcional)"
              className="w-full border border-gray-300 rounded p-2 resize-none"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              disabled={salvando}
            />
            <Button
              onClick={salvarAvaliacao}
              disabled={salvando || nota < 1}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {salvando ? "Salvando..." : "Enviar Avaliação"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ChatChamado() {
  const { uid, chamadoId } = useParams();
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [statusChamado, setStatusChamado] = useState("carregando");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [nome, setNome] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [avaliacao, setAvaliacao] = useState(null);
  const mensagensEndRef = useRef(null);
  const inputRef = useRef(null);

  // Pede permissão de notificação ao montar
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!uid || !chamadoId) return;
    const db = getDatabase();
    setIsLoading(true);

    const chamadoRef = ref(db, `chamados/${uid}/${chamadoId}`);
    const unsubscribeChamado = onValue(chamadoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTitulo(data.categoria || `Chamado #${chamadoId}`);
        setDescricao(data.descricao || "");
        setPrioridade(data.prioridade || "");
        setProtocolo(data.protocolo || "");
        setNome(data.nome || "");
        setStatusChamado(data.status || "Aberto");
        setAvaliacao(data.avaliacao || null);
      }
      setIsLoading(false);
    });

    const mensagensRef = ref(db, `chamados/${uid}/${chamadoId}/mensagens`);
    const unsubscribeMsgs = onValue(mensagensRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data).map(([msgId, msg]) => ({
          id: msgId,
          ...msg,
        }));
        const ordenadas = lista.sort((a, b) => a.timestamp - b.timestamp);
        setMensagens(ordenadas);

        // Pega a última mensagem para notificação
        const ultimaMensagem = ordenadas[ordenadas.length - 1];
        if (ultimaMensagem) {
          // Não notifica mensagens enviadas pelo admin (você mesmo)
          if (ultimaMensagem.autor !== "admin") {
            const mensagemTexto = ultimaMensagem.texto || "Nova mensagem";

            if (
              document.hidden &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("Nova mensagem", {
                body: mensagemTexto,
                // icon: "/icone-do-chat.png", // opcional
              });
            } else {
              toast.info(`Nova mensagem: ${mensagemTexto}`);
            }
          }
        }
      } else {
        setMensagens([]);
      }
    });

    return () => {
      unsubscribeChamado();
      unsubscribeMsgs();
    };
  }, [uid, chamadoId]);

  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const enviarMensagem = async () => {
    if (novaMensagem.trim() === "" || statusChamado.toLowerCase() === "fechado") return;
    setIsSending(true);
    const db = getDatabase();
    const mensagensRef = ref(db, `chamados/${uid}/${chamadoId}/mensagens`);
    try {
      await push(mensagensRef, {
        texto: novaMensagem.trim(),
        autor: "admin",
        timestamp: Date.now(),
      });
      setNovaMensagem("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setIsSending(false);
    }
  };

  const alterarStatus = async (novoStatus) => {
    const db = getDatabase();
    const chamadoRef = ref(db, `chamados/${uid}/${chamadoId}`);
    try {
      await update(chamadoRef, {
        status: novoStatus,
        atualizadoEm: Date.now(),
      });
      if (novoStatus.toLowerCase() === "fechado") {
        const mensagensRef = ref(db, `chamados/${uid}/${chamadoId}/mensagens`);
        await push(mensagensRef, {
          texto: "Este chamado foi encerrado pelo administrador.",
          autor: "sistema",
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const formatarData = (timestamp) => {
    const data = new Date(timestamp);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    if (data.toDateString() === hoje.toDateString()) {
      return data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (data.toDateString() === ontem.toDateString()) {
      return `Ontem ${data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case "aberto":
        return { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: AlertCircle, label: "Aberto" };
      case "andamento":
        return { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, label: "Em Andamento" };
      case "fechado":
        return { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle, label: "Fechado" };
      default:
        return { color: "bg-gray-50 text-gray-700 border-gray-200", icon: Clock, label: status };
    }
  };

  const getAutorInfo = (autor) => {
    switch (autor) {
      case "admin":
        return { name: "Administrador", avatar: "AD", color: "bg-gradient-to-br from-blue-500 to-blue-600", textColor: "text-white" };
      case "usuario":
        return {
          name: nome || "Usuário",
          avatar: nome ? nome.split(" ").map((n) => n[0]).join("").toUpperCase() : "US",
          color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
          textColor: "text-white",
        };
      case "sistema":
        return { name: "Sistema", avatar: "SY", color: "bg-gradient-to-br from-gray-500 to-gray-600", textColor: "text-white" };
      default:
        return { name: "Desconhecido", avatar: "??", color: "bg-gradient-to-br from-gray-400 to-gray-500", textColor: "text-white" };
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };
  const handleInputChange = (e) => {
    setNovaMensagem(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-blue-400 animate-ping mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-slate-700 font-medium">Carregando chat</p>
            <p className="text-slate-500 text-sm">Conectando ao chamado...</p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(statusChamado);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Card className="rounded-none border-x-0 border-t-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-slate-100"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <StatusIcon className="h-2.5 w-2.5 text-slate-600" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">
                    {titulo} - {protocolo}
                  </h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn("text-xs font-medium px-3 py-1", statusConfig.color)}>
                      <StatusIcon className="h-3 w-3 mr-1.5" />
                      {statusConfig.label}
                    </Badge>
                    <span className="text-xs text-slate-500">{nome}</span>
                  </div>
                  {descricao && <p className="text-sm text-slate-600 mt-1 max-w-xl">{descricao}</p>}
                  {prioridade && (
                    <Badge variant="secondary" className="text-xs font-semibold mt-2">
                      Prioridade: {prioridade}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                <MoreVertical className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-500" />
                <Select value={statusChamado} onValueChange={alterarStatus}>
                  <SelectTrigger className="w-44 border-slate-200 hover:border-slate-300 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aberto">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-emerald-600" />
                        Aberto
                      </div>
                    </SelectItem>
                    <SelectItem value="Andamento">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        Em Andamento
                      </div>
                    </SelectItem>
                    <SelectItem value="Fechado">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Fechado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="px-4 lg:px-6 py-6 space-y-6">
            {mensagens.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-600 font-medium">Nenhuma mensagem ainda</p>
                  <p className="text-slate-500 text-sm">Inicie a conversa enviando a primeira mensagem</p>
                </div>
              </div>
            ) : (
              mensagens.map((msg, index) => {
                const autorInfo = getAutorInfo(msg.autor);
                const isAdmin = msg.autor === "admin";
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-4 max-w-4xl mx-auto",
                      isAdmin ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isAdmin && (
                      <Avatar className={cn("flex-shrink-0", autorInfo.color)}>
                        <AvatarFallback className={autorInfo.textColor}>
                          {autorInfo.avatar}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "relative px-4 py-3 rounded-xl max-w-[65%] leading-tight whitespace-pre-wrap",
                        isAdmin ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"
                      )}
                    >
                      {msg.texto}
                      <time
                        className={cn(
                          "block text-xs opacity-70 absolute bottom-1 right-2",
                          isAdmin ? "text-blue-200" : "text-slate-400"
                        )}
                        dateTime={new Date(msg.timestamp).toISOString()}
                      >
                        {formatarData(msg.timestamp)}
                      </time>
                    </div>
                    {isAdmin && (
                      <Avatar className={cn("flex-shrink-0", autorInfo.color)}>
                        <AvatarFallback className={autorInfo.textColor}>
                          {autorInfo.avatar}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })
            )}
            <div ref={mensagensEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-slate-200 p-4 flex gap-2 bg-white">
          <Input
            ref={inputRef}
            placeholder={
              statusChamado.toLowerCase() === "fechado"
                ? "Chamado fechado, não é possível enviar mensagens"
                : "Digite uma mensagem"
            }
            value={novaMensagem}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={statusChamado.toLowerCase() === "fechado" || isSending}
            autoFocus
            rows={1}
            as="textarea"
            className="resize-none"
          />
          <Button
            onClick={enviarMensagem}
            disabled={novaMensagem.trim() === "" || statusChamado.toLowerCase() === "fechado" || isSending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AvaliacaoChamado
        uid={uid}
        chamadoId={chamadoId}
        statusChamado={statusChamado}
        avaliacao={avaliacao}
        onAvaliacaoSalva={() => {
          // Força atualização da avaliação no estado local
          const db = getDatabase();
          const chamadoRef = ref(db, `chamados/${uid}/${chamadoId}/avaliacao`);
          onValue(chamadoRef, (snapshot) => {
            setAvaliacao(snapshot.val());
          });
        }}
      />

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}
