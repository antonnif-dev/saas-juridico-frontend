import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
//import { auth } from './services/firebase'; //Função gerar token
//Usar esse código no console logado com administrador
//window.auth.currentUser.getIdToken(/* forceRefresh */ true).then(token => console.log(token));

// Componentes
import PrivateRoute from '@/components/shared/PrivateRoute';
import RootRedirect from '@/components/shared/RootRedirect';
import Layout from '@/components/shared/Layout';

// Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import ClientLoginPage from './pages/client/ClientLoginPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import ClientDashboardPage from './pages/client/ClientDashboardPage';
import ClientCaseDetailPage from './pages/client/ClientCaseDetailPage';
import AgendaPage from './pages/AgendaPage';
import AgendaDetailPage from './pages/AgendaDetailPage';
import EquipePage from './pages/EquipePage';
import AdminThemePage from './pages/AdminThemePage';
import PreAtendimentoPage from './pages/PreAtendimentoPage';
import AtendimentoPage from './pages/AtendimentoPage';
import PosAtendimentoPage from './pages/PosAtendimentoPage';
import NotificacaoPage from './pages/NotificacaoPage';
import MensagensPage from './pages/MensagensPage';
import TransactionsPage from './pages/TransactionsPage';
import ClientTriagemPage from './pages/client/ClientTriagemPage';
import UserProfilePage from '@/pages/UserProfilePage';
import IaPreAtendimentoPage from './pages/IaPreAtendimentoPage';
import IaAtendimentoPage from './pages/IaAtendimentoPage';
import IaPosAtendimentoPage from './pages/IaPosAtendimentoPage';
import RelatorioFinalPage from './pages/RelatorioFinalPage';
import IaRelatorioPage from './pages/IaRelatorioPage';
import EditAdvogadoPage from './pages/EditAdvogadoPage';

// Páginas escritório
import AreasAtuacaoPage from './pages/escritorio/AreasAtuacaoPage';
import EquipeEscritorioPage from './pages/escritorio/EquipeEscritorioPage';
import JurisprudenciaPage from './pages/escritorio/JurisprudenciaPage';
import PrivacidadePage from './pages/escritorio/PrivacidadePage';
import TermosPage from './pages/escritorio/TermosPage';
import FaleConoscoPage from './pages/escritorio/FaleConoscoPage';

// Páginas cliente
import ClientCasesPage from "./pages/client/ClientCasesPage";
import ClientPaymentsPage from "./pages/client/ClientPaymentsPage";
import ClientMessagesPage from './pages/client/ClientMessagesPage';
import ClientAtendimentosPage from './pages/client/ClientAtendimentosPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const { userRole, loading } = useAuth();
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Sincronizando permissões...</div>;
  }

  const isAdmin = userRole === 'administrador';
  const isStaff = userRole === 'administrador' || userRole === 'advogado';
  //window.auth = auth;  //Função gerar token
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* 1. ROTAS PÚBLICAS */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />
        <Route path="/portal/login" element={<ClientLoginPage />} />
        <Route path="/pre-atendimento" element={<PreAtendimentoPage />} />

        {/* 2. ROTAS PROTEGIDAS (LAYOUT COMUM) */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/processos" element={<CasesPage />} />
            <Route path="/processos/:id" element={<CaseDetailPage />} />
            <Route path="/portal/processos/:id" element={<ClientCaseDetailPage />} />
            <Route path="perfil" element={<UserProfilePage />} />
            <Route
              path="/mensagens"
              element={!isStaff ? <ClientMessagesPage /> : <MensagensPage />}
            />
            <Route path="/notificacoes" element={<NotificacaoPage />} />
            <Route path="/transacoes" element={<TransactionsPage />} />
            <Route path="/triagem" element={<PreAtendimentoPage />} />
            <Route path="/portal/processos" element={<ClientCasesPage />} />
            <Route path="/portal/pagamentos" element={<ClientPaymentsPage />} />
            <Route path="/portal/mensagens" element={<ClientMessagesPage />} />
            <Route path="/portal/atendimentos" element={<ClientAtendimentosPage />} />

            {/* 3. ROTAS DE STAFF (ADVOGADOS E ADMINS) */}
            {isStaff && (
              <>
                <Route path="/clientes" element={<ClientsPage />} />
                <Route path="/clientes/:id" element={<ClientDetailPage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/agenda/:id" element={<AgendaDetailPage />} />
                <Route path="/ia-triagem" element={<IaPreAtendimentoPage />} />
                <Route path="/atendimento" element={<AtendimentoPage />} />
                <Route path="/ia-atendimento" element={<IaAtendimentoPage />} />
                <Route path="/pos-atendimento" element={<PosAtendimentoPage />} />
                <Route path="/ia-pos-atendimento" element={<IaPosAtendimentoPage />} />
                <Route path="/relatorios" element={<RelatorioFinalPage />} />
                <Route path="/ia-relatorio" element={<IaRelatorioPage />} />
              </>
            )}

            {/* 4. ROTAS DE ADMINISTRAÇÃO */}
            {isAdmin && (
              <>
                <Route path="/equipe" element={<EquipePage />} />
                <Route path="/equipe/:id" element={<EditAdvogadoPage />} />
                <Route path="/admin/tema" element={<AdminThemePage />} />
              </>
            )}
          </Route>
        </Route>

        {/* 5. PORTAL DO CLIENTE */}
        <Route element={<PrivateRoute />}>
          <Route path="/portal/dashboard" element={<ClientDashboardPage />} />
          <Route path="/portal/preAtendimentoPage" element={<ClientAtendimentosPage />} />          
          <Route path="/portal/negociacao/:id" element={<ClientTriagemPage />} />
        </Route>

        {/* PÁGINAS INSTITUCIONAIS DO ESCRITÓRIO */}
        <Route path="/escritorio/atuacao" element={<AreasAtuacaoPage />} />
        <Route path="/escritorio/equipe" element={<EquipeEscritorioPage />} />
        <Route path="/escritorio/jurisprudencia" element={<JurisprudenciaPage />} />
        <Route path="/escritorio/privacidade" element={<PrivacidadePage />} />
        <Route path="/escritorio/termos" element={<TermosPage />} />
        <Route path="/escritorio/contato" element={<FaleConoscoPage />} />
      </Routes>
    </>
  );
}

export default App;