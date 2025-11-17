import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

function CreateCaseForm({ onCaseCreated }) {
  // --- Seus campos existentes ---
  const [titulo, setTitulo] = useState('');
  const [area, setArea] = useState('Cível');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  
  // --- Novos campos do nosso planejamento ---
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [partesEnvolvidas, setPartesEnvolvidas] = useState('');
  const [comarca, setComarca] = useState('');
  const [instancia, setInstancia] = useState('');
  const [status, setStatus] = useState('Em andamento');

  // --- Seus estados de controle ---
  const [error, setError] = useState('');
  const [loadingClients, setLoadingClients] = useState(true);

  // Sua lógica para buscar clientes (perfeita, sem alterações)
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
      // Objeto de dados mesclado, com todos os campos
      const caseData = { 
        titulo, 
        area, 
        clientId: selectedClient,
        numeroProcesso,
        partesEnvolvidas,
        comarca,
        instancia,
        status,
      };
      
      const response = await apiClient.post('/processo', caseData);
      
      alert('Processo criado com sucesso!');
      if(onCaseCreated) {
        onCaseCreated(response.data);
      }
      
      // Limpa todos os campos do formulário
      setTitulo('');
      setArea('Cível');
      setSelectedClient('');
      setNumeroProcesso('');
      setPartesEnvolvidas('');
      setComarca('');
      setInstancia('');
      setStatus('Em andamento');

    } catch (err) {
      console.error("Erro detalhado ao criar processo:", err.response || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.[0]?.message || 'Ocorreu um erro.';
      setError(`Falha ao criar processo: ${errorMessage}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-5 mb-5'>
      <h3 className="text-xl font-semibold">Novo Processo</h3>      
      {/* Sua lista de seleção de clientes (perfeita, sem alterações) */}
      <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="select-base" required>
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
      <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do Processo" className="input-base" required />
      <input type="text" value={numeroProcesso} onChange={(e) => setNumeroProcesso(e.target.value)} className="input-base" placeholder="Número do Processo (CNJ)" required />      
      <textarea value={partesEnvolvidas} onChange={(e) => setPartesEnvolvidas(e.target.value)} className="textarea-base" placeholder="Partes Envolvidas (Autor, Réu)" />
      <input type="text" value={comarca} onChange={(e) => setComarca(e.target.value)} className="input-base" placeholder="Comarca" />
      <input type="text" value={instancia} onChange={(e) => setInstancia(e.target.value)} className="input-base" placeholder="Instância (1ª, 2ª, etc.)" />
      <select value={area} onChange={(e) => setArea(e.target.value)} className="select-base">
        <option value="Cível">Cível</option>
        <option value="Trabalhista">Trabalhista</option>
        <option value="Tributário">Tributário</option>
        <option value="Penal">Penal</option>
        <option value="Outro">Outro</option>
      </select>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-base">
        <option value="Em andamento">Em andamento</option>
        <option value="Suspenso">Suspenso</option>
        <option value="Arquivado">Arquivado</option>
      </select>
      <button type="submit">Salvar Processo</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default CreateCaseForm;