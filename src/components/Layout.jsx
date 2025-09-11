import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';


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
        <nav style={{ display: 'flex', gap: '20px', padding: '10px', background: '#f0f0f0' }}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/processos">Processos</Link>
          <Link to="/clientes">Clientes</Link>
          <Link to="/agenda">Agenda</Link>
          <div style={{ marginLeft: 'auto' }}>
            <span>{currentUser.email}</span>
            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Sair</button>
          </div>          
        </nav>
      </header>
      <main style={{ padding: '20px' }}>
        {/* O <Outlet /> é onde as páginas filhas (Dashboard, Processos) serão renderizadas */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;