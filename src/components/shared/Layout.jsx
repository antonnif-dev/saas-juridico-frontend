import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/services/firebase';
import { signOut } from 'firebase/auth';
import LogoutButton from '@/components/shared/LogoutButton';

function Layout() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div>
      <header>
        <nav style={{ display: 'flex', gap: '20px', padding: '20px', background: '#00a8ff' }}>
          <h1>SaaS Jurídico</h1>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/processos">Processos</Link>
          <Link to="/clientes">Clientes</Link>
          <Link to="/agenda">Agenda</Link>
          <Link to="/equipe">Equipe</Link>
          <div style={{ marginLeft: 'auto' }}>
            <span className="break-words">{currentUser.email}</span> {/* Habilitar nome no cadastro ou deixar email */}
            <button onClick={handleLogout} style={{ marginLeft: '10px'}}>Sair</button>
          </div>
        </nav>
      </header>
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;