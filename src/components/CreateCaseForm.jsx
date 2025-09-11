import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

function CreateCaseForm({ onCaseCreated }) {
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [titulo, setTitulo] = useState('');
  const [area, setArea] = useState('Cível');
  
  // Estados para a lista de clientes e cliente selecionado
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  
  const [error, setError] = useState('');
  const [loadingClients, setLoadingClients] = useState(true); // Estado de loading para clientes

  // Busca a lista de clientes quando o formulário é montado
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await apiClient.get('/clients');
        setClients(response.data);
      } catch (err) {
        console.error("Não foi possível carregar a lista de clientes", err);
        setError("Erro ao carregar clientes para seleção.");
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      setError('Por favor, selecione um cliente.');
      return;
    }
    setError('');
    try {
      const newCase = { 
        numeroProcesso, 
        titulo, 
        area, 
        clienteId: selectedClient 
      };
      
      const response = await apiClient.post('/processo', newCase);
      
      alert('Processo criado com sucesso!');
      onCaseCreated(response.data);
      
      setNumeroProcesso('');
      setTitulo('');
      setSelectedClient('');
    } catch (err) {
      console.error("Erro detalhado ao criar processo:", err.response || err);
      const errorMessage = err.response?.data?.[0]?.message || err.response?.data?.message || 'Ocorreu um erro.';
      setError(`Falha ao criar processo: ${errorMessage}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
      <h3>Novo Processo</h3>
      
      <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} required>
        <option value="" disabled>
          {loadingClients ? 'Carregando clientes...' : 'Selecione um Cliente'}
        </option>
        {!loadingClients && (
          clients.length > 0 ? (
            clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))
          ) : (
            <option disabled>Nenhum cliente cadastrado</option>
          )
        )}
      </select>

      <input type="text" value={numeroProcesso} onChange={(e) => setNumeroProcesso(e.target.value)} placeholder="Número do Processo (CNJ)" required />
      <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do Processo" required />
      <select value={area} onChange={(e) => setArea(e.target.value)}>
        <option value="Cível">Cível</option>
        <option value="Trabalhista">Trabalhista</option>
        <option value="Tributário">Tributário</option>
        <option value="Penal">Penal</option>
        <option value="Outro">Outro</option>
      </select>

      <button type="submit">Salvar Processo</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default CreateCaseForm;