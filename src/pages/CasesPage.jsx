import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import CreateCaseForm from '../components/CreateCaseForm';

function CasesPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      setError(null);
      try {
        // CORREÇÃO 1: Usando a nova rota '/processo' para buscar a lista
        const response = await apiClient.get('/processo');
        setCases(response.data);
      } catch (err) { // <-- CORREÇÃO 2: Adicionando '(err)' para declarar a variável de erro
        console.error("Erro detalhado ao buscar processos:", err.response || err);
        setError("Não foi possível carregar os processos. Verifique o console para mais detalhes.");
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const handleCaseCreated = (newCase) => {
    setCases(prevCases => [newCase, ...prevCases]);
  };

  return (
    <div>
      <h1>Meus Processos</h1>
      <CreateCaseForm onCaseCreated={handleCaseCreated} />
      <hr />
      <h2>Lista de Processos</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {cases.length > 0 ? (
            cases.map(c => (
              <li key={c.id}>
                <Link to={`/processos/${c.id}`}>
                  {c.titulo} ({c.area}) - Nº: {c.numeroProcesso}
                </Link>
              </li>
            ))
          ) : (
            <p>Nenhum processo encontrado.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default CasesPage;