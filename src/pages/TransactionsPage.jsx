import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import apiClient from '@/services/apiClient';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, CalendarClock, CheckCircle2, AlertCircle, Receipt, Clock, PlusCircle } from 'lucide-react';
//import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function TransactionsPage() {
  const [processes, setProcesses] = useState([]);
  const { userRole } = useAuth();
  const isAdmin = userRole === 'administrador' || userRole === 'advogado';

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalPendente: 0, totalPago: 0, totalAtrasado: 0 });
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState([]);
  const [displayTransactions, setDisplayTransactions] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseData, setExpenseData] = useState({
    titulo: "",
    valor: "",
    tipo: "despesa",
    categoria: "custas",
    status: "paid", // Despesas geralmente são registradas já pagas
    processoId: ""
  });

  const handleCreateExpense = async () => {
    try {
      // 1. Localiza o processo completo na lista que você buscou no useEffect
      const processoAlvo = processes.find(p => p.id === expenseData.processoId);

      if (!expenseData.titulo || !expenseData.valor || !processoAlvo) {
        alert("Por favor, selecione um processo e preencha todos os campos.");
        return;
      }

      const payload = {
        titulo: expenseData.titulo,
        valor: parseFloat(expenseData.valor),
        tipo: "despesa", // Garante o tipo correto para o cálculo
        categoria: "custas",
        status: "pending", // Ou "paid", conforme sua necessidade
        processoId: processoAlvo.id,
        clientId: processoAlvo.clientId, // ESSENCIAL para os cards atualizarem
        clienteNome: processoAlvo.clienteNome || processoAlvo.cliente || "Escritório",
        dataVencimento: new Date().toISOString()
      };

      await apiClient.post('/financial/transactions', payload);

      alert("Despesa lançada com sucesso!");
      setIsExpenseModalOpen(false);

      setExpenseData({
        titulo: "", valor: "", tipo: "despesa", categoria: "custas", status: "paid", processoId: ""
      });

      loadFinancialData();
    } catch (error) {
      console.error("Erro ao lançar despesa:", error);
      alert("Erro ao salvar. Verifique se todos os campos estão preenchidos.");
    }
  };

  const [filterStatus, setFilterStatus] = useState('all');

  const handleMarkAsPaid = async (id) => {
    if (!window.confirm("Confirmar o recebimento deste valor?")) return;

    try {
      await apiClient.patch(`/financial/transactions/${id}/pay`); // Precisaremos criar esta rota
      toast.success("Pagamento confirmado!");
      // Recarregar os dados para atualizar os cards e a lista
      loadFinancialData();
    } catch (error) {
      toast.error("Erro ao processar pagamento.");
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  // 2. Extraia a função de carregamento para fora do useEffect para que ela seja acessível
  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/financial/transactions');
      const txs = data.transactions || [];
      setAllTransactions(txs);
      setSummary(data.summary || { totalPendente: 0, totalPago: 0, totalAtrasado: 0 });
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. UseEffects Limpos
  useEffect(() => {
    if (isAdmin) {
      const fetchProcesses = async () => {
        try {
          const { data } = await apiClient.get('/processo');
          setProcesses(data);
        } catch (e) { console.error(e); }
      };
      fetchProcesses();
    }
    loadFinancialData();
  }, [isAdmin]);

  // 4. Lógica ÚNICA de Filtragem (Status + Pesquisa)
  useEffect(() => {
    let filtered = [...allTransactions];

    // Filtro de Mês e Ano
    filtered = filtered.filter(txn => {
      const data = new Date(txn.dataVencimento);
      return data.getMonth() === selectedMonth && data.getFullYear() === selectedYear;
    });

    // Filtro por Status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Filtro por Pesquisa (Título ou Cliente)
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.titulo?.toLowerCase().includes(term) ||
        t.cliente?.toLowerCase().includes(term)
      );
    }

    setDisplayTransactions(filtered);
  }, [allTransactions, filterStatus, searchQuery, selectedMonth, selectedYear]);

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

  const handleConfirmPayment = async (transactionId) => {
    if (!window.confirm("Deseja confirmar o recebimento deste valor?")) return;
    try {
      await apiClient.post(`/financial/transactions/${transactionId}/pay`);
      alert("Pagamento confirmado!");
      loadFinancialData(); // Agora esta função está acessível aqui
    } catch (error) {
      console.error(error);
    }
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

        {/* ADICIONE ESTE BLOCO AQUI */}
        {isAdmin && (
          <Button
            onClick={() => setIsExpenseModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Lançar Despesa
          </Button>
        )}
      </div>

      {/* Cards de Resumo (Só Admin vê o total geral, Cliente vê o dele) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="...">
            <CardTitle className="...">Total Pendente</CardTitle>
            <CalendarClock className="..." />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {formatMoney(summary.totalPendente)}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="...">
            <CardTitle className="...">Total Pago (Mês)</CardTitle>
            <CheckCircle2 className="..." />
          </CardHeader>
          <CardContent>
            {/* ANTES: <div className="...">R$ 1.500,00</div> */}
            <div className="text-2xl font-bold text-green-700">
              {formatMoney(summary.totalPago)}
            </div>
            <p className="text-xs text-muted-foreground">Valores liquidados</p>
          </CardContent>
        </Card>
        {isAdmin && (
          <Card>
            <CardHeader className="...">
              <CardTitle className="...">Em Atraso</CardTitle>
              <AlertCircle className="..." />
            </CardHeader>
            <CardContent>
              {/* ANTES: <div className="...">R$ 5.000,00</div> */}
              <div className="text-2xl font-bold text-red-700">
                {formatMoney(summary.totalAtrasado)}
              </div>
              <p className="text-xs text-muted-foreground">Ações de cobrança necessárias</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Pesquisar por título ou cliente..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select onValueChange={(val) => setFilterStatus(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="overdue">Atrasados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="border rounded p-3 px-10 bg-white"
        >
          {["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map((mes, index) => (
              <option key={index} value={index}>{mes}</option>
            ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="border rounded p-2 px-10 bg-white"
        >
          {[2024, 2025, 2026].map(ano => (
            <option key={ano} value={ano}>{ano}</option>
          ))}
        </select>
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
                  {/* necessários? descomentar para habilitar Status e Ações  
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>*/}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">
                      {txn.titulo}
                      <div className="text-xs text-muted-foreground md:hidden">{formatMoney(txn.valor)} • {txn.status}</div>
                    </TableCell>
                    {isAdmin && <TableCell>{txn.cliente}</TableCell>}
                    <TableCell>
                      {txn.vencimento && (format(new Date(txn.dataVencimento?._seconds * 1000 || txn.dataVencimento), 'dd/MM/yyyy', { locale: ptBR }))}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-bold text-slate-700">
                      {formatMoney(txn.valor)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getStatusBadge(txn.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* AÇÃO PARA O CLIENTE: Botão de Pagar */}
                      {txn.status === 'pending' && !isAdmin && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handlePaymentAction(txn)}>
                          <DollarSign className="w-3 h-3 mr-1" /> Pagar
                        </Button>
                      )}

                      {/* AÇÃO PARA O ADMIN: Confirmar que o dinheiro caiu (Dar Baixa) */}
                      {txn.status === 'pending' && isAdmin && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => handleConfirmPayment(txn.id)} // Função que criamos antes
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmar Recebimento
                          </Button>

                          <Button size="sm" variant="ghost" className="text-xs text-slate-400">
                            Reenviar
                          </Button>
                        </div>
                      )}

                      {/* EXIBIÇÃO PARA AMBOS: Quando já está pago */}
                      {txn.status === 'paid' && (
                        <Button size="sm" variant="ghost" className="text-xs text-blue-600">
                          <Receipt className="w-3 h-3 mr-1" /> Ver Recibo
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
      <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Lançar Despesa / Gasto</DialogTitle>
            <DialogDescription>
              Registre saídas de caixa vinculadas a processos ou manutenção do escritório.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vincular Processo (Opcional)</label>
              <Select onValueChange={(val) => setExpenseData({ ...expenseData, processoId: val })}
                value={expenseData.processoId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um processo..." />
                </SelectTrigger>
                <SelectContent>
                  {processes.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.numeroProcesso || "Sem Nº"} - {p.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                placeholder="Ex: Custas Judiciais, Token, Correios..."
                onChange={(e) => setExpenseData({ ...expenseData, titulo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input
                type="number"
                placeholder="0.00"
                onChange={(e) => setExpenseData({ ...expenseData, valor: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateExpense} className="bg-slate-900 text-white">Salvar Gasto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TransactionsPage;