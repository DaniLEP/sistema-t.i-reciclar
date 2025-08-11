import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue, update } from "firebase/database";

import {
  Search,
  Filter,
  Eye,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ListaChamadosWeb = () => {
  const [chamados, setChamados] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [fechandoChamadoId, setFechandoChamadoId] = useState(null);
  const navigate = useNavigate();

  // Guardar estado anterior para detectar novidades
  const chamadosPrevRef = useRef({}); // { `${uid}_${id}`: chamadoData }

  // Capitaliza a primeira letra da string
  const capitalize = (str) => {
    if (typeof str !== "string" || str.length === 0) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Normaliza o status para minúsculas
  const normalizeStatus = (status) =>
    typeof status === "string" ? status.toLowerCase() : "";

  useEffect(() => {
    const db = getDatabase();
    const chamadosRef = ref(db, "chamados");

    const unsubscribe = onValue(chamadosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = [];

        Object.entries(data).forEach(([uid, chamadosUsuario]) => {
          Object.entries(chamadosUsuario).forEach(([id, chamado]) => {
            const normalizedStatus = normalizeStatus(chamado.status);
            const updatedAt = chamado.updatedAt || chamado.atualizadoEm || chamado.criadoEm || 0;
            lista.push({
              uid,
              id,
              ...chamado,
              status: normalizedStatus,
              updatedAt,
            });
          });
        });

        // Ordena por updatedAt descendente
        lista.sort((a, b) => b.updatedAt - a.updatedAt);

        // Detectar novos chamados e novas mensagens
        lista.forEach((chamado) => {
          const key = `${chamado.uid}_${chamado.id}`;
          const chamadoPrev = chamadosPrevRef.current[key];

          // Novo chamado
          if (!chamadoPrev) {
            toast.info(`Novo chamado: ${chamado.titulo || chamado.id}`, {
              position: "top-right",
              autoClose: 5000,
            });
          } else {
            // Verificar se updatedAt mudou — sinaliza mensagem nova
            if (chamado.updatedAt > chamadoPrev.updatedAt) {
              // Evitar notificar se só mudou status, mas podemos aprimorar depois
              toast.success(
                `Novo update no chamado ${chamado.titulo || chamado.id}`,
                {
                  position: "top-right",
                  autoClose: 5000,
                }
              );
            }
          }
        });

        // Atualiza estado e ref anterior
        setChamados(lista);
        chamadosPrevRef.current = lista.reduce((acc, chamado) => {
          acc[`${chamado.uid}_${chamado.id}`] = chamado;
          return acc;
        }, {});
      } else {
        setChamados([]);
        chamadosPrevRef.current = {};
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fecharChamado = async (id, uid) => {
    setFechandoChamadoId(id);
    try {
      const db = getDatabase();
      const chamadoRef = ref(db, `chamados/${uid}/${id}`);
      await update(chamadoRef, {
        status: "Resolvido",
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Erro ao fechar chamado:", error);
    } finally {
      setFechandoChamadoId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "aberto":
        return <AlertCircle className="h-4 w-4" />;
      case "andamento":
        return <Clock className="h-4 w-4" />;
      case "Resolvido":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "aberto":
        return "destructive";
      case "andamento":
        return "default";
      case "Resolvido":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const chamadosFiltrados = chamados.filter((chamado) => {
    const matchesStatus =
      filtroStatus === "todos" || chamado.status === filtroStatus;
    const matchesSearch =
      (chamado.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chamado.criadoPor || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chamado.nome || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusCount = (status) => {
    if (status === "todos") return chamados.length;
    return chamados.filter((ch) => ch.status === status).length;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chamados</h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe todos os chamados de suporte
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate("/dashboard-chamados")}
            >
              Ir para Dashboard
            </Button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              aria-label="Buscar chamados"
              placeholder="Buscar chamados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { status: "todos", label: "Total", color: "bg-blue-500" },
            { status: "aberto", label: "Abertos", color: "bg-red-500" },
            { status: "andamento", label: "Em Andamento", color: "bg-yellow-500" },
            { status: "Resolvido", label: "Resolvido", color: "bg-green-500" },
          ].map(({ status, label, color }) => (
            <Card
              key={status}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setFiltroStatus(status)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") setFiltroStatus(status);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{getStatusCount(status)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={filtroStatus} onValueChange={setFiltroStatus}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="todos" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Todos ({getStatusCount("todos")})
                </TabsTrigger>
                <TabsTrigger value="aberto" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Abertos ({getStatusCount("aberto")})
                </TabsTrigger>
                <TabsTrigger value="andamento" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Em Andamento ({getStatusCount("andamento")})
                </TabsTrigger>
                <TabsTrigger value="Resolvido" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Resolvidos ({getStatusCount("Resolvido")})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={filtroStatus} className="mt-6">
                {chamadosFiltrados.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum chamado encontrado</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Tente ajustar sua busca" : "Não há chamados para exibir"}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Protocolo</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Prioridade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Criado por</TableHead>
                          <TableHead>Última atualização</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {chamadosFiltrados.map((chamado) => (
                          <TableRow
                            key={`${chamado.uid}_${chamado.id}`}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="text-sm text-muted-foreground">
                              {chamado.protocolo || "-"}
                            </TableCell>

                            <TableCell>
                              <div>
                                <p className="font-medium">{chamado.titulo}</p>
                                {chamado.descricao && (
                                  <p className="text-sm text-muted-foreground truncate max-w-xs">
                                    {chamado.descricao}
                                  </p>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>{chamado.categoria || "-"}</TableCell>
                            <TableCell>{chamado.prioridade || "-"}</TableCell>

                            <TableCell>
                              <Badge
                                variant={getStatusVariant(chamado.status)}
                                className="flex items-center gap-1 w-fit"
                              >
                                {getStatusIcon(chamado.status)}
                                {capitalize(chamado.status)}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {chamado.nome || chamado.criadoPor || "Desconhecido"}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {formatDate(chamado.updatedAt)}
                              </div>
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    navigate(`/admin/chat/${chamado.uid}/${chamado.id}`)
                                  }
                                  className="flex items-center gap-1"
                                  aria-label={`Ver detalhes do chamado ${chamado.protocolo || chamado.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                  Ver
                                </Button>

                                {chamado.status !== "Resolvido" && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        disabled={fechandoChamadoId === chamado.id}
                                      >
                                        <X className="h-4 w-4" />
                                        {fechandoChamadoId === chamado.id
                                          ? "Fechando..."
                                          : "Fechar"}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Fechar chamado</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja fechar este chamado? Esta ação não pode ser
                                          desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => fecharChamado(chamado.id, chamado.uid)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Fechar chamado
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ListaChamadosWeb;
