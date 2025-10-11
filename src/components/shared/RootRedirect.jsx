import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function RootRedirect() {
  const { currentUser, userRole, loading } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    // Aguarda a verificação de autenticação terminar antes de tomar qualquer decisão.
    if (loading) {
      return;
    }

    if (currentUser) {
      // Lógica explícita para cada tipo de perfil.
      if (userRole === 'cliente') {
        navigate('/portal/dashboard', { replace: true });
      } else if (userRole === 'administrador' || userRole === 'advogado') {
        navigate('/dashboard', { replace: true });
      } else {
        // Fallback de segurança caso o perfil seja desconhecido.
        navigate('/login', { replace: true });
      }
    } else {
      // Se não há usuário, o destino é sempre a página de login principal.
      navigate('/login', { replace: true });
    }
  }, [currentUser, userRole, loading, navigate]);

  // Exibe uma mensagem de carregamento enquanto a lógica do useEffect é processada.
  return <div>Carregando...</div>;
}

export default RootRedirect;
