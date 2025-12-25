import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText,
  Scale,
  CheckCircle,
  Bell,
  MessageSquare,
  FolderOpen,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/AuthContext';

const NavigationBars = () => {
  const location = useLocation();
  const { userRole } = useAuth();
  const isStaff = userRole === 'administrador' || userRole === 'advogado';

  // Definição dos grupos de links
  const leftGroup = [
    { to: "/triagem", icon: FileText, label: "Pré" },
    { to: "/atendimento", icon: Scale, label: "Atendimento" },
    { to: "/pos-atendimento", icon: CheckCircle, label: "Pós" },
  ];

  const rightGroup = [
    { to: "/notificacoes", icon: Bell, label: "Notificações" },
    { to: "/mensagens", icon: MessageSquare, label: "Mensagens" },
    { to: "/transacoes", icon: CreditCard, label: "Pagamentos" },
  ];

  const filteredLeft = isStaff ? leftGroup : [];
  const filteredRight = isStaff ? rightGroup : [];

  // Componente Helper para renderizar um link
  const NavItem = ({ item, mobile }) => {
    const isActive = location.pathname === item.to;
    return (
      <Link
        to={item.to}
        className={cn(
          "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 group",
          isActive
            ? "text-primary bg-primary/10"
            : "text-slate-500 hover:text-primary hover:bg-slate-100",
          mobile ? "w-14" : "w-full h-16 my-2"
        )}
      >
        <item.icon className={cn("w-6 h-6 mb-1", isActive && "stroke-[2.5px]")} />
        <span className="text-[10px] font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* 1. Só renderiza as barras se houver itens (ou seja, se for Staff) */}
      {isStaff && (
        <>
          {/* --- DESKTOP: BARRA LATERAL ESQUERDA --- */}
          <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-24 bg-[var(--sidebar-bg)] border-r border-slate-200 z-40 items-center pt-72 shadow-sm transition-all duration-300">
            {filteredLeft.map((item) => <NavItem key={item.to} item={item} />)}
          </aside>

          {/* --- DESKTOP: BARRA LATERAL DIREITA --- */}
          <aside className="hidden md:flex flex-col fixed right-0 top-0 h-screen w-24 bg-[var(--sidebar-bg)] border-l border-slate-200 z-40 items-center pt-72 shadow-sm transition-all duration-300">
            {filteredRight.map((item) => <NavItem key={item.to} item={item} />)}
          </aside>

          {/* --- MOBILE: BARRA INFERIOR DIVIDIDA --- */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50 px-4 pb-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center h-full w-full max-w-md mx-auto">

              {/* Grupo Esquerdo Filtrado */}
              <div className="flex gap-5">
                {filteredLeft.map((item) => <NavItem key={item.to} item={item} mobile />)}
              </div>

              <div className="h-8 w-px bg-slate-300 mx-2" />

              {/* Grupo Direito Filtrado */}
              <div className="flex gap-5">
                {filteredRight.map((item) => <NavItem key={item.to} item={item} mobile />)}
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
};

export default NavigationBars;