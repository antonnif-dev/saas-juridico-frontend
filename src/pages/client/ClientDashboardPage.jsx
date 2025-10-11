import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '@/components/shared/LogoutButton';

function ClientDashboardPage() {
  const { currentUser } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [cases, setCases] = useState([]); // <-- NOVO: Estado para a lista de processos
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Usamos Promise.all para buscar os dois dados em paralelo, é mais eficiente
        const [summaryResponse, casesResponse] = await Promise.all([
          apiClient.get('/portal/dashboard-summary'),
          apiClient.get('/portal/meus-processos') // <-- NOVO: Busca a lista de processos
        ]);

        setSummaryData(summaryResponse.data);
        setCases(casesResponse.data); // <-- NOVO: Salva os processos no estado
      } catch (err) {
        console.error("Erro ao buscar dados do portal:", err);
        setError('Não foi possível carregar os dados do portal.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Carregando dados do portal...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ position: 'relative', padding: '20px' }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <LogoutButton />
      </div>

      <h1>Dashboard do Cliente</h1>
      <h2>Bem-vindo(a), {currentUser?.displayName || 'Cliente'}!</h2>

      {summaryData && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
          <h3>Resumo</h3>
          <p><strong>Cliente:</strong> {summaryData.clientName}</p>
          <p><strong>Total de Processos Ativos:</strong> {summaryData.activeCasesCount}</p>
        </div>
      )}

      {/* NOVO: Seção para listar os processos 👇 */}
      <div style={{ marginTop: '30px' }}>
        <h3>Seus Processos</h3>
        {cases.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cases.map(processo => (
              <li key={processo.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
                <Link to={`/portal/processos/${processo.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <strong>Processo:</strong> {processo.numeroProcesso} <br />
                  <strong>Título:</strong> {processo.titulo} <br />
                  <strong>Status:</strong> {processo.status}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>Você ainda não possui processos cadastrados.</p>
        )}
      </div>
    </div>
  );
}

export default ClientDashboardPage;