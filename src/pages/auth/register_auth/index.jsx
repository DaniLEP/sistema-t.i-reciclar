import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, createUserWithEmailAndPassword, db } from "../../../../firebase";
import { ref, update, get } from "firebase/database";
import { updateProfile } from "firebase/auth";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Eye, EyeOff, User, Mail, Shield, Lock, ArrowLeft, XCircle, Loader2,
} from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegistroUser() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    funcao: "",
    senha: "",
    confirmSenha: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (senha) => senha.length >= 6;

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const validateField = (field, value) => {
    const v = typeof value === "string" ? value.trim() : value;
    const errors = { ...validationErrors };
    switch (field) {
      case "nome":
        if (!v) errors.nome = "Nome é obrigatório";
        else if (v.length < 2) errors.nome = "Nome deve ter pelo menos 2 caracteres";
        else delete errors.nome;
        break;
      case "email":
        if (!v) errors.email = "E-mail é obrigatório";
        else if (!validateEmail(v)) errors.email = "E-mail inválido";
        else delete errors.email;
        break;
      case "senha":
        if (!v) errors.senha = "Senha é obrigatória";
        else if (!validatePassword(v)) errors.senha = "Senha deve ter pelo menos 6 caracteres";
        else delete errors.senha;
        break;
      case "confirmSenha":
        if (!v) errors.confirmSenha = "Confirmação de senha é obrigatória";
        else if (v !== formData.senha) errors.confirmSenha = "Senhas não coincidem";
        else delete errors.confirmSenha;
        break;
      case "funcao":
        if (!v) errors.funcao = "Função é obrigatória";
        else delete errors.funcao;
        break;
      default:
        break;
    }
    setValidationErrors(errors);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const canProceedToStep2 = () =>
    formData.nome.trim() &&
    formData.email.trim() &&
    validateEmail(formData.email.trim()) &&
    !validationErrors.nome &&
    !validationErrors.email;

  const canSubmit = () =>
    Object.keys(validationErrors).length === 0 &&
    formData.nome.trim() &&
    formData.email.trim() &&
    formData.funcao.trim() &&
    formData.senha &&
    formData.confirmSenha;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validação final sincrônica
    const required = ["nome", "email", "funcao", "senha", "confirmSenha"];
    const newErrors = {};
    for (const f of required) {
      const v = String(formData[f] ?? "").trim();
      if (!v) newErrors[f] = "Campo obrigatório";
    }
    if (formData.senha !== formData.confirmSenha) {
      newErrors.confirmSenha = "Senhas não coincidem";
    }
    if (formData.email && !validateEmail(formData.email.trim())) {
      newErrors.email = "E-mail inválido";
    }
    if (Object.keys(newErrors).length) {
      setValidationErrors((prev) => ({ ...prev, ...newErrors }));
      toast.warning("Por favor, corrija os erros no formulário.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.senha
      );
      const newUser = userCredential.user;

      // Atualiza o perfil do Auth (útil se você mostra displayName em outro lugar)
      try {
        await updateProfile(newUser, { displayName: formData.nome.trim() });
      } catch (e) {
        console.warn("Falha ao atualizar displayName:", e);
      }

      // Payload higienizado
      const payload = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        funcao: formData.funcao.trim().toLowerCase(),
        uid: newUser.uid,
        ativo: true,
        online: false,
        criadoEm: Date.now(),
      };
      console.log("[RegistroUser] salvando no RTDB:", payload);

      // UPDATE para evitar sobrescrita por outros processos (ex.: Cloud Function)
      await update(ref(db, `usuarios/${newUser.uid}`), payload);

      // (Opcional) Ler de volta para conferir
      try {
        const snap = await get(ref(db, `usuarios/${newUser.uid}`));
        console.log("[RegistroUser] dado salvo:", snap.val());
      } catch {}

      toast.success("Usuário criado com sucesso!");

      // Resetar formulário
      setFormData({ nome: "", email: "", funcao: "", senha: "", confirmSenha: "" });

      setTimeout(() => navigate("/gestão-users"), 1200);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      if (error?.code === "auth/email-already-in-use") {
        toast.error("Este e-mail já está em uso.");
      } else {
        toast.error(`Erro: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.senha);
  const getStrengthText = (s) => (s < 25 ? "Muito fraca" : s < 50 ? "Fraca" : s < 75 ? "Média" : "Forte");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2 pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Criar Nova Conta
            </CardTitle>
            <CardDescription className="text-lg text-slate-600">
              Preencha os dados para criar um novo usuário no sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4" /> Nome Completo
                      </Label>
                      <Input
                        id="nome"
                        type="text"
                        value={formData.nome}
                        onChange={(e) => handleInputChange("nome", e.target.value)}
                        placeholder="Digite seu nome completo"
                      />
                      {validationErrors.nome && (
                        <Alert className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">{validationErrors.nome}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> E-mail
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Digite seu e-mail"
                      />
                      {validationErrors.email && (
                        <Alert className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">{validationErrors.email}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Link to="/gestão-users">
                        <Button type="button" variant="outline">Cancelar</Button>
                      </Link>
                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!canProceedToStep2()}
                        className="ml-5 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Próximo
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="funcao" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Função no Sistema
                      </Label>
                      <Select value={formData.funcao} onValueChange={(value) => handleInputChange("funcao", value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione sua função" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Administrador</SelectItem>
                          <SelectItem value="Usuario">Usuário</SelectItem>
                          <SelectItem value="T.I">T.I</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.funcao && (
                        <Alert className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">{validationErrors.funcao}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="senha" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="senha"
                          type={showPassword ? "text" : "password"}
                          value={formData.senha}
                          onChange={(e) => handleInputChange("senha", e.target.value)}
                          placeholder="Digite uma senha segura"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {formData.senha && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Força da senha:</span>
                            <span className={`font-medium ${passwordStrength >= 75 ? "text-green-600" : passwordStrength >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                              {getStrengthText(passwordStrength)}
                            </span>
                          </div>
                          <Progress value={passwordStrength} className="h-2" />
                        </div>
                      )}
                      {validationErrors.senha && (
                        <Alert className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">{validationErrors.senha}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmSenha" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Confirmar Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmSenha"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmSenha}
                          onChange={(e) => handleInputChange("confirmSenha", e.target.value)}
                          placeholder="Confirme sua senha"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {validationErrors.confirmSenha && (
                        <Alert className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">{validationErrors.confirmSenha}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex justify-between gap-4">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft className="w-4 h-4" /> Voltar
                      </Button>
                      <div className="flex gap-3">
                        <Link to="/gestão-users">
                          <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" disabled={!canSubmit() || isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                          {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin mr-2 inline" />Criando...</>) : "Finalizar"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} pauseOnHover />
    </div>
  );
}
