import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle, Bot, Sparkles, Scale, FileText, Paperclip,
  Gavel, ArrowRight, Clock, DollarSign, Receipt,
  Calendar as CalendarIcon, CheckCircle2
} from 'lucide-react';

// Componentes Shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function AtendimentoPage() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'administrador' || userRole === 'advogado';
  const navigate = useNavigate();

  // --- ESTADOS (Que estavam faltando) ---
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para input de protocolo
  const [protocolNumbers, setProtocolNumbers] = useState({});

  // Estados para o Modal de Decisão/Sentença
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [decisionResult, setDecisionResult] = useState('');

  // --- ESTADOS PARA FINANCEIRO ---
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [financeData, setFinanceData] = useState({
    titulo: '',
    valor: '',
    categoria: 'honorarios',
    processoId: '',
    clientId: ''
  });

  // Busca Processos
  const fetchCases = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/processo');
      // Filtra apenas os status desta fase
      const allCases = response.data;
      setCases(allCases);
    } catch (error) {
      console.error("Erro ao buscar processos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // --- FUNÇÕES DE AÇÃO (Que estavam faltando) ---

  // 1. Captura digitação do protocolo
  const handleProtocolChange = (id, value) => {
    setProtocolNumbers(prev => ({ ...prev, [id]: value }));
  };

  // 2. Salva o protocolo e muda status
  const handleRegistrarProtocolo = async (id) => {
    const numero = protocolNumbers[id];
    if (!numero) return alert("Digite o número do CNJ.");
    if (!window.confirm(`Confirmar protocolo: ${numero}?`)) return;

    try {
      await apiClient.put(`/processo/${id}`, { status: 'Protocolado', numeroProcesso: numero });
      alert("Status atualizado: Protocolado!");
      fetchCases();
    } catch (error) { alert("Erro ao atualizar."); }
  };

  // 3. Muda status direto (ex: "Aguardar Sentença")
  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Mudar status para: ${newStatus}?`)) return;
    try {
      await apiClient.put(`/processo/${id}`, { status: newStatus });
      fetchCases();
    } catch (error) { alert("Erro ao atualizar status."); }
  };

  // 4. Abre o Modal de Decisão
  const openDecisionModal = (processo) => {
    setSelectedProcess(processo);
    setDecisionModalOpen(true);
  };

  // 5. Salva a Decisão e move para Pós-Atendimento
  const handleSaveDecision = async () => {
    if (!decisionResult) return alert("Selecione o resultado.");

    try {
      await apiClient.put(`/processo/${selectedProcess.id}`, {
        status: 'Sentença', // Isso move o card para a página Pós
        resultadoSentenca: decisionResult
      });
      setDecisionModalOpen(false);
      alert(`Decisão registrada! O processo foi movido para a fase de Pós-Atendimento.`);
      fetchCases(); // Recarrega a lista (o card vai sumir daqui)
    } catch (error) { alert("Erro ao registrar decisão."); }
  };

  const handleAddFinance = async () => {
    if (!financeData.titulo || !financeData.valor) return alert("Preencha título e valor.");

    try {
      await apiClient.post('/financial/transactions', {
        ...financeData,
        valor: parseFloat(financeData.valor),
        tipo: 'receita', // Definido como receita por padrão neste botão
        status: 'pending',
        dataVencimento: new Date() // Simplificado para o teste
      });

      setFinanceModalOpen(false);
      alert("Cobrança registrada com sucesso!");
      setFinanceData({ titulo: '', valor: '', categoria: 'honorarios', processoId: '', clientId: '' });
    } catch (error) {
      console.error("Erro ao salvar financeiro:", error);
      alert("Erro ao registrar cobrança.");
    }
  };

  // --- RENDERIZAÇÃO DO RODAPÉ INTELIGENTE ---
  const renderSmartFooter = (processo) => {

    if (
      processo.status === 'Em Elaboração' ||
      (processo.status === 'Em andamento' &&
        (!processo.numeroProcesso || processo.numeroProcesso === 'Aguardando Distribuição'))
    ) {
      return (
        <div className="w-full bg-yellow-50 border border-yellow-200 p-3 rounded-md flex flex-col gap-2 animate-in fade-in">
          <label className="text-xs font-bold text-yellow-800 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" /> Ação Necessária: Protocolar
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Cole o Nº do Processo (CNJ)"
              className="bg-white h-8 text-sm"
              onChange={(e) => handleProtocolChange(processo.id, e.target.value)}
            />
            <Button
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white h-8 whitespace-nowrap"
              onClick={() => handleRegistrarProtocolo(processo.id)}
            >
              Salvar Protocolo
            </Button>
          </div>
        </div>
      );
    }

    if (
      processo.status === 'Protocolado' ||
      (processo.status === 'Em andamento' && processo.numeroProcesso && processo.numeroProcesso !== 'Aguardando Distribuição')
    ) {
      return (
        <div className="w-full flex flex-col gap-2 animate-in fade-in">
          <p className="text-xs text-center text-blue-600 font-medium">Processo Protocolado. Próxima etapa?</p>
          <div className="flex gap-2">
            {/* Botão 1: Vai para Agenda */}
            <Button variant="outline" size="sm" className="flex-1"
              onClick={() => navigate('/agenda', { state: { tipo: 'Audiência', processoId: processo.id } })} // <--- ADICIONADO STATE
            >
              <CalendarIcon className="w-3 h-3 mr-2" /> Agendar Audiência
            </Button>

            {/* Botão 2: Pula direto para aguardar sentença */}
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => handleUpdateStatus(processo.id, 'Aguardando Sentença')}
            >
              Aguardar Sentença
            </Button>
          </div>
        </div>
      );
    }

    // CENÁRIO C: Aguardando Audiência (Status Específico)
    if (processo.status === 'Aguardando Audiência') {
      return (
        <div className="w-full animate-in fade-in">
          <p className="text-xs text-center text-orange-600 mb-2 font-medium">Audiência Agendada</p>
          <Button
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleUpdateStatus(processo.id, 'Aguardando Sentença')}
          >
            <CheckCircle2 className="w-3 h-3 mr-2" /> Audiência Realizada (Mover p/ Sentença)
          </Button>
        </div>
      );
    }

    // CENÁRIO D: Aguardando Sentença -> Registrar Decisão
    if (processo.status === 'Aguardando Sentença') {
      return (
        <div className="w-full animate-in fade-in">
          <p className="text-xs text-center text-purple-600 mb-2 font-medium">Conclusos para Julgamento</p>
          <Button
            size="sm"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
            onClick={() => openDecisionModal(processo)}
          >
            <Gavel className="w-3 h-3 mr-2" /> Registrar Sentença / Decisão
          </Button>
        </div>
      );
    }

    // Padrão (Caso de segurança: Visualização apenas)
    return (
      <Link to={`/processos/${processo.id}`} className="w-full">
        <Button variant="ghost" size="sm" className="w-full justify-between hover:bg-white">
          Ver Detalhes Completos <ArrowRight className="ml-1 w-3 h-3" />
        </Button>
      </Link>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Atendimento Ativo</h1>
          <p className="text-slate-500">Gestão, execução e financeiro dos processos em andamento.</p>
        </div>
      </div>

      {isAdmin && (
        <div className="space-y-6">
          {/* Banner IA */}
          <div className="border-2 border-dashed border-blue-300 bg-blue-50 p-6 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-blue-900">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-lg">Copiloto Jurídico</h3>
                <p className="text-sm text-blue-700">Use a IA para minutar petições e analisar documentos.</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/ia-atendimento")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Sparkles className="mr-2 h-4 w-4" /> Acessar IA de Execução
            </Button>
          </div>

          <h2 className="text-xl font-bold text-slate-700 border-b pb-2">Fila de Trabalho</h2>

          {loading ? <p>Carregando casos...</p> : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cases.map(processo => (
                <Card key={processo.id} className={`border-l-4 shadow-sm transition-all ${processo.status === 'Em Elaboração' ? 'border-l-yellow-500' : 'border-l-blue-600'}`}>
                  <CardHeader className="flex flex-row justify-between items-start pb-2">
                    <div className="overflow-hidden pr-2">
                      <CardTitle className="text-lg truncate">{processo.titulo}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{processo.area}</Badge>
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase bg-slate-100 text-slate-700`}>
                          {processo.status}
                        </span>
                      </div>
                    </div>
                    {processo.numeroProcesso && (
                      <Badge variant="secondary" className="font-mono">{processo.numeroProcesso}</Badge>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4 text-sm pt-0">
                    {/* ABAS (Execução e Financeiro) - MANTIDAS */}
                    <Tabs defaultValue="execucao" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="execucao">Execução</TabsTrigger>
                        <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                      </TabsList>

                      <TabsContent value="execucao" className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold flex items-center gap-1 text-slate-500 mb-1">
                            <Paperclip className="w-3 h-3" /> Anexar Peças/Docs:
                          </label>
                          <div className="flex gap-2">
                            <Input type="file" className="h-8 text-xs" />
                            <Button size="sm" variant="outline" className="h-8">Enviar</Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold flex items-center gap-1 text-slate-500 mb-1">
                            <FileText className="w-3 h-3" /> Notas Internas:
                          </label>
                          <textarea className="textarea-base h-20 text-sm resize-none p-2 border rounded" placeholder="Anotações..."></textarea>
                        </div>
                      </TabsContent>

                      <TabsContent value="financeiro" className="space-y-3">
                        {/* ... (manter o bloco de Total Cobrado) */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Button
                            variant="outline" size="sm"
                            className="text-xs h-8 border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => {
                              setFinanceData({
                                titulo: `Honorários - ${processo.titulo}`,
                                valor: '',
                                categoria: 'honorarios',
                                processoId: processo.id,
                                clientId: processo.clientId
                              });
                              setFinanceModalOpen(true);
                            }}
                          >
                            <DollarSign className="w-3 h-3 mr-1" /> + Honorário
                          </Button>

                          <Button
                            variant="outline" size="sm"
                            className="text-xs h-8 border-orange-200 text-orange-700 hover:bg-orange-50"
                            onClick={() => {
                              setFinanceData({
                                titulo: `Custa - ${processo.titulo}`,
                                valor: '',
                                categoria: 'custas',
                                processoId: processo.id,
                                clientId: processo.clientId
                              });
                              setFinanceModalOpen(true);
                            }}
                          >
                            <Receipt className="w-3 h-3 mr-1" /> + Custa/Despesa
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>

                  </CardContent>

                  {/* RODAPÉ INTELIGENTE */}
                  <CardFooter className="pt-4 border-t bg-slate-50/50 flex flex-col gap-3">
                    <div className="w-full flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>Criado em: {processo.createdAt?._seconds ? new Date(processo.createdAt._seconds * 1000).toLocaleDateString() : 'Data desc.'}</span>
                    </div>
                    {renderSmartFooter(processo)}
                  </CardFooter>
                </Card>
              ))}
              {cases.length === 0 && <p className="text-slate-500 col-span-full text-center py-10">Nenhum processo ativo encontrado.</p>}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE DECISÃO (FALTAVA ISSO NO ÚLTIMO CÓDIGO) */}
      <Dialog open={decisionModalOpen} onOpenChange={setDecisionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Decisão / Sentença</DialogTitle>
            <DialogDescription>
              O processo será movido para a fase de <strong>Pós-Atendimento</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <label className="text-sm font-medium">Qual foi o resultado?</label>
            <Select value={decisionResult} onValueChange={setDecisionResult}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Procedente">Procedente (Ganhamos)</SelectItem>
                <SelectItem value="Improcedente">Improcedente (Perdemos)</SelectItem>
                <SelectItem value="Parcial">Parcialmente Procedente</SelectItem>
                <SelectItem value="Acordo">Acordo Homologado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveDecision} className="bg-purple-600 text-white hover:bg-purple-700">
              Salvar e Mover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE ADICIONAR COBRANÇA */}
      <Dialog open={financeModalOpen} onOpenChange={setFinanceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Cobrança Financeira</DialogTitle>
            <DialogDescription>Registre um novo lançamento vinculado a este processo.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição da Cobrança</label>
              <Input
                value={financeData.titulo}
                onChange={(e) => setFinanceData({ ...financeData, titulo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={financeData.valor}
                onChange={(e) => setFinanceData({ ...financeData, valor: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFinanceModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddFinance} className="bg-green-600 hover:bg-green-700 text-white">
              Confirmar Lançamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AtendimentoPage;