import { Link } from "react-router-dom";

const opcoesCadastro = [
  {
    id: "toner",
    titulo: "Cadastro de Toner",
    descricao: "Cadastre cores, SKUs e impressoras para toners.",
    emoji: "🎨",
    rota: "/register-toner",
  },
  {
    id: "impressora",
    titulo: "Cadastro de Impressora",
    descricao: "Cadastre impressoras designadas.",
    emoji: "🖨️",
    rota: "/register-impressora",
  },
  {
    id: "tablet",
    titulo: "Cadastro de Tablet",
    descricao: "Cadastre seus tablets disponíveis e suas especificações.",
    emoji: "📱",
    rota: "/register-tablet",
  },
  {
    id: "notebook",
    titulo: "Cadastro de Notebook",
    descricao: "Cadastre seus Notebooks disponíveis e suas especificações.",
    emoji: "💻",
    rota: "/register-notebook",
  },
  {
    id: "Mobiliário",
    titulo: "Cadastro de Mobiliário",
    descricao: "Cadastre os movéis e suas especificações.",
    emoji: "🏠",
    rota: "/register-mobiliaria",
  },
  {
    id: "Camera",
    titulo: "Cadastro de Câmeras",
    descricao: "Cadastre câmeras e seus periféricos.",
    emoji: "📷",
    rota: "/register-camera",
  },
    {
    id: "Fone",
    titulo: "Cadastro de Fone de Ouvido",
    descricao: "Cadastre fones de ouvidos.",
    emoji: "🎧",
    rota: "/register-fone",
  },
  {
    id: "outro",
    titulo: "Outro Cadastro",
    descricao: "Adicione novos tipos de cadastro conforme necessidade.",
    emoji: "↩️",
    rota: "/Home",
  },
];

export default function HomeRegister() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6">
      <header className="max-w-5xl mx-auto mb-10 text-center">
        <h1 className="text-6xl font-bold text-white">Cadastros de Equipamentos </h1>
        <p className="text-white mt-2">Escolha uma opção abaixo para iniciar o cadastro.</p>
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
