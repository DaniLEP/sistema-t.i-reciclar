import { Link } from "react-router-dom";

const opcoesCadastro = [
  {
    id: "toner",
    titulo: "Consulta de Toner",
    descricao: "Gerencie cores, SKUs e impressoras para toners.",
    emoji: "🎨",
    rota: "/views-toners",
  },
  {
    id: "impressora",
    titulo: "Consulta de Impressora",
    descricao: "Gerencie impressoras designadas.",
    emoji: "🖨️",
    rota: "/views-impressora",
  },
  {
    id: "tablet",
    titulo: "Consulta de Tablet",
    descricao: "Controle seus tablets disponíveis e suas especificações.",
    emoji: "📱",
    rota: "/views-tablet",
  },
    {
    id: "notebook",
    titulo: "Consulta de Notebook",
    descricao: "Controle seus Notebooks disponíveis e suas especificações.",
    emoji: "💻",
    rota: "/views-notebooks",
  },
  {
    id: "Camera",
    titulo: "Consulta de Câmeras",
    descricao: "Gerencie as câmeras e seus periféricos.",
    emoji: "📷",
    rota: "/views-camera",
  },
  {
    id: "Mobiliário",
    titulo: "Consulta Mobiliária",
    descricao: "Controle os movéis e suas especificações.",
    emoji: "🏠",
    rota: "/view-mobiliaria",
  },
  {
    id: "Fone",
    titulo: "Consulte seus Fones de Ouvido",
    descricao:"Gerencie os Fones de Ouvidos do Instituto.",
    emoji: "🎧",
    rota: "/view-fone",
  },
  {
    id: "outro",
    titulo: "Voltar para Home",
    descricao: "Volte para a pagina anterior.",
    emoji: "↩️",
    rota: "/Home",
  },
];

export default function HomeViews() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6">
      <header className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-6xl font-bold text-white">Consulta de Equipamentos</h1>
        <p className="text-white mt-2"> Escolha uma opção abaixo que deseja visualizar.</p>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {opcoesCadastro.map(({ id, titulo, descricao, emoji, rota }) => (
          <Link key={id} to={rota}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 flex flex-col items-center cursor-pointer">
            <div className="text-6xl mb-4">{emoji}</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">{titulo}</h2>
            <p className="text-gray-600 text-center">{descricao}</p>
          </Link>
        ))}
      </main>
    </div>
  );
}
