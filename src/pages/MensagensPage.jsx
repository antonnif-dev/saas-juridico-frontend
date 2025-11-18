import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

// Componentes Shadcn/ui
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Send, Plus, ArrowLeft, MoreVertical, User, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function MensagensPage() {
  const { currentUser } = useAuth();

  // Estados de Dados
  const [conversations, setConversations] = useState([]);
  const [clients, setClients] = useState([]); // Lista de clientes para iniciar conversa
  const [messages, setMessages] = useState([]);

  // Estados de Controle
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Estado da busca
  const [newMessage, setNewMessage] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false); // Modal de nova conversa

  // Estados de Carregamento
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  // --- 1. Buscar Conversas ---
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

  const formatTimeSafe = (dateValue) => {
    if (!dateValue) return ''; // Se não tiver data, não exibe nada
    try {
      // Se for um Timestamp do Firestore (tem .seconds), converte. Se for string/data, usa direto.
      const date = dateValue.seconds ? new Date(dateValue.seconds * 1000) : new Date(dateValue);
      // Verifica se a data é válida antes de formatar
      if (isNaN(date.getTime())) return '';
      return format(date, 'HH:mm');
    } catch (error) {
      return '';
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // --- 2. Lógica do Filtro de Busca ---
  const filteredConversations = conversations.filter((conv) =>
    conv.participant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- 3. Abrir Modal e Buscar Clientes ---
  const handleOpenNewChat = async () => {
    setIsNewChatOpen(true);
    setLoadingClients(true);
    try {
      // Busca a lista de clientes para selecionar
      const response = await apiClient.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      alert("Não foi possível carregar a lista de clientes.");
    } finally {
      setLoadingClients(false);
    }
  };

  // --- 4. Iniciar uma Nova Conversa ---
  const handleStartNewConversation = async (client) => {
    try {
      // Tenta criar ou obter uma conversa existente com este cliente
      // O backend deve verificar se já existe e retornar a antiga, ou criar nova
      const response = await apiClient.post('/mensagens/conversas', {
        participantId: client.id
      });

      const conversation = response.data;

      // Atualiza a lista de conversas se for uma nova
      if (!conversations.find(c => c.id === conversation.id)) {
        setConversations([conversation, ...conversations]);
      }

      setIsNewChatOpen(false); // Fecha o modal
      handleSelectConversation(conversation); // Abre o chat
    } catch (error) {
      console.error("Erro ao iniciar conversa:", error);
      alert("Erro ao iniciar conversa.");
    }
  };

  // --- 5. Selecionar Conversa e Carregar Mensagens ---
  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
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

  // --- 6. Enviar Mensagem ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const tempId = Date.now();
    const msgContent = newMessage;
    setNewMessage(""); // Limpa input imediatamente (UX)

    try {
      const response = await apiClient.post(`/mensagens/conversas/${selectedConversation.id}/mensagens`, {
        content: msgContent
      });

      // Adiciona a mensagem real retornada pelo backend
      setMessages(prev => [...prev, response.data]);

      // Atualiza a "última mensagem" na lista lateral
      setConversations(prev => prev.map(c =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: msgContent, updatedAt: new Date().toISOString() }
          : c
      ));

    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Falha ao enviar mensagem.");
    }
  };

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '??';

  const handleDeleteConversation = async (conversationId) => {
    if (window.confirm("Tem certeza que deseja apagar toda esta conversa?")) {
      try {
        // Certifique-se de que esta rota DELETE existe no seu backend!
        await apiClient.delete(`/mensagens/conversas/${conversationId}`);

        // Remove da lista localmente
        setConversations(prev => prev.filter(c => c.id !== conversationId));

        // Se a conversa apagada for a que está aberta, fecha ela
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
        }
      } catch (error) {
        console.error("Erro ao apagar:", error);
        alert("Não foi possível apagar a conversa.");
      }
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] p-4 md:p-6 flex gap-4 bg-slate-50">

      {/* --- ESQUERDA: LISTA DE CONVERSAS --- */}
      <Card className={`w-full md:w-1/3 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>

        <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-lg">
          <h2 className="font-bold text-xl">Mensagens</h2>
          <Button size="icon" variant="ghost" onClick={handleOpenNewChat}>
            <Plus className="h-6 w-6 text-primary" />
          </Button>
        </div>

        {/* Campo de Busca Funcional */}
        <div className="p-4 pt-2 bg-white">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversa..."
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
            ) : filteredConversations.length === 0 ? (
              <p className="text-center p-4 text-muted-foreground text-sm">Nenhuma conversa encontrada.</p>
            ) : (
              filteredConversations.map((conv) => (
                <ContextMenu key={conv.id}>
                  <ContextMenuTrigger>
                    <button
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full flex items-center gap-3 p-4 border-b transition-colors text-left hover:bg-slate-50
          ${selectedConversation?.id === conv.id ? 'bg-slate-100 border-l-4 border-l-primary' : ''}
        `}
                    >
                      <Avatar>
                        <AvatarFallback>{getInitials(conv.participant?.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold truncate">{conv.participant?.name || 'Usuário'}</span>
                          {/* Use sua função segura de data aqui */}
                          <span className="text-[10px] text-muted-foreground">
                            {formatTimeSafe(conv.updatedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conv.lastMessage || 'Nova conversa'}
                        </p>
                      </div>
                    </button>
                  </ContextMenuTrigger>

                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => handleDeleteConversation(conv.id)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Apagar
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* --- DIREITA: ÁREA DE CHAT --- */}
      <Card className={`w-full md:w-2/3 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>

        {selectedConversation ? (
          <>
            <div className="p-3 border-b flex items-center justify-between bg-white rounded-t-lg shadow-sm z-10">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{getInitials(selectedConversation.participant?.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{selectedConversation.participant?.name}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleDeleteConversation(selectedConversation.id)}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Apagar Conversa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <ScrollArea className="flex-1 p-4 bg-[#e5ddd5]"> {/* Cor de fundo estilo WhatsApp */}
              <div className="space-y-4 flex flex-col">
                {loadingMessages ? (
                  <div className="flex justify-center mt-4"><span className="text-xs bg-white/80 px-3 py-1 rounded-full shadow-sm">Carregando histórico...</span></div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center mt-10"><span className="text-sm bg-white/80 px-4 py-2 rounded-lg shadow-sm text-center">Inicie a conversa com um "Olá!"</span></div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUser?.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm text-sm relative
                            ${isMe ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none'}
                          `}
                        >
                          <p className="pr-2">{msg.content}</p>
                          <span className={`text-[10px] block text-right mt-1 opacity-60`}>
                            {formatTimeSafe(msg.createdAt)}
                          </span>
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
                  placeholder="Digite uma mensagem"
                  className="flex-1 bg-white border-0 focus-visible:ring-0 rounded-full px-4 py-5"
                />
                <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0" disabled={!newMessage.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-[#f0f2f5] border-l">
            <div className="w-full h-full flex flex-col items-center justify-center opacity-60">
              {/* Placeholder de chat vazio */}
              <h3 className="text-xl font-light mb-2">SaaS Jurídico Web</h3>
              <p className="text-sm">Envie e receba mensagens sem precisar manter seu celular conectado.</p>
            </div>
          </div>
        )}
      </Card>

      {/* --- MODAL: NOVA CONVERSA --- */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-[400px] h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Nova Conversa</DialogTitle>
            <DialogDescription>
              Selecione um cliente abaixo para iniciar um atendimento.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {loadingClients ? (
                <p className="text-center p-4 text-sm">Carregando contatos...</p>
              ) : (
                clients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleStartNewConversation(client)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-100 rounded-lg transition-colors text-left"
                  >
                    <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </div>
                  </button>
                ))
              )}
              {!loadingClients && clients.length === 0 && (
                <p className="text-center p-8 text-muted-foreground text-sm">Nenhum cliente encontrado.</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default MensagensPage;