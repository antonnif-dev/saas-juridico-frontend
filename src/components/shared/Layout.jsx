import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import LogoutButton from '@/components/shared/LogoutButton';
import NavigationBars from '@/components/shared/NavigationBars';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";

function Layout() {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) return null;

  const [settings, setSettings] = useState({});
  const isAdmin = userRole === 'administrador';
  const isAdvogado = userRole === 'advogado';
  const isStaff = isAdmin || isAdvogado;
  const location = useLocation();

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

  const getLogoShapeStyle = (shape) => {
    const baseStyle = {
      height: '80px', // TAMANHO FIXO CONFORME SOLICITADO
      width: '80px',  // Forçamos a largura também para garantir o formato quadrado/redondo
      objectFit: 'cover' // 'cover' preenche melhor formatos geométricos que 'contain'
    };

    switch (shape) {
      case 'rounded': // Quadrado com bordas
        return { ...baseStyle, borderRadius: '12px' };
      case 'circle': // Redondo
        return { ...baseStyle, borderRadius: '50%' };
      case 'triangle': // Triangular (Usa clip-path para "recortar" a imagem)
        return { ...baseStyle, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' };
      case 'diamond': // Quadrangular/Losango (Usa clip-path)
        return { ...baseStyle, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };
      case 'square': // Quadrado (padrão)
      default:
        return baseStyle;
    }
  };

  const navLinkClass = (path) => {
    const isActive = location.pathname.startsWith(path);

    return `
    px-3 py-1 rounded-md transition-all
    ${isActive
        ? "bg-white/20 font-semibold shadow-sm"
        : "hover:bg-white/10 hover:opacity-90"}
  `;
  };

  return (
    <div
      key={location.pathname}
      className="animate-page"
    >
      <div>
        <header
          className="relative z-50 w-full border-b shadow-sm transition-all"
          style={{ backgroundColor: 'var(--header-bg)', color: 'var(--header-text)' }}
        >
          <nav
            className='flex flex-col gap-3 p-4 transition-colors duration-300'
            style={{
              backgroundColor: 'var(--cor-navbar-fundo)',
              color: 'var(--cor-navbar-texto)'
            }}
          >
            <div className="flex items-center gap-3 flex-nowrap">
              <div className="flex items-center">
                {/* Lógica de Logo vs Texto */}
                {settings.headerType === 'image' && settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Logo"
                    style={getLogoShapeStyle(settings.headerLogoShape || 'square')}
                  />
                ) : (
                  <h1
                    className='break-all font-bold leading-tight m-0 text-center'
                    style={{
                      fontSize: settings.headerLogoSize || 'var(--font-size-h1)',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: settings.headerTitle || 'SaaS <br /> Jurídico'
                    }}
                  />
                )}
              </div>

              {/* Links de Navegação Principal */}
              <div className="flex-1 flex justify-end">
                <div className="flex gap-2 font-medium whitespace-nowrap overflow-x-auto max-w-full">
                  <Link to="/dashboard" className={navLinkClass("/dashboard")}>Dashboard</Link>
                  <Link to={isStaff ? "/processos" : "/portal/processos"} className={navLinkClass("/processos")}> Processos </Link>
                  {/* EXCLUSIVO CLIENTE */}
                  {!isStaff && (
                    <Link
                      to="/portal/atendimentos"
                      className={navLinkClass("/portal/atendimentos")}
                    >
                      Atendimentos
                    </Link>
                  )}
                  {/* Oculto para Clientes */}
                  {isStaff && (
                    <>
                      <Link to="/clientes" className={navLinkClass("/clientes")}>Clientes</Link>
                      <Link to="/agenda" className={navLinkClass("/agenda")}>Agenda</Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Linha inferior do cabeçalho */}
            <div className="flex justify-between items-center border-t border-white/20">
              <div className="flex items-center gap-8 ml-4">
                {/* Exclusivo Admin */}
                {isAdmin && (
                  <Link to="/equipe" className={navLinkClass("/equipe")}>Equipe</Link>
                )}

                {/* Oculto para Clientes */}
                {isStaff && (
                  <Link to="/relatorios" className={navLinkClass("/relatorios")}>Relatórios</Link>
                )}

                {/* Exclusivo Admin */}
                {isAdmin && (
                  <Link to="/admin/tema" className={navLinkClass("/admin/tema")}>Aparência do site</Link>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/perfil"
                  className="group flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-all"
                  title="Editar Perfil"
                >
                  <div className="h-10 w-10 rounded-full bg-slate-300 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-white/30 transition-all">
                    {(currentUser?.photoUrl || currentUser?.photoURL) ? (
                      <img
                        src={currentUser.photoUrl || currentUser.photoURL}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-slate-500">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </Link>
                <LogoutButton />
              </div>
            </div>
          </nav>
        </header>

        {/* Barra Lateral / Inferior - Também precisará de filtro interno */}
        <NavigationBars />

        <main className="p-5 pb-24 md:pb-8 md:mx-24 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;