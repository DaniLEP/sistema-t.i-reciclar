import { useState } from "react";
import { getDatabase, ref, push } from "firebase/database";
import { app } from "../../../../firebase";
import { motion } from "framer-motion";
import { Printer, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input/input";

export default function CadastroImpressora() {
  const [form, setForm] = useState({ patrimonio: "", marca: "", modelo: "", tipoCor: "",
    notaFiscal: "", local: "", fotoBase64: "", obs: "",  projeto: "",  dataCadastro: "", NCM: "", vrbem: "", parceiro: "", projetoEditalConvenio: "", ano: "" });
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const db = getDatabase(app);
  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value });};
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {setForm((prev) => ({ ...prev, fotoBase64: reader.result }));
      setPreview(reader.result);
    }; reader.readAsDataURL(file); 
  };

  const handleSubmit = async (e) => {e.preventDefault();
    try {const impressoraRef = ref(db, "impressoras");
      await push(impressoraRef, form);
      alert("Impressora cadastrada com sucesso!");
      setForm({patrimonio: "", marca: "", modelo: "", tipoCor: "", notaFiscal: "", local: "", fotoBase64: "", obs: "", projeto: "", 
        dataCadastro: "", NCM: "", vrbem: "", parceiro: "", projetoEditalConvenio: "", ano: "" });
      setPreview(null);
    } catch (error) {alert("Erro ao cadastrar: " + error.message);}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6">
      <motion.div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-10"
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} >
        <div className="flex items-center gap-3 mb-8"><Printer className="w-7 h-7 text-indigo-600" />
          <h2 className="text-4xl text-center font-bold text-gray-800">Cadastro de Impressora </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: "Patrimônio", name: "patrimonio" },
            { label: "Marca", name: "marca" },
            { label: "Modelo", name: "modelo" },
            { label: "Especificação de Cor", name: "tipoCor" },
            { label: "Nota Fiscal", name: "notaFiscal" },
            { label: "Parceiro", name: "parceiro" },
            { label: "Local", name: "local" },
            ].map((field) => (<div key={field.name}>
              <label className="block text-gray-700 font-medium mb-1">{field.label}</label>
              <input type="text" name={field.name}value={form[field.name]}  onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
          ))}
          {/* Data de Cadastro */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Data de Cadastro</label>
            <input type="date" name="dataCadastro" value={form.dataCadastro} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
          </div>
          {/* Ano */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Ano</label>
            <select name="ano"value={form.ano} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
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
          <div>
            <label className="block text-gray-700 font-medium mb-1">NCM</label>
            <input type="text" name="NCM" value={form.NCM} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
          </div>
          {/* VR-BEM */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">VR-BEM</label>
            <input type="text" name="vrbem"value={form.vrbem} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          {/* FOTO */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Foto da Impressora</label>
            <Input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
            {preview && (<img src={preview}  alt="Preview"  className="mt-2 max-h-48 rounded-md object-contain border border-gray-300"/> )}
          </div>
          <motion.button whileTap={{ scale: 0.97 }} type="submit"
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg text-sm shadow-md transition" > 
             <Save className="w-5 h-5" /> Cadastrar Impressora
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={() => navigate("/register-option")}
            className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg text-sm shadow-md transition">
              <ArrowLeft className="w-5 h-5" />Voltar
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
