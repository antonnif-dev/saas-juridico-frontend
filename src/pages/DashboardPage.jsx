import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, linkTo }) => (
  <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', minWidth: '200px', textAlign: 'center' }}>
    <h3 style={{ margin: 0, color: '#555' }}>{title}</h3>
    <p style={{ fontSize: '2.5rem', margin: '10px 0', fontWeight: 'bold' }}>{value}</p>
    {linkTo && <Link to={linkTo}>Ver mais</Link>}
  </div>
);

function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await apiClient.get('/clients');
        setClients(response.data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await apiClient.get('/dashboard/summary');
        setSummaryData(response.data);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setError('Não foi possível carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <p>Carregando dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          {currentUser && (
            <p className="mt-1">
              Seja muito bem-vindo de volta,{currentUser.nome}!
            </p>
          )}
        </div>
      </div>
      <hr className="mb-6"/>
      <div className="flex justify-center align-center my-8 gap-1">
        <StatCard title="Processos Ativos" value={summaryData?.processosAtivosCount} linkTo="/processos" />
        <StatCard title="Total de Clientes" value={summaryData?.totalClientesCount} linkTo="/clientes" />
      </div>

      <div>
        <h2>Próximos 5 Compromissos</h2>
        {summaryData?.proximosCompromissos.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {summaryData.proximosCompromissos.map(c => (
              <li key={c.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
                <strong>{c.titulo}</strong> ({c.tipo})
                <br />
                <small>{new Date(c.dataHora.seconds * 1000).toLocaleString('pt-BR')}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum compromisso futuro encontrado.</p>
        )}
        <Link to="/agenda">Ver agenda completa</Link>
      </div>
    </div>
  );
}

export default DashboardPage;