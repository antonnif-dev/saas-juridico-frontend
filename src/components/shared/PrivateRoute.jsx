import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function PrivateRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Verificando autenticação...</div>;
  }

  if (currentUser) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" replace />;
  }
}

export default PrivateRoute;