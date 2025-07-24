import { useEffect, useState, useRef } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "./firebase"; // ajuste o caminho

const CONEXAO_CONFIG = {
  online: "bg-green-500",
  offline: "bg-red-500",
  indefinido: "bg-gray-400",
};

export default function VisualizacaoImpressoras() {
  const [impressoras, setImpressoras] = useState([]);
  const ws = useRef(null);

  function atualizarStatus(ip, status) {
    setImpressoras((lista) =>
      lista.map((imp) => (imp.ip === ip ? { ...imp, conexao: status } : imp))
    );
  }

  useEffect(() => {
    const db = getDatabase(app);
    const impressorasRef = ref(db, "impressoras");

    const unsubscribe = onValue(impressorasRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setImpressoras([]);
        return;
      }
      const lista = Object.entries(data).map(([id, imp]) => ({
        id,
        ...imp,
        conexao: "indefinido",
      }));
      setImpressoras(lista);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (impressoras.length === 0) return;

    fetch("https://sistema-t-i-reciclar.onrender.com/")
      .then(() => {
        ws.current = new WebSocket("wss://sistema-t-i-reciclar.onrender.com");

        ws.current.onopen = () => {
          impressoras.forEach((imp) => {
            if (imp.ip) {
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
        };
      })
      .catch((err) => {
        console.error("Erro ao acordar servidor Render:", err);
      });

    return () => {
      if (ws.current) ws.current.close();
    };
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
