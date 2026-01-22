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
  const isCliente = userRole === 'cliente';

  // Definição dos grupos de links
  const leftGroup = [
    { to: "/triagem", icon: FileText, label: "Pré" },
    { to: "/atendimento", icon: Scale, label: "Atendimento" },
    { to: "/pos-atendimento", icon: CheckCircle, label: "Pós" },
  ];

  const rightGroup = [
    { to: "/notificacoes", icon: Bell, label: "Notificações" },
    { to: "/mensagens", icon: MessageSquare, label: "Mensagens" },
    {
      to: isCliente ? "/portal/pagamentos" : "/transacoes",
      icon: CreditCard,
      label: "Pagamentos",
    },
  ];

  const filteredLeft = leftGroup.filter(item => {
    if (item.label === "Pré") return isStaff || isCliente;
    return isStaff;
  });

  const filteredRight = rightGroup;

  // Componente Helper para renderizar um link
  const NavItem = ({ item, mobile }) => {
    const isActive = location.pathname.startsWith(item.to);

    return (
      <Link
        to={item.to}
        className={cn(
          "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 group",
          mobile ? "w-14" : "w-full h-16 my-2"
        )}
        style={{
          color: isActive ? "var(--cor-footer-ativo)" : "var(--cor-footer-texto)",
          backgroundColor: isActive
            ? "color-mix(in srgb, var(--cor-primaria) 12%, transparent)"
            : "transparent",
        }}
      >
        <item.icon className={cn("w-6 h-6 mb-1", isActive && "stroke-[2.5px]")} />
        <span className="text-[10px] font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* --- BARRA LATERAL ESQUERDA (Desktop) --- */}
      {/* Só aparece se houver itens (Staff vê tudo, Cliente vê apenas Pré) */}
      {filteredLeft.length > 0 && (
        <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-24 bg-[var(--cor-footer-fundo)] border-r border-slate-200 z-40 items-center pt-72 shadow-sm transition-all duration-300">
          {filteredLeft.map((item) => <NavItem key={item.to} item={item} />)}
        </aside>
      )}

      {/* --- BARRA LATERAL DIREITA (Desktop) --- */}
      {/* SEMPRE VISÍVEL para qualquer usuário logado */}
      <aside className="hidden md:flex flex-col fixed right-0 top-0 h-screen w-24 bg-[var(--cor-footer-fundo)] border-l border-slate-200 z-40 items-center pt-72 shadow-sm transition-all duration-300">
        {filteredRight.map((item) => <NavItem key={item.to} item={item} />)}
      </aside>

      {/* --- MOBILE: BARRA INFERIOR (Sempre visível) --- */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-20 backdrop-blur-md border-t border-slate-200 z-50 px-4 pb-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
        style={{
          backgroundColor: "color-mix(in srgb, var(--cor-footer-fundo) 88%, transparent)",
          color: "var(--cor-footer-texto)",
        }}
      >
        <div className="flex justify-between items-center h-full w-full max-w-md mx-auto">

          {/* Lado Esquerdo (Pré para clientes, todos para staff) */}
          <div className="flex gap-5">
            {filteredLeft.map((item) => <NavItem key={item.to} item={item} mobile />)}
          </div>

          <div className="h-8 w-px bg-slate-300 mx-2" />

          {/* Lado Direito (Sempre visível para todos) */}
          <div className="flex gap-5">
            {filteredRight.map((item) => <NavItem key={item.to} item={item} mobile />)}
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavigationBars;