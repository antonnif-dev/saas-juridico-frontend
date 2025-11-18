import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function AtendimentoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">Atendimento Ativo</h1>
      <p className="text-muted-foreground">Execução de serviços e acompanhamento processual.</p>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader><CardTitle>Petições em Elaboração</CardTitle></CardHeader>
          <CardContent>Fluxo de trabalho das peças jurídicas atuais.</CardContent>
        </Card>
      </div>
    </div>
  );
}
export default AtendimentoPage;