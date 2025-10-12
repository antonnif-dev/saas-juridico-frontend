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

function App() {
  //window.auth = auth;  //Função gerar token
  return (
    <Routes>
      {/* --- ROTAS PÚBLICAS GERAIS --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="/portal/login" element={<ClientLoginPage />} />

      {/* --- ROTAS PRIVADAS (ADMIN/ADVOGADO) --- */}
      {/* CORREÇÃO: Estrutura correta de rotas protegidas com layout aninhado */}
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
        </Route>
      </Route>

      {/* --- ROTAS PRIVADAS DO PORTAL DO CLIENTE --- */}
      <Route element={<PrivateRoute />}>
        <Route path="/portal/dashboard" element={<ClientDashboardPage />} />
        {/* Futuras rotas do cliente podem ser adicionadas aqui */}
        <Route path="/portal/processos/:id" element={<ClientCaseDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
