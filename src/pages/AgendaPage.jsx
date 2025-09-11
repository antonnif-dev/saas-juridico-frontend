import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { Link } from 'react-router-dom';

function AgendaPage() {
  const [compromissos, setCompromissos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do formulário
  const [titulo, setTitulo] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [tipo, setTipo] = useState('Prazo');
  const [selectedProcesso, setSelectedProcesso] = useState('');
  const [error, setError] = useState('');
  
  // Função para buscar os dados iniciais (compromissos e processos)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [compromissosRes, processosRes] = await Promise.all([
        apiClient.get('/agenda'),
        apiClient.get('/processo')
      ]);
      setCompromissos(compromissosRes.data);
      setProcessos(processosRes.data);
    } catch (err) {
      console.error("Erro ao buscar dados da agenda:", err);
      setError("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const newCompromisso = { titulo, dataHora, tipo, processoId: selectedProcesso };
      await apiClient.post('/agenda', newCompromisso);
      alert('Compromisso criado com sucesso!');
      // Limpa formulário e recarrega a lista
      setTitulo('');
      setDataHora('');
      setSelectedProcesso('');
      fetchData();
    } catch (err) {
      const errorMessage = err.response?.data?.[0]?.message || err.response?.data?.message || 'Erro.';
      setError(`Falha ao criar compromisso: ${errorMessage}`);
    }
  };

  // Função para formatar a data que vem do Firestore
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return 'Data inválida';
    return new Date(timestamp.seconds * 1000).toLocaleString('pt-BR');
  };

  return (
    <div>
      <h1>Agenda e Prazos</h1>
      <form onSubmit={handleSubmit} style={{ /* ...estilos... */ }}>
        <h3>Novo Compromisso</h3>
        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" required />
        <input type="datetime-local" value={dataHora} onChange={e => setDataHora(e.target.value)} required />
        <select value={tipo} onChange={e => setTipo(e.target.value)}>
          <option>Prazo</option>
          <option>Audiência</option>
          <option>Reunião</option>
          <option>Outro</option>
        </select>
        <select value={selectedProcesso} onChange={e => setSelectedProcesso(e.target.value)} required>
          <option value="" disabled>Vincular a um Processo</option>
          {processos.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
        </select>
        <button type="submit">Adicionar</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <hr />
      <h2>Próximos Compromissos</h2>
      {loading ? <p>Carregando...</p> : (
        <ul>
          {compromissos.map(c => (
            <li key={c.id}>
              <Link to={`/agenda/${c.id}`}>
                <strong>{c.titulo}</strong> ({c.tipo}) - {formatDate(c.dataHora)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AgendaPage;