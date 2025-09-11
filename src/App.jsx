import { Routes, Route } from 'react-router-dom';

// Componentes
import PrivateRoute from './components/PrivateRoute';
import RootRedirect from './components/RootRedirect';
import Layout from './components/Layout';

// Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import AgendaPage from './pages/AgendaPage';
import AgendaDetailPage from './pages/AgendaDetailPage';

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Rotas Privadas Agrupadas sob o mesmo Layout */}
      <Route
        element={
          <PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/processos" element={<CasesPage />} />
        <Route path="/processos/:id" element={<CaseDetailPage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/clientes/:id" element={<ClientDetailPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/agenda/:id" element={<AgendaDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;