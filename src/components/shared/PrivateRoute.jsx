import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function PrivateRoute() {
  const { currentUser, loading } = useAuth();

  // Logs de depuração para ver o que o componente está recebendo
  console.log("--- PrivateRoute RENDERIZOU ---");
  console.log("Valor de 'loading':", loading);
  console.log("Valor de 'currentUser':", currentUser);

  if (loading) {
    console.log("PrivateRoute DECISÃO: Estado é 'loading'. Exibindo mensagem...");
    return <div>Verificando autenticação...</div>;
  }

  if (currentUser) {
    console.log("PrivateRoute DECISÃO: Usuário existe. Renderizando <Outlet /> (a página filha).");
    return <Outlet />;
  } else {
    console.log("PrivateRoute DECISÃO: Usuário NÃO existe. Redirecionando para /login.");
    return <Navigate to="/login" replace />;
  }
}

export default PrivateRoute;