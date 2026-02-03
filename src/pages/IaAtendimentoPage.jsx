import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { Bot, FileText, CheckCircle, AlertTriangle, Sparkles, Search, BookOpen, PenTool, Gavel, Scale } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

function IaAtendimentoPage() {
  const [cases, setCases] = useState([]);
  const [selectedprocessoId, setSelectedprocessoId] = useState('');
  const [selectedprocessoData, setSelectedprocessoData] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState("etapa1");

  // Busca Processos
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await apiClient.get('/processo');
        setCases(response.data);
      } catch (error) { console.error("Erro", error); }
    };
    fetchCases();
  }, []);

  const handleSelectCase = (value) => {
    setSelectedprocessoId(value);
    const item = cases.find(c => c.id === value);
    setSelectedprocessoData(item);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedprocessoId) return;

    setIsAnalyzing(true);
    
    try {
      const resp = await apiClient.post('/ai/atendimento/executar', {
        processoId: selectedprocessoId
      });

      setAnalysisResult(resp.data);
      setActiveTab("etapa1");
    } catch (e) {
      console.error('Erro ao executar IA:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleWhatsApp = async () => {
    const resp = await apiClient.post('/ai/atendimento/whatsapp', { processoId: selectedprocessoId });
    alert(resp.data.message); // ou abrir modal
  };

  const handleRegenerateFormal = async () => {
    const resp = await apiClient.post('/ai/atendimento/executar', {
      processoId: selectedprocessoId,
      tom: 'Mais Formal'
    });
    setAnalysisResult(resp.data);
    setActiveTab("etapa4");
  };

  const handleExportZip = async () => {
    const resp = await apiClient.post('/ai/atendimento/exportar',
      { processoId: selectedprocessoId },
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'application/zip' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'exportacao_processo.zip');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8 bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-100">
        <div className="p-3 bg-blue-600 rounded-lg text-white shadow-lg">
          <Bot className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">IA Jurídica - Execução Processual</h1>
          <p className="text-slate-600">Automação completa: da análise de documentos à redação final da peça.</p>
        </div>
      </div>

      {/* Seleção */}
      <Card className="border-t-4 border-t-blue-500 shadow-md">
        <CardHeader>
          <CardTitle>Selecionar Processo para Execução</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/2 space-y-2">
            <label className="text-sm font-medium text-slate-700">Processo Ativo:</label>
            <Select value={selectedprocessoId} onValueChange={handleSelectCase}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Busque pelo título ou número..." />
              </SelectTrigger>
              <SelectContent>
                {cases.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.titulo} ({c.area})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!selectedprocessoId || isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto min-w-[200px] h-11 text-base"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" /> Processando 6 Etapas...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Iniciar Execução IA
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* RESULTADOS (TABS) */}
      {analysisResult && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-slate-100 rounded-xl mb-6">
              <TabsTrigger value="etapa1" className="py-2 text-xs sm:text-sm">1. Docs</TabsTrigger>
              <TabsTrigger value="etapa2" className="py-2 text-xs sm:text-sm">2. Análise</TabsTrigger>
              <TabsTrigger value="etapa3" className="py-2 text-xs sm:text-sm">3. Roteiro</TabsTrigger>
              <TabsTrigger value="etapa4" className="py-2 text-xs sm:text-sm">4. Redação</TabsTrigger>
              <TabsTrigger value="etapa5" className="py-2 text-xs sm:text-sm">5. Revisão</TabsTrigger>
              <TabsTrigger value="etapa6" className="py-2 text-xs sm:text-sm font-bold text-blue-700">6. Protocolo</TabsTrigger>
            </TabsList>

            {/* CONTEÚDO DAS ABAS */}

            {/* ETAPA 1: DOCUMENTOS */}
            <TabsContent value="etapa1">
              <Card>
                <CardHeader><CardTitle className="flex gap-2 items-center"><Search className="w-5 h-5" /> Coleta e Validação</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border">{analysisResult.etapa1.narrativa}</p>
                    <div className="grid gap-2">
                      {analysisResult.etapa1.lista.map((doc, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                          <span className="font-medium">{doc.nome}</span>
                          {doc.status === 'ok' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">OK</Badge>}
                          {doc.status === 'missing' && <Badge variant="destructive">Faltando</Badge>}
                          {doc.status === 'warning' && <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Ilegível</Badge>}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={handleWhatsApp}
                      disabled={!selectedprocessoId || isAnalyzing}
                    >
                      Gerar Mensagem de Cobrança (WhatsApp)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ETAPA 2: ANÁLISE */}
            <TabsContent value="etapa2">
              <Card>
                <CardHeader><CardTitle className="flex gap-2 items-center"><Gavel className="w-5 h-5" /> Estratégia Jurídica</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="font-bold text-blue-800 mb-2">Ação Sugerida</h4>
                      <p className="text-lg">{analysisResult.etapa2.tipoAcao}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <h4 className="font-bold text-slate-800 mb-2">Estratégia</h4>
                      <p>{analysisResult.etapa2.estrategia}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Direitos Violados:</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.etapa2.direitos.map(d => <Badge key={d} variant="secondary">{d}</Badge>)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ETAPA 3: ROTEIRO */}
            <TabsContent value="etapa3">
              <Card>
                <CardHeader><CardTitle className="flex gap-2 items-center"><BookOpen className="w-5 h-5" /> Estrutura da Peça</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <span className="font-bold text-green-800">Valor da Causa Calculado:</span>
                    <span className="text-xl font-bold text-green-900">{analysisResult.etapa3.valorCausa}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold mb-2 underline">Tópicos:</h4>
                      <ul className="list-decimal list-inside space-y-1 text-sm">
                        {analysisResult.etapa3.estrutura.map(e => <li key={e}>{e}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2 underline">Jurisprudência Sugerida:</h4>
                      <p className="text-sm italic bg-slate-50 p-2 rounded border">{analysisResult.etapa3.jurisprudencia}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ETAPA 4: REDAÇÃO */}
            <TabsContent value="etapa4">
              <Card>
                <CardHeader><CardTitle className="flex gap-2 items-center"><PenTool className="w-5 h-5" /> Minuta Gerada</CardTitle><CardDescription>Tom: {analysisResult.etapa4.tom}</CardDescription></CardHeader>
                <CardContent>
                  <textarea
                    className="w-full h-64 p-4 font-mono text-sm bg-slate-50 border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={analysisResult?.etapa4?.minuta || ""}
                    readOnly
                  />
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={handleRegenerateFormal} disabled={!selectedprocessoId || isAnalyzing}>
                      Regenerar (Mais Formal)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ETAPA 5: REVISÃO */}
            <TabsContent value="etapa5">
              <Card>
                <CardHeader><CardTitle className="flex gap-2 items-center"><CheckCircle className="w-5 h-5" /> Controle de Qualidade</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded text-center">
                    <h4 className="text-sm text-slate-500">Ortografia</h4>
                    <p className="text-xl font-bold text-green-600">{analysisResult.etapa5.ortografia}</p>
                  </div>
                  <div className="p-4 border rounded text-center">
                    <h4 className="text-sm text-slate-500">Coerência</h4>
                    <p className="text-xl font-bold text-blue-600">{analysisResult.etapa5.coerencia}</p>
                  </div>
                  <div className="p-4 border rounded text-center bg-slate-50 col-span-full md:col-span-1">
                    <h4 className="text-sm text-slate-500">Resumo</h4>
                    <p className="text-sm mt-1">{analysisResult.etapa5.resumoEquipe}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ETAPA 6: PROTOCOLO */}
            <TabsContent value="etapa6">
              <Card className="border-green-500 border-2">
                <CardHeader><CardTitle className="flex gap-2 items-center text-green-800"><Gavel className="w-6 h-6" /> Finalização</CardTitle></CardHeader>
                <CardContent className="text-center space-y-6 py-8">
                  <div className="flex justify-center gap-8">
                    <div className="text-center"><CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" /><p>Anexos</p></div>
                    <div className="text-center"><CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" /><p>Timbre</p></div>
                    <div className="text-center"><CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" /><p>Links</p></div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">{analysisResult.etapa6.status}</h3>
                  <div className="flex justify-center gap-4">
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleExportZip}
                      disabled={!selectedprocessoId || isAnalyzing}
                    >
                      Exportar Pacote (ZIP)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      )}
    </div>
  );
}

export default IaAtendimentoPage;