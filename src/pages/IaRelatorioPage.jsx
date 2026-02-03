import React, { useEffect, useMemo, useState } from "react";
import apiClient from "@/services/apiClient";
import { Bot, FileText, Mail, Shield, Sparkles, Star, Download, Copy, Trash2 } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

function norm(s) {
  return (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function IaRelatorioPage() {
  const [cases, setCases] = useState([]);
  const [selectedprocessoId, setSelectedprocessoId] = useState("");
  const [selectedProcesso, setSelectedProcesso] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("relatorio"); // relatorio | preventivo | nps

  const archivedCases = useMemo(() => {
    // Somente Arquivado
    return (cases || []).filter((c) => norm(c.status) === "arquivado");
  }, [cases]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await apiClient.get("/processo");
        setCases(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCases();
  }, []);

  useEffect(() => {
    if (!selectedprocessoId) {
      setSelectedProcesso(null);
      setResult(null);
      return;
    }
    const item = (archivedCases || []).find((c) => c.id === selectedprocessoId) || null;
    setSelectedProcesso(item);
    setResult(null);
  }, [selectedprocessoId, archivedCases]);

  const handleGenerate = async (type) => {
    if (!selectedprocessoId) return;

    setIsProcessing(true);
    setResult(null);

    try {
      if (type === "pdf") {
        const r = await apiClient.post("/ai/relatorio/final", { processoId: selectedprocessoId });
        setResult(r.data);
        return;
      }
      if (type === "preventivo") {
        const r = await apiClient.post("/ai/relatorio/preventivo", { processoId: selectedprocessoId });
        setResult(r.data);
        return;
      }
      if (type === "email") {
        const r = await apiClient.post("/ai/relatorio/nps", { processoId: selectedprocessoId });
        setResult(r.data);
        return;
      }
    } catch (e) {
      console.error(e);
      setResult({
        titulo: "Erro",
        conteudo:
          e?.response?.data?.error ||
          "Falha ao executar a função. Confirme se o processo está com status 'Arquivado' e se o backend está com as rotas /ai/relatorio/* ativas.",
        acao: "OK",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result?.conteudo || "");
    } catch (e) {
      console.error(e);
      alert("Não foi possível copiar. Tente novamente.");
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const resp = await apiClient.post(
        "/ai/relatorio/pdf",
        { titulo: result?.titulo || "Relatório", conteudo: result?.conteudo || "" },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([resp.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "relatorio_final.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Falha ao gerar/baixar o PDF.");
    }
  };

  const actionMode = useMemo(() => {
    const a = (result?.acao || "").toLowerCase();
    if (a.includes("pdf")) return "pdf";
    if (a.includes("copiar")) return "copy";
    return "copy";
  }, [result]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-white p-6 rounded-xl border border-green-100">
        <div className="p-3 bg-green-600 rounded-lg text-white shadow-lg">
          <Bot className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">IA de Encerramento e Fidelização</h1>
          <p className="text-slate-600">
            Gere relatório final do caso, orientações preventivas e mensagem de encerramento para manter o cliente próximo.
          </p>
        </div>
      </div>

      {/* Seleção */}
      <Card className="border-t-4 border-t-green-500 shadow-md">
        <CardHeader>
          <CardTitle>Selecionar Processo Arquivado</CardTitle>
          <CardDescription>Somente processos com status “Arquivado” aparecem aqui.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/2 space-y-2">
            <label className="text-sm font-medium text-slate-700">Processo:</label>
            <Select value={selectedprocessoId} onValueChange={setSelectedprocessoId}>
              <SelectTrigger className="h-11 bg-white">
                <SelectValue placeholder="Busque pelo processo..." />
              </SelectTrigger>
              <SelectContent>
                {archivedCases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!!selectedProcesso && (
            <div className="flex flex-wrap gap-2 md:justify-end w-full">
              <Badge variant="secondary">{selectedProcesso.area || "Área não informada"}</Badge>
              <Badge variant="outline">Status: {selectedProcesso.status}</Badge>
              {selectedProcesso.resultadoSentenca ? (
                <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                  Resultado: {selectedProcesso.resultadoSentenca}
                </Badge>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Painel resumo do processo */}
      {!!selectedProcesso && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Resumo do Processo</CardTitle>
            <CardDescription>Baseado nos campos cadastrados no sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg bg-white">
                <p className="text-xs text-slate-500">Título</p>
                <p className="font-medium text-slate-900">{selectedProcesso.titulo || "-"}</p>
              </div>
              <div className="p-3 border rounded-lg bg-white">
                <p className="text-xs text-slate-500">Número do Processo</p>
                <p className="font-medium text-slate-900">{selectedProcesso.numeroProcesso || "-"}</p>
              </div>
            </div>

            <div className="p-3 border rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500 mb-1">Descrição</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {selectedProcesso.descricao || "Sem descrição preenchida."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ferramentas */}
      {selectedprocessoId && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-slate-100 rounded-xl mb-6">
            <TabsTrigger value="relatorio" className="py-3 gap-2">
              <FileText className="w-4 h-4" /> Relatório Final
            </TabsTrigger>
            <TabsTrigger value="preventivo" className="py-3 gap-2">
              <Shield className="w-4 h-4" /> Preventivo & Vendas
            </TabsTrigger>
            <TabsTrigger value="nps" className="py-3 gap-2">
              <Star className="w-4 h-4" /> Feedback / NPS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="relatorio" className="space-y-4">
            <Card
              onClick={() => handleGenerate("pdf")}
              className="cursor-pointer hover:border-green-400 transition-all border-l-4 border-l-blue-500"
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Gerar Relatório Final (texto + PDF)
                </CardTitle>
                <CardDescription>Prestação de contas com dados reais do processo.</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="preventivo" className="space-y-4">
            <Card
              onClick={() => handleGenerate("preventivo")}
              className="cursor-pointer hover:border-green-400 transition-all border-l-4 border-l-yellow-500"
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Orientações Futuras + Oferta Preventiva
                </CardTitle>
                <CardDescription>Texto pronto para enviar ao cliente após encerramento.</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="nps" className="space-y-4">
            <Card
              onClick={() => handleGenerate("email")}
              className="cursor-pointer hover:border-green-400 transition-all border-l-4 border-l-purple-500"
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Mensagem Final (Fidelização + NPS)
                </CardTitle>
                <CardDescription>Mensagem pronta para WhatsApp/E-mail com pedido de avaliação.</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Loading */}
      {isProcessing && (
        <div className="p-12 text-center border rounded-lg bg-slate-50 animate-pulse">
          <Sparkles className="w-8 h-8 text-green-500 mx-auto mb-4 animate-spin" />
          <p className="text-green-700 font-medium">Gerando conteúdo final...</p>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <Card className="bg-white shadow-lg animate-in zoom-in-95 duration-300">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-slate-900">{result.titulo}</CardTitle>
            <CardDescription>
              {actionMode === "pdf"
                ? "Você pode copiar o texto e também baixar em PDF."
                : "Você pode copiar e enviar direto para o cliente."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <textarea
              className="w-full min-h-[260px] bg-slate-50 font-mono text-sm p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              value={result.conteudo || ""}
              readOnly
            />
          </CardContent>

          <CardFooter className="justify-between gap-3 bg-slate-50/50 pt-4 flex flex-col md:flex-row">
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => setResult(null)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Limpar
              </Button>

              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={handleCopy}
                disabled={!result?.conteudo}
              >
                <Copy className="w-4 h-4 mr-2" /> Copiar
              </Button>
            </div>

            <div className="w-full md:w-auto">
              {actionMode === "pdf" ? (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                  onClick={handleDownloadPdf}
                >
                  Baixar PDF <Download className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                  onClick={handleCopy}
                >
                  Copiar e Enviar <Download className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default IaRelatorioPage;