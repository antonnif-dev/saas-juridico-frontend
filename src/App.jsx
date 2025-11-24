import { Routes, Route } from 'react-router-dom';
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

function App() {
  //window.auth = auth;  //Função gerar token
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="/portal/login" element={<ClientLoginPage />} />
      <Route path="/pre-atendimento" element={<PreAtendimentoPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/processos" element={<CasesPage />} />
          <Route path="/processos/:id" element={<CaseDetailPage />} />
          <Route path="/clientes" element={<ClientsPage />} />
          <Route path="/clientes/:id" element={<ClientDetailPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/agenda/:id" element={<AgendaDetailPage />} />
          <Route path="/equipe" element={<EquipePage />} />
          <Route path="/equipe/:id" element={<EditAdvogadoPage />} />
          <Route path="/admin/tema" element={<AdminThemePage />} />
          <Route path="/triagem" element={<PreAtendimentoPage />} />
          <Route path="/ia-triagem" element={<IaPreAtendimentoPage />} />
          <Route path="/atendimento" element={<AtendimentoPage />} />
          <Route path="/ia-atendimento" element={<IaAtendimentoPage />} />
          <Route path="/pos-atendimento" element={<PosAtendimentoPage />} />
          <Route path="/ia-pos-atendimento" element={<IaPosAtendimentoPage />} />
          <Route path="/notificacoes" element={<NotificacaoPage />} />
          <Route path="/mensagens" element={<MensagensPage />} />
          <Route path="/transacoes" element={<TransactionsPage />} />
          <Route path="perfil" element={<UserProfilePage />} />
          <Route path="/relatorios" element={<RelatorioFinalPage />} />
          <Route path="/ia-relatorio" element={<IaRelatorioPage />} />
        </Route>
      </Route>
      <Route element={<PrivateRoute />}>
        <Route path="/portal/dashboard" element={<ClientDashboardPage />} />
        <Route path="/portal/processos/:id" element={<ClientCaseDetailPage />} />
        <Route path="/portal/negociacao/:id" element={<ClientTriagemPage />} />
      </Route>
    </Routes>
  );
}

export default App;
