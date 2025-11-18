import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Scale, 
  CheckCircle, 
  Bell, 
  MessageSquare, 
  FolderOpen 
} from 'lucide-react';
import { cn } from "@/lib/utils"; // Utilitário do Shadcn para classes condicionais

const NavigationBars = () => {
  const location = useLocation();

  // Definição dos grupos de links
  const leftGroup = [
    { to: "/pre-atendimento", icon: FileText, label: "Pré" },
    { to: "/atendimento", icon: Scale, label: "Atendimento" },
    { to: "/pos-atendimento", icon: CheckCircle, label: "Pós" },
  ];

  const rightGroup = [
    { to: "/notificacoes", icon: Bell, label: "Alertas" },
    { to: "/mensagens", icon: MessageSquare, label: "Mensagens" },
    { to: "/arquivos", icon: FolderOpen, label: "Arquivos" },
  ];

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
      {/* --- DESKTOP: BARRA LATERAL ESQUERDA --- */}
      <aside className="hidden md:flex flex-col fixed left-0 top-39 bottom-0 w-20 bg-white/80 backdrop-blur-md border-r border-slate-200 z-40 items-center py-6 shadow-sm">
        {leftGroup.map((item) => <NavItem key={item.to} item={item} />)}
      </aside>

      {/* --- DESKTOP: BARRA LATERAL DIREITA --- */}
      <aside className="hidden md:flex flex-col fixed right-0 top-39 bottom-0 w-20 bg-white/80 backdrop-blur-md border-l border-slate-200 z-40 items-center py-6 shadow-sm">
        {rightGroup.map((item) => <NavItem key={item.to} item={item} />)}
      </aside>

      {/* --- MOBILE: BARRA INFERIOR DIVIDIDA --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-50 px-4 pb-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center h-full w-full max-w-md mx-auto">
          
          {/* Grupo Esquerdo */}
          <div className="flex gap-4">
            {leftGroup.map((item) => <NavItem key={item.to} item={item} mobile />)}
          </div>

          {/* Divisor Central Visual (Opcional, apenas estético) */}
          <div className="h-8 w-px bg-slate-300 mx-2" />

          {/* Grupo Direito */}
          <div className="flex gap-4">
            {rightGroup.map((item) => <NavItem key={item.to} item={item} mobile />)}
          </div>

        </div>
      </nav>
    </>
  );
};

export default NavigationBars;