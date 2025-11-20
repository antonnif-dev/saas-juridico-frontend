import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import LogoutButton from '@/components/shared/LogoutButton';
import NavigationBars from '@/components/shared/NavigationBars';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient'; // Importante para buscar o tema

function Layout() {
  const { currentUser } = useAuth();
  
  // 1. DECLARAÇÃO DO ESTADO 'SETTINGS' (Isso faltava)
  const [settings, setSettings] = useState({});

  // 2. BUSCA AS CONFIGURAÇÕES NO BANCO AO CARREGAR (Isso faltava)
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data } = await apiClient.get('/theme');
        setSettings(data || {});
      } catch (error) {
        console.error("Erro ao carregar tema:", error);
      }
    };
    fetchTheme();
  }, []);

  const handleLogout = () => {
    // Sua lógica de logout aqui (ou use o LogoutButton diretamente)
    // Se for usar o componente LogoutButton, o botão abaixo pode ser removido
  };

  const ColorInput = ({ label, name, defaultValue }) => (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-slate-500 uppercase">{label}</Label>
      <div className="flex gap-2 items-center">
        <Input 
          type="color" 
          name={name}
          value={settings[name] || defaultValue || '#000000'} 
          onChange={(e) => handleChange(name, e.target.value)}
          className="w-12 h-9 p-1 cursor-pointer"
        />
        <Input 
          type="text" 
          name={`${name}_text`}
          value={settings[name] || defaultValue || ''} 
          onChange={(e) => handleChange(name, e.target.value)}
          className="flex-1 h-9"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  return (
    <div>
      <header>
        {/* Note que troquei 'bg-blue-400' por estilo dinâmico para usar a cor que você escolher no painel */}
        <nav 
          className='flex flex-col gap-3 p-4 transition-colors duration-300'
          style={{ 
            backgroundColor: 'var(--cor-navbar-fundo)', 
            color: 'var(--cor-navbar-texto)' 
          }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              
              {/* Lógica de Logo vs Texto */}
              {settings.headerType === 'image' && settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  style={{ 
                    height: settings.headerLogoSize || '50px', 
                    objectFit: 'contain' 
                  }} 
                />
              ) : (
                <h1 
                  className='break-all font-bold leading-tight m-0' 
                  style={{ 
                    // Se não tiver tamanho salvo, usa o padrão do CSS
                    fontSize: settings.headerLogoSize || 'var(--font-size-h1)',
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: settings.headerTitle || 'SaaS <br /> Jurídico' 
                  }}
                />
              )}

            </div>

            {/* Links de Navegação */}
            <div className="flex gap-4 font-medium">
                <Link to="/dashboard" className="hover:opacity-80">Dashboard</Link>
                <Link to="/processos" className="hover:opacity-80">Processos</Link>
                <Link to="/clientes" className="hover:opacity-80">Clientes</Link>
                <Link to="/agenda" className="hover:opacity-80">Agenda</Link>
                <Link to="/equipe" className="hover:opacity-80">Equipe</Link>
            </div>
          </div>

          {/* Linha inferior do cabeçalho */}
          <div className="flex justify-between items-center border-t border-white/20 pt-2 mt-1">
            <Link to="/admin/tema" className="text-sm opacity-80 hover:opacity-100">Aparência do site</Link>
            
            <div className="flex items-center gap-4">
              <span className="break-words text-sm">{currentUser?.email}</span>
              {/* Usando o componente LogoutButton que você já tem importado é mais limpo */}
              <LogoutButton /> 
            </div>
          </div>
        </nav>
      </header>

      {/* Barra Lateral / Inferior */}
      <NavigationBars />

      <main className="p-5 pb-24 md:pb-8 md:mx-24 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;