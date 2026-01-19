import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Plus, FileText, Check, X, Bot, Sparkles, ArrowLeft } from 'lucide-react';

// Componentes Shadcn/ui
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function PreAtendimentoPage() {
  const { userRole, currentUser } = useAuth();
  const navigate = useNavigate();
  const isAdmin = userRole === 'administrador' || userRole === 'advogado';

  // Estados do Formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [successForm, setSuccessForm] = useState(false);
  const [success, setSuccess] = useState(false); //#verificar necessidade
  const [errorForm, setErrorForm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Estados da Lista (Triagem)
  const [leads, setLeads] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // estado para clientes existentes e busca
  const [existingClients, setExistingClients] = useState([]);
  const [isExistingClient, setIsExistingClient] = useState(false);

  // --- FORMULÁRIO: ESTADO INICIAL ---
  const initialFormState = {
    nome: '', tipoPessoa: 'Física', cpfCnpj: '', dataNascimento: '', email: '', telefone: '',
    endereco: { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' },
    estadoCivil: '', profissao: '', nomeMae: '',
    categoria: '', resumoProblema: '', dataProblema: '', problemaContinuo: false,
    parteContrariaNome: '', tipoRelacao: '', documentos: [], objetivo: '', urgencia: 'Média',
    triagem: {}, informacaoExtra: '',
    consentimentoLGPD: false, consentimentoWhatsapp: false, consentimentoCadastro: false
  };
  const [formData, setFormData] = useState(initialFormState);
  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: {
              ...prev.endereco,
              rua: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf,
              cep: cep
            }
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP");
      }
    }
  };
  // --- LÓGICA CPF/CNPJ AUTOMÁTICA ---
  const handleCpfCnpjChange = (e) => {
    const value = e.target.value;
    // Remove não numéricos para contar
    const numericValue = value.replace(/\D/g, '');

    let tipo = formData.tipoPessoa;
    // Lógica simples: Passou de 11 dígitos, assume CNPJ (Pessoa Jurídica)
    if (numericValue.length > 11) {
      tipo = 'Jurídica';
    } else {
      tipo = 'Física';
    }

    setFormData(prev => ({
      ...prev,
      cpfCnpj: value,
      tipoPessoa: tipo
    }));
  };

  // --- 1. BUSCAR DADOS (Apenas se for Admin/Advogado) ---
  const fetchLeads = async () => {
    if (userRole !== 'administrador' && userRole !== 'advogado') return;
    setLoadingList(true);
    try {
      const response = await apiClient.get('/preatendimento');
      setLeads(response.data);
      const activeLeads = response.data.filter(l => l.status !== 'Convertido');
      setLeads(activeLeads);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [userRole]);

  useEffect(() => {
    if (isAdmin && isModalOpen) {
      apiClient.get('/clients')
        .then(res => {
          setExistingClients(res.data);
        })
        .catch(err => {
          console.error("Erro ao carregar clientes do backend:", err.response?.data || err.message);
        });
    }
  }, [isModalOpen, isAdmin]);

  useEffect(() => {
    if (currentUser && userRole === 'cliente') {
      setFormData(prev => ({
        ...prev,
        nome: currentUser.nome,
        email: currentUser.email,
        clientId: currentUser.uid // Vínculo direto
      }));
    }
  }, [currentUser]);

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
  //Função handleTransformar sem pagamento que funciona
  const handleTransformar = async (lead) => {
    if (!window.confirm(`Deseja transformar o caso de ${lead.nome} em um Processo?`)) return;
    try {
      const response = await apiClient.post(`/preatendimento/${lead.id}/converter`, { data: lead });
      const senha = response.data.tempPassword;

      alert(`SUCESSO!\n\nCliente e Processo criados.\n\nSENHA PROVISÓRIA DO CLIENTE: ${senha}\n\nAnote esta senha e envie para o cliente.`);

      fetchLeads();
    } catch (error) {
      console.error(error);
      alert("Erro ao converter.");
    }
  };

  //Função handleTransformar com pagamento à implementar
  /*
    const handleTransformar = async (lead) => {
      if (!window.confirm(`Criar Cliente e Processo para ${lead.nome}?`)) return;
      try {
        // ... chamada da API existente ...
  
        // --- FUTURA IMPLEMENTAÇÃO FINANCEIRA ---
        // Se houver um 'lead.proposalValue' (valor acordado), aqui chamaremos a API:
        // await apiClient.post('/financial/create-charge', { 
        //    clientId: res.clientId, 
        //    amount: lead.proposalValue,
        //    description: `Honorários Iniciais - ${lead.categoria}`
        // });
        // Isso irá gerar o item na TransactionsPage.
        // ---------------------------------------
  
        alert("Sucesso! Cliente e Processo criados.");
        fetchLeads();
      } catch (error) { alert("Erro ao converter."); }
    };
  
    */
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
      if (isAdmin) fetchLeads(); // Deixar comentado: window.scrollTo(0, 0); fetchLeads();
      window.scrollTo(0, 0);
      fetchLeads();
    } catch (err) {
      setErrorForm('Erro ao enviar. Tente novamente.');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleSendProposal = async (id, valor) => {
    if (!valor) return alert("Digite um valor.");

    const notas = document.getElementById(`notes-${id}`).value;

    try {
      await apiClient.put(`/preatendimento/${id}/proposal`, {
        proposalValue: valor,
        proposalStatus: 'sent',
        adminNotes: notas
      });
      fetchLeads();
    } catch (e) { alert("Erro ao enviar proposta"); }
  };

  // Função atualizada de Aceitar (Cria cliente)
  const handleAceitarInicial = async (lead) => {
    if (!window.confirm("Confirmação 1/2: Deseja aceitar este caso?")) return;
    if (!window.confirm("Confirmação 2/2: Isso criará o acesso do cliente imediatamente. Confirmar?")) return;

    try {
      const res = await apiClient.post(`/preatendimento/${lead.id}/accept`, lead);
      alert(`Cliente criado!\nSenha Provisória: ${res.data.tempPassword}`);
      fetchLeads();
    } catch (e) { alert("Erro ao aceitar."); }
  };

  const handleFileUpload = async (id) => {
    if (!selectedFile) return alert("Selecione um arquivo.");
    const formData = new FormData();
    formData.append('documento', selectedFile);

    try {
      await apiClient.post(`/preatendimento/${id}/upload`, formData);
      alert("Arquivo enviado com sucesso!");
      fetchLeads();
    } catch (e) { alert("Erro no upload."); }
  };

  //Prencher todos os campos. #verificar
  const renderCamposEspecificos = () => {
    switch (formData.categoria) {
      case 'Direito do Consumidor':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="col-span-full font-semibold text-slate-700">Detalhes do Consumidor</h4>
            <input name="triagem.empresaReclamada" placeholder="Empresa reclamada" className="input-base" onChange={handleChange} />
            <input name="triagem.produtoServico" placeholder="Produto/Serviço adquirido" className="input-base" onChange={handleChange} />
            <input name="triagem.valorPago" placeholder="Valor pago (R$)" type="number" className="input-base" onChange={handleChange} />
            <input name="triagem.dataCompra" type="date" title="Data da compra/contratação" className="input-base" onChange={handleChange} />
            <input name="triagem.protocoloAtendimento" placeholder="Protocolo de atendimento (se houver)" className="input-base" onChange={handleChange} />
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
            <input name="triagem.empresa" placeholder="Nome da empresa" className="input-base" onChange={handleChange} />
            <input name="triagem.cargo" placeholder="Cargo/Função" className="input-base" onChange={handleChange} />
            <div className="flex gap-2">
              <input name="triagem.admissao" type="date" title="Data de admissão" className="input-base" onChange={handleChange} />
              <input name="triagem.demissao" type="date" title="Data de demissão" className="input-base" onChange={handleChange} />
            </div>
            <input name="triagem.salario" placeholder="Último salário (R$)" type="number" className="input-base" onChange={handleChange} />
            <select name="triagem.registroCLT" className="select-base" onChange={handleChange}>
              <option value="">Registro em carteira?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
            <select name="triagem.horasExtras" className="select-base" onChange={handleChange}>
              <option value="">Teve horas extras?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
        );

      case 'Previdenciário':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="col-span-full font-semibold text-slate-700">Detalhes Previdenciários</h4>
            <input name="triagem.tipoBeneficio" placeholder="Tipo de benefício (ex: aposentadoria)" className="input-base" onChange={handleChange} />
            <input name="triagem.numeroBeneficio" placeholder="Número do benefício (NB)" className="input-base" onChange={handleChange} />
            <select name="triagem.statusINSS" className="select-base" onChange={handleChange}>
              <option value="">Status no INSS</option>
              <option value="Negado">Negado</option>
              <option value="Em análise">Em análise</option>
              <option value="Concedido">Concedido</option>
              <option value="Revisão">Revisão</option>
            </select>
            <input name="triagem.dataRequerimento" type="date" title="Data do requerimento" className="input-base" onChange={handleChange} />
          </div>
        );

      case 'Família e Sucessões':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="col-span-full font-semibold text-slate-700">Detalhes Familiares</h4>

            <select name="triagem.tipoDemandaFamilia" className="select-base" onChange={handleChange}>
              <option value="">Tipo de demanda</option>
              <option value="Divórcio">Divórcio</option>
              <option value="Guarda">Guarda</option>
              <option value="Pensão">Pensão</option>
              <option value="Inventário">Inventário</option>
              <option value="Partilha">Partilha</option>
              <option value="União Estável">União estável</option>
            </select>

            <select name="triagem.criancas" className="select-base" onChange={handleChange}>
              <option value="">Há crianças menores envolvidas?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>

            <input name="triagem.situacaoConvivencia" placeholder="Situação atual (ex: separado, morando junto)" className="input-base" onChange={handleChange} />

            <select name="triagem.bensEnvolvidos" className="select-base" onChange={handleChange}>
              <option value="">Há bens envolvidos?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>

            <select name="triagem.medidaProtetiva" className="select-base" onChange={handleChange}>
              <option value="">Há medida protetiva?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
        );

      case 'Cível':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="col-span-full font-semibold text-slate-700">Detalhes Cíveis</h4>
            <input name="triagem.naturezaDano" placeholder="Natureza da dívida ou dano" className="input-base" onChange={handleChange} />
            <input name="triagem.valorEnvolvido" placeholder="Valor aproximado envolvido (R$)" type="number" className="input-base" onChange={handleChange} />
            <select name="triagem.existeContrato" className="select-base" onChange={handleChange}>
              <option value="">Existe contrato?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
            <select name="triagem.haCobrancaJudicial" className="select-base" onChange={handleChange}>
              <option value="">Há cobrança judicial?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
        );

      case 'Criminal':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="col-span-full font-semibold text-slate-700">Detalhes Criminais</h4>
            <input name="triagem.tipoCrime" placeholder="Tipo de ocorrência (ex: ameaça, furto, etc.)" className="input-base" onChange={handleChange} />
            <input name="triagem.dataFato" type="date" title="Data do fato" className="input-base" onChange={handleChange} />
            <select name="triagem.existeBO" className="select-base" onChange={handleChange}>
              <option value="">Existe BO?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
            <select name="triagem.haAudiencia" className="select-base" onChange={handleChange}>
              <option value="">Já existe audiência?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
        );

      case 'Imobiliário':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="col-span-full font-semibold text-slate-700">Detalhes Imobiliários</h4>
            <select name="triagem.tipoImovel" className="select-base" onChange={handleChange}>
              <option value="">Tipo de imóvel</option>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Terreno">Terreno</option>
              <option value="Comercial">Comercial</option>
            </select>

            <select name="triagem.tipoProblemaImobiliario" className="select-base" onChange={handleChange}>
              <option value="">Tipo de problema</option>
              <option value="Locação">Locação</option>
              <option value="Compra e venda">Compra e venda</option>
              <option value="Condomínio">Condomínio</option>
              <option value="Usucapião">Usucapião</option>
              <option value="Posse/Despejo">Posse/Despejo</option>
            </select>

            <select name="triagem.existeContrato" className="select-base" onChange={handleChange}>
              <option value="">Existe contrato?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>

            <input name="triagem.valorImovel" placeholder="Valor aproximado do imóvel (R$)" type="number" className="input-base" onChange={handleChange} />
            <input name="triagem.cidadeUFImovel" placeholder="Cidade/UF do imóvel" className="input-base" onChange={handleChange} />
          </div>
        );

      case 'Tributário':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="col-span-full font-semibold text-slate-700">Detalhes Tributários</h4>
            <input name="triagem.tipoTributo" placeholder="Tipo de tributo (ex: IPTU, ICMS, IR)" className="input-base" onChange={handleChange} />
            <input name="triagem.anoCompetencia" placeholder="Ano de competência" type="number" className="input-base" onChange={handleChange} />
            <input name="triagem.valorEstimado" placeholder="Valor estimado (R$)" type="number" className="input-base" onChange={handleChange} />
            <select name="triagem.temAutoInfracao" className="select-base" onChange={handleChange}>
              <option value="">Tem auto de infração?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
            <input name="triagem.prazoTributario" type="date" title="Prazo (se houver)" className="input-base" onChange={handleChange} />
          </div>
        );

      case 'Empresarial':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="col-span-full font-semibold text-slate-700">Detalhes Empresariais</h4>
            <select name="triagem.tipoEmpresa" className="select-base" onChange={handleChange}>
              <option value="">Tipo de empresa</option>
              <option value="MEI">MEI</option>
              <option value="ME">ME</option>
              <option value="EPP">EPP</option>
              <option value="LTDA">LTDA</option>
              <option value="S/A">S/A</option>
            </select>
            <input name="triagem.areaConflito" placeholder="Área do conflito (ex: societário, contrato, cobrança)" className="input-base" onChange={handleChange} />
            <input name="triagem.valorEnvolvidoEmpresarial" placeholder="Valor envolvido (R$)" type="number" className="input-base" onChange={handleChange} />
            <select name="triagem.existeContrato" className="select-base" onChange={handleChange}>
              <option value="">Existe contrato?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
            <select name="triagem.sociosEnvolvidos" className="select-base" onChange={handleChange}>
              <option value="">Há sócios envolvidos?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
        );

      case 'Bancário/Financeiro':
      case 'Bancário / Financeiro':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="col-span-full font-semibold text-slate-700">Detalhes Bancários/Financeiros</h4>
            <input name="triagem.nomeBanco" placeholder="Banco/Instituição" className="input-base" onChange={handleChange} />
            <select name="triagem.tipoProblemaBancario" className="select-base" onChange={handleChange}>
              <option value="">Tipo de problema</option>
              <option value="Juros abusivos">Juros abusivos</option>
              <option value="Fraude">Fraude</option>
              <option value="Consignado">Consignado</option>
              <option value="Cartão de crédito">Cartão de crédito</option>
              <option value="Renegociação">Renegociação</option>
              <option value="Negativação indevida">Negativação indevida</option>
            </select>
            <input name="triagem.valorCobrado" placeholder="Valor cobrado (R$)" type="number" className="input-base" onChange={handleChange} />
            <select name="triagem.existeNegativacao" className="select-base" onChange={handleChange}>
              <option value="">Houve negativação?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
            <input name="triagem.dataInicioProblema" type="date" title="Início do problema" className="input-base" onChange={handleChange} />
          </div>
        );

      case 'Administrativo':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="col-span-full font-semibold text-slate-700">Detalhes Administrativos</h4>
            <input name="triagem.orgaoEnvolvido" placeholder="Órgão envolvido (ex: INSS, Prefeitura)" className="input-base" onChange={handleChange} />
            <input name="triagem.tipoAtoAdministrativo" placeholder="Tipo de ato (multa, indeferimento...)" className="input-base" onChange={handleChange} />
            <input name="triagem.numeroProcessoAdm" placeholder="Número do processo administrativo (se houver)" className="input-base" onChange={handleChange} />
            <input name="triagem.prazoRecurso" type="date" title="Prazo de recurso (se houver)" className="input-base" onChange={handleChange} />
            <select name="triagem.temDocumentoOficial" className="select-base" onChange={handleChange}>
              <option value="">Tem documento oficial?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
        );

      case 'Outros':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="col-span-full font-semibold text-slate-700">Outras Categorias</h4>

            <select name="triagem.categoriaOutros" className="select-base" onChange={handleChange}>
              <option value="">Selecione a categoria</option>
              <option value="Ambiental">Ambiental</option>
              <option value="Direito Digital">Direito Digital</option>
              <option value="Internacional">Direito Internacional</option>
              <option value="Marcas e Patentes">Marcas e Patentes</option>
              <option value="Direito da Saúde">Direito da Saúde</option>
              <option value="Educacional">Educacional</option>
              <option value="Direito Eleitoral">Direito Eleitoral</option>
              <option value="Direito Militar">Direito Militar</option>
              <option value="Direito do Trânsito">Direito do Trânsito</option>
            </select>

            <input
              name="triagem.descricaoOutros"
              placeholder="Descreva brevemente a demanda"
              className="input-base"
              onChange={handleChange}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Até formcontent
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
          {isAdmin && (
            <div className="bg-slate-100 p-3 rounded-md mb-4 flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">Vincular a cliente já cadastrado?</label>
              <Select onValueChange={(val) => {
                const client = existingClients.find(c => c.id === val);
                if (client) {
                  setFormData(prev => ({
                    ...prev,
                    clientId: client.id,
                    nome: client.name,
                    email: client.email,
                    cpfCnpj: client.cpfCnpj
                  }));
                  setIsExistingClient(true);
                }
              }}>
                <SelectTrigger className="w-[250px] bg-white">
                  <SelectValue placeholder="Selecione o cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {existingClients.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name || c.nome} ({c.cpfCnpj})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2 text-primary">1. Dados Pessoais</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Nome Completo / Razão Social *</label>
                <input name="nome" required className="input-base" value={formData.nome} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">CPF ou CNPJ *</label>
                <input name="cpfCnpj" required className="input-base" placeholder="Digite apenas números" value={formData.cpfCnpj} onChange={handleCpfCnpjChange} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Pessoa</label>
                <select name="tipoPessoa" className="select-base" value={formData.tipoPessoa} onChange={handleChange}>
                  <option value="Física">Pessoa Física</option>
                  <option value="Jurídica">Pessoa Jurídica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data de Nascimento *</label>
                <input name="dataNascimento" type="date" required className="input-base" value={formData.dataNascimento} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estado Civil</label>
                <select name="estadoCivil" className="select-base" value={formData.estadoCivil} onChange={handleChange}>
                  <option value="">Selecione...</option>
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                  <option value="União Estável">União Estável</option>
                  <option value="Não se aplica">Não se aplica (PJ)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">E-mail *</label>
                <input name="email" type="email" required className="input-base" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone / WhatsApp *</label>
                <input name="telefone" type="tel" required className="input-base" value={formData.telefone} onChange={handleChange} />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-md space-y-3 border border-slate-200">
              <p className="font-medium text-sm text-slate-700">Endereço Completo</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="label-base">CEP (Preenche automático)</label>
                  <input
                    name="endereco.cep"
                    placeholder="00000-000"
                    className="input-base"
                    value={formData.endereco.cep}
                    onChange={handleChange}
                    onBlur={handleCepBlur}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label-base">Rua / Av.</label>
                  <input name="endereco.rua" className="input-base" value={formData.endereco.rua} onChange={handleChange} />
                </div>
                <input name="endereco.numero" placeholder="Número" className="input-base" value={formData.endereco.numero} onChange={handleChange} />
                <input name="endereco.complemento" placeholder="Complemento" className="input-base" value={formData.endereco.complemento} onChange={handleChange} />
                <input name="endereco.bairro" placeholder="Bairro" className="input-base" value={formData.endereco.bairro} onChange={handleChange} />
                <input name="endereco.cidade" placeholder="Cidade" className="input-base" value={formData.endereco.cidade} onChange={handleChange} />
                <input name="endereco.estado" placeholder="UF" className="input-base" value={formData.endereco.estado} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className="textarea-base min-h-[120px] min-w-full"
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
              className="textarea-base min-w-full"
              placeholder="Deseja acrescentar mais alguma informação importante?"
              value={formData.informacaoExtra}
              onChange={handleChange}
            />
          </section>

          {/* 5. CONSENTIMENTOS */}

          <section className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
            <h3 className="font-bold text-blue-900">Termos e Consentimentos</h3>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input name="consentimentoLGPD" type="checkbox" required className="mt-1 w-5 h-5 text-primary rounded" checked={formData.consentimentoLGPD} onChange={handleChange} />
              <span className="text-sm text-slate-700"><strong>(Obrigatório)</strong> Autorizo o tratamento dos meus dados pessoais para fins de pré-atendimento jurídico, análise de caso e contato, em conformidade com a Lei Geral de Proteção de Dados (LGPD).</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input name="consentimentoWhatsapp" type="checkbox" required className="mt-1 w-5 h-5 text-primary rounded" checked={formData.consentimentoWhatsapp} onChange={handleChange} />
              <span className="text-sm text-slate-700"><strong>(Obrigatório)</strong> Concordo em receber mensagens, atualizações sobre meu caso e contatos da equipe jurídica através do WhatsApp informado.</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                name="consentimentoCadastro"
                type="checkbox"
                required // AGORA É OBRIGATÓRIO
                className="mt-1 w-5 h-5 text-primary rounded"
                checked={formData.consentimentoCadastro}
                onChange={handleChange}
              />
              <span className="text-sm text-slate-700">
                <strong>(Obrigatório)</strong> Concordo que meus dados sejam armazenados para a criação de um pré-cadastro, facilitando a continuidade do atendimento caso o serviço seja contratado.
              </span>
            </label>
          </section>

          <div className="flex gap-4 pt-4 border-t">
            {/* No modo público, não precisamos do botão cancelar, mas no modal sim. 
                Podemos ocultar via CSS ou lógica se quiser, mas pode deixar assim por enquanto. */}
            {isAdmin && <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>}

            <Button type="submit" disabled={loadingForm} className="btn-primary flex-1">
              {loadingForm ? 'Enviando...' : 'Registrar Solicitação'}
            </Button>
          </div>
          {errorForm && <p className="text-red-500 text-sm text-center">{errorForm}</p>}
          {renderCamposEspecificos()}
        </form>
      )
      }
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
              <div>
                <div className="flex items-center gap-2 mb-2 text-blue-900">
                  <Bot className="w-6 h-6" /> {/* Importe o ícone Bot de lucide-react */}
                  <h3 className="font-bold text-lg">Inteligência Artificial do Escritório</h3>
                </div>
                <p className="text-sm text-blue-700 max-w-xl">
                  Utilize nossa IA para analisar os pré-atendimentos pendentes. Ela fornecerá um resumo estruturado, sugestão de documentos e uma triagem preliminar para agilizar seu trabalho.
                </p>
              </div>
              <Button
                onClick={() => navigate("/ia-triagem")}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md whitespace-nowrap"
              >
                <Sparkles className="mr-2 h-4 w-4" /> Acessar Assistente IA
              </Button>
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

                    <CardContent className="space-y-4">
                      <div className="text-sm space-y-1 border-b pb-2">
                        <p><strong>Categoria:</strong> {lead.categoria}</p>
                        <p className="italic">"{lead.resumoProblema}"</p>
                      </div>

                      {/* --- ÁREA DE NEGOCIAÇÃO (Visível se status for 'Em Negociacao') --- */}
                      {lead.status === 'Em Negociacao' && (
                        <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-4">
                          <h4 className="font-bold text-blue-900 text-sm">Painel de Negociação</h4>

                          {/* 1. Observações (NOVO) */}
                          <div>
                            <label className="text-xs font-semibold">Instruções/Observações para o Cliente:</label>
                            <textarea
                              id={`notes-${lead.id}`} // ID único para pegar o valor
                              className="textarea-base w-full h-20 mt-1 text-sm"
                              placeholder="Descreva detalhes da proposta, formas de pagamento ou instruções..."
                              defaultValue={lead.adminNotes} // Mostra o que já foi salvo, se houver
                              disabled={lead.proposalStatus === 'sent' || lead.proposalStatus === 'accepted'}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={async () => {
                                const notas = document.getElementById(`notes-${lead.id}`).value;
                                await apiClient.put(`/preatendimento/${lead.id}/proposal`, { adminNotes: notas });
                                alert("Observações salvas.");
                              }}
                            >
                              Salvar Observações
                            </Button>
                          </div>

                          {/* 2. Envio de Arquivos */}
                          <div>
                            <label className="text-xs font-semibold">Anexar Documentos/Minutas:</label>
                            <div className="flex gap-2 mt-1">
                              <Input type="file" className="h-8 text-xs" onChange={(e) => setSelectedFile(e.target.files[0])} />
                              <Button size="sm" variant="outline" onClick={() => handleFileUpload(lead.id)}>Enviar</Button>
                            </div>
                          </div>

                          {/* 3. Valor da Proposta */}
                          <div>
                            <label className="text-xs font-semibold">Valor dos Honorários (R$):</label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="number"
                                placeholder="0,00"
                                disabled={lead.proposalStatus === 'sent' || lead.proposalStatus === 'accepted'}
                                defaultValue={lead.proposalValue}
                                id={`valor-${lead.id}`}
                              />
                              {lead.proposalStatus === 'sent' ? (
                                <Button size="sm" variant="ghost" className="text-green-600 border border-green-200 bg-green-50" disabled>
                                  Enviado (Aguardando)
                                </Button>
                              ) : lead.proposalStatus === 'accepted' ? (
                                <Button size="sm" variant="ghost" className="text-green-700 font-bold border border-green-600 bg-green-100" disabled>
                                  Aprovado!
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleSendProposal(lead.id, document.getElementById(`valor-${lead.id}`).value)}
                                >
                                  Enviar Proposta
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* 4. Status dos Arquivos do Cliente */}
                          <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                            <p>Arquivos do Cliente: {lead.clientFiles?.length || 0} anexados.</p>
                            {lead.signature ? (
                              <p className="text-green-600 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Assinado por: {lead.signature}
                              </p>
                            ) : (
                              <p>Aguardando assinatura.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2 items-end pt-2">
                      {/* Botões iniciais (Pendente) */}
                      {lead.status === 'Pendente' && (
                        <div className="flex gap-2">
                          <Button variant="destructive" onClick={() => handleRecusar(lead.id)}>Recusar</Button>
                          <Button onClick={() => handleAceitarInicial(lead)}>Aceitar e Criar Cliente</Button>
                        </div>
                      )}

                      {/* --- BOTÃO DE TRANSFORMAR EM PROCESSO (NOVO) --- */}
                      {/* Só aparece se: Status Negociação + Cliente Aceitou + Tem Assinatura #verificar */}
                      {/* {lead.status === 'Em Negociacao' && lead.proposalStatus === 'accepted' && lead.signature && ( */}
                      {lead.status === 'Em Negociacao' && (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md animate-in zoom-in"
                          onClick={() => handleTransformar(lead)}
                        >
                          <FileText className="mr-2 h-4 w-4" /> Aprovar e Gerar Processo
                        </Button>
                      )}

                      {/* Status Final */}
                      {lead.status === 'Convertido' && (
                        <Button variant="ghost" size="sm" disabled className="w-full border-green-200 bg-green-50 text-green-800">
                          ✓ Processo Criado
                        </Button>
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
          {!currentUser && (
            <CardHeader>
              <Button className="btn-primary" type="button" variant="secondary" onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Início
              </Button>
            </CardHeader>
          )}
          <CardContent className="text-center text-2xl">
            <CardTitle>Novo Pré-Atendimento</CardTitle>
            <CardDescription>Preencha os dados abaixo para iniciar.</CardDescription>
          </CardContent>
          <CardContent className="pt-2">
            {FormContent()}
          </CardContent>
        </Card>
      )}

    </div>
  );
}

export default PreAtendimentoPage;