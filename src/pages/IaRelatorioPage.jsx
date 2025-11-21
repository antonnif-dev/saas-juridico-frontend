import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { Bot, FileText, Mail, Shield, Sparkles, ChevronRight, Star, Download } from 'lucide-react';

// UI Components
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function IaRelatorioPage() {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("relatorio");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await apiClient.get('/processo');
        // Filtra apenas encerrados/arquivados
        const closedCases = response.data.filter(c => ['Encerrado', 'Arquivado', 'Concluído'].includes(c.status));
        setCases(closedCases);
      } catch (error) { console.error(error); }
    };
    fetchCases();
  }, []);

  const handleGenerate = (type) => {
    setIsProcessing(true);
    setResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      
      if (type === 'pdf') {
        setResult({
          titulo: "Relatório Final Completo (PDF)",
          conteudo: "RESUMO DO CASO:\nProcesso nº 00123... julgado procedente.\n\nLINHA DO TEMPO:\n- 10/01: Inicial\n- 05/06: Audiência\n- 20/11: Sentença\n- 15/12: Pagamento\n\nVALORES FINAIS:\nRecebido: R$ 25.000,00\nHonorários: R$ 7.500,00\nLíquido Cliente: R$ 17.500,00",
          acao: "Baixar PDF"
        });
      } 
      else if (type === 'preventivo') {
        setResult({
          titulo: "Guia de Orientações Futuras",
          conteudo: "RECOMENDAÇÕES:\n1. Revisar contratos de fornecedores a cada 12 meses.\n2. Manter notas fiscais organizadas digitalmente.\n3. Caso receba nova notificação, não responder sem orientação.\n\nOFERTA EXCLUSIVA:\nMonitoramento preventivo de CPF por R$ 49,90/mês.",
          acao: "Enviar para Cliente"
        });
      }
      else if (type === 'email') {
        setResult({
          titulo: "Mensagem de Encerramento e NPS",
          conteudo: "Olá [Nome]! Foi um prazer defender seus interesses. Seu processo foi concluído com êxito.\n\nGostaria de saber: De 0 a 10, quanto indicaria nosso escritório?\n\nLink para avaliação: [LINK_NPS]",
          acao: "Enviar Email/WhatsApp"
        });
      }
    }, 2500);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      <div className="flex items-center gap-3 mb-8 bg-gradient-to-r from-green-50 to-white p-6 rounded-xl border border-green-100">
        <div className="p-3 bg-green-600 rounded-lg text-white shadow-lg">
          <Bot className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">IA de Encerramento e Fidelização</h1>
          <p className="text-slate-600">Gere relatórios finais, colete feedbacks e ofereça serviços preventivos.</p>
        </div>
      </div>

      <Card className="border-t-4 border-t-green-500 shadow-md">
        <CardContent className="pt-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/2 space-y-2">
            <label className="text-sm font-medium text-slate-700">Selecione o Processo Encerrado:</label>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger className="h-11 bg-white">
                <SelectValue placeholder="Busque pelo processo..." />
              </SelectTrigger>
              <SelectContent>
                {cases.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.titulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedCaseId && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-slate-100 rounded-xl mb-6">
            <TabsTrigger value="relatorio" className="py-3 gap-2"><FileText className="w-4 h-4"/> Relatório Final</TabsTrigger>
            <TabsTrigger value="preventivo" className="py-3 gap-2"><Shield className="w-4 h-4"/> Preventivo & Vendas</TabsTrigger>
            <TabsTrigger value="nps" className="py-3 gap-2"><Star className="w-4 h-4"/> Feedback / NPS</TabsTrigger>
          </TabsList>

          <TabsContent value="relatorio" className="space-y-4">
            <Card onClick={() => handleGenerate('pdf')} className="cursor-pointer hover:border-green-400 transition-all border-l-4 border-l-blue-500">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4"/> Gerar PDF de Prestação de Contas</CardTitle><CardDescription>Resumo do caso, valores e sentença.</CardDescription></CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="preventivo" className="space-y-4">
            <Card onClick={() => handleGenerate('preventivo')} className="cursor-pointer hover:border-green-400 transition-all border-l-4 border-l-yellow-500">
               <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4"/> Plano de Acompanhamento</CardTitle><CardDescription>Gerar proposta de monitoramento contínuo.</CardDescription></CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="nps" className="space-y-4">
            <Card onClick={() => handleGenerate('email')} className="cursor-pointer hover:border-green-400 transition-all border-l-4 border-l-purple-500">
               <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="w-4 h-4"/> Email de Encerramento</CardTitle><CardDescription>Agradecimento e link de avaliação.</CardDescription></CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* RESULTADO */}
      {isProcessing && (
        <div className="p-12 text-center border rounded-lg bg-slate-50 animate-pulse">
           <Sparkles className="w-8 h-8 text-green-500 mx-auto mb-4 animate-spin" />
           <p className="text-green-700 font-medium">Gerando documentos finais...</p>
        </div>
      )}

      {result && (
        <Card className="bg-white shadow-lg animate-in zoom-in-95 duration-300">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">{result.titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea 
              className="w-full min-h-[200px] bg-slate-50 font-mono text-sm p-4 border rounded-md resize-none" 
              value={result.conteudo}
              readOnly
            />
          </CardContent>
          <CardFooter className="justify-end gap-3 bg-slate-50/50 pt-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              {result.acao} <Download className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

    </div>
  );
}

export default IaRelatorioPage;