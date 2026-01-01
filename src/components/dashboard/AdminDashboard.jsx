import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

// Ícones e UI
import { 
  Users, Gavel, Calendar, AlertCircle, 
  ArrowRight, Plus, Briefcase, CheckCircle2,
  TrendingUp, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalProcessos: 0,
    triagemCount: 0,
    atendimentoCount: 0,
    posAtendimentoCount: 0,
    proximosCompromissos: [],
    recentes: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Buscamos dados em paralelo para agilizar
        const [summaryRes, processosRes, agendaRes] = await Promise.all([
          apiClient.get('/dashboard/summary'), // Seu endpoint original
          apiClient.get('/processo'),          // Para calcularmos as fases
          apiClient.get('/agenda')             // Para garantirmos a agenda atualizada
        ]);

        const processos = processosRes.data || [];
        const agenda = agendaRes.data || [];

        // --- Lógica de Classificação por Fase (Frontend) ---
        // Aqui definimos o que conta como cada fase baseada no Status
        const triagem = processos.filter(p => ['Pendente', 'Em Negociação', 'Análise'].includes(p.status)).length;
        const pos = processos.filter(p => ['Sentença', 'Em Recurso', 'Trânsito em Julgado', 'Em Execução'].includes(p.status)).length;
        // O resto assumimos como Atendimento Ativo
        const atendimento = processos.length - (triagem + pos);

        // --- Processar Agenda (Próximos 3) ---
        const proximosEventos = agenda
          .filter(evt => new Date(evt.dataHora) >= new Date()) // Apenas futuros
          .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
          .slice(0, 4);

        // --- Processos Recentes (Últimos 3 criados) ---
        // Assumindo que a API retorna ordenado ou ordenamos por data se houver
        const ultimosProcessos = processos.slice(0, 3); 

        setStats({
          totalClientes: summaryRes.data?.totalClientesCount || 0,
          totalProcessos: processos.length,
          triagemCount: triagem,
          atendimentoCount: atendimento,
          posAtendimentoCount: pos,
          proximosCompromissos: proximosEventos,
          recentes: ultimosProcessos
        });

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- Componente de Loading (Esqueleto) ---
  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Skeleton className="h-64 lg:col-span-2" />
           <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-[100dvh]">
      
      {/* 1. CABEÇALHO DE BOAS-VINDAS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Olá, {currentUser?.nome || 'Doutor(a)'}
          </h1>
          <p className="text-slate-500">
            Aqui está o panorama do seu escritório hoje, {format(new Date(), "d 'de' MMMM", { locale: ptBR })}.
          </p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => navigate('/clientes')} variant="outline">
             <Users className="mr-2 h-4 w-4" /> Clientes
           </Button>
           <Button onClick={() => navigate('/processos')} className="bg-primary hover:bg-primary/90">
             <Plus className="mr-2 h-4 w-4" /> Novo Processo
           </Button>
        </div>
      </div>

      {/* 2. KPIs GERAIS (Métricas de Topo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">Cadastrados na base</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processos Ativos</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProcessos}</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Audiências</CardTitle>
            <Gavel className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {stats.proximosCompromissos.filter(c => c.tipo === 'Audiência').length}
            </div>
            <p className="text-xs text-muted-foreground">Agendadas em breve</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prazos Fatais</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
                {stats.proximosCompromissos.filter(c => c.tipo === 'Prazo').length}
            </div>
            <p className="text-xs text-muted-foreground">Necessitam atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. FLUXO DE TRABALHO (PIPELINE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD FASE 1: TRIAGEM */}
        <Link to="/pre-atendimento" className="block group">
            <Card className="h-full border-l-4 border-l-orange-400 hover:shadow-md transition-all">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                        <TrendingUp className="h-5 w-5" /> Pré-Atendimento
                    </CardTitle>
                    <CardDescription>Novos leads e negociações</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-end">
                        <span className="text-4xl font-bold text-slate-800">{stats.triagemCount}</span>
                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                    </div>
                </CardContent>
            </Card>
        </Link>

        {/* CARD FASE 2: ATENDIMENTO */}
        <Link to="/atendimento" className="block group">
            <Card className="h-full border-l-4 border-l-blue-500 hover:shadow-md transition-all">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                        <Gavel className="h-5 w-5" /> Atendimento Ativo
                    </CardTitle>
                    <CardDescription>Aguardando audiência ou sentença</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-end">
                        <span className="text-4xl font-bold text-slate-800">{stats.atendimentoCount}</span>
                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                </CardContent>
            </Card>
        </Link>

        {/* CARD FASE 3: PÓS-ATENDIMENTO */}
        <Link to="/pos-atendimento" className="block group">
            <Card className="h-full border-l-4 border-l-green-500 hover:shadow-md transition-all">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="h-5 w-5" /> Pós-Atendimento
                    </CardTitle>
                    <CardDescription>Execução, recursos e financeiro</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-end">
                        <span className="text-4xl font-bold text-slate-800">{stats.posAtendimentoCount}</span>
                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-green-500 transition-colors" />
                    </div>
                </CardContent>
            </Card>
        </Link>
      </div>

      {/* 4. AGENDA E RECENTES (DIVISÃO 2/3 e 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo: Agenda Compacta */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-500" /> Próximos Compromissos
                </CardTitle>
                <CardDescription>Sua agenda para os próximos dias.</CardDescription>
            </CardHeader>
            <CardContent>
                {stats.proximosCompromissos.length > 0 ? (
                    <div className="space-y-4">
                        {stats.proximosCompromissos.map((evt, index) => (
                            <div key={index} className="flex items-start gap-4 p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 transition-colors">
                                <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 
                                    ${evt.tipo === 'Prazo' ? 'bg-red-500' : evt.tipo === 'Audiência' ? 'bg-purple-500' : 'bg-blue-500'}`} 
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-slate-800">{evt.titulo}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(evt.dataHora), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                                        <span className="mx-1">•</span> {evt.tipo}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/agenda')}>Ver</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-400 border-2 border-dashed rounded-lg">
                        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p>Agenda livre nos próximos dias.</p>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Lado Direito: Atalhos Rápidos / Recentes */}
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium uppercase text-slate-500">Adicionados Recentemente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {stats.recentes.map(proc => (
                    <div key={proc.id} className="flex flex-col gap-1 pb-3 border-b last:border-0">
                        <Link to={`/processos/${proc.id}`} className="font-medium text-blue-600 hover:underline truncate">
                            {proc.titulo}
                        </Link>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                             <span>{proc.numeroProcesso || 'Sem Nº'}</span>
                             <Badge variant="outline" className="text-[10px] h-5">{proc.status}</Badge>
                        </div>
                    </div>
                ))}
                
                <div className="pt-4 mt-4 border-t">
                    <h4 className="text-sm font-semibold mb-3">Acesso Rápido</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/ia-triagem')}>
                           <Users className="mr-2 h-3 w-3" /> IA Triagem
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/relatorios')}>
                           <Briefcase className="mr-2 h-3 w-3" /> Relatórios
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/equipe')}>
                           <Users className="mr-2 h-3 w-3" /> Equipe
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default AdminDashboard;