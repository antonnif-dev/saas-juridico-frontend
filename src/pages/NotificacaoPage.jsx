import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useNavigate } from 'react-router-dom';
import { format, isToday } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

// Ícones
import { Bell, AlertTriangle, FileSignature, UserPlus, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function NotificacaoPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Buscamos dados de várias fontes ao mesmo tempo
        const [preatendimentos, processos, agenda] = await Promise.all([
          apiClient.get('/preatendimento'),
          apiClient.get('/processo'),
          apiClient.get('/agenda')
        ]);

        const newNotifications = [];

        // 1. NOTIFICAÇÕES DE NOVOS LEADS (Triagem)
        preatendimentos.data.forEach(item => {
          if (item.status === 'Pendente') {
            newNotifications.push({
              id: `lead-${item.id}`,
              type: 'lead',
              title: 'Novo Pré-atendimento Recebido',
              description: `${item.nome} enviou uma solicitação de ${item.categoria}.`,
              date: item.createdAt?._seconds ? new Date(item.createdAt._seconds * 1000) : new Date(),
              link: '/triagem',
              priority: 'medium'
            });
          }
          // Cliente Assinou/Aceitou
          if (item.status === 'Em Negociacao' && item.proposalStatus === 'accepted' && item.signature) {
            newNotifications.push({
              id: `sign-${item.id}`,
              type: 'success',
              title: 'Proposta Aceita e Assinada!',
              description: `${item.nome} assinou o contrato. Pronto para gerar processo.`,
              date: new Date(), // Idealmente usaria updatedAt
              link: '/triagem',
              priority: 'high'
            });
          }
        });

        // 2. NOTIFICAÇÕES DE PROCESSOS URGENTES
        processos.data.forEach(proc => {
          if (proc.urgencia === 'Alta' || proc.urgencia === 'Urgente') {
            newNotifications.push({
              id: `proc-${proc.id}`,
              type: 'alert',
              title: `Atenção: Processo Urgente`,
              description: `${proc.titulo} requer atenção imediata.`,
              date: proc.createdAt?._seconds ? new Date(proc.createdAt._seconds * 1000) : new Date(),
              link: `/processos/${proc.id}`,
              priority: 'high'
            });
          }
        });

        // 3. NOTIFICAÇÕES DE AGENDA (Para Hoje)
        agenda.data.forEach(evt => {
          // Convertendo data string ISO ou timestamp
          let eventDate = evt.dataHora;
          if (typeof evt.dataHora === 'object' && evt.dataHora.seconds) {
             eventDate = new Date(evt.dataHora.seconds * 1000);
          } else {
             eventDate = new Date(evt.dataHora);
          }

          if (isToday(eventDate)) {
            newNotifications.push({
              id: `agenda-${evt.id}`,
              type: 'agenda',
              title: 'Compromisso Hoje',
              description: `${evt.titulo} às ${format(eventDate, 'HH:mm')}.`,
              date: eventDate,
              link: '/agenda',
              priority: 'medium'
            });
          }
        });

        // Ordenar por data (mais recente primeiro) ou prioridade
        // Aqui vamos ordenar por prioridade para destacar o que importa
        const sorted = newNotifications.sort((a, b) => {
           if (a.priority === 'high' && b.priority !== 'high') return -1;
           if (a.priority !== 'high' && b.priority === 'high') return 1;
           return b.date - a.date;
        });

        setNotifications(sorted);

      } catch (error) {
        console.error("Erro ao carregar notificações", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper para ícones e cores
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
          <p className="text-muted-foreground">Atualizações importantes sobre seus casos e clientes.</p>
        </div>
        <Badge variant="secondary" className="text-sm py-1 px-3">
          {notifications.length} Novas
        </Badge>
      </div>

      <Tabs defaultValue="todas" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="urgentes">Apenas Urgentes</TabsTrigger>
        </TabsList>

        {loading ? (
           <p className="p-8 text-center text-slate-500">Buscando atualizações...</p>
        ) : (
          <>
            <TabsContent value="todas" className="space-y-3 mt-4">
              {notifications.length === 0 && (
                 <div className="text-center py-12 border-2 border-dashed rounded-lg text-slate-400">
                   <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                   <p>Tudo em dia! Nenhuma notificação pendente.</p>
                 </div>
              )}
              
              {notifications.map(item => (
                <Card 
                  key={item.id} 
                  className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${item.priority === 'high' ? 'border-l-red-500 bg-red-50/30' : 'border-l-blue-500'}`}
                  onClick={() => navigate(item.link)}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-full shadow-sm shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800">{item.title}</h3>
                        <span className="text-xs text-slate-400">{format(item.date, "dd/MM HH:mm")}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 self-center" />
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="urgentes" className="space-y-3 mt-4">
              {notifications.filter(n => n.priority === 'high').map(item => (
                 <Card 
                 key={item.id} 
                 className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-red-500 bg-red-50/50"
                 onClick={() => navigate(item.link)}
               >
                 <CardContent className="p-4 flex items-start gap-4">
                   <div className="p-2 bg-white rounded-full shadow-sm shrink-0">
                     {getIcon(item.type)}
                   </div>
                   <div className="flex-1">
                     <h3 className="font-bold text-red-900">{item.title}</h3>
                     <p className="text-sm text-red-800 mt-1">{item.description}</p>
                   </div>
                 </CardContent>
               </Card>
              ))}
              {notifications.filter(n => n.priority === 'high').length === 0 && (
                <p className="text-center p-8 text-slate-500">Nenhuma urgência pendente.</p>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

export default NotificacaoPage;