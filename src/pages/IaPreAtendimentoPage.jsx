import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { Bot, FileText, ListChecks, Scale, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function IaPreAtendimentoPage() {
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedLeadData, setSelectedLeadData] = useState(null);

  // Estados da IA
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // 1. Buscar Pré-atendimentos (apenas os pendentes/em negociação)
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await apiClient.get('/preatendimento');
        // Filtra para não mostrar os que já viraram processo ("Convertido")
        const activeLeads = response.data.filter(l => l.status !== 'Convertido');
        setLeads(activeLeads);
      } catch (error) {
        console.error("Erro ao buscar leads:", error);
      }
    };
    fetchLeads();
  }, []);

  // 2. Ao selecionar um caso, carrega os dados dele na tela
  const handleSelectLead = (value) => {
    setSelectedLeadId(value);
    const lead = leads.find(l => l.id === value);
    setSelectedLeadData(lead);
    setAnalysisResult(null); // Reseta a análise anterior
  };

  // 3. Função Fake para Simular a IA (Frontend apenas por enquanto)
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // Chama o backend real
      const response = await apiClient.post('/ai/triagem', { leadId: selectedLeadId });
      setAnalysisResult(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">

      {/* Cabeçalho da Página */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-purple-100 rounded-lg text-purple-700">
          <Bot className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Assistente Jurídico IA</h1>
          <p className="text-slate-500">Selecione um pré-atendimento para gerar uma análise preliminar inteligente.</p>
        </div>
      </div>

      {/* Área de Seleção */}
      <Card className="border-t-4 border-t-purple-500">
        <CardHeader>
          <CardTitle>Seleção de Caso</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/2 space-y-2">
            <label className="text-sm font-medium text-slate-700">Escolha o Pré-atendimento:</label>
            <Select value={selectedLeadId} onValueChange={handleSelectLead}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente..." />
              </SelectTrigger>
              <SelectContent>
                {leads.map(lead => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.nome} - {lead.categoria} ({lead.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!selectedLeadId || isAnalyzing}
            className="bg-purple-600 hover:bg-purple-700 text-white w-full md:w-auto min-w-[200px]"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" /> Analisando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Gerar Análise com IA
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Exibição dos Resultados */}
      {analysisResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* 1. Resumo Estruturado */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <FileText className="w-5 h-5 text-blue-600" /> Resumo Estruturado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 leading-relaxed">
              {analysisResult.resumo}
            </CardContent>
          </Card>

          {/* 2. Triagem Preliminar */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <ListChecks className="w-5 h-5 text-green-600" /> Triagem Preliminar
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 leading-relaxed">
              {analysisResult.triagem}
            </CardContent>
          </Card>

          {/* 3. Documentos Necessários */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <AlertTriangle className="w-5 h-5 text-orange-500" /> Documentos Sugeridos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {analysisResult.documentos.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 4. Parecer Inicial */}
          <Card className="bg-purple-50 border-purple-200 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-purple-900">
                <Scale className="w-5 h-5 text-purple-600" /> Parecer Inicial (IA)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-purple-800 font-medium leading-relaxed">
              {analysisResult.parecer}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}

export default IaPreAtendimentoPage;