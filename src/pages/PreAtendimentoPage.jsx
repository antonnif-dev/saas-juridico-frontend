import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function PreAtendimentoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Pré-atendimento (Triagem)</h1>
      <p className="text-muted-foreground">Gestão de leads e qualificação de novos contatos.</p>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Novos Contatos</CardTitle></CardHeader>
          <CardContent>Lista de potenciais clientes aguardando retorno.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Agendamento Inicial</CardTitle></CardHeader>
          <CardContent>Agenda de reuniões de apresentação.</CardContent>
        </Card>
      </div>
    </div>
  );
}
export default PreAtendimentoPage;