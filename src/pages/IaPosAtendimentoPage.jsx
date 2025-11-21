import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { 
  Bot, MessageCircle, BookOpen, FileEdit, Sparkles, 
  ChevronRight, Mic, FileText, BellRing, Search, Scale,
  Gavel, CheckCircle, PenTool
} from 'lucide-react';

// UI Components
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function IaPosAtendimentoPage() {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("cliente"); // cliente, estrategia, redacao

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await apiClient.get('/processo');
        setCases(response.data);
      } catch (error) { console.error(error); }
    };
    fetchCases();
  }, []);

  // SIMULAÇÃO DAS FUNÇÕES DA IA
  const handleGenerate = (type) => {
    setIsProcessing(true);
    setResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      
      if (type === 'tradutor') {
        setResult({
          titulo: "Explicação para o Cliente (WhatsApp/Email)",
          conteudo: "Olá! O juiz acabou de dar uma decisão importante (Sentença). Em resumo: ganhamos os pedidos de horas extras, mas o dano moral foi negado. O valor estimado subiu para R$ 35.000. A empresa ainda pode recorrer em 8 dias. Recomendo aguardarmos o prazo deles antes de qualquer ação.",
          acao: "Copiar Texto"
        });
      } 
      else if (type === 'guia') {
        setResult({
          titulo: "Guia de Preparação para Audiência",
          conteudo: "1. Chegar 30min antes.\n2. Levar RG original e Carteira de Trabalho.\n3. Testemunhas: João e Maria (confirmar presença).\n4. Ponto de atenção: O advogado da empresa vai perguntar sobre o horário de almoço. Responda apenas a verdade: que fazia 20min.\n5. Não se exaltar com o juiz.",
          acao: "Gerar PDF"
        });
      }
      else if (type === 'peca') {
        setResult({
          titulo: "Minuta de Réplica à Contestação",
          conteudo: "EXCELENTÍSSIMO SENHOR DOUTOR...\n\nEm que pese o esforço da Reclamada, suas alegações não merecem prosperar. A preliminar de inépcia é descabida pois...\n\n[IA gerou 3 páginas de argumentação baseada na contestação anexada]...",
          acao: "Exportar Word"
        });
      }
      else if (type === 'timeline') {
         setResult({
            titulo: "Relatório Mensal de Andamentos",
            conteudo: "Histórico do mês de Outubro:\n- 05/10: Protocolo da Inicial\n- 12/10: Juiz designou audiência para Nov/2025\n- 28/10: Citação da empresa via correio.\n\nPróximos passos: Aguardar defesa da empresa até a audiência.",
            acao: "Enviar por E-mail"
         });
      }

    }, 2500);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 bg-gradient-to-r from-purple-50 to-white p-6 rounded-xl border border-purple-100">
        <div className="p-3 bg-purple-600 rounded-lg text-white shadow-lg">
          <Bot className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">IA de Gestão Processual</h1>
          <p className="text-slate-600">Traduza "juridiquês" para clientes, prepare audiências e gere relatórios automáticos.</p>
        </div>
      </div>

      {/* Seleção */}
      <Card className="border-t-4 border-t-purple-500 shadow-md">
        <CardContent className="pt-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/2 space-y-2">
            <label className="text-sm font-medium text-slate-700">Selecione o Processo:</label>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Busque pelo processo..." />
              </SelectTrigger>
              <SelectContent>
                {cases.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.titulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pb-2 text-sm text-slate-400 italic hidden md:block">
            Selecione um processo para liberar as ferramentas.
          </div>
        </CardContent>
      </Card>

      {/* FERRAMENTAS IA */}
      {selectedCaseId && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-slate-100 rounded-xl mb-6">
            <TabsTrigger value="cliente" className="py-3 gap-2"><MessageCircle className="w-4 h-4"/> Comunicação Cliente</TabsTrigger>
            <TabsTrigger value="estrategia" className="py-3 gap-2"><BookOpen className="w-4 h-4"/> Estratégia</TabsTrigger>
            <TabsTrigger value="redacao" className="py-3 gap-2"><FileEdit className="w-4 h-4"/> Redação Jurídica</TabsTrigger>
          </TabsList>

          {/* ABA 1: CLIENTE */}
          <TabsContent value="cliente" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card onClick={() => handleGenerate('tradutor')} className="cursor-pointer hover:border-purple-400 transition-all">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bot className="w-4 h-4 text-purple-600"/> Tradutor de "Juridiquês"</CardTitle><CardDescription>Resumir última decisão em linguagem simples.</CardDescription></CardHeader>
              </Card>
              <Card onClick={() => handleGenerate('timeline')} className="cursor-pointer hover:border-purple-400 transition-all">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><BellRing className="w-4 h-4 text-purple-600"/> Relatório Mensal</CardTitle><CardDescription>Gerar histórico cronológico para envio.</CardDescription></CardHeader>
              </Card>
            </div>
          </TabsContent>

          {/* ABA 2: ESTRATÉGIA */}
          <TabsContent value="estrategia" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card onClick={() => handleGenerate('guia')} className="cursor-pointer hover:border-purple-400 transition-all">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mic className="w-4 h-4 text-blue-600"/> Preparação Audiência</CardTitle><CardDescription>Gerar guia de perguntas e comportamento.</CardDescription></CardHeader>
              </Card>
               {/* Placeholder para outras ferramentas */}
               <Card className="opacity-50"><CardHeader><CardTitle className="text-base">Análise de Risco (Em breve)</CardTitle></CardHeader></Card>
            </div>
          </TabsContent>

          {/* ABA 3: REDAÇÃO */}
          <TabsContent value="redacao" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Card onClick={() => handleGenerate('peca')} className="cursor-pointer hover:border-purple-400 transition-all">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-green-600"/> Minutar Peça</CardTitle><CardDescription>Réplica, Recurso ou Manifestação.</CardDescription></CardHeader>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      )}

      {/* ÁREA DE RESULTADO */}
      {isProcessing && (
        <div className="p-12 text-center border rounded-lg bg-slate-50 animate-pulse">
           <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-4 animate-spin" />
           <p className="text-purple-700 font-medium">A Inteligência Artificial está analisando os autos...</p>
        </div>
      )}

      {result && (
        <Card className="border-l-4 border-l-purple-600 bg-white shadow-lg animate-in zoom-in-95 duration-300">
          <CardHeader>
            <CardTitle className="text-xl text-purple-900">{result.titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              className="min-h-[200px] bg-slate-50 font-sans text-base leading-relaxed p-4 border-slate-200 focus:ring-purple-500 textarea-base" 
              value={result.conteudo}
              readOnly
            />
          </CardContent>
          <CardFooter className="justify-end gap-3 bg-slate-50/50 pt-4">
            <Button variant="outline">Refazer</Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              {result.acao} <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

    </div>
  );
}

export default IaPosAtendimentoPage;