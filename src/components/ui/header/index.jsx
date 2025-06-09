import { Menu } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../../../firebase";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/"));
  };

  return (
    <header className="flex items-center justify-between bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 text-white p-4 shadow">
      <div className="flex items-center gap-2">
        <img src="./Logo.png" alt=""  className="w-[230px] sm:w-[230px]" />
      </div>
      <button
        onClick={handleLogout}
        className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600"
      >
        Exit
      </button>
    </header>
  );
}
