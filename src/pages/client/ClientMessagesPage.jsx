import React, { useEffect, useMemo, useState } from "react";
import apiClient from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

// UI (shadcn)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Search, Send, ArrowLeft, MessageSquare, MessageSquarePlus } from "lucide-react";

export default function ClientMessagesPage() {
  const { currentUser } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [messages, setMessages] = useState([]);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingLawyers, setLoadingLawyers] = useState(false);

  const formatTimeSafe = (dateValue) => {
    if (!dateValue) return "";
    try {
      const date = dateValue?.seconds
        ? new Date(dateValue.seconds * 1000)
        : new Date(dateValue);
      if (isNaN(date.getTime())) return "";
      return format(date, "HH:mm");
    } catch {
      return "";
    }
  };

  const getInitials = (name) => {
    const n = (name || "").trim();
    if (!n) return "??";
    return n.substring(0, 2).toUpperCase();
  };

  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const response = await apiClient.get("/mensagens/conversas");
      setConversations(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const filteredConversations = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    return (conversations || []).filter((conv) =>
      (conv?.participant?.name || "").toLowerCase().includes(q)
    );
  }, [conversations, searchTerm]);

  const handleOpenNewChat = async () => {
    setIsNewChatOpen(true);
    setLoadingLawyers(true);
    try {
      // rota que deve ser permitida para CLIENTE (não use /users/advogados)
      const response = await apiClient.get("/portal/advogados");
      setLawyers(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar advogados:", error);
      alert("Não foi possível carregar a lista de advogados.");
      setLawyers([]);
    } finally {
      setLoadingLawyers(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);

    if (!conversation || conversation.id === "draft") {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    try {
      const response = await apiClient.get(
        `/mensagens/conversas/${conversation.id}/mensagens`
      );
      setMessages(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDraftConversation = (lawyer) => {
    const lawyerUid = lawyer?.uid || lawyer?.id;
    const existingConv = (conversations || []).find(
      (c) => c?.participant?.uid === lawyerUid
    );

    if (existingConv) {
      handleSelectConversation(existingConv);
    } else {
      const draftConversation = {
        id: "draft",
        participant: {
          uid: lawyerUid,
          name: lawyer?.name,
          photoUrl: lawyer?.photoUrl || lawyer?.photoURL,
          photoURL: lawyer?.photoUrl || lawyer?.photoURL,
        },
      };
      setSelectedConversation(draftConversation);
      setMessages([]);
    }

    setIsNewChatOpen(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const msgContent = newMessage.trim();
    setNewMessage("");

    try {
      let conversationId = selectedConversation.id;

      // Se for rascunho, cria conversa antes
      if (conversationId === "draft") {
        const createResponse = await apiClient.post("/mensagens/conversas", {
          participantId: selectedConversation.participant.uid,
        });

        const createdConversation = createResponse.data;
        conversationId = createdConversation.id;

        setConversations((prev) => [createdConversation, ...(prev || [])]);
        setSelectedConversation(createdConversation);
      }

      const response = await apiClient.post(
        `/mensagens/conversas/${conversationId}/mensagens`,
        { content: msgContent }
      );

      setMessages((prev) => [...(prev || []), response.data]);

      setConversations((prev) =>
        (prev || []).map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage: msgContent, updatedAt: new Date().toISOString() }
            : c
        )
      );
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Falha ao enviar mensagem.");
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] p-4 md:p-6 flex gap-4 bg-slate-50">
      {/* LISTA DE CONVERSAS */}
      <Card className={`w-full md:w-1/3 flex flex-col ${selectedConversation ? "hidden md:flex" : ""}`}>
        <div className="p-3 border-b bg-white rounded-t-lg">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-sm">Conversas</h2>
            <Button variant="outline" size="icon" onClick={handleOpenNewChat} title="Nova conversa">
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative mt-3">
            <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8 bg-slate-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar advogado..."
            />
          </div>
        </div>

        <ScrollArea className="flex-1 bg-white">
          <div className="flex flex-col">
            {loadingConversations ? (
              <p className="text-center p-4 text-muted-foreground">Carregando...</p>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2 opacity-60" />
                <p className="text-sm">Nenhuma conversa encontrada.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className="w-full text-left px-3 py-3 hover:bg-slate-50 border-b flex items-center gap-3"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv?.participant?.photoUrl || conv?.participant?.photoURL} />
                    <AvatarFallback>{getInitials(conv?.participant?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{conv?.participant?.name || "Advogado"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv?.lastMessage || "Sem mensagens ainda"}
                    </p>
                  </div>
                  <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatTimeSafe(conv?.updatedAt)}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* CHAT */}
      <Card className={`w-full md:w-2/3 flex flex-col ${selectedConversation ? "" : "hidden md:flex"}`}>
        {!selectedConversation ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Selecione uma conversa para começar.
          </div>
        ) : (
          <>
            <div className="p-3 border-b flex items-center gap-3 bg-white rounded-t-lg shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={
                    selectedConversation?.participant?.photoUrl ||
                    selectedConversation?.participant?.photoURL
                  }
                />
                <AvatarFallback>
                  {getInitials(selectedConversation?.participant?.name)}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-semibold text-sm">
                  {selectedConversation?.participant?.name || "Advogado"}
                </p>
                <p className="text-xs text-muted-foreground">Atendimento Jurídico</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-[#e5ddd5]">
              <div className="space-y-4 flex flex-col">
                {loadingMessages ? (
                  <div className="flex justify-center mt-4">
                    <span className="text-xs bg-white/80 px-3 py-1 rounded-full">Carregando...</span>
                  </div>
                ) : (messages || []).length === 0 ? (
                  <div className="flex justify-center mt-10">
                    <span className="text-sm bg-white/90 px-4 py-2 rounded-lg text-center shadow-sm">
                      Este é o início da sua conversa com{" "}
                      {selectedConversation?.participant?.name}. <br />
                      Como podemos ajudar hoje?
                    </span>
                  </div>
                ) : (
                  (messages || []).map((msg) => {
                    const isMe = msg?.senderId === currentUser?.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-lg shadow-sm text-sm relative
                            ${isMe
                              ? "bg-[#d9fdd3] text-slate-900 rounded-tr-none"
                              : "bg-white text-slate-900 rounded-tl-none"
                            }`}
                        >
                          <p className="pr-2">{msg?.content}</p>
                          <span className="text-[10px] block text-right mt-1 opacity-60">
                            {formatTimeSafe(msg?.createdAt)}
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
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-white border-0 rounded-full px-4 py-5"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full h-10 w-10 shrink-0"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </Card>

      {/* MODAL: NOVA CONVERSA */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Iniciar nova conversa</DialogTitle>
            <DialogDescription>Selecione um advogado do escritório.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-72 pr-2">
            {loadingLawyers ? (
              <p className="text-sm text-muted-foreground">Carregando advogados...</p>
            ) : (lawyers || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum advogado disponível.</p>
            ) : (
              <div className="space-y-2">
                {lawyers.map((lawyer) => (
                  <button
                    key={lawyer.uid || lawyer.id}
                    onClick={() => handleDraftConversation(lawyer)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={lawyer.photoUrl || lawyer.photoURL} />
                      <AvatarFallback>{getInitials(lawyer.name)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{lawyer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {lawyer.oab ? `OAB: ${lawyer.oab}` : "Advogado"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
