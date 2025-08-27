import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import jsPDF from "jspdf";
import { Printer, Save, Trash } from "lucide-react";

function TermoEmprestimo({ collectionName = "loans", organizationName = "INSTITUTO RECICLAR" }) {
  const today = new Date().toISOString().slice(0, 10);
  const imgBase = window.location.origin;

  const [data, setData] = useState({
    solicitante: "",
    telefone: "",
    numeroPatrimonial: "",
    tipoEquipamento: "",
    dataEntrega: today,
    objetivoUso: "",
    problemasDescricao: "",
    cidade: "São Paulo",
    termoAceito: false,
    email: "",
    cpf: "",
    setor: "",
    observacoes: "",
    estadoEquipamento: "perfeito",
    estadoPerfeito: false,
    estadoProblemas: false
  });

  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (error) setError(null);
    if (successMessage) setSuccessMessage("");
  };

  const validateForm = () => {
    const errors = [];
    if (!data.solicitante.trim()) errors.push("Nome do solicitante é obrigatório");
    if (!data.telefone.trim()) errors.push("Telefone é obrigatório");
    if (!data.email.trim()) errors.push("Email é obrigatório");
    if (!data.cpf.trim()) errors.push("CPF é obrigatório");
    if (!data.tipoEquipamento.trim()) errors.push("Tipo de equipamento é obrigatório");
    if (!data.numeroPatrimonial.trim()) errors.push("Número patrimonial é obrigatório");
    if (!data.objetivoUso.trim()) errors.push("Objetivo de uso é obrigatório");
    if (!data.termoAceito) errors.push("É necessário aceitar o termo de responsabilidade");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) errors.push("Email deve ter um formato válido");

    const phoneRegex = /^[\d\s\-]+$/;
    if (data.telefone && !phoneRegex.test(data.telefone)) errors.push("Telefone deve conter apenas números e caracteres válidos");

    return errors;
  };

  const salvar = async () => {
    setError(null);
    setSuccessMessage("");
    const validationErrors = validateForm();
    if (validationErrors.length > 0) { setError(validationErrors.join(", ")); return; }
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() });
      setSavedId(docRef.id);
      setSuccessMessage("Termo salvo com sucesso! ID: " + docRef.id);
    } catch (e) { console.error(e); setError("Erro ao salvar o termo: " + e.message); }
    finally { setSaving(false); }
  };

  const resetForm = () => {
    setData({
      solicitante:"", telefone:"", numeroPatrimonial:"", tipoEquipamento:"", dataEntrega:today,
      objetivoUso:"", problemasDescricao:"", cidade:"São Paulo",
      termoAceito:false, email:"", cpf:"", setor:"", observacoes:"", estadoEquipamento:"perfeito",
      estadoPerfeito:false, estadoProblemas:false
    });
    setError(null);
    setSuccessMessage("");
    setSavedId(null);
  };

  const loadImage = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "________________") return "________________";
    const date = new Date(dateStr);
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return date.toLocaleDateString("pt-BR", options);
  };

  const exportPDF = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const M = 36;
    const HEADER_Y = 28;
    const HEADER_LEFT_H = 40;
    const HEADER_LEFT_MAX_W = 200;
    const HEADER_RIGHT_H = 34;
    const HEADER_RIGHT_MAX_W = 120;
    const FOOTER_IMG_H = 150;  
    const FOOTER_IMG_MAX_W = 270;
    const HEADER_BOTTOM_MARGIN = 28;

    const logoLeft = await loadImage(`${imgBase}/Reciclar_30anos_Horizontal_Positivo.png`);
    const logoRight = await loadImage(`${imgBase}/seloAtualizado.png`);
    const footerImg = await loadImage(`${imgBase}/selo.png`);

    const getDimByHeight = (image, targetH, maxW = 9999) => {
      const ratio = (image.width || 1) / (image.height || 1);
      let w = targetH * ratio;
      if (w > maxW) w = maxW;
      const h = w / ratio;
      return { w, h };
    };

    // Header
    const leftDim = getDimByHeight(logoLeft, HEADER_LEFT_H, HEADER_LEFT_MAX_W);
    doc.addImage(logoLeft, "PNG", M, HEADER_Y, leftDim.w, leftDim.h);
    const rightDim = getDimByHeight(logoRight, HEADER_RIGHT_H, HEADER_RIGHT_MAX_W);
    const rightX = pageW - M - rightDim.w;
    const rightY = HEADER_Y + Math.max(0, (leftDim.h - rightDim.h) / 2);
    doc.addImage(logoRight, "PNG", rightX, rightY, rightDim.w, rightDim.h);

    let y = HEADER_Y + Math.max(leftDim.h, rightDim.h) + HEADER_BOTTOM_MARGIN;

    // Títulos centrais
    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text("TERMO DE RESPONSABILIDADE", pageW / 2, y, { align: "center" });
    y += 18;
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    doc.text("EMPRÉSTIMO DE EQUIPAMENTO", pageW / 2, y, { align: "center" });
    y += 26;

    const drawField = (label, value) => {
      doc.rect(M, y - 2, pageW - 2 * M, 18);
      doc.text(`${label} ${value}`, M + 6, y + 12);
      y += 22;
    };

    // Dados do Solicitante
    doc.setFont("helvetica", "bold");
    doc.text("Dados do Solicitante", M, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    drawField("Nome:", data.solicitante);
    drawField("Telefone:", data.telefone);
    drawField("Email:", data.email);
    drawField("CPF:", data.cpf);
    drawField("Setor/Departamento:", data.setor);

    // Espaço extra antes do título "Dados do Equipamento"
    y += 16;

    // Dados do Equipamento
    doc.setFont("helvetica", "bold");
    doc.text("Dados do Equipamento", M, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    drawField("Número Patrimonial:", data.numeroPatrimonial);
    drawField("Tipo de Equipamento:", data.tipoEquipamento);
    drawField("Data Entrega:", formatDate(data.dataEntrega));
    drawField("Data Devolução:", "________________"); // campo vazio
    drawField("Objetivo de Uso:", data.objetivoUso);
    drawField("Estado do Equipamento:", data.estadoEquipamento);
    drawField("Descrição de problemas:", data.problemasDescricao);
    drawField("Observações adicionais:", data.observacoes);

    // Declaração detalhada
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Declaro, para os devidos fins:", M, y);
    y += 16;
    doc.setFont("helvetica", "normal");

    const lines = [
      "• Ter recebido o equipamento, para meu uso e gozo;",
      "• Que irei utilizar o equipamento com cuidado e zelo;",
      "• Ter verificado, antes da retirada, que o equipamento se encontrava:"
    ];
    lines.forEach(line => { doc.text(line, M + 12, y); y += 14; });

    // Checkboxes
    const checkboxX = M + 12;
    doc.rect(checkboxX, y, 10, 10);
    if(data.estadoPerfeito) doc.line(checkboxX, y, checkboxX + 10, y + 10); 
    doc.text("Em perfeitas condições de uso e bom estado de conservação", checkboxX + 20, y + 10);
    y += 18;

    doc.rect(checkboxX, y, 10, 10);
    if(data.estadoProblemas) doc.line(checkboxX, y, checkboxX + 10, y + 10);
    doc.text("Com os seguintes problemas e/ou danos (descrevê-los):", checkboxX + 20, y + 10);
    y += 18;

    // Espaço para descrição
    const descWidth = pageW - 2*M - 24;
    doc.rect(M + 24, y, descWidth, 45);
    y += 62;
    if(data.problemasDescricao) doc.text(data.problemasDescricao, M + 28, y - 40);

    // Outras linhas da declaração
    const otherLines = [
      "• Não irei alterar a instalação e/ou configuração do equipamento;",
      "• Comunicarei de imediato à RECICLAR eventuais defeitos que forem identificados no equipamento;"
    ];
    otherLines.forEach(line => { doc.text(line, M + 12, y); y += 14; });

    const longText = "• Devolverei o equipamento à RECICLAR no prazo previsto ou até 5 dias de quando for por esta requisição, em idênticas condições e em uso, devendo reparar danos identificados.";
    const maxWidth = pageW - 2 * M - 12; 
    const splitText = doc.splitTextToSize(longText, maxWidth);
    splitText.forEach(line => { doc.text(line, M + 12, y); y += 14; });

    // Assinatura centralizada
    y += 15;
    doc.text(`São Paulo, _____ de _________________ de _______`, pageW / 2, y, { align: "center" }); y += 16;
    doc.text("_________________________________", pageW / 2, y, { align: "center" }); y += 14;
    doc.text("(Assinatura do Responsável)", pageW / 2, y, { align: "center" });

    // Footer
    const footerDim = getDimByHeight(footerImg, FOOTER_IMG_H, FOOTER_IMG_MAX_W);
    const footerY = pageH - M - footerDim.h;
    doc.addImage(footerImg, "PNG", M, footerY, footerDim.w, footerDim.h);

    doc.save(`termo_emprestimo_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="mx-auto max-w-4xl bg-white text-gray-900 shadow-lg rounded-lg p-4 md:p-6">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between border-b-2 border-gray-300 pb-4 mb-1">
        <img src={`${imgBase}/Reciclar_30anos_Horizontal_Positivo.png`} alt="Logo esquerda" className="h-10 object-contain" />
        <div className="text-center">
          <h1 className="text-2xl font-bold uppercase text-gray-800 mb-1">TERMO DE RESPONSABILIDADE</h1>
          <h2 className="text-lg uppercase text-gray-600">EMPRÉSTIMO DE EQUIPAMENTO</h2>
        </div>
        <img src={`${imgBase}/seloAtualizado.png`} alt="Logo direita" className="h-10 object-contain" />
      </header>

      {/* Formulário */}
      <div className="space-y-4">
        {/* Dados do Solicitante */}
        <div className="bg-gray-50 p-2 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Dados do Solicitante</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input placeholder="Nome completo *" name="solicitante" value={data.solicitante} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
            <input placeholder="Telefone *" name="telefone" value={data.telefone} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
            <input placeholder="Email *" name="email" type="email" value={data.email} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
            <input placeholder="CPF *" name="cpf" value={data.cpf} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
            <input placeholder="Setor/Departamento" name="setor" value={data.setor} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full md:col-span-2" />
          </div>
        </div>

        {/* Dados do Equipamento */}
        <div className="bg-gray-50 p-2 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Dados do Equipamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <input placeholder="Número Patrimonial *" name="numeroPatrimonial" value={data.numeroPatrimonial} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
            <input placeholder="Tipo de Equipamento *" name="tipoEquipamento" value={data.tipoEquipamento} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full md:col-span-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-2 mb-2">
            <input type="date" name="dataEntrega" value={data.dataEntrega} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
          </div>
          <textarea placeholder="Objetivo de uso *" name="objetivoUso" value={data.objetivoUso} onChange={handleChange} rows="2" className="border-2 border-gray-300 rounded-md p-2 w-full mb-2" />
          <div className="space-y-1 mb-2">
            <label className="flex items-center gap-2"><input type="radio" name="estadoEquipamento" value="perfeito" checked={data.estadoEquipamento==="perfeito"} onChange={handleChange} />Em perfeitas condições</label>
            <label className="flex items-center gap-2"><input type="radio" name="estadoEquipamento" value="com_problemas" checked={data.estadoEquipamento==="com_problemas"} onChange={handleChange} />Com problemas</label>
            {data.estadoEquipamento==="com_problemas" && <textarea placeholder="Descrição dos problemas" name="problemasDescricao" value={data.problemasDescricao} onChange={handleChange} rows="2" className="border-2 border-gray-300 rounded-md p-2 w-full" />}
          </div>
          <textarea placeholder="Observações adicionais" name="observacoes" value={data.observacoes} onChange={handleChange} rows="1" className="border-2 border-gray-300 rounded-md p-2 w-full" />
        </div>

        {/* Declarações */}
        <div className="text-sm bg-blue-50 border-2 border-blue-200 rounded-lg p-3 leading-relaxed">
          <p className="mb-2 font-semibold text-gray-800">Declaro:</p>
          <ol className="list-[lower-roman] pl-4 space-y-1 text-gray-700">
            <li>Recebi o equipamento e cuidarei dele;</li>
            <li>Não alterarei instalação/configuração;</li>
            <li>Informarei ao {organizationName} sobre defeitos;</li>
            <li>Devolverei em condições originais no prazo;</li>
            <li>Assumo responsabilidade pelo equipamento.</li>
          </ol>
        </div>

        {/* Local e aceite */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          <input placeholder="Cidade" name="cidade" value={data.cidade} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
          <label className="flex items-center gap-2 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-2 cursor-pointer">
            <input type="checkbox" name="termoAceito" checked={data.termoAceito} onChange={handleChange} className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm">Declaro que li e aceito todos os termos</span>
          </label>
        </div>

        {/* Assinatura manual */}
        <div className="border-t-2 border-gray-600 mt-4 pt-4 mb-6 text-left">
          <p className="text-sm mb-1">Assinatura do Responsável: ____________________________________________</p>
          <p className="text-xs text-gray-500">(Assinatura manual, à caneta)</p>
        </div>

        {/* Botões */}
<div className="flex flex-wrap gap-2 mb-2 print-hidden">
  <button
    onClick={salvar}
    disabled={saving}
    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
  >
    <Save className="w-4 h-4" />
    {saving ? "Salvando..." : "Salvar Termo"}
  </button>

  <button
    onClick={exportPDF}
    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
  >
    <Printer className="w-4 h-4" />
    Imprimir Termo
  </button>

  <button
    onClick={resetForm}
    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
  >
    <Trash  className="w-4 h-4" />
    Limpar Formulário
  </button>
</div>

        {/* Mensagens */}
        {successMessage && <div className="bg-green-100 border-2 border-green-300 text-green-800 px-2 py-2 rounded-lg mb-2 text-sm">{successMessage}</div>}
        {error && <div className="bg-red-100 border-2 border-red-300 text-red-800 px-2 py-2 rounded-lg mb-2 text-sm">{error}</div>}
      </div>

      {/* Footer visual */}
      <footer className="mt-2 border-t-2 border-gray-300 pt-2 text-sm flex gap-4">
        <img src={`${imgBase}/selo.png`} alt="Logo rodapé" className="h-24 object-contain" />
      </footer>
    </div>
  );
}

export default TermoEmprestimo;


//   import { useState } from "react";
//   import { addDoc, collection, serverTimestamp } from "firebase/firestore";
//   import { db } from "../../../firebase";
//   import jsPDF from "jspdf";

//   function TermoEmprestimo({ collectionName = "loans", organizationName = "INSTITUTO RECICLAR" }) {
//     const today = new Date().toISOString().slice(0, 10);
//     const imgBase = typeof window !== "undefined" ? window.location.origin : "";

//     const [data, setData] = useState({
//       solicitante: "",
//       telefone: "",
//       numeroPatrimonial: "",
//       tipoEquipamento: "",
//       dataEntrega: today,
//       dataDevolucao: "", // Devolução começa vazia
//       objetivoUso: "",
//       problemasDescricao: "",
//       cidade: "São Paulo",
//       termoAceito: false,
//       email: "",
//       cpf: "",
//       setor: "",
//       observacoes: "",
//       estadoEquipamento: "perfeito",
//     });

//     const [saving, setSaving] = useState(false);
//     const [error, setError] = useState(null);
//     const [successMessage, setSuccessMessage] = useState("");

//     const handleChange = (e) => {
//       const { name, value, type, checked } = e.target;
//       setData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
//       setError(null);
//       setSuccessMessage("");
//     };

//     const validateForm = () => {
//       const errors = [];
//       if (!data.solicitante.trim()) errors.push("Nome do solicitante é obrigatório");
//       if (!data.telefone.trim()) errors.push("Telefone é obrigatório");
//       if (!data.email.trim()) errors.push("Email é obrigatório");
//       if (!data.cpf.trim()) errors.push("CPF é obrigatório");
//       if (!data.tipoEquipamento.trim()) errors.push("Tipo de equipamento é obrigatório");
//       if (!data.numeroPatrimonial.trim()) errors.push("Número patrimonial é obrigatório");
//       if (!data.objetivoUso.trim()) errors.push("Objetivo de uso é obrigatório");
//       if (!data.termoAceito) errors.push("É necessário aceitar o termo de responsabilidade");

//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (data.email && !emailRegex.test(data.email)) errors.push("Email deve ter um formato válido");

//       const phoneRegex = /^[\d\s\-]+$/;
//       if (data.telefone && !phoneRegex.test(data.telefone)) errors.push("Telefone deve conter apenas números e caracteres válidos");

//       if (data.dataDevolucao && new Date(data.dataDevolucao) <= new Date(data.dataEntrega))
//         errors.push("Data de devolução deve ser posterior à data de entrega");

//       return errors;
//     };

//     const salvar = async () => {
//       setError(null);
//       setSuccessMessage("");
//       const validationErrors = validateForm();
//       if (validationErrors.length > 0) {
//         setError(validationErrors.join(", "));
//         return;
//       }

//       setSaving(true);
//       try {
//         const docRef = await addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() });
//         setSuccessMessage("Termo salvo com sucesso! ID: " + docRef.id);
//       } catch (e) {
//         console.error(e);
//         setError("Erro ao salvar o termo: " + e.message);
//       } finally {
//         setSaving(false);
//       }
//     };

//     const resetForm = () => {
//       setData({
//         solicitante:"", telefone:"", numeroPatrimonial:"", tipoEquipamento:"", dataEntrega:today,
//         dataDevolucao:"", objetivoUso:"", problemasDescricao:"", cidade:"São Paulo",
//         termoAceito:false, email:"", cpf:"", setor:"", observacoes:"", estadoEquipamento:"perfeito"
//       });
//       setError(null);
//       setSuccessMessage("");
//     };

// // Função para gerar PDF (posições iguais ao PDF enviado)
// // Função para gerar PDF (header com espaçamento, footer grande e data ajustada)
// const gerarPDF = async () => {
//   const doc = new jsPDF("p", "pt", "a4");
//   const pageW = doc.internal.pageSize.getWidth();
//   const pageH = doc.internal.pageSize.getHeight();

//   // Constantes
//   const M = 36; // margem lateral
//   const HEADER_Y = 28;
//   const HEADER_LEFT_H = 40;
//   const HEADER_LEFT_MAX_W = 200;
//   const HEADER_RIGHT_H = 34;
//   const HEADER_RIGHT_MAX_W = 120;

//   const FOOTER_IMG_H = 200;       // selo maior
//   const FOOTER_IMG_MAX_W = 300;  

//   const HEADER_BOTTOM_MARGIN = 28; // espaço entre logos e título

//   // Carregar imagens
//   const logoLeft = await loadImage(`${imgBase}/Reciclar_30anos_Horizontal_Positivo.png`);
//   const logoRight = await loadImage(`${imgBase}/seloAtualizado.png`);
//   const footerImg = await loadImage(`${imgBase}/selo.png`);

//   const getDimByHeight = (image, targetH, maxW = 9999) => {
//     const ratio = (image.width || 1) / (image.height || 1);
//     let w = targetH * ratio;
//     if (w > maxW) w = maxW;
//     const h = w / ratio;
//     return { w, h };
//   };

//   // Header
//   const leftDim = getDimByHeight(logoLeft, HEADER_LEFT_H, HEADER_LEFT_MAX_W);
//   doc.addImage(logoLeft, "PNG", M, HEADER_Y, leftDim.w, leftDim.h);

//   const rightDim = getDimByHeight(logoRight, HEADER_RIGHT_H, HEADER_RIGHT_MAX_W);
//   const rightX = pageW - M - rightDim.w;
//   const rightY = HEADER_Y + Math.max(0, (leftDim.h - rightDim.h) / 2);
//   doc.addImage(logoRight, "PNG", rightX, rightY, rightDim.w, rightDim.h);

//   // Calcula Y inicial do título com espaçamento extra
//   let y = HEADER_Y + Math.max(leftDim.h, rightDim.h) + HEADER_BOTTOM_MARGIN;

//   // Títulos
//   doc.setFont("helvetica", "bold"); doc.setFontSize(16);
//   doc.text("TERMO DE RESPONSABILIDADE", pageW / 2, y, { align: "center" });
//   y += 18;
//   doc.setFont("helvetica", "normal"); doc.setFontSize(11);
//   doc.text("EMPRÉSTIMO DE EQUIPAMENTO", pageW / 2, y, { align: "center" });
//   y += 26;

//   const margin = M;
//   const drawField = (label, value) => {
//     doc.rect(margin, y - 2, pageW - 2 * margin, 18);
//     doc.text(`${label} ${value}`, margin + 6, y + 12);
//     y += 22;
//   };

//   // Dados do solicitante
//   doc.setFont("helvetica", "bold");
//   doc.text("Dados do Solicitante", pageW / 2, y, { align: "center" });
//   y += 18;
//   doc.setFont("helvetica", "normal");
//   drawField("Nome:", data.solicitante);
//   drawField("Telefone:", data.telefone);
//   drawField("Email:", data.email);
//   drawField("CPF:", data.cpf);
//   drawField("Setor/Departamento:", data.setor);

//   // Dados do equipamento
//   y += 8;
//   doc.setFont("helvetica", "bold");
//   doc.text("Dados do Equipamento", pageW / 2, y, { align: "center" });
//   y += 18;
//   doc.setFont("helvetica", "normal");
//   drawField("Número Patrimonial:", data.numeroPatrimonial);
//   drawField("Tipo de Equipamento:", data.tipoEquipamento);
//   drawField("Data Entrega:", data.dataEntrega);
//   drawField("Data Devolução:", data.dataDevolucao || "________________");
//   drawField("Objetivo de Uso:", data.objetivoUso);
//   drawField("Estado do Equipamento:", data.estadoEquipamento);
//   drawField("Descrição de problemas:", data.problemasDescricao);
//   drawField("Observações adicionais:", data.observacoes);

//   // Declarações
//   y += 50;
//   doc.setFont("helvetica", "bold");
//   doc.text("Declaro:", pageW / 2, y, { align: "left" });
//   y += 14;
//   doc.setFont("helvetica", "normal");
//   [
//     "i. Recebi o equipamento e cuidarei dele;",
//     "ii. Não alterarei instalação/configuração;",
//     `iii. Informarei ao ${organizationName} sobre defeitos;`,
//     "iv. Devolverei em condições originais no prazo;",
//     "v. Assumo responsabilidade pelo equipamento."
//   ].forEach(item => { doc.text(item, margin + 18, y); y += 14; });

//   // Local e aceite
//   y += 16;
//   doc.text(`Cidade: ${data.cidade}`, pageW / 2, y, { align: "center" });
//   y += 14;
//   doc.text("Declaro que li e aceito todos os termos", pageW / 2, y, { align: "center" });

//   // Rodapé
//   const footerDim = getDimByHeight(footerImg, FOOTER_IMG_H, FOOTER_IMG_MAX_W);
//   const footerY = pageH - M - footerDim.h;
//   doc.addImage(footerImg, "PNG", M, footerY, footerDim.w, footerDim.h);


//   doc.save(`termo_emprestimo_${new Date().toISOString().slice(0, 10)}.pdf`);
// };



//     const loadImage = (src) => new Promise(resolve => {
//       const img = new Image();
//       img.crossOrigin = "anonymous";
//       img.onload = () => resolve(img);
//       img.src = src;
//     });

//     return (
//       <div className="mx-auto max-w-4xl p-4 md:p-6">
//         <div className="bg-white text-gray-900 shadow-lg rounded-lg p-4 md:p-6">
//           {/* Dados do Solicitante */}
//           <div className="bg-gray-50 p-2 rounded-lg mb-4">
//             <h3 className="text-sm font-semibold mb-2 text-gray-700">Dados do Solicitante</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//               <input placeholder="Nome completo *" name="solicitante" value={data.solicitante} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
//               <input placeholder="Telefone *" name="telefone" value={data.telefone} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
//               <input placeholder="Email *" name="email" value={data.email} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
//               <input placeholder="CPF *" name="cpf" value={data.cpf} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
//               <input placeholder="Setor/Departamento" name="setor" value={data.setor} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full md:col-span-2" />
//             </div>
//           </div>

//           {/* Dados do Equipamento */}
//           <div className="bg-gray-50 p-2 rounded-lg mb-4">
//             <h3 className="text-sm font-semibold mb-2 text-gray-700">Dados do Equipamento</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
//               <input placeholder="Número Patrimonial *" name="numeroPatrimonial" value={data.numeroPatrimonial} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
//               <input placeholder="Tipo de Equipamento *" name="tipoEquipamento" value={data.tipoEquipamento} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full md:col-span-2" />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
//               <input type="date" name="dataEntrega" value={data.dataEntrega} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
//               <input type="date" name="dataDevolucao" value={data.dataDevolucao} onChange={handleChange} className="border-2 border-gray-300 rounded-md p-2 w-full" />
//             </div>
//             <textarea placeholder="Objetivo de uso *" name="objetivoUso" value={data.objetivoUso} onChange={handleChange} rows="2" className="border-2 border-gray-300 rounded-md p-2 w-full mb-2" />
//           </div>

//           {/* Botões */}
//           <div className="flex flex-wrap gap-2 mb-2">
//             <button onClick={salvar} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm">{saving ? "Salvando..." : "Salvar Termo"}</button>
//             <button onClick={gerarPDF} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Gerar PDF</button>
//             <button onClick={resetForm} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">Limpar Formulário</button>
//           </div>

//           {successMessage && <div className="bg-green-100 border-2 border-green-300 text-green-800 px-2 py-2 rounded-lg mb-2 text-sm">{successMessage}</div>}
//           {error && <div className="bg-red-100 border-2 border-red-300 text-red-800 px-2 py-2 rounded-lg mb-2 text-sm">{error}</div>}
//         </div>
//       </div>
//     );
//   }

//   export default TermoEmprestimo;
