import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, AlertCircle, Plus, FileText, Check, X } from 'lucide-react';

// Componentes Shadcn/ui
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function PreAtendimentoPage() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'administrador' || userRole === 'advogado';

  // Estados do Formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [successForm, setSuccessForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  // Estados da Lista (Triagem)
  const [leads, setLeads] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // --- FORMULÁRIO: ESTADO INICIAL ---
  const initialFormState = {
    nome: '', cpfCnpj: '', dataNascimento: '', email: '', telefone: '',
    endereco: { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' },
    estadoCivil: '', profissao: '', nomeMae: '',
    categoria: '', resumoProblema: '', dataProblema: '', problemaContinuo: false,
    parteContrariaNome: '', tipoRelacao: '', documentos: [], objetivo: '', urgencia: 'Média',
    triagem: {}, informacaoExtra: '',
    consentimentoLGPD: false, consentimientoWhatsapp: false, consentimientoCadastro: false
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- 1. BUSCAR DADOS (Apenas se for Admin/Advogado) ---
  const fetchLeads = async () => {
    if (userRole !== 'administrador' && userRole !== 'advogado') return;
    setLoadingList(true);
    try {
      const response = await apiClient.get('/preatendimento');
      setLeads(response.data);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [userRole]);

  // --- 2. AÇÕES DA TRIAGEM ---
  const handleRecusar = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir e recusar este caso?")) return;
    try {
      await apiClient.delete(`/preatendimento/${id}`);
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (error) { alert("Erro ao recusar."); }
  };

  const handleAceitar = async (id) => {
    try {
      await apiClient.put(`/preatendimento/${id}/status`, { status: 'aceitar' });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'Em Análise' } : l));
    } catch (error) { alert("Erro ao aceitar."); }
  };

  const handleTransformar = async (lead) => {
    if (!window.confirm(`Deseja transformar o caso de ${lead.nome} em um Processo?`)) return;
    
    try {
      const response = await apiClient.post(`/preatendimento/${lead.id}/converter`, { data: lead });
      
      // Captura a senha da resposta
      const senha = response.data.tempPassword;
      
      // Exibe no alert
      alert(`SUCESSO!\n\nCliente e Processo criados.\n\nSENHA PROVISÓRIA DO CLIENTE: ${senha}\n\nAnote esta senha e envie para o cliente.`);
      
      fetchLeads();
    } catch (error) { 
      console.error(error);
      alert("Erro ao converter."); 
    }
  };

  // --- 3. LÓGICA DO FORMULÁRIO ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, endereco: { ...prev.endereco, [field]: value } }));
      return;
    }
    if (name.startsWith('triagem.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, triagem: { ...prev.triagem, [field]: value } }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

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
    setLoadingForm(true);
    setErrorForm('');
    try {
      await apiClient.post('/preatendimento', formData);
      setSuccessForm(true);
      window.scrollTo(0, 0);
      fetchLeads();
    } catch (err) {
      setErrorForm('Erro ao enviar. Tente novamente.');
    } finally {
      setLoadingForm(false);
    }
  };

  //Prencher todos os campos. #verificar
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
  if (successForm) {
    return (//                                                se quiser adcionar duração do alert na tela: duration-500
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in">
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

  const FormContent = () => (
    <>
      {successForm ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-green-600">
          <CheckCircle2 className="w-16 h-16 mb-4" />
          <h3 className="text-2xl font-bold">Sucesso!</h3>
          <p>Solicitação registrada.</p>          
          <Button 
            onClick={() => {
              if (isAdmin) {
                setSuccessForm(false);
                setFormData(initialFormState);
              } else {
                window.location.href = '/login';
              }
            }} 
            className="btn-primary mt-8 w-auto px-8"
          >
            {isAdmin ? 'Novo Cadastro' : 'Voltar ao Início'}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
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
            <div className="bg-slate-50 p-4 rounded-md space-y-3 border border-slate-200">
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

            {/* 3. TRIAGEM ESPECÍFICA (Dinâmica) */}
            {renderCamposEspecificos()}

            <div>
              <label className="block text-sm font-medium mb-1">Resumo do Problema</label>
              <textarea
                name="resumoProblema"
                className="textarea-base min-h-[120px]"
                placeholder="Descreva o que está acontecendo com o máximo de detalhes..."
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
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input name="problemaContinuo" type="checkbox" className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" checked={formData.problemaContinuo} onChange={handleChange} />
                  <span className="text-sm">O problema ainda está ocorrendo?</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Parte Contrária</label>
                <input name="parteContrariaNome" placeholder="Nome da Pessoa/Empresa" className="input-base" value={formData.parteContrariaNome} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Relação</label>
                <input name="tipoRelacao" placeholder="Ex: vizinho, patrão, loja" className="input-base" value={formData.tipoRelacao} onChange={handleChange} />
              </div>
            </div>

            {/* Documentos */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <label className="block text-sm font-bold mb-3">Quais documentos você possui? (Selecione)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Contratos', 'Comprovantes', 'Mensagens/Prints', 'Boletim de Ocorrência', 'Laudos', 'Sentenças', 'Outros'].map(doc => (
                  <label key={doc} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.documentos.includes(doc)}
                      onChange={() => handleDocumentoChange(doc)}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
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
                  <option value="Regularização">Regularizar situação</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Urgência do Caso</label>
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

          {/* 5. CONSENTIMENTOS */}
          <section className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
            <h3 className="font-bold text-blue-900">Termos e Consentimentos</h3>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input name="consentimentoLGPD" type="checkbox" required className="mt-1 w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" checked={formData.consentimentoLGPD} onChange={handleChange} />
              <span className="text-sm text-slate-700">
                <strong>(Obrigatório)</strong> Autorizo o tratamento dos meus dados pessoais para fins de pré-atendimento jurídico, análise de caso e contato, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input name="consentimentoWhatsapp" type="checkbox" required className="mt-1 w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" checked={formData.consentimentoWhatsapp} onChange={handleChange} />
              <span className="text-sm text-slate-700">
                <strong>(Obrigatório)</strong> Concordo em receber mensagens, atualizações sobre meu caso e contatos da equipe jurídica através do WhatsApp informado.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input name="consentimentoCadastro" type="checkbox" className="mt-1 w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" checked={formData.consentimentoCadastro} onChange={handleChange} />
              <span className="text-sm text-slate-700">
                (Opcional) Concordo que meus dados sejam armazenados para a criação de um pré-cadastro, facilitando a continuidade do atendimento caso o serviço seja contratado.
              </span>
            </label>
          </section>

          {renderCamposEspecificos()}

          <div className="flex gap-4 pt-4 border-t">
            {/* No modo público, não precisamos do botão cancelar, mas no modal sim. 
                Podemos ocultar via CSS ou lógica se quiser, mas pode deixar assim por enquanto. */}
            {isAdmin && <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>}

            <Button type="submit" disabled={loadingForm} className="btn-primary flex-1">
              {loadingForm ? 'Enviando...' : 'Registrar Solicitação'}
            </Button>
          </div>
          {errorForm && <p className="text-red-500 text-sm text-center">{errorForm}</p>}
        </form>
      )}
    </>
  );

  // --- RENDERIZAÇÃO ---
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Central de Pré-Atendimento</h1>
          <p className="text-slate-500">Gestão e triagem de novas solicitações.</p>
        </div>
        
        {/* Botão "+" aparece APENAS para Admin/Advogado */}
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus className="mr-2 h-4 w-4" /> Novo Atendimento Manual
          </Button>
        )}
      </div>

      {/* --- CENÁRIO 1: ADMIN/ADVOGADO (VÊ A LISTA DE LEADS E O MODAL) --- */}
      {isAdmin ? (
        <>
          <div className="space-y-6">
            
            {/* Bloco Informativo Admin */}
            <div className="border-2 border-dashed border-blue-300 bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-blue-800">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-lg">Área Administrativa</h3>
              </div>
              <p className="text-sm text-blue-700">
                Abaixo estão as solicitações recebidas pelo site.
              </p>
            </div>

            {/* LISTA DE DADOS RECEBIDOS (O que estava faltando) */}
            <h2 className="text-xl font-bold text-slate-700 border-b pb-2">Fila de Solicitações</h2>
            
            {loadingList ? <p>Carregando fila...</p> : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {leads.map(lead => (
                  <Card key={lead.id} className={`border-l-4 ${lead.status === 'Convertido' ? 'border-l-green-500 opacity-60' : lead.status === 'Em Análise' ? 'border-l-blue-500' : 'border-l-yellow-500'}`}>
                    <CardHeader className="flex flex-row justify-between items-start pb-2">
                      <div>
                        <CardTitle className="text-lg">{lead.nome}</CardTitle>
                        <p className="text-sm text-muted-foreground">{lead.cpfCnpj || 'CPF não informado'} • {lead.telefone}</p>
                      </div>
                      <Badge variant={lead.status === 'Pendente' ? 'outline' : 'default'}>
                        {lead.status}
                      </Badge>
                    </CardHeader>
                    
                    <CardContent className="space-y-2 text-sm">
                      <p><span className="font-semibold">Categoria:</span> {lead.categoria}</p>
                      <div className="bg-slate-50 p-3 rounded-md italic text-slate-600">
                        "{lead.resumoProblema}"
                      </div>
                      <p className="text-xs text-muted-foreground pt-2">
                        Recebido em: {lead.createdAt?._seconds ? new Date(lead.createdAt._seconds * 1000).toLocaleDateString() : 'Hoje'}
                      </p>
                    </CardContent>

                    <CardFooter className="flex justify-end gap-2 pt-0">
                      {lead.status === 'Pendente' && (
                        <>
                          <Button variant="destructive" size="sm" onClick={() => handleRecusar(lead.id)}>
                            <X className="mr-1 h-4 w-4" /> Recusar
                          </Button>
                          <Button size="sm" onClick={() => handleAceitar(lead.id)}>
                            <Check className="mr-1 h-4 w-4" /> Aceitar
                          </Button>
                        </>
                      )}
                      {lead.status === 'Em Análise' && (
                        <>
                           <Button variant="outline" size="sm" onClick={() => handleRecusar(lead.id)}>Excluir</Button>
                           <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => handleTransformar(lead)}>
                             <FileText className="mr-1 h-4 w-4" /> Gerar Processo
                           </Button>
                        </>
                      )}
                      {lead.status === 'Convertido' && (
                         <Button variant="ghost" size="sm" disabled>Processo Criado</Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
                {leads.length === 0 && <p className="text-slate-500 col-span-full text-center py-10">Nenhuma solicitação pendente.</p>}
              </div>
            )}
          </div>

          {/* O Modal (Dialog) para cadastro manual */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Pré-Atendimento</DialogTitle>
                <DialogDescription>Preencha os dados para iniciar uma triagem.</DialogDescription>
              </DialogHeader>
              {FormContent()}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        
      /* --- CENÁRIO 2: PÚBLICO (VÊ O FORMULÁRIO DIRETO NA TELA) --- */
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle>Novo Pré-Atendimento</CardTitle>
            <CardDescription>Preencha os dados abaixo para iniciar.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {FormContent()}
          </CardContent>
        </Card>
      )}

    </div>
  );
}

export default PreAtendimentoPage;