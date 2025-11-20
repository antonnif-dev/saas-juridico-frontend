import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, FileText } from 'lucide-react';

function ClientTriagemPage() {
  const { id } = useParams(); // ID do pré-atendimento
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assinatura, setAssinatura] = useState('');

  // Busca os dados do caso
  useEffect(() => {
    const fetchLead = async () => {
      try {
        // Reutiliza a rota de listagem ou cria uma específica de 'getById' pública/cliente
        // Aqui assumo que você vai criar ou usar um getById simples.
        // Se não tiver, use a lista e filtre no front temporariamente:
        const response = await apiClient.get('/preatendimento');
        const found = response.data.find(l => l.id === id);
        setLead(found);
      } catch (error) {
        console.error("Erro", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const handleResponderProposta = async (status) => {
    try {
      await apiClient.put(`/preatendimento/${id}/proposal`, {
        proposalStatus: status,
        // Se recusar, limpa o valor para renegociação
        proposalValue: status === 'rejected' ? null : lead.proposalValue
      });
      alert(status === 'accepted' ? "Proposta aceita! Por favor, assine abaixo." : "Proposta recusada. Aguarde novo contato.");
      window.location.reload();
    } catch (error) { alert("Erro ao responder."); }
  };

  const handleAssinar = async () => {
    if (!assinatura.trim()) return alert("Digite seu nome completo para assinar.");
    try {
      await apiClient.put(`/preatendimento/${id}/proposal`, { signature: assinatura });
      alert("Assinado com sucesso! O advogado finalizará o processo.");
      window.location.reload();
    } catch (error) { alert("Erro ao assinar."); }
  };

  if (loading) return <p className="p-8">Carregando caso...</p>;
  if (!lead) return <p className="p-8">Caso não encontrado.</p>;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Acompanhamento do Caso</h1>

      <Card>
        <CardHeader>
          <CardTitle>{lead.categoria}</CardTitle>
          <p className="text-sm text-muted-foreground">Status: {lead.status}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-md">
            <p className="font-semibold text-sm mb-1">Resumo do Problema:</p>
            <p className="text-sm">{lead.resumoProblema}</p>
          </div>

          {/* --- MENSAGEM DO ADVOGADO --- */}
          {lead.adminNotes && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-2 text-sm">Observações do Escritório:</h3>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {lead.adminNotes}
              </p>
            </div>
          )}

          {/* ÁREA DE PROPOSTA (Só aparece se o advogado enviou valor) */}
          {lead.proposalStatus !== 'pending' && lead.proposalValue && (
            <div className="border p-4 rounded-lg border-blue-200 bg-blue-50">
              <h3 className="font-bold text-blue-900 mb-2">Proposta de Honorários</h3>
              <p className="text-3xl font-bold text-slate-800">R$ {lead.proposalValue}</p>

              {/* Botões de Aceite (Só aparecem se ainda não respondeu) */}
              {lead.proposalStatus === 'sent' && (
                <div className="flex gap-4 mt-4">
                  <Button onClick={() => handleResponderProposta('accepted')} className="bg-green-600 hover:bg-green-700 w-full">
                    <Check className="mr-2 h-4 w-4" /> Aceitar Proposta
                  </Button>
                  <Button onClick={() => handleResponderProposta('rejected')} variant="destructive" className="w-full">
                    <X className="mr-2 h-4 w-4" /> Recusar
                  </Button>
                </div>
              )}

              {/* Mensagens de Status */}
              {lead.proposalStatus === 'rejected' && <p className="text-red-600 mt-2 font-bold">Você recusou esta proposta.</p>}
              {lead.proposalStatus === 'accepted' && <p className="text-green-600 mt-2 font-bold">Proposta Aceita!</p>}
            </div>
          )}

          {/* ÁREA DE ASSINATURA (Só aparece se aceitou e ainda não assinou) */}
          {lead.proposalStatus === 'accepted' && !lead.signature && (
            <div className="space-y-4 border-t pt-4">
              <Label>Assinatura Digital</Label>
              <p className="text-xs text-muted-foreground">Digite seu nome completo para confirmar a contratação.</p>
              <Input
                value={assinatura}
                onChange={(e) => setAssinatura(e.target.value)}
                placeholder="Seu Nome Completo"
                className="border-blue-300 bg-blue-50"
              />
              <Button onClick={handleAssinar} className="w-full">Confirmar Assinatura</Button>
            </div>
          )}

          {/* STATUS FINAL */}
          {lead.signature && (
            <div className="bg-green-100 p-4 rounded-md text-center text-green-800 font-bold">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              Contrato Assinado Digitalmente por: {lead.signature}
              <p className="text-xs font-normal mt-1">Aguardando finalização pelo escritório.</p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

export default ClientTriagemPage;