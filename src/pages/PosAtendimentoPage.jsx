import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function PosAtendimentoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-600">Pós-atendimento</h1>
      <p className="text-muted-foreground">Fidelização, NPS e encerramento de casos.</p>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Pesquisa de Satisfação</CardTitle></CardHeader>
          <CardContent>Métricas de NPS dos clientes.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Arquivamento</CardTitle></CardHeader>
          <CardContent>Gestão de processos finalizados.</CardContent>
        </Card>
      </div>
    </div>
  );
}
export default PosAtendimentoPage;