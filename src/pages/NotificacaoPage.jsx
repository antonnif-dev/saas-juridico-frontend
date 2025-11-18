import React from 'react';

function NotificacaoPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Central de Notificações</h1>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <p className="font-bold">Publicação Recente</p>
        <p>Nova movimentação no processo 12345.</p>
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <p className="font-bold">Lembrete de Prazo</p>
        <p>Prazo fatal para contestação amanhã.</p>
      </div>
    </div>
  );
}
export default NotificacaoPage;