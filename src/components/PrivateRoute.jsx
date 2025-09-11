import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  // Se não houver usuário logado, redireciona para a página de login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Se houver usuário logado, renderiza o componente filho (a página protegida)
  return children;
}

export default PrivateRoute;