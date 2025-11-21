import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import {
  AlertCircle, Bot, Sparkles, Scale, FileText, Paperclip,
  Gavel, ArrowRight, Clock, DollarSign, Receipt, CheckCircle2, AlertTriangle
} from 'lucide-react';

// Componentes Shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AtendimentoPage() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'administrador' || userRole === 'advogado';

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado local para capturar o número do processo antes de salvar
  const [protocolNumbers, setProtocolNumbers] = useState({});

  const fetchCases = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/processo');
      // Filtra apenas processos na fase ativa de atendimento
      const activeCases = response.data.filter(c =>
        ['Em andamento', 'Em Elaboração', 'Protocolado', 'Aguardando Audiência', 'Aguardando Sentença'].includes(c.status)
      );
      setCases(activeCases);
    } catch (error) {
      console.error("Erro ao buscar processos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Handler para o input de protocolo
  const handleProtocolChange = (id, value) => {
    setProtocolNumbers(prev => ({ ...prev, [id]: value }));
  };

  // Ação: Registrar Protocolo
  const handleRegistrarProtocolo = async (id) => {
    const numero = protocolNumbers[id];
    if (!numero) return alert("Digite o número do processo gerado pelo tribunal.");
    if (!window.confirm(`Confirma o protocolo sob o número ${numero}?`)) return;

    try {
      await apiClient.put(`/processo/${id}`, {
        status: 'Protocolado',
        numeroProcesso: numero
      });
      alert("Processo protocolado com sucesso!");
      fetchCases();
    } catch (error) {
      alert("Erro ao registrar protocolo.");
    }
  };

  const handleAddFee = async () => {
    await apiClient.post('/financial', {
      titulo: "Honorários Iniciais",
      valor: 1500,
      tipo: "receita",
      processoId: processo.id,
      clienteId: processo.clientId
    });
    // Atualiza a lista
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
          <div className="border-2 border-dashed border-blue-300 bg-blue-50 p-6 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-blue-900">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-lg">Copiloto Jurídico</h3>
                <p className="text-sm text-blue-700">Use a IA para minutar petições e analisar documentos.</p>
              </div>
            </div>
            <Button onClick={() => window.location.href = '/ia-atendimento'} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                        {/* Badge de Status Dinâmica */}
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${processo.status === 'Em Elaboração' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                          {processo.status}
                        </span>
                      </div>
                    </div>
                    {/* Exibe número do processo se existir */}
                    {processo.numeroProcesso && (
                      <Badge variant="secondary" className="font-mono">{processo.numeroProcesso}</Badge>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4 text-sm pt-0">
                    {/* --- GATILHO DO PROTOCOLO (Aparece se estiver em elaboração) --- */}
                    {(processo.status === 'Em Elaboração' || (processo.status === 'Em andamento' && !processo.numeroProcesso)) && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md animate-in fade-in zoom-in duration-300 mb-4">
                        <label className="text-xs font-bold text-yellow-800 mb-2 block flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" /> Ação Necessária: Registrar Protocolo
                        </label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nº do Processo (CNJ)"
                            className="bg-white h-8 text-sm"
                            onChange={(e) => handleProtocolChange(processo.id, e.target.value)}
                          />
                          <Button
                            size="sm"
                            className="bg-yellow-600 hover:bg-yellow-700 text-white h-8"
                            onClick={() => handleRegistrarProtocolo(processo.id)}
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* --- SISTEMA DE ABAS (Execução e Financeiro) --- */}
                    <Tabs defaultValue="execucao" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="execucao">Execução</TabsTrigger>
                        <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                      </TabsList>

                      {/* ABA 1: EXECUÇÃO */}
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
                          <textarea
                            className="textarea-base h-20 text-sm resize-none"
                            placeholder="Anotações sobre prazos ou estratégias..."
                          />
                        </div>
                      </TabsContent>

                      {/* ABA 2: FINANCEIRO */}
                      <TabsContent value="financeiro" className="space-y-3">
                        {/* Resumo Financeiro do Caso (Mockado por enquanto) */}
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded border">
                          <div className="text-xs">
                            <span className="text-slate-500 block">Total Cobrado</span>
                            <span className="font-bold text-slate-800">R$ 5.450,00</span>
                          </div>
                          <div className="text-xs text-right">
                            <span className="text-slate-500 block">Pendente</span>
                            <span className="font-bold text-red-600">R$ 350,00</span>
                          </div>
                        </div>

                        {/* Botões de Ação Financeira */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Button variant="outline" size="sm" className="text-xs h-8 border-green-200 text-green-700 hover:bg-green-50">
                            <DollarSign className="w-3 h-3 mr-1" /> + Honorário
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs h-8 border-orange-200 text-orange-700 hover:bg-orange-50">
                            <Receipt className="w-3 h-3 mr-1" /> + Custa/Despesa
                          </Button>
                        </div>

                        <p className="text-[10px] text-center text-slate-400 pt-1">
                          * Lançamentos aparecem na página "Financeiro".
                        </p>
                      </TabsContent>
                    </Tabs>

                  </CardContent>

                  {/* RODAPÉ DO CARD */}
                  <CardFooter className="flex justify-between items-center pt-3 border-t bg-slate-50/50">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>Início: {new Date(processo.createdAt._seconds * 1000).toLocaleDateString()}</span>
                    </div>

                    {/* Botão Gerenciar AGORA FUNCIONAL */}
                    <Link to={`/processos/${processo.id}`}>
                      <Button variant="ghost" size="sm" className="hover:bg-white hover:text-blue-600">
                        Ver Detalhes <ArrowRight className="ml-1 w-3 h-3" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
              {cases.length === 0 && <p className="text-slate-500 col-span-full text-center py-10">Nenhum processo ativo encontrado.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AtendimentoPage;