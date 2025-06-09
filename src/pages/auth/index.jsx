import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const loginEmailSenha = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;

      // Verifica se o UID existe na tabela de usuários
      const db = getDatabase();
      const userRef = ref(db, `usuarios/${uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        navigate('/Home'); // Usuário válido, pode entrar
      } else {
        setErro('Usuário não autorizado');
        auth.signOut(); // Desloga se não estiver cadastrado na tabela de usuários
      }

    } catch (err) {
      setErro('Email ou senha inválidos');
    }
  };

  const redefinirSenha = async () => {
    if (!email) return setErro('Digite seu e-mail para redefinir');
    try {
      await sendPasswordResetEmail(auth, email);
      setErro('Link de redefinição enviado para seu e-mail');
    } catch {
      setErro('Erro ao enviar e-mail');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 to-blue-900 p-5">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-sm text-center">
        <img src="/Reciclar_LOGO.png" alt="Logo" className="w-24 mx-auto mb-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-6">Instituto Reciclar</h2>

        {erro && <p className="text-red-500 text-sm mb-2">{erro}</p>}

        <form onSubmit={loginEmailSenha} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full p-3 pr-10 rounded border border-gray-300 bg-gray-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full p-3 pr-10 rounded border border-gray-300 bg-gray-50"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-br from-purple-700 to-blue-800 text-white font-semibold hover:from-pink-500 hover:to-purple-700 transition duration-300 mb-3"
          >
            Acessar Plataforma
          </button>
        </form>

        <button
          onClick={redefinirSenha}
          className="w-full mt-2 text-sm text-blue-600 hover:underline"
        >
          Esqueci minha senha
        </button>
      </div>
    </div>
  );
}



// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { auth, createUserWithEmailAndPassword, db,  } from '../../../firebase'; 
// import { ref, set } from "firebase/database"; 


// export default function Registro() {
//   const [nome, setNome] = useState('');
//   const [email, setEmail] = useState('');
//   const [funcao, setFuncao] = useState('');
//   const [senha, setSenha] = useState('');
//   const [confirmSenha, setConfirmSenha] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   const validatePassword = (senha) => senha.length >= 6;



//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateEmail(email)) return setErrorMessage('E-mail inválido.');
//     if (!validatePassword(senha)) return setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
//     if (senha !== confirmSenha) return setErrorMessage('As senhas não coincidem.');
//     if (!funcao) return setErrorMessage('Selecione uma função.');
//     setIsLoading(true);
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, senha); 
//       const newUser = userCredential.user;
//       const tipoUsuario = funcao === 'Admin' ? 'Admin' : funcao === 'Cozinha' ? 'Cozinha' : 'T.I';

//       await set(ref(db, 'usuarios/' + newUser.uid), 
//       {nome, email, funcao: tipoUsuario, uid: newUser.uid,});
//       setSuccessMessage('Usuário criado com sucesso!');
//       setTimeout(() => navigate("/Verificacao_Usuario"), 2000);
//     } catch (error) {
//       console.error('Erro ao criar usuário:', error);
//       if (error.code === 'auth/email-already-in-use') {
//         setErrorMessage('Este e-mail já está em uso.');
//       } else {
//         setErrorMessage(`Erro: ${error.message}`);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-800 to-blue-900 flex items-center justify-center px-4">
//       <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-6xl">
//         <h2 className="text-[40px] font-bold text-center text-gray-700 mb-4">Registro de Novo Usuário</h2>
//         <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
//           {/* NOME */}
//           <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Nome" 
//             className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
//           {/* E-MAIL */}
//           <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="E-mail" 
//             className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
//           {/* FUNÇÃO */}
//           <select value={funcao} onChange={(e) => setFuncao(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
//             <option value="">Selecione a função</option>
//             <option value="Admin">Admin</option>
//             <option value="Cozinha">Cozinha</option>
//             <option value="T.I">T.I</option>
//           </select>
//           {/* SENHA */}
//           <div className="relative">
//             <input type={'password'} value={senha} onChange={(e) => setSenha(e.target.value)} required placeholder="Digite uma senha" 
//               className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
//           </div>
//           {/* CONFIRMAR SENHA */}
//           <input type={'password'} value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)} required placeholder="Confirmar Senha" 
//               className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />

//           {/* FOTO DE PERFIL */}

//           {/* BOTÕES */}
//           <div className="flex flex-col md:flex-row justify-between md:col-span-2 gap-4 mt-4">
//             <button type="submit" disabled={isLoading} className="...">
//               {isLoading ? 'Carregando...' : 'Criar Conta'}
//             </button>
//             <Link to="/Verificacao_Usuario">
//               <button type="button" className="...">Voltar</button>
//             </Link>
//           </div>
//         </form>

//         {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>}
//         {successMessage && <p className="text-green-600 mt-4">{successMessage}</p>}
//       </div>
//     </div>
//   );
// }
