import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { Bot, Sparkles, Search, Filter, Gavel, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function PosAtendimentoPage() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'administrador' || userRole === 'advogado';

  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [faseFilter, setFaseFilter] = useState('all');

  // Mapeamento das fases do seu roteiro para facilitar o filtro
  const fases = [
    "Aguardando Análise", "Prazos Iniciais", "Contestação/Réplica",
    "Instrução/Audiência", "Perícia", "Sentença",
    "Recurso", "Execução/Cumprimento", "Arquivado"
  ];

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/processo');

        // FILTRO RIGOROSO DA FASE PÓS
        const posCases = response.data.filter(c =>
          ['Sentença', 'Em Recurso', 'Trânsito em Julgado', 'Em Execução', 'Arquivado'].includes(c.status)
        );

        setCases(posCases);
        setFilteredCases(posCases);
      } catch (error) {
        console.error("Erro ao buscar processos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  // Lógica de Filtragem
  useEffect(() => {
    let result = cases;

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(c => c.titulo.toLowerCase().includes(term) || c.numeroProcesso?.includes(term));
    }

    if (faseFilter !== 'all') {
      // Aqui filtramos pelo campo 'status' ou 'fase' do processo
      result = result.filter(c => c.status === faseFilter);
    }

    setFilteredCases(result);
  }, [search, faseFilter, cases]);

  const getStatusColor = (status) => {
    if (status.includes('Execução') || status.includes('Sentença')) return 'bg-green-100 text-green-800 border-green-200';
    if (status.includes('Audiência') || status.includes('Perícia')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status.includes('Recurso')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (status.includes('Arquivado')) return 'bg-slate-100 text-slate-800 border-slate-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const handleMudarStatus = async (id, novoStatus) => {
    if (!window.confirm(`Confirmar mudança de fase para: ${novoStatus}?`)) return;
    try {
      await apiClient.put(`/processo/${id}`, { status: novoStatus });
      // Atualiza a lista localmente
      setCases(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c));
      // Opcional: Se arquivar, remove da lista (dependendo do seu filtro)
      if (novoStatus === 'Arquivado') fetchCases();
    } catch (error) {
      alert("Erro ao atualizar status.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão Processual (Pós-atendimento)</h1>
          <p className="text-slate-500">Acompanhamento, prazos e execução de sentenças.</p>
        </div>
      </div>

      {/* --- ÁREA DE IA E AVISOS --- */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card da IA */}
          <div className="md:col-span-2 border-2 border-dashed border-purple-300 bg-purple-50 p-6 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 text-purple-900">
                <Bot className="w-6 h-6" />
                <h3 className="font-bold text-lg">IA Processual</h3>
              </div>
              <p className="text-sm text-purple-700">
                Monitore andamentos, gere resumos de sentenças para clientes e prepare roteiros de audiência automaticamente.
              </p>
            </div>
            <Button
              onClick={() => window.location.href = '/ia-pos-atendimento'}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-md whitespace-nowrap"
            >
              <Sparkles className="mr-2 h-4 w-4" /> Acessar IA de Gestão
            </Button>
          </div>

          {/* Card de Resumo Rápido */}
          <Card className="border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-base flex items-center gap-2 text-red-700">
                <Clock className="w-4 h-4" /> Prazos Críticos (48h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">03</div>
              <p className="text-xs text-muted-foreground">Processos aguardando protocolo urgente.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- FILTROS --- */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, número do processo..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select value={faseFilter} onValueChange={setFaseFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Fase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Fases</SelectItem>
              {fases.map(fase => (
                <SelectItem key={fase} value={fase}>{fase}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- LISTA DE PROCESSOS --- */}
      {loading ? <p>Carregando processos...</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCases.map(processo => (
            <Card key={processo.id} className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row justify-between items-start pb-2">
                <div>
                  <CardTitle className="text-lg">{processo.titulo}</CardTitle>
                  <p className="text-sm font-mono text-slate-500 mt-1">
                    {processo.numeroProcesso || 'Nº CNJ Pendente'}
                  </p>
                </div>
                <Badge variant="outline" className={getStatusColor(processo.status || 'Aguardando Análise')}>
                  {processo.status || 'Aguardando Análise'}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-slate-400" />
                    <span>{processo.area}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Últ. Mov.: Há 2 dias</span>
                  </div>
                </div>

                {/* Barra de Progresso Visual (Simulada baseada na fase) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Progresso Estimado</span>
                    <span>65%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[65%] rounded-full" />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2 pt-4 border-t bg-slate-50/50">

                {/* GATILHO: REGISTRAR SENTENÇA (Se ainda não tiver sentença) */}
                {!['Sentença', 'Em Recurso', 'Em Execução', 'Arquivado'].includes(processo.status) && (
                  <div className="w-full grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleMudarStatus(processo.id, 'Sentença')}>
                      <Gavel className="w-3 h-3 mr-1" /> Saiu Sentença
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleMudarStatus(processo.id, 'Em Recurso')}>
                      <ScrollText className="w-3 h-3 mr-1" /> Recorrer
                    </Button>
                  </div>
                )}

                {/* GATILHO: INICIAR EXECUÇÃO (Se já teve sentença) */}
                {['Sentença', 'Em Recurso'].includes(processo.status) && (
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleMudarStatus(processo.id, 'Em Execução')}>
                    <DollarSign className="w-3 h-3 mr-1" /> Iniciar Execução/Cumprimento
                  </Button>
                )}

                {/* GATILHO: ARQUIVAR (Final) */}
                {processo.status === 'Em Execução' && (
                  <Button size="sm" variant="destructive" className="w-full" onClick={() => handleMudarStatus(processo.id, 'Arquivado')}>
                    <Archive className="w-3 h-3 mr-1" /> Arquivar Processo
                  </Button>
                )}

              </CardFooter>
            </Card>
          ))}
          {filteredCases.length === 0 && (
            <p className="col-span-full text-center py-10 text-slate-500 border-2 border-dashed rounded-lg">
              Nenhum processo encontrado nesta fase.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default PosAtendimentoPage;