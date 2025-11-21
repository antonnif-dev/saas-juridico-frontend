import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, CalendarClock, CheckCircle2, AlertCircle } from 'lucide-react';

function TransactionsPage() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'administrador' || userRole === 'advogado';
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulação de busca de dados (Backend Futuro)
  useEffect(() => {
    // Em breve: const { data } = await apiClient.get('/financial/transactions');
    const mockData = [
      { 
        id: 'txn_001', 
        titulo: 'Honorários - Caso Silva vs Estado', 
        cliente: 'João Silva', 
        valor: 1500.00, 
        vencimento: new Date(2025, 10, 15), 
        status: 'paid', // paid, pending, overdue
        metodo: 'Pix'
      },
      { 
        id: 'txn_002', 
        titulo: 'Consulta Inicial - Trabalhista', 
        cliente: 'Maria Oliveira', 
        valor: 350.00, 
        vencimento: new Date(2025, 10, 20), 
        status: 'pending',
        metodo: 'Aguardando'
      },
      { 
        id: 'txn_003', 
        titulo: 'Honorários - Divórcio', 
        cliente: 'Carlos Souza', 
        valor: 5000.00, 
        vencimento: new Date(2025, 9, 30), 
        status: 'overdue',
        metodo: 'Boleto'
      }
    ];

    // Filtra se for cliente (simulação)
    // Se fosse real, o backend já filtraria pelo token
    setTimeout(() => {
      setTransactions(mockData); 
      setLoading(false);
    }, 800);
  }, []);

  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Pago</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pendente</Badge>;
      case 'overdue': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Atrasado</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const handlePaymentAction = (txn) => {
    alert(`Redirecionando para gateway de pagamento (Stripe/Asaas/etc) para pagar: ${formatMoney(txn.valor)}`);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Gerencie as cobranças e receitas do escritório." : "Consulte e realize pagamentos dos seus honorários."}
          </p>
        </div>
      </div>

      {/* Cards de Resumo (Só Admin vê o total geral, Cliente vê o dele) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <CalendarClock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">R$ 350,00</div>
            <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago (Mês)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">R$ 1.500,00</div>
            <p className="text-xs text-muted-foreground">+20% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">R$ 5.000,00</div>
              <p className="text-xs text-muted-foreground">Ações de cobrança necessárias</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabela de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="p-4 text-center">Carregando financeiro...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição / Processo</TableHead>
                  {isAdmin && <TableHead>Cliente</TableHead>}
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">
                      {txn.titulo}
                      <div className="text-xs text-muted-foreground md:hidden">{formatMoney(txn.valor)} • {txn.status}</div>
                    </TableCell>
                    {isAdmin && <TableCell>{txn.cliente}</TableCell>}
                    <TableCell>{format(txn.vencimento, 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell className="hidden md:table-cell font-bold text-slate-700">
                      {formatMoney(txn.valor)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getStatusBadge(txn.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {txn.status === 'pending' && !isAdmin && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handlePaymentAction(txn)}>
                          <DollarSign className="w-3 h-3 mr-1" /> Pagar
                        </Button>
                      )}
                      {txn.status === 'pending' && isAdmin && (
                        <Button size="sm" variant="outline" className="text-xs">
                          Reenviar Cobrança
                        </Button>
                      )}
                      {txn.status === 'paid' && (
                        <Button size="sm" variant="ghost" className="text-xs text-blue-600">
                          Ver Recibo
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TransactionsPage;