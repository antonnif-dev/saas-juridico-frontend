import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ClientDashboard from '@/components/dashboard/ClientDashboard';

function DashboardPage() {
  const { userRole } = useAuth();

  // Lógica de Redirecionamento Inteligente
  if (userRole === 'cliente') {
    return <ClientDashboard />;
  }

  // Advogados e Administradores
  return <AdminDashboard />;
}

export default DashboardPage;