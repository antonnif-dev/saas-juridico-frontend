import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

function ClientCaseDetailPage() {
  const { id: processoId } = useParams();

  const [processo, setProcesso] = useState(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [processoResponse, movimentacoesResponse] = await Promise.all([
          apiClient.get(`/processo/${processoId}`),
          apiClient.get(`/processo/${processoId}/movimentacoes`) // O cliente agora tem permissão
        ]);
        
        setProcesso(processoResponse.data);
        setMovimentacoes(movimentacoesResponse.data);
      } catch (err) {
        setError('Não foi possível carregar os dados do processo.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [processoId]);

  if (loading) return <div>Carregando detalhes do processo...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!processo) return <div>Processo não encontrado.</div>;

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/portal/dashboard">{'< Voltar para o Dashboard'}</Link>
      
      <h1 style={{ marginTop: '20px' }}>{processo.titulo}</h1>
      <p><strong>Número do Processo:</strong> {processo.numeroProcesso}</p>
      <p><strong>Status:</strong> {processo.status}</p>
      <p><strong>Área:</strong> {processo.area}</p>

      <div style={{ marginTop: '30px' }}>
        <h2>Linha do Tempo / Movimentações</h2>
        {movimentacoes.length > 0 ? (
          movimentacoes.map(mov => (
            <div key={mov.id} style={{ borderLeft: '3px solid #007bff', padding: '10px 20px', marginBottom: '15px' }}>
              <p><strong>{new Date(mov.data._seconds * 1000).toLocaleString('pt-BR')}</strong></p>
              <p>{mov.descricao}</p>
            </div>
          ))
        ) : (
          <p>Nenhuma movimentação registrada para este processo.</p>
        )}
      </div>
    </div>
  );
}

export default ClientCaseDetailPage;