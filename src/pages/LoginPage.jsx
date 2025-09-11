import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword // <-- IMPORTAR A FUNÇÃO DE CRIAR USUÁRIO
} from 'firebase/auth';

function LoginPage() {
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(true); // <-- NOVO

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // <-- NOVO
  const [error, setError] = useState(null);

  // Função para lidar com o login de um usuário existente
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login bem-sucedido!', userCredential.user);
      navigate('/dashboard');
      // Idealmente, redirecionar para o dashboard aqui
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.');
      console.error(err);
    }
  };

  // Função para lidar com o cadastro de um novo usuário
  const handleRegister = async () => { // <-- NOVO
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Cadastro bem-sucedido!', userCredential.user);
      navigate('/dashboard');
      // O Firebase já loga o usuário automaticamente após o cadastro.
      // Você pode redirecionar para o dashboard ou para uma página de "bem-vindo".
      
      // PONTO CRÍTICO: Após o cadastro, você precisará chamar seu backend
      // para atribuir um perfil (role) padrão a este novo usuário.
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else {
        setError('Ocorreu um erro ao realizar o cadastro.');
      }
      console.error(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (isLoginView) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const toggleView = () => { // <-- NOVO
    setIsLoginView(!isLoginView);
    setError(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div>
      {/* O título da página muda de acordo com a visão */}
      <h2>{isLoginView ? 'Login' : 'Criar Conta'}</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="E-mail" 
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Senha" 
          required 
        />
        
        {/* Campo de confirmação de senha, visível apenas no modo de cadastro */}
        {!isLoginView && ( // <-- NOVO
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            placeholder="Confirme a Senha" 
            required 
          />
        )}

        {/* O texto do botão muda de acordo com a visão */}
        <button type="submit">{isLoginView ? 'Entrar' : 'Cadastrar'}</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      {/* Link para alternar entre as visões de login e cadastro */}
      <p> 
        {isLoginView ? 'Não tem uma conta?' : 'Já tem uma conta?'}
        <button type="button" onClick={toggleView} style={{ marginLeft: '5px', border: 'none', background: 'none', color: 'blue', cursor: 'pointer', padding: 0 }}>
          {isLoginView ? 'Cadastre-se' : 'Faça Login'}
        </button>
      </p>
    </div>
  );
}

export default LoginPage;