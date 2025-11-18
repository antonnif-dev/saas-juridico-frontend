import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/services/firebase';
import { signOut } from 'firebase/auth';
import NavigationBars from '@/components/shared/NavigationBars';
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
        <nav className='flex flex-col gap-3 p-4 bg-blue-400'>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className='break-all'>SaaS <br /> Jurídico</h1>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/processos">Processos</Link>
            <Link to="/clientes">Clientes</Link>
            <Link to="/agenda">Agenda</Link>
            <Link to="/equipe">Equipe</Link>
          </div>
          <div className="flex justify-between items-center">
            <Link to="/admin/tema">Aparência do site</Link>
            <div className="flex items-center gap-4">
              <span className="break-words">{currentUser.email}</span>
              <button onClick={handleLogout}>Sair</button>
            </div>
          </div>
        </nav>
      </header>
      <NavigationBars />
      <main className="p-5 pb-24 md:pb-8 md:mx-24 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;