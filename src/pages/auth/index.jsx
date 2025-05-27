import { useState } from 'react';
import { auth, provider } from '../../../firebase';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const loginEmailSenha = async (e) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, email, senha); navigate('/');} 
    catch (err) {
      setErro('Email ou senha inválidos');
    }
  };

  const loginGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setErro('Erro ao logar com o Google');
    }
  };

  const redefinirSenha = async () => {
    if (!email) return setErro('Digite seu e-mail para redefinir');
    try {await sendPasswordResetEmail(auth, email);
    setErro('Link de redefinição enviado para seu e-mail');
    } catch { setErro('Erro ao enviar e-mail');}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 to-blue-900 p-5">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-sm text-center">
        <img src="/Reciclar_LOGO.png" alt="Logo" className="w-24 mx-auto mb-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-6">Instituto Reciclar</h2>
        {erro && <p className="text-red-500 text-sm mb-2">{erro}</p>}
        <form onSubmit={loginEmailSenha} className="space-y-4">
          <input type="email" placeholder="E-mail" className="w-full p-3 pr-10 rounded border border-gray-300 bg-gray-50" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Senha" className="w-full p-3 pr-10 rounded border border-gray-300 bg-gray-50" value={senha} onChange={(e) => setSenha(e.target.value)}  />
          <button type="submit"  className="w-full py-3 rounded-lg bg-gradient-to-br from-purple-700 to-blue-800 text-white font-semibold hover:from-pink-500 hover:to-purple-700 transition duration-300 mb-3">Acessar Plataforma</button>
        </form>
        <button onClick={loginGoogle}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-2 rounded shadow hover:bg-gray-100"><img src="../iconGoogle.png" alt="Google" className="w-5 h-5" /><span>Entrar com Google</span></button>        
        <button onClick={redefinirSenha} className="w-full mt-2 text-sm text-blue-600 hover:underline">Esqueci a senha?</button>
      </div>
    </div>
  );
}
