import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RootRedirect() {
  const { currentUser } = useAuth();

  // Se houver usuário, redireciona para o dashboard. Senão, para o login.
  return currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}

export default RootRedirect;