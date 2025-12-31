import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { Bot, Sparkles, FileCheck, Star, Download, Archive, FileText } from 'lucide-react';

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ReportModalContent from '@/components/reports/ReportModalContent';


function RelatorioFinalPage() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'administrador' || userRole === 'advogado';

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para Avaliação (NPS)
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [selectedCaseForRating, setSelectedCaseForRating] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [currentReportProcess, setCurrentReportProcess] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [filteredCases, setFilteredCases] = useState([]);
  //const [decisionResult, setDecisionResult] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/processo');
        // Filtra apenas processos ENCERRADOS
        const closedCases = response.data.filter(c =>
          ['Encerrado', 'Arquivado', 'Concluído'].includes(c.status)
        );
        setCases(closedCases);
        setFilteredCases(closedCases);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchCases();
  }, []);

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    alert("Obrigado pela sua avaliação!");
    setIsRatingOpen(false);
  };

  const handleViewReport = async (processo) => {
    setIsReportModalOpen(true); // Abrir imediatamente para melhorar a UX
    setLoading(true);
    try {
      // 1. Tentar buscar transações e movimentações em paralelo
      // Precisamos das movimentações para o "histórico do caso" no relatório
      const [financialRes, movRes] = await Promise.all([
        apiClient.get(`/financial/transactions/process/${processo.id}`),
        apiClient.get(`/processo/${processo.id}/movimentacoes`)
      ]);

      // 2. Busca de Cliente com tratamento de erro (Evita o travamento 404)
      let clientData = { name: "Cliente não identificado" };
      try {
        const clientRes = await apiClient.get(`/clientes/${processo.clientId}`);
        clientData = clientRes.data;
      } catch (err) {
        console.warn("Dados do cliente não encontrados no cadastro.");
      }

      const transactions = financialRes.data || [];
      const movimentacoes = movRes.data || [];

      // 3. Cálculo do Balanço
      const balance = transactions.reduce((acc, t) => {
        const val = parseFloat(t.valor);
        return t.tipo === 'despesa' ? acc - val : acc + val;
      }, 0);

      setCurrentReportProcess({
        ...processo,
        transactions,
        movimentacoes, // Adicionado para o histórico completo
        balance
      });
      setClientData(clientData);

    } catch (e) {
      console.error("Erro ao consolidar relatório:", e);
      alert("Erro ao carregar alguns dados do relatório.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Relatórios & Encerramento</h1>
          <p className="text-slate-500">Histórico de casos concluídos e documentos finais.</p>
        </div>
      </div>

      {/* --- ÁREA ADMIN (IA) --- */}
      {isAdmin && (
        <div className="border-2 border-dashed border-green-300 bg-green-50 p-6 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-green-900">
            <Bot className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-lg">IA de Fidelização</h3>
              <p className="text-sm text-green-700">Gere relatórios finais, pesquisas de NPS e ofertas preventivas.</p>
            </div>
          </div>
          <Button onClick={() => window.location.href = '/ia-relatorio'} className="bg-green-600 hover:bg-green-700 text-white shadow-md">
            <Sparkles className="mr-2 h-4 w-4" /> Acessar IA Final
          </Button>
        </div>
      )}

      {/* --- LISTA DE CASOS ENCERRADOS --- */}
      {loading ? <p>Carregando histórico...</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCases.length > 0 ? (
            filteredCases.map(processo => (
              <Card key={processo.id} className="border-l-4 border-l-slate-400 opacity-90 hover:opacity-100 transition-opacity shadow-sm">
                <CardHeader className="flex flex-row justify-between items-start pb-2">
                  <div>
                    <CardTitle className="text-lg">{processo.titulo}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono mt-1">{processo.numeroProcesso || 'N/A'}</p>
                  </div>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                    {processo.status}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Archive className="w-4 h-4" />
                    <span>Arquivado em: {new Date().toLocaleDateString()}</span> {/* Simulado, ideal ter dataFim no banco */}
                  </div>
                  <p className="text-slate-500 italic">"{processo.descricao}"</p>
                </CardContent>

                <CardFooter className="pt-4 border-t bg-slate-50/50 flex justify-end gap-2">
                  {/* Ações para ADMIN */}
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full text-blue-800"
                      onClick={() => handleViewReport(processo)}
                    >
                      <FileText className="mr-2 h-3 w-3" /> Ver Relatório Final
                    </Button>
                  )}

                  {/* Ações para CLIENTE */}
                  {!isAdmin && (
                    <>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-3 w-3" /> Baixar PDF Final
                      </Button>
                      <Button
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        onClick={() => { setSelectedCaseForRating(processo); setIsRatingOpen(true); }}
                      >
                        <Star className="mr-2 h-3 w-3" /> Avaliar
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center py-10 text-slate-500 border-2 border-dashed rounded-lg">
              Nenhum processo encontrado nesta fase.
            </p>
          )}
        </div>
      )}

      {/* MODAL DE AVALIAÇÃO (CLIENTE) */}
      <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avalie nosso serviço</DialogTitle>
            <DialogDescription>Como foi sua experiência no caso {selectedCaseForRating?.titulo}?</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRatingSubmit} className="space-y-4 py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className="w-8 h-8 text-yellow-400 cursor-pointer hover:fill-yellow-400" />
              ))}
            </div>
            <textarea
              placeholder="Deixe um comentário (opcional)..."
              className="textarea-base bg-slate-50 min-h-[100px]" // Usando sua classe .textarea-base
            />
            <DialogFooter>
              <Button type="submit">Enviar Avaliação</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DO RELATÓRIO FINAL --- */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-2xl">Relatório Final de {currentReportProcess?.titulo || 'Processo'}</DialogTitle>
            <DialogDescription>
              Relatório consolidado e pronto para ser entregue ao cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <ReportModalContent processo={currentReportProcess} cliente={clientData} />
          </div>

          <DialogFooter className="p-4 border-t">
            <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Fechar</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Baixar PDF (Em breve)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default RelatorioFinalPage;