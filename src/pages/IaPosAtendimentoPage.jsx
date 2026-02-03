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
import { Textarea } from "@/components/ui/textarea";
import { CardFooter } from "@/components/ui/card";

function IaPosAtendimentoPage() {
  const [cases, setCases] = useState([]);
  const [selectedprocessoId, setSelectedprocessoId] = useState('');

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

  const handleGenerate = async (type) => {
    if (!selectedprocessoId) return;

    setIsProcessing(true);
    setResult(null);

    try {
      if (type === "tradutor") {
        const r = await apiClient.post("/ai/pos/cliente/tradutor", { processoId: selectedprocessoId });
        setResult(r.data);
        return;
      }

      if (type === "timeline") {
        const r = await apiClient.post("/ai/pos/cliente/relatorio", { processoId: selectedprocessoId });
        setResult(r.data);
        return;
      }

      if (type === "guia") {
        const r = await apiClient.post("/ai/pos/estrategia/viabilidade", { processoId: selectedprocessoId });
        // mostra como “resultado”
        setResult(r.data);
        return;
      }

      if (type === "datajud") {
        const r = await apiClient.post("/ai/pos/estrategia/datajud", { processoId: selectedprocessoId });
        setResult(r.data);
        return;
      }

      if (type === "peca") {
        const r = await apiClient.post("/ai/pos/redacao/recurso", { processoId: selectedprocessoId });
        setResult(r.data);
        return;
      }
    } catch (e) {
      console.error(e);
      setResult({
        titulo: "Erro",
        conteudo: e?.response?.data?.error || "Falha ao executar a função. Verifique se o processo tem o campo 'sentenca' preenchido.",
        acao: "OK"
      });
    } finally {
      setIsProcessing(false);
    }
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
            <Select value={selectedprocessoId} onValueChange={setSelectedprocessoId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Busque pelo processo..." />
              </SelectTrigger>
              <SelectContent>
                {cases .filter(c => (c.status || "").toLowerCase() === "sentença")
                  .map(c => (
                    <SelectItem key={c.id} value={c.id}> {c.titulo} </SelectItem>
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
      {selectedprocessoId && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-slate-100 rounded-xl mb-6">
            <TabsTrigger value="cliente" className="py-3 gap-2"><MessageCircle className="w-4 h-4" /> Comunicação Cliente</TabsTrigger>
            <TabsTrigger value="estrategia" className="py-3 gap-2"><BookOpen className="w-4 h-4" /> Estratégia</TabsTrigger>
            <TabsTrigger value="redacao" className="py-3 gap-2"><FileEdit className="w-4 h-4" /> Redação Jurídica</TabsTrigger>
          </TabsList>

          {/* ABA 1: CLIENTE */}
          <TabsContent value="cliente" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card onClick={() => handleGenerate('tradutor')} className="cursor-pointer hover:border-purple-400 transition-all">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bot className="w-4 h-4 text-purple-600" /> Tradutor de "Juridiquês"</CardTitle><CardDescription>Resumir última decisão em linguagem simples.</CardDescription></CardHeader>
              </Card>
              <Card onClick={() => handleGenerate('timeline')} className="cursor-pointer hover:border-purple-400 transition-all">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><BellRing className="w-4 h-4 text-purple-600" /> Relatório Mensal</CardTitle><CardDescription>Gerar histórico cronológico para envio.</CardDescription></CardHeader>
              </Card>
            </div>
          </TabsContent>

          {/* ABA 2: ESTRATÉGIA */}
          <TabsContent value="estrategia" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card onClick={() => handleGenerate('guia')} className="cursor-pointer hover:border-purple-400 transition-all">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-blue-600" /> Viabilidade de Recurso (Sentença × Processo)
                  </CardTitle>
                  <CardDescription>Analisa a sentença, compara com o processo e gera prós/contras + score.</CardDescription>
                </CardHeader>
              </Card>

              <Card onClick={() => handleGenerate('datajud')} className="cursor-pointer hover:border-purple-400 transition-all">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-600" /> Consulta CNJ/Datajud (Visual)
                  </CardTitle>
                  <CardDescription>Gera query e filtros para buscar casos semelhantes (contrato pronto pra API).</CardDescription>
                </CardHeader>
              </Card>

            </div>
          </TabsContent>

          {/* ABA 3: REDAÇÃO */}
          <TabsContent value="redacao" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card onClick={() => handleGenerate('peca')} className="cursor-pointer hover:border-purple-400 transition-all">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" /> Minuta de Recurso
                  </CardTitle>
                  <CardDescription>Modelo base com trechos-chave da sentença e estrutura recursal.</CardDescription>
                </CardHeader>
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
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
              }}
            >
              Limpar
            </Button>

            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={async () => {
                const acao = result?.acao || "";

                if (acao.toLowerCase().includes("copiar")) {
                  await navigator.clipboard.writeText(result.conteudo || "");
                  return;
                }

                if (acao.toLowerCase().includes("pdf")) {
                  const resp = await apiClient.post(
                    "/ai/pos/pdf",
                    { titulo: result.titulo, conteudo: result.conteudo },
                    { responseType: "blob" }
                  );

                  const url = window.URL.createObjectURL(new Blob([resp.data], { type: "application/pdf" }));
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", "ia_pos_atendimento.pdf");
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                  return;
                }
              }}
            >
              {result.acao} <ChevronRight className="ml-2 w-4 h-4" />
            </Button>

          </CardFooter>
        </Card>
      )}

    </div>
  );
}

export default IaPosAtendimentoPage;