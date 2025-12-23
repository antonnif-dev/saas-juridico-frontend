import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isWithinInterval, addDays, startOfDay, endOfDay } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { Bell, AlertTriangle, FileSignature, UserPlus, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function NotificacaoPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Usamos blocos separados ou tratamento de erro no readStatus para não quebrar a página
        const [preatendimentos, processos, agenda] = await Promise.all([
          apiClient.get('/preatendimento'),
          apiClient.get('/processo'),
          apiClient.get('/agenda')
        ]);

        // Tentamos buscar lidos, se falhar, assume array vazio e segue a vida
        let readIds = [];
        try {
          const res = await apiClient.get('/notifications/read-status');
          readIds = res.data || [];
        } catch (e) {
          console.warn("Backend de 'lidos' não configurado ou offline. Exibindo todas.");
        }

        const newNotifications = [];
        const hoje = startOfDay(new Date());
        const limiteAgenda = endOfDay(addDays(new Date(), 7)); // Horizonte de 7 dias

        // 1. LEADS (Pendentes no banco)
        preatendimentos.data.forEach(item => {
          const id = `lead-${item.id}`;
          if (item.status === 'Pendente' && !readIds.includes(id)) {
            newNotifications.push({
              id,
              type: 'lead',
              title: 'Novo Pré-atendimento',
              description: `${item.nome} aguarda triagem em ${item.categoria}.`,
              date: item.createdAt?._seconds ? new Date(item.createdAt._seconds * 1000) : new Date(),
              link: '/triagem',
              priority: 'medium'
            });
          }
        });

        // 2. PROCESSOS URGENTES (Qualquer um que esteja no banco como Alta/Urgente)
        processos.data.forEach(proc => {
          const id = `proc-${proc.id}`;
          if ((proc.urgencia === 'Alta' || proc.urgencia === 'Urgente') && !readIds.includes(id)) {
            newNotifications.push({
              id,
              type: 'alert',
              title: `Urgência: ${proc.titulo}`,
              description: `Atenção imediata requerida para o processo.`,
              date: proc.createdAt?._seconds ? new Date(proc.createdAt._seconds * 1000) : new Date(),
              link: `/processos/${proc.id}`,
              priority: 'high'
            });
          }
        });

        // 3. AGENDA (Próximos 7 dias)
        agenda.data.forEach(evt => {
          const id = `agenda-${evt.id}`;
          let eventDate = evt.dataHora?.seconds ? new Date(evt.dataHora.seconds * 1000) : new Date(evt.dataHora);

          const estaNoIntervalo = isWithinInterval(eventDate, { start: hoje, end: limiteAgenda });

          if (estaNoIntervalo && !readIds.includes(id)) {
            newNotifications.push({
              id,
              type: 'agenda',
              title: isToday(eventDate) ? 'Compromisso HOJE' : `Compromisso em ${format(eventDate, "dd/MM")}`,
              description: `${evt.titulo} às ${format(eventDate, 'HH:mm')}.`,
              date: eventDate,
              link: '/agenda',
              priority: isToday(eventDate) ? 'high' : 'medium'
            });
          }
        });

        const sorted = newNotifications.sort((a, b) => {
          if (a.priority === 'high' && b.priority !== 'high') return -1;
          if (a.priority !== 'high' && b.priority === 'high') return 1;
          return b.date - a.date;
        });

        setNotifications(sorted);
      } catch (error) {
        console.error("Erro crítico ao carregar notificações", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNotificationClick = async (item) => {
    try {
      await apiClient.post(`/notifications/read/${item.id}`);
      setNotifications(prev => prev.filter(n => n.id !== item.id));
      navigate(item.link);
    } catch (error) {
      navigate(item.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'lead': return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'success': return <FileSignature className="h-5 w-5 text-green-600" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'agenda': return <Calendar className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Central de Notificações</h1>
          <p className="text-muted-foreground">Alertas de prazos, audiências e novos clientes.</p>
        </div>
        <Badge variant={notifications.length > 0 ? "destructive" : "secondary"} className="text-sm py-1 px-3">
          {notifications.length} Pendentes
        </Badge>
      </div>

      <Tabs defaultValue="todas" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="urgentes">Urgências</TabsTrigger>
        </TabsList>

        {loading ? (
          <p className="p-12 text-center text-slate-500 animate-pulse">Sincronizando dados...</p>
        ) : (
          <div className="mt-4">
            <TabsContent value="todas" className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-slate-50/50">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500 font-medium">Nenhuma pendência encontrada no banco.</p>
                </div>
              ) : (
                notifications.map(item => (
                  <Card key={item.id} className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${item.priority === 'high' ? 'border-l-red-500 bg-red-50/20' : 'border-l-blue-500'}`} onClick={() => handleNotificationClick(item)}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="p-2 bg-white rounded-full shadow-sm">{getIcon(item.type)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-bold ${item.priority === 'high' ? 'text-red-900' : 'text-slate-800'}`}>{item.title}</h3>
                          <span className="text-xs text-slate-400">{format(item.date, "dd/MM HH:mm", { locale: ptBR })}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 self-center" />
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="urgentes" className="space-y-3">
              {notifications.filter(n => n.priority === 'high').length === 0 ? (
                <p className="text-center py-12 text-slate-500">Não há alertas de alta prioridade.</p>
              ) : (
                notifications.filter(n => n.priority === 'high').map(item => (
                   <Card key={item.id} className="border-l-4 border-l-red-500 bg-red-50/30 cursor-pointer" onClick={() => handleNotificationClick(item)}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="p-2 bg-white rounded-full">{getIcon(item.type)}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-red-900">{item.title}</h3>
                        <p className="text-sm text-red-800">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </div>
        )}
      </Tabs>
    </div>
  );
}

export default NotificacaoPage;