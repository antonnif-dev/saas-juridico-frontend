import React from 'react';

function ArquivosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestão Eletrônica de Documentos (GED)</h1>
      <p>Repositório central de modelos e arquivos do escritório.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Contratos', 'Procurações', 'Modelos', 'Financeiro'].map(folder => (
          <div key={folder} className="h-32 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 cursor-pointer transition-colors">
            <span className="font-medium">📁 {folder}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ArquivosPage;