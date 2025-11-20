import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

function CreateCaseForm({ onCaseCreated }) {
  // --- 1. DADOS BÁSICOS ---
  const [titulo, setTitulo] = useState('');
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);
  const [partesEnvolvidas, setPartesEnvolvidas] = useState('');

  // --- 2. CLASSIFICAÇÃO JURÍDICA ---
  const [area, setArea] = useState('Cível');
  const [assuntoEspecifico, setAssuntoEspecifico] = useState(''); // Ex: Danos morais
  const [comarca, setComarca] = useState('');
  const [localidade, setLocalidade] = useState(''); // Ex: SP - Capital
  const [instancia, setInstancia] = useState('');
  
  // --- 3. GESTÃO E RISCO ---
  const [valorCausa, setValorCausa] = useState(''); // R$
  const [complexidade, setComplexidade] = useState('Média');
  const [urgencia, setUrgencia] = useState('Média');
  const [probabilidade, setProbabilidade] = useState('Média');
  
  // --- 4. TRIAGEM E ORIGEM ---
  const [status, setStatus] = useState('Em andamento');
  const [etapaTriagem, setEtapaTriagem] = useState('Pronto para aceite');
  const [origem, setOrigem] = useState(''); // Ex: WhatsApp, Site
  const [tipoCliente, setTipoCliente] = useState('Pessoa Física');
  const [responsavel, setResponsavel] = useState(''); // Nome do advogado

  // Estados de controle
  const [error, setError] = useState('');
  const [loadingClients, setLoadingClients] = useState(true);

  // Busca clientes
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await apiClient.get('/clients');
        setClients(response.data);
      } catch (err) {
        console.error("Erro ao carregar clientes", err);
        setError("Erro ao carregar clientes.");
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
      // Monta o objeto completo com todos os filtros
      const caseData = { 
        titulo,
        numeroProcesso,
        clientId: selectedClient,
        partesEnvolvidas,
        
        area,
        assuntoEspecifico,
        comarca,
        localidade,
        instancia,
        
        valorCausa,
        complexidade,
        urgencia,
        probabilidade,
        
        status,
        etapaTriagem,
        origem,
        tipoCliente,
        responsavel
      };
      
      const response = await apiClient.post('/processo', caseData);
      
      alert('Processo criado com sucesso!');
      if(onCaseCreated) {
        onCaseCreated(response.data);
      }
      
      // Limpeza total do formulário
      setTitulo(''); setNumeroProcesso(''); setSelectedClient(''); setPartesEnvolvidas('');
      setArea('Cível'); setAssuntoEspecifico(''); setComarca(''); setLocalidade(''); setInstancia('');
      setValorCausa(''); setComplexidade('Média'); setUrgencia('Média'); setProbabilidade('Média');
      setStatus('Em andamento'); setEtapaTriagem('Pronto para aceite'); setOrigem(''); setTipoCliente('Pessoa Física'); setResponsavel('');

    } catch (err) {
      console.error("Erro ao criar processo:", err);
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao criar o processo.';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6 mb-5 p-4 border rounded-lg bg-white shadow-sm'>
      <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Novo Processo Completo</h3>
      
      {/* SEÇÃO 1: INFORMAÇÕES PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2">
           <label className="text-sm font-medium text-slate-700">Cliente *</label>
           <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="select-base" required>
            <option value="" disabled>{loadingClients ? 'Carregando...' : 'Selecione o Cliente'}</option>
            {!loadingClients && clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Título Interno *</label>
          <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Ação Indenizatória Silva" className="input-base" required />
        </div>
        <div>
           <label className="text-sm font-medium text-slate-700">Número CNJ</label>
           <input type="text" value={numeroProcesso} onChange={(e) => setNumeroProcesso(e.target.value)} className="input-base" placeholder="0000000-00.0000.0.00.0000" /> 
        </div>
      </div>

      {/* SEÇÃO 2: DETALHES JURÍDICOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Área do Direito</label>
          <select value={area} onChange={(e) => setArea(e.target.value)} className="select-base">
            <option>Cível</option>
            <option>Trabalhista</option>
            <option>Previdenciário</option>
            <option>Família</option>
            <option>Criminal</option>
            <option>Empresarial</option>
            <option>Tributário</option>
            <option>Consumidor</option>
            <option>Outros</option>
          </select>
        </div>
        <div>
           <label className="text-sm font-medium text-slate-700">Assunto Específico</label>
           <input type="text" value={assuntoEspecifico} onChange={(e) => setAssuntoEspecifico(e.target.value)} placeholder="Ex: Danos Morais" className="input-base" />
        </div>
        <div>
           <label className="text-sm font-medium text-slate-700">Tipo de Cliente</label>
           <select value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)} className="select-base">
             <option>Pessoa Física</option>
             <option>Empresa</option>
             <option>Prospect</option>
           </select>
        </div>
      </div>

      {/* SEÇÃO 3: LOCALIZAÇÃO E PARTES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div>
            <label className="text-sm font-medium text-slate-700">Comarca</label>
            <input type="text" value={comarca} onChange={(e) => setComarca(e.target.value)} className="input-base" />
         </div>
         <div>
            <label className="text-sm font-medium text-slate-700">Localidade (UF/Região)</label>
            <input type="text" value={localidade} onChange={(e) => setLocalidade(e.target.value)} placeholder="Ex: SP - Capital" className="input-base" />
         </div>
         <div>
            <label className="text-sm font-medium text-slate-700">Instância</label>
            <input type="text" value={instancia} onChange={(e) => setInstancia(e.target.value)} className="input-base" />
         </div>
         <div className="col-span-1 md:col-span-3">
            <label className="text-sm font-medium text-slate-700">Partes Envolvidas</label>
            <textarea value={partesEnvolvidas} onChange={(e) => setPartesEnvolvidas(e.target.value)} className="textarea-base h-20" placeholder="Autor vs Réu" />
         </div>
      </div>

      {/* SEÇÃO 4: GESTÃO ESTRATÉGICA */}
      <h4 className="text-sm font-bold text-slate-500 uppercase mt-2">Gestão e Estratégia</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div>
           <label className="text-sm font-medium text-slate-700">Valor Estimado (R$)</label>
           <input type="number" value={valorCausa} onChange={(e) => setValorCausa(e.target.value)} className="input-base" placeholder="0,00" />
         </div>
         <div>
            <label className="text-sm font-medium text-slate-700">Probabilidade Êxito</label>
            <select value={probabilidade} onChange={(e) => setProbabilidade(e.target.value)} className="select-base">
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
              <option>Quase certo</option>
            </select>
         </div>
         <div>
            <label className="text-sm font-medium text-slate-700">Complexidade</label>
            <select value={complexidade} onChange={(e) => setComplexidade(e.target.value)} className="select-base">
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
            </select>
         </div>
         <div>
            <label className="text-sm font-medium text-slate-700">Urgência</label>
            <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)} className="select-base">
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
              <option>Urgente</option>
            </select>
         </div>
      </div>

      {/* SEÇÃO 5: CONTROLE INTERNO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-md">
         <div>
            <label className="text-sm font-medium text-slate-700">Status Atual</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-base">
              <option>Em andamento</option>
              <option>Suspenso</option>
              <option>Arquivado</option>
              <option>Encerrado</option>
            </select>
         </div>
         <div>
            <label className="text-sm font-medium text-slate-700">Etapa Triagem</label>
            <select value={etapaTriagem} onChange={(e) => setEtapaTriagem(e.target.value)} className="select-base">
              <option>Aguardando documentos</option>
              <option>Análise</option>
              <option>Em revisão</option>
              <option>Pronto para aceite</option>
            </select>
         </div>
         <div>
            <label className="text-sm font-medium text-slate-700">Origem</label>
            <select value={origem} onChange={(e) => setOrigem(e.target.value)} className="select-base">
              <option value="">Selecione...</option>
              <option>Indicação</option>
              <option>Site</option>
              <option>WhatsApp</option>
              <option>Instagram</option>
              <option>Google Ads</option>
              <option>Outro</option>
            </select>
         </div>
         <div>
            <label className="text-sm font-medium text-slate-700">Advogado Responsável</label>
            <input type="text" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Nome" className="input-base" />
         </div>
      </div>

      <button type="submit" className="btn-primary w-full py-3 mt-4 font-bold text-lg">Salvar Processo</button>
      {error && <p className="text-red-500 text-center text-sm">{error}</p>}
    </form>
  );
}

export default CreateCaseForm;