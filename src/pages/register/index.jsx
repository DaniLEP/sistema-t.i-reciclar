import { Link } from "react-router-dom";

const opcoesCadastro = [
  {
    id: "toner",
    titulo: "Cadastro de Toner",
    descricao: "Gerencie cores, SKUs e impressoras para toners.",
    emoji: "🖨️",
    rota: "/register-toner",
  },
  {
    id: "impressora",
    titulo: "Cadastro de Impressora",
    descricao: "Adicione e gerencie impressoras designadas.",
    emoji: "🖥️",
    rota: "/register-tablet",
  },
  {
    id: "tablet",
    titulo: "Cadastro de Tablet",
    descricao: "Controle seus tablets disponíveis e suas especificações.",
    emoji: "📱",
    rota: "/register-equipament",
  },
  {
    id: "outro",
    titulo: "Outro Cadastro",
    descricao: "Adicione novos tipos de cadastro conforme necessidade.",
    emoji: "↩️",
    rota: "/",
  },
];

export default function HomeRegister() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-5xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Sistema de Cadastros</h1>
        <p className="text-gray-600 mt-2">
          Escolha uma opção abaixo para iniciar o cadastro.
        </p>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {opcoesCadastro.map(({ id, titulo, descricao, emoji, rota }) => (
          <Link
            key={id}
            to={rota}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 flex flex-col items-center cursor-pointer"
          >
            <div className="text-6xl mb-4">{emoji}</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">{titulo}</h2>
            <p className="text-gray-600 text-center">{descricao}</p>
          </Link>
        ))}
      </main>
    </div>
  );
}
