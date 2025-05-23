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
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/');
    } catch (err) {
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
    try {
      await sendPasswordResetEmail(auth, email);
      setErro('Link de redefinição enviado para seu e-mail');
    } catch {
      setErro('Erro ao enviar e-mail');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Login do Sistema</h1>

        {erro && <p className="text-red-500 text-sm mb-2">{erro}</p>}

        <form onSubmit={loginEmailSenha} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full px-4 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full px-4 py-2 border rounded"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Entrar
          </button>
        </form>

        <button
          onClick={loginGoogle}
          className="w-full mt-4 bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Entrar com Google
        </button>

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
