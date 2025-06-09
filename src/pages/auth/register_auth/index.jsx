
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, createUserWithEmailAndPassword, db } from '../../../../firebase'; 
import { ref, set } from "firebase/database"; 
import { Input } from '@/components/ui/input/input';
import { motion } from "framer-motion";


export default function RegistroUser() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (senha) => senha.length >= 6;



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) return setErrorMessage('E-mail inválido.');
    if (!validatePassword(senha)) return setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
    if (senha !== confirmSenha) return setErrorMessage('As senhas não coincidem.');
    if (!funcao) return setErrorMessage('Selecione uma função.');
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha); 
      const newUser = userCredential.user;
      const tipoUsuario = funcao === 'Admin' ? 'Admin' : funcao === 'Cozinha' ? 'Cozinha' : 'T.I';

      await set(ref(db, 'usuarios/' + newUser.uid), 
      {nome, email, funcao: tipoUsuario, uid: newUser.uid,});
      setSuccessMessage('Usuário criado com sucesso!');
      setTimeout(() => navigate("/Verificacao_Usuario"), 2000);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Este e-mail já está em uso.');
      } else {
        setErrorMessage(`Erro: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-6xl">
        <h2 className="text-[40px] font-bold text-center text-gray-700 mb-4">Registro de Novo Usuário</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          {/* NOME */}
          <Input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Nome" 
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {/* E-MAIL */}
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="E-mail" 
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {/* FUNÇÃO */}
          <select value={funcao} onChange={(e) => setFuncao(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Selecione a função</option>
            <option value="Admin">Admin</option>
            <option value="Cozinha">Cozinha</option>
            <option value="T.I">T.I</option>
          </select>
          {/* SENHA */}
          <div className="relative">
            <Input type={'password'} value={senha} onChange={(e) => setSenha(e.target.value)} required placeholder="Digite uma senha" 
              className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          {/* CONFIRMAR SENHA */}
          <Input type={'password'} value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)} required placeholder="Confirmar Senha" 
              className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />

          {/* BOTÕES */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4">
            <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-sm shadow-md transition">
                {isLoading ? 'Carregando...' : 'Criar Conta'}
            </motion.button>

            <Link to="/Home">
              <motion.button whileTap={{ scale: 0.97 }} type="button"
                className="flex items-center justify-center gap-2 w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg text-sm shadow-md transition">Voltar</motion.button>
            </Link>
          </div>
        </form>
        {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>}
        {successMessage && <p className="text-green-600 mt-4">{successMessage}</p>}
      </div>
    </div>
  );
}