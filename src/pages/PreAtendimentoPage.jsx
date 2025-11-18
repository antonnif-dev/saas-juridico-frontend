import React, { useState } from 'react';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function PreAtendimentoPage() {
  const { currentUser, userRole } = useAuth(); // Para verificar permissões
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Estado único para todo o formulário
  const [formData, setFormData] = useState({
    // 1. Dados Pessoais
    nome: '',
    cpfCnpj: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    endereco: {
      rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: ''
    },
    estadoCivil: '',
    profissao: '',
    nomeMae: '',

    // 2. Dados do Caso
    categoria: '',
    resumoProblema: '',
    dataProblema: '',
    problemaContinuo: false,
    parteContrariaNome: '',
    tipoRelacao: '',
    documentos: [], // Array para checkboxes
    objetivo: '',
    urgencia: 'Média',

    // 3. Triagem Específica (Campos dinâmicos)
    triagem: {},

    // 4. Complementos
    informacaoExtra: '',

    // 5. Consentimentos
    consentimentoLGPD: false,
    consentimentoWhatsapp: false,
    consentimentoCadastro: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Lógica para campos aninhados (endereço)
    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: { ...prev.endereco, [field]: value }
      }));
      return;
    }

    // Lógica para campos da triagem específica
    if (name.startsWith('triagem.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        triagem: { ...prev.triagem, [field]: value }
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Lógica específica para checkboxes de documentos (array)
  const handleDocumentoChange = (docName) => {
    setFormData(prev => {
      const docs = prev.documentos.includes(docName)
        ? prev.documentos.filter(d => d !== docName)
        : [...prev.documentos, docName];
      return { ...prev, documentos: docs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Envia para o endpoint público ou autenticado dependendo da origem
      await apiClient.post('/preatendimento', formData);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao enviar sua solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZAÇÃO CONDICIONAL DOS CAMPOS ESPECÍFICOS ---
  const renderCamposEspecificos = () => {
    switch (formData.categoria) {
      case 'Direito do Consumidor':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="col-span-full font-semibold text-slate-700">Detalhes do Consumidor</h4>
            <input name="triagem.produtoServico" placeholder="Produto/Serviço Adquirido" className="input-base" onChange={handleChange} />
            <input name="triagem.valorPago" placeholder="Valor Pago (R$)" type="number" className="input-base" onChange={handleChange} />
            <select name="triagem.tentativaSolucao" className="select-base" onChange={handleChange}>
              <option value="">Houve tentativa de solução?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
        );
      case 'Trabalhista':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="col-span-full font-semibold text-slate-700">Detalhes Trabalhistas</h4>
            <input name="triagem.empresa" placeholder="Nome da Empresa" className="input-base" onChange={handleChange} />
            <input name="triagem.cargo" placeholder="Cargo/Função" className="input-base" onChange={handleChange} />
            <div className="flex gap-2">
              <input name="triagem.admissao" type="date" className="input-base" title="Data de Admissão" onChange={handleChange} />
              <input name="triagem.demissao" type="date" className="input-base" title="Data de Demissão" onChange={handleChange} />
            </div>
            <input name="triagem.salario" placeholder="Último Salário (R$)" type="number" className="input-base" onChange={handleChange} />
          </div>
        );
      case 'Previdenciário':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
             <h4 className="col-span-full font-semibold text-slate-700">Detalhes Previdenciários</h4>
             <input name="triagem.tipoBeneficio" placeholder="Tipo de Benefício (ex: Aposentadoria)" className="input-base" onChange={handleChange} />
             <input name="triagem.numeroBeneficio" placeholder="Número do Benefício (NB)" className="input-base" onChange={handleChange} />
          </div>
        );
      case 'Família e Sucessões':
        return (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
             <h4 className="col-span-full font-semibold text-slate-700">Detalhes Familiares</h4>
             <select name="triagem.criancas" className="select-base" onChange={handleChange}>
                <option value="">Há crianças menores envolvidas?</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
             </select>
             <input name="triagem.situacaoConvivencia" placeholder="Situação atual (ex: morando junto, separado)" className="input-base" onChange={handleChange} />
           </div>
        );
      case 'Cível':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
             <h4 className="col-span-full font-semibold text-slate-700">Detalhes Cíveis</h4>
             <input name="triagem.naturezaDano" placeholder="Natureza da dívida ou dano" className="input-base" onChange={handleChange} />
             <input name="triagem.valorEnvolvido" placeholder="Valores aproximados envolvidos (R$)" type="number" className="input-base" onChange={handleChange} />
          </div>
        );
      default:
        return null;
    }
  };

  // TELA DE SUCESSO
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Pré-atendimento Enviado!</h2>
        <p className="text-lg text-slate-600 max-w-md">
          Recebemos suas informações com sucesso. Nossa equipe jurídica analisará seu caso e entrará em contato pelo WhatsApp informado em breve.
        </p>
        <button onClick={() => window.location.href = '/login'} className="btn-primary mt-8 w-auto px-8">
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      
      {/* --- ESPAÇO RESERVADO: FUNÇÕES ADMINISTRATIVAS (VISÍVEL APENAS PARA STAFF) --- */}
      {(userRole === 'administrador' || userRole === 'advogado') && (
        <div className="mb-8 border-2 border-dashed border-blue-300 bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-blue-800">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-bold text-lg">Área Administrativa do Advogado</h3>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            Esta seção é visível apenas para a equipe interna. Aqui você poderá visualizar os pré-atendimentos recebidos e converter leads em clientes.
          </p>
          <div className="flex gap-4">
            <button className="btn-primary w-auto bg-blue-600 hover:bg-blue-700 text-sm">
              Visualizar Fila de Triagem
            </button>
            {/* Botão futuro para criar cliente a partir deste formulário */}
            <button className="btn-primary w-auto bg-slate-700 hover:bg-slate-800 text-sm" disabled>
              Gerar Cliente (Em breve)
            </button>
          </div>
        </div>
      )}
      {/* ----------------------------------------------------------------------- */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Formulário de Pré-Atendimento</h1>
        <p className="text-slate-500 mt-2">Preencha as informações abaixo para que possamos analisar seu caso com agilidade.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. DADOS PESSOAIS */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 text-primary">1. Dados Pessoais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Nome Completo *</label>
              <input name="nome" required className="input-base" value={formData.nome} onChange={handleChange} />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">CPF ou CNPJ *</label>
              <input name="cpfCnpj" required className="input-base" placeholder="000.000.000-00" value={formData.cpfCnpj} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data de Nascimento *</label>
              <input name="dataNascimento" type="date" required className="input-base" value={formData.dataNascimento} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">E-mail *</label>
              <input name="email" type="email" required className="input-base" value={formData.email} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefone / WhatsApp *</label>
              <input name="telefone" type="tel" required className="input-base" placeholder="(00) 00000-0000" value={formData.telefone} onChange={handleChange} />
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-slate-50 p-4 rounded-md space-y-3 border border-slate-100">
            <p className="font-medium text-sm text-slate-700">Endereço Completo</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input name="endereco.cep" placeholder="CEP" className="input-base" value={formData.endereco.cep} onChange={handleChange} />
              <div className="md:col-span-2">
                <input name="endereco.rua" placeholder="Rua / Av." className="input-base" value={formData.endereco.rua} onChange={handleChange} />
              </div>
              <input name="endereco.numero" placeholder="Número" className="input-base" value={formData.endereco.numero} onChange={handleChange} />
              <input name="endereco.complemento" placeholder="Complemento" className="input-base" value={formData.endereco.complemento} onChange={handleChange} />
              <input name="endereco.bairro" placeholder="Bairro" className="input-base" value={formData.endereco.bairro} onChange={handleChange} />
              <input name="endereco.cidade" placeholder="Cidade" className="input-base" value={formData.endereco.cidade} onChange={handleChange} />
              <input name="endereco.estado" placeholder="Estado (UF)" className="input-base" value={formData.endereco.estado} onChange={handleChange} />
            </div>
          </div>

          {/* Complementares */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <input name="estadoCivil" placeholder="Estado Civil" className="input-base" value={formData.estadoCivil} onChange={handleChange} />
             <input name="profissao" placeholder="Profissão" className="input-base" value={formData.profissao} onChange={handleChange} />
             <input name="nomeMae" placeholder="Nome da Mãe" className="input-base" value={formData.nomeMae} onChange={handleChange} />
          </div>
        </section>

        {/* 2. DADOS DO CASO */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 text-primary">2. Dados do Caso</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Categoria Jurídica *</label>
            <select name="categoria" required className="select-base" value={formData.categoria} onChange={handleChange}>
              <option value="">Selecione uma área...</option>
              <option value="Direito do Consumidor">Direito do Consumidor</option>
              <option value="Trabalhista">Trabalhista</option>
              <option value="Previdenciário">Previdenciário</option>
              <option value="Família e Sucessões">Família e Sucessões</option>
              <option value="Cível">Cível</option>
              <option value="Criminal">Criminal</option>
              <option value="Imobiliário">Imobiliário</option>
              <option value="Tributário">Tributário</option>
              <option value="Empresarial">Empresarial</option>
              <option value="Bancário / Financeiro">Bancário / Financeiro</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          {/* 3. TRIAGEM ESPECÍFICA (Renderizada condicionalmente) */}
          {renderCamposEspecificos()}

          <div>
            <label className="block text-sm font-medium mb-1">Resumo do Problema</label>
            <textarea 
              name="resumoProblema" 
              className="textarea-base min-h-[120px]" 
              placeholder="Descreva o que está acontecendo com o máximo de detalhes possíveis..."
              value={formData.resumoProblema}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium mb-1">Data aproximada do ocorrido</label>
               <input name="dataProblema" type="date" className="input-base" value={formData.dataProblema} onChange={handleChange} />
             </div>
             <div className="flex items-center h-full pt-6">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input name="problemaContinuo" type="checkbox" className="w-4 h-4 text-primary" checked={formData.problemaContinuo} onChange={handleChange} />
                 <span className="text-sm">O problema ainda está ocorrendo?</span>
               </label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input name="parteContrariaNome" placeholder="Nome da parte contrária (Pessoa/Empresa)" className="input-base" value={formData.parteContrariaNome} onChange={handleChange} />
             <input name="tipoRelacao" placeholder="Tipo de relação (ex: vizinho, patrão)" className="input-base" value={formData.tipoRelacao} onChange={handleChange} />
          </div>

          {/* Documentos (Checkboxes) */}
          <div>
            <label className="block text-sm font-medium mb-2">Quais documentos você possui? (Selecione)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Contratos', 'Comprovantes', 'Mensagens/Prints', 'Boletim de Ocorrência', 'Laudos', 'Sentenças', 'Outros'].map(doc => (
                <label key={doc} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.documentos.includes(doc)}
                    onChange={() => handleDocumentoChange(doc)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  {doc}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Objetivo Principal</label>
              <select name="objetivo" className="select-base" value={formData.objetivo} onChange={handleChange}>
                <option value="">Selecione...</option>
                <option value="Indenização">Receber indenização</option>
                <option value="Rescisão">Rescindir contrato</option>
                <option value="Ação Judicial">Ajuizar ação</option>
                <option value="Defesa">Defender-se em processo</option>
                <option value="Benefício">Obter benefício</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Urgência</label>
              <select name="urgencia" className="select-base" value={formData.urgencia} onChange={handleChange}>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta (Prazo/Processo em andamento)</option>
              </select>
            </div>
          </div>
        </section>

        {/* 4. COMPLEMENTOS */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 text-primary">4. Informações Adicionais</h2>
          <textarea 
            name="informacaoExtra" 
            className="textarea-base" 
            placeholder="Deseja acrescentar mais alguma informação importante?"
            value={formData.informacaoExtra}
            onChange={handleChange}
          />
        </section>

        {/* 5. CONSENTIMENTOS (LGPD) */}
        <section className="bg-slate-100 p-6 rounded-lg border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-800">Termos e Consentimentos</h3>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input name="consentimentoLGPD" type="checkbox" required className="mt-1 w-4 h-4 text-primary" checked={formData.consentimentoLGPD} onChange={handleChange} />
            <span className="text-sm text-slate-600">
              <strong>(Obrigatório)</strong> Autorizo o tratamento dos meus dados pessoais para fins de pré-atendimento jurídico, análise de caso e contato, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input name="consentimentoWhatsapp" type="checkbox" required className="mt-1 w-4 h-4 text-primary" checked={formData.consentimentoWhatsapp} onChange={handleChange} />
            <span className="text-sm text-slate-600">
              <strong>(Obrigatório)</strong> Concordo em receber mensagens, atualizações sobre meu caso e contatos da equipe jurídica através do WhatsApp informado.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input name="consentimentoCadastro" type="checkbox" className="mt-1 w-4 h-4 text-primary" checked={formData.consentimentoCadastro} onChange={handleChange} />
            <span className="text-sm text-slate-600">
              (Opcional) Concordo que meus dados sejam armazenados para a criação de um pré-cadastro, facilitando a continuidade do atendimento caso o serviço seja contratado.
            </span>
          </label>
        </section>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col gap-4 pt-4">
          {error && <p className="text-red-600 text-center font-medium">{error}</p>}
          
          <button type="submit" disabled={loading} className="btn-primary w-full md:w-1/3 md:mx-auto py-3 text-lg shadow-lg hover:shadow-xl transition-all">
            {loading ? 'Enviando...' : 'Finalizar Pré-Atendimento'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default PreAtendimentoPage;