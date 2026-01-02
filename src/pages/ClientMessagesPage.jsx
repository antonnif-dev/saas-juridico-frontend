import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Send, Plus, MessageSquare, Briefcase, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ClientMessagesPage() {
  const { currentUser } = useAuth();

  // Estados
  const [conversations, setConversations] = useState([]);
  const [lawyers, setLawyers] = useState([]); // Lista de advogados disponíveis
  const [messages, setMessages] = useState([]);
  
  // Controles
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  // Loadings
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingLawyers, setLoadingLawyers] = useState(false);

  // 1. Buscar Conversas Existentes
  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const response = await apiClient.get('/mensagens/conversas');
      setConversations(response.data);
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // 2. Buscar Advogados para iniciar conversa (Filtro de Staff)
  const handleOpenNewChat = async () => {
    setIsNewChatOpen(true);
    setLoadingLawyers(true);
    try {
      // ATENÇÃO: Verifique se essa rota existe e é acessível por clientes
      const response = await apiClient.get('/users/advogados'); 
      setLawyers(response.data);
    } catch (error) {
      console.error("Erro ao buscar advogados:", error);
      alert("Não foi possível carregar a lista de advogados.");
    } finally {
      setLoadingLawyers(false);
    }
  };

  // 3. Lógica de Rascunho (Igual à do Admin)
  const handleDraftConversation = (lawyer) => {
    const existingConv = conversations.find(c => c.participant?.uid === (lawyer.uid || lawyer.id));

    if (existingConv) {
      handleSelectConversation(existingConv);
    } else {
      const draftConversation = {
        id: 'draft',
        participant: {
          uid: lawyer.uid || lawyer.id,
          name: lawyer.name,
          // Garante leitura correta da foto
          photoUrl: lawyer.photoUrl || lawyer.photoURL,
          photoURL: lawyer.photoUrl || lawyer.photoURL
        }
      };
      setSelectedConversation(draftConversation);
      setMessages([]);
    }
    setIsNewChatOpen(false);
  };

  // 4. Selecionar Conversa
  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    if (conversation.id === 'draft') {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    try {
      const response = await apiClient.get(`/mensagens/conversas/${conversation.id}/mensagens`);
      setMessages(response.data);
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // 5. Enviar Mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const msgContent = newMessage;
    setNewMessage("");

    try {
      let conversationId = selectedConversation.id;

      if (conversationId === 'draft') {
        const createResponse = await apiClient.post('/mensagens/conversas', {
          participantId: selectedConversation.participant.uid
        });
        const newConversation = createResponse.data;
        conversationId = newConversation.id;
        
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
      }

      const response = await apiClient.post(`/mensagens/conversas/${conversationId}/mensagens`, {
        content: msgContent
      });

      setMessages(prev => [...prev, response.data]);
      setConversations(prev => prev.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: msgContent, updatedAt: new Date().toISOString() }
          : c
      ));

    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Falha ao enviar mensagem.");
    }
  };

  const formatTimeSafe = (dateValue) => {
    if (!dateValue) return '';
    try {
      const date = dateValue.seconds ? new Date(dateValue.seconds * 1000) : new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return format(date, 'HH:mm');
    } catch (error) {
      return '';
    }
  };

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '??';

  return (
    <div className="h-[calc(100vh-100px)] p-4 md:p-6 flex gap-4 bg-slate-50">
      
      {/* LISTA DE CONVERSAS (LATERAL) */}
      <Card className={`w-full md:w-1/3 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-lg">
          <h2 className="font-bold text-xl">Suporte Jurídico</h2>
          <Button onClick={handleOpenNewChat} className="gap-2 bg-primary text-white hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Solicitação</span>
          </Button>
        </div>

        <div className="p-4 pt-2 bg-white">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nas conversas..."
              className="pl-8 bg-slate-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 bg-white">
          <div className="flex flex-col">
            {loadingConversations ? (
              <p className="text-center p-4 text-muted-foreground">Carregando...</p>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">Você ainda não tem conversas.</p>
                <Button variant="link" onClick={handleOpenNewChat}>Fale com um advogado</Button>
              </div>
            ) : (
              conversations
                .filter(c => c.participant?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full flex items-center gap-3 p-4 border-b transition-colors text-left hover:bg-slate-50
                    ${selectedConversation?.id === conv.id ? 'bg-slate-100 border-l-4 border-l-primary' : ''}
                  `}
                >
                  <Avatar>
                    <AvatarImage src={conv.participant?.photoUrl || conv.participant?.photoURL} />
                    <AvatarFallback>{getInitials(conv.participant?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold truncate">{conv.participant?.name || 'Escritório'}</span>
                      <span className="text-[10px] text-muted-foreground">{formatTimeSafe(conv.updatedAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conv.lastMessage || 'Toque para visualizar'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* ÁREA DE CHAT (PRINCIPAL) */}
      <Card className={`w-full md:w-2/3 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            <div className="p-3 border-b flex items-center gap-3 bg-white rounded-t-lg shadow-sm">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarImage src={selectedConversation.participant?.photoUrl || selectedConversation.participant?.photoURL} />
                <AvatarFallback>{getInitials(selectedConversation.participant?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{selectedConversation.participant?.name}</p>
                <p className="text-xs text-muted-foreground">Atendimento Jurídico</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-[#e5ddd5]">
              <div className="space-y-4 flex flex-col">
                {loadingMessages ? (
                  <div className="flex justify-center mt-4"><span className="text-xs bg-white/80 px-3 py-1 rounded-full">Carregando...</span></div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center mt-10">
                    <span className="text-sm bg-white/90 px-4 py-2 rounded-lg text-center shadow-sm">
                      Este é o início da sua conversa com {selectedConversation.participant?.name}.<br/>
                      Como podemos ajudar hoje?
                    </span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUser?.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-lg shadow-sm text-sm relative
                          ${isMe ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none'}
                        `}>
                          <p className="pr-2">{msg.content}</p>
                          <span className="text-[10px] block text-right mt-1 opacity-60">{formatTimeSafe(msg.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <div className="p-3 bg-[#f0f2f5]">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-white border-0 rounded-full px-4 py-5"
                />
                <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0" disabled={!newMessage.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-[#f0f2f5] border-l p-8 text-center">
            <Briefcase className="h-16 w-16 mb-4 opacity-10" />
            <h3 className="text-xl font-light mb-2">Canal de Atendimento</h3>
            <p className="text-sm max-w-xs">Selecione uma conversa ao lado ou inicie um novo atendimento com nossa equipe jurídica.</p>
          </div>
        )}
      </Card>

      {/* MODAL: SELECIONAR ADVOGADO */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Fale com o Escritório</DialogTitle>
            <DialogDescription>Selecione um advogado para iniciar o atendimento.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2 p-1">
              {loadingLawyers ? (
                <p className="text-center p-4 text-sm">Carregando equipe...</p>
              ) : lawyers.length === 0 ? (
                <p className="text-center p-4 text-sm text-muted-foreground">Nenhum advogado disponível no momento.</p>
              ) : (
                lawyers.map(lawyer => (
                  <button
                    key={lawyer.id || lawyer.uid}
                    onClick={() => handleDraftConversation(lawyer)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-100 rounded-lg transition-colors text-left border"
                  >
                    <Avatar>
                      <AvatarImage src={lawyer.photoUrl || lawyer.photoURL} />
                      <AvatarFallback><Briefcase className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{lawyer.name}</p>
                      <p className="text-xs text-muted-foreground">Advogado(a)</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClientMessagesPage;