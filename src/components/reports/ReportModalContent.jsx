import React from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FileText, DollarSign, Archive, User, AlertCircle, Scale, Receipt } from 'lucide-react';

const ReportModalContent = ({ processo, cliente }) => {
  if (!processo) return <p className="p-4 text-center">Nenhum processo selecionado.</p>;

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(value) || 0);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date._seconds ? new Date(date._seconds * 1000) : new Date(date);
    return format(d, 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="space-y-8 pb-10">

      {/* SEÇÃO 1: RESUMO DO CASO */}
      <section className="border-b pb-4" style={{ borderColor: 'var(--cor-borda)' }}>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--cor-texto-primario)' }}>
          <FileText className="w-5 h-5" style={{ color: 'var(--cor-primaria)' }} />
          Resumo e Identificação
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div><p className="text-xs uppercase" style={{ color: 'var(--cor-texto-secundario)' }}>Título</p><p className="font-medium">{processo.titulo}</p></div>
          <div><p className="text-xs uppercase" style={{ color: 'var(--cor-texto-secundario)' }}>Nº Processo</p><p className="font-medium">{processo.numeroProcesso || "N/A"}</p></div>
          <div><p className="text-xs uppercase" style={{ color: 'var(--cor-texto-secundario)' }}>Status Final</p><p className="font-medium">{processo.status}</p></div>
          <div><p className="text-xs uppercase" style={{ color: 'var(--cor-texto-secundario)' }}>Data Início</p><p className="font-medium">{formatDate(processo.createdAt)}</p></div>
        </div>
      </section>

      {/* SEÇÃO 2: PRESTAÇÃO DE CONTAS */}
      <section className="border-b pb-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--cor-fundo)', borderColor: 'var(--cor-borda)' }}>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#2f855a' }}>
          <Receipt className="w-5 h-5" /> Prestação de Contas Financeira
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-sm">
            <p className="text-xs uppercase" style={{ color: 'var(--cor-texto-secundario)' }}>Total Recebido</p>
            <p className="text-lg font-bold" style={{ color: '#38a169' }}>
              {formatCurrency(processo.transactions?.filter(t => t.tipo !== 'despesa').reduce((a, b) => a + b.valor, 0))}
            </p>
          </div>
          <div className="text-sm">
            <p className="text-xs uppercase" style={{ color: 'var(--cor-texto-secundario)' }}>Total Despesas</p>
            <p className="text-lg font-bold" style={{ color: '#e53e3e' }}>
              {formatCurrency(processo.transactions?.filter(t => t.tipo === 'despesa').reduce((a, b) => a + b.valor, 0))}
            </p>
          </div>
          <div className="text-sm border-l pl-4" style={{ borderColor: 'var(--cor-borda)' }}>
            <p className="text-xs uppercase" style={{ color: 'var(--cor-texto-secundario)' }}>Saldo Líquido</p>
            <p className="text-lg font-bold" style={{ color: processo.balance >= 0 ? 'var(--cor-primaria)' : '#e53e3e' }}>
              {formatCurrency(processo.balance)}
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: HISTÓRICO */}
      <section className="border-b pb-4" style={{ borderColor: 'var(--cor-borda)' }}>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--cor-texto-primario)' }}>
          <Scale className="w-5 h-5" style={{ color: '#805ad5' }} /> Histórico de Atos Processuais
        </h3>
        <div className="space-y-2">
          {processo.movimentacoes?.length > 0 ? (
            processo.movimentacoes.map((mov, i) => (
              <div key={i} className="flex justify-between p-3 border rounded text-sm" style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-borda)' }}>
                <span className="font-medium" style={{ color: 'var(--cor-texto-primario)' }}>{mov.descricao}</span>
                <span className="text-xs" style={{ color: 'var(--cor-texto-secundario)' }}>{formatDate(mov.data)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm italic" style={{ color: 'var(--cor-texto-secundario)' }}>Nenhum ato registrado.</p>
          )}
        </div>
      </section>

      {/* SEÇÃO 4: CLIENTE */}
      <section className="pb-4">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--cor-texto-primario)' }}>
          <User className="w-5 h-5" style={{ color: 'var(--cor-texto-secundario)' }} /> Dados do Contratante
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs uppercase" style={{ color: 'var(--cor-texto-secundario)' }}>Nome</p><p className="font-medium">{cliente?.name}</p></div>
          <div><p className="text-xs uppercase" style={{ color: 'var(--cor-texto-secundario)' }}>E-mail</p><p className="font-medium">{cliente?.email}</p></div>
        </div>
      </section>
    </div>
  );
};

export default ReportModalContent;