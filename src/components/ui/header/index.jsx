import { Menu } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../../../firebase";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/login"));
  };

  return (
    <header className="flex items-center justify-between bg-blue-700 text-white p-4 shadow">
      <div className="flex items-center gap-2">
        <Menu className="w-6 h-6 md:hidden" />
        <h1 className="text-xl font-bold">Sistema de T.I</h1>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600"
      >
        Sair
      </button>
    </header>
  );
}
