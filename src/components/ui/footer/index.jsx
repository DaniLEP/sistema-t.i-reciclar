import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { auth } from "../../../../firebase";

export default function Footer() {
  const [dateTime, setDateTime] = useState(dayjs().format("DD/MM/YYYY HH:mm"));
  const user = auth.currentUser;

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(dayjs().format("DD/MM/YYYY HH:mm"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 text-white text-sm p-3 flex justify-between items-center">
      <p>👤 Usuário: {user?.email || "Desconhecido"}</p>
      <p>📅 {dateTime}</p>
    </footer>
  );
}
