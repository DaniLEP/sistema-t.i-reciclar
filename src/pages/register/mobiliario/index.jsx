import { useState } from "react";
import { getDatabase, ref, push } from "firebase/database";
import { app } from "../../../../firebase";
import { motion } from "framer-motion";
import { Save, ArrowLeft, HouseIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input/input";

export default function CadastroMobiliario() {
  const [form, setForm] = useState({
    patrimonio: "", dataCadastro: "", descricao: "", projeto: "", NCM: "",
    vrbem: "", projetoEditalConvenio: "", ano: "",ambienteAtual: "", quantidade: "", notaFiscal: "", obs: "", fotoBase64: ""});

  const navigate = useNavigate();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {setForm((prev) => ({ ...prev, fotoBase64: reader.result })); };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {setForm({ ...form, [e.target.name]: e.target.value });};

  const handleSubmit = async (e) => {e.preventDefault();
    const db = getDatabase(app);
    const refMobiliario = ref(db, "moveis");
    try {await push(refMobiliario, form);
      alert("Mobiliário cadastrado com sucesso!");
      setForm({patrimonio: "", dataCadastro: "", descricao: "", projeto: "",  NCM: "",  vrbem: "", projetoEditalConvenio: "", ano: "",
        ambienteAtual: "", quantidade: "", notaFiscal: "", obs: "",  fotoBase64: "",}); } 
    catch (error) { alert("Erro ao cadastrar: " + error.message); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6">
      <motion.div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-10" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-8">
          <HouseIcon className="w-7 h-7 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-800">Cadastro de Mobiliário</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[ {/* Campos principais em loop */},
            { label: "Patrimônio", name: "patrimonio" },
            { label: "Descrição", name: "descricao" },
            { label: "Nota Fiscal", name: "notaFiscal" },
            { label: "Parceiro", name: "parceiro"},
            { label: "Quantidade", name: "quantidade" },
            { label: "Projeto-Edital-Convenio", name: "projetoEditalConvenio" },
            { label: "Observações", name: "obs", required: false },
          ].map(({ label, name, required = true }) => (
            <div key={name}><label className="block text-gray-700 font-medium mb-1">{label}</label>
              <input type="text" name={name} value={form[name]} onChange={handleChange} required={required}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
            </div>
          ))}
          {/* Data de Cadastro */}
          <div><label className="block text-gray-700 font-medium mb-1">Data de Cadastro</label>
            <input type="date" name="dataCadastro" value={form.dataCadastro} onChange={handleChange}  required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          {/* Ano */}
          <div><label className="block text-gray-700 font-medium mb-1">Ano</label>
            <select name="ano" value={form.ano} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" >
              <option value="" disabled>Selecione o ano</option>
              {Array.from({ length: 30 }, (_, i) => {const year = 2010 + i; return <option key={year} value={year}>{year}</option>;})}
            </select>
          </div>
          {/* Projeto */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Projeto</label>
            <select name="projeto" value={form.projeto} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
              <option value="" disabled>Selecione o projeto</option>
              <option value="FUMCAD">FUMCAD</option>
              <option value="CONDECA">CONDECA</option>
              <option value="INSTITUTO RECICLAR">INSTITUTO RECICLAR</option>
              <option value="DOACAO">DOAÇÃO</option>
            </select>
          </div>
          {/* NCM */}
          <div><label className="block text-gray-700 font-medium mb-1">NCM</label>
            <input type="text" name="NCM" value={form.NCM} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
          </div>
          {/* VR-BEM */}
          <div><label className="block text-gray-700 font-medium mb-1">VR-BEM</label>
            <input type="text"name="vrbem" value={form.vrbem} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          {/* Ambiente Atual */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Ambiente Atual</label>
            <input type="text" name="ambienteAtual" value={form.ambienteAtual} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          {/* Upload de Imagem */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Foto do Mobiliário</label>
            <Input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-700"/>
            {form.fotoBase64 && (<img src={form.fotoBase64} alt="Prévia da foto"  className="mt-3 max-w-xs max-h-48 rounded-md object-contain border" />)}
          </div>
          {/* Botões */}
          <motion.button whileTap={{ scale: 0.97 }} type="submit"
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg text-sm shadow-md transition">
            <Save className="w-5 h-5" />  Cadastrar Mobiliário
          </motion.button>

          <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={() => navigate("/register-option")}
            className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg text-sm shadow-md transition" >
            <ArrowLeft className="w-5 h-5" /> Voltar
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
