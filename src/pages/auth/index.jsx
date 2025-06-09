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

    } catch (err) {setErro('Email ou senha inválidos'); }
  };

  const redefinirSenha = async () => {
    if (!email) return setErro('Digite seu e-mail para redefinir');
    try { await sendPasswordResetEmail(auth, email);
       setErro('Link de redefinição enviado para seu e-mail');} 
    catch { setErro('Erro ao enviar e-mail');}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 to-blue-900 p-5">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-sm text-center">
        <img src="/Reciclar_LOGO.png" alt="Logo" className="w-24 mx-auto mb-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-6">Instituto Reciclar- Digital</h2>
        {erro && <p className="text-red-500 text-sm mb-2">{erro}</p>}
        <form onSubmit={loginEmailSenha} className="space-y-4">
          <input type="email" placeholder="E-mail" className="w-full p-3 pr-10 rounded border border-gray-300 bg-gray-50" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Senha" className="w-full p-3 pr-10 rounded border border-gray-300 bg-gray-50" value={senha}  onChange={(e) => setSenha(e.target.value)} />
          <button type="submit" className="w-full py-3 rounded-lg bg-gradient-to-br from-purple-700 to-blue-800 text-white font-semibold hover:from-pink-500 hover:to-purple-700 transition duration-300 mb-3">Acessar Plataforma</button>
        </form>

        <button onClick={redefinirSenha} className="w-full mt-2 text-sm text-blue-600 hover:underline"> Esqueci minha senha</button>
      </div>
    </div>
  );
}



