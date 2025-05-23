import Header from "../../components/ui/header/index";
import Footer from "../../components/ui/footer/index";
import { useNavigate } from "react-router-dom";
import { ClipboardList, FolderKanban, FilePlus2 } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Cadastro",
      icon: <FilePlus2 className="w-10 h-10 text-blue-700" />,
      onClick: () => navigate("/register-option"),
    },
    {
      title: "Dashboard",
      icon: <FolderKanban className="w-10 h-10 text-green-700" />,
      onClick: () => navigate("/dashboard"),
    },
    {
      title: "Chamados",
      icon: <ClipboardList className="w-10 h-10 text-red-700" />,
      onClick: () => navigate("/chamados"),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              onClick={card.onClick}
              className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                {card.icon}
                <h2 className="text-lg font-semibold">{card.title}</h2>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
