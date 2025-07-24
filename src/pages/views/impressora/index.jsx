import { useEffect, useState, useRef } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../../../firebase"; // ajuste o caminho

const CONEXAO_CONFIG = {
  online: "bg-green-500",
  offline: "bg-red-500",
  indefinido: "bg-gray-400",
};

export default function VisualizacaoImpressoras() {
  const [impressoras, setImpressoras] = useState([]);
  const ws = useRef(null);
  const isWsOpen = useRef(false);
  const impressorasRef = useRef([]);
  const statusCache = useRef({}); // Guarda status atual para evitar atualizações desnecessárias

  useEffect(() => {
    const db = getDatabase(app);
    const impressorasRefDB = ref(db, "impressoras");

    const unsubscribe = onValue(impressorasRefDB, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setImpressoras([]);
        statusCache.current = {};
        return;
      }

      const lista = Object.entries(data).map(([id, imp]) => ({
        id,
        ...imp,
        conexao: "indefinido",
        status: "indefinido",
      }));

      setImpressoras(lista);
      statusCache.current = {}; // Resetar cache de status quando a lista muda
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    impressorasRef.current = impressoras;
  }, [impressoras]);

  // Atualiza status apenas se for diferente do atual para evitar flickering
  function atualizarStatus(ip, status) {
    if (statusCache.current[ip] === status) return; // status igual, não atualiza
    statusCache.current[ip] = status;

    setImpressoras((lista) =>
      lista.map((imp) =>
        imp.ip === ip ? { ...imp, conexao: status, status: status } : imp
      )
    );
  }

  // Criar e gerenciar WebSocket
  useEffect(() => {
    // Acordar servidor e abrir WS
    fetch("http://192.168.1.146:4000")
      .then(() => {
        ws.current = new WebSocket("ws://192.168.1.146:4000");

        ws.current.onopen = () => {
          console.log("WS conectado");
          isWsOpen.current = true;

          // Enviar IPs só dos que não têm status definido (ou indefinido)
          impressorasRef.current.forEach((imp) => {
            if (
              imp.ip &&
              (imp.conexao === "indefinido" || !statusCache.current[imp.ip]) &&
              ws.current.readyState === WebSocket.OPEN
            ) {
              ws.current.send(JSON.stringify({ ip: imp.ip }));
            }
          });
        };

        ws.current.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.ip && msg.status) {
              atualizarStatus(msg.ip, msg.status);
            }
          } catch (error) {
            console.error("Erro ao processar mensagem WS:", error);
          }
        };

        ws.current.onerror = (error) => {
          console.error("WebSocket erro:", error);
        };

        ws.current.onclose = () => {
          console.log("WebSocket fechado");
          isWsOpen.current = false;
        };
      })
      .catch((err) => {
        console.error("Erro ao acordar servidor:", err);
      });

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  // Reenvia IPs para atualizar status somente se WS estiver aberto e IP ainda não for conhecido
  useEffect(() => {
    if (!isWsOpen.current || !ws.current || ws.current.readyState !== WebSocket.OPEN)
      return;

    impressoras.forEach((imp) => {
      if (
        imp.ip &&
        (imp.conexao === "indefinido" || !statusCache.current[imp.ip])
      ) {
        ws.current.send(JSON.stringify({ ip: imp.ip }));
      }
    });
  }, [impressoras]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {impressoras.map((imp) => (
        <div
          key={imp.id}
          className={`rounded-xl p-4 shadow-md text-white ${
            CONEXAO_CONFIG[imp.conexao.toLowerCase()] || "bg-gray-400"
          }`}
        >
          <p>
            <strong>IP:</strong> {imp.ip || "Não informado"}
          </p>
          <p>
            <strong>Status:</strong> {imp.status || "Indefinido"}
          </p>
          <p>
            <strong>Conexão:</strong> {imp.conexao}
          </p>
        </div>
      ))}
    </div>
  );
}
