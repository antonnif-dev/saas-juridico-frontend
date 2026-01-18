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

  const [transactions, setTransactions,] = useState([]);
  const [summary, setSummary] = useState({ totalPendente: 0, totalPago: 0, totalAtrasado: 0 });
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions,] = useState([]);
  const [displayTransactions, setDisplayTransactions] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [periodMode, setPeriodMode] = useState("month");
  const [honorariosTotal, setHonorariosTotal] = useState(0);

  const [isReciboModalOpen, setIsReciboModalOpen] = useState(false);
  const [reciboTxn, setReciboTxn] = useState(null);
  const [reciboFile, setReciboFile] = useState(null);
  const [isUploadingRecibo, setIsUploadingRecibo] = useState(false);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseData, setExpenseData] = useState({
    titulo: "",
    valor: "",
    tipo: "despesa",
    categoria: "custas",
    status: "paid",
    processoId: "",
    dataVencimento: ""
  });

  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [revenueData, setRevenueData] = useState({
    titulo: "",
    valor: "",
    tipo: "receita",
    categoria: "honorarios",
    status: "pending",
    processoId: "",
    dataVencimento: ""
  });

  const handleCreateExpense = async () => {
    try {
      if (!expenseData.titulo || !expenseData.valor) {
        alert("Preencha descrição e valor.");
        return;
      }

      const isOfficeExpense = expenseData.categoria === "despesa_geral";

      let processoAlvo = null;
      if (!isOfficeExpense) {
        processoAlvo = processes.find(p => p.id === expenseData.processoId);
        if (!processoAlvo) {
          alert("Selecione um processo para lançar custas/despesas do processo.");
          return;
        }
      }

      const payload = {
        titulo: expenseData.titulo,
        valor: parseFloat(expenseData.valor),
        tipo: "despesa",
        categoria: expenseData.categoria,
        status: expenseData.status || "paid",
        dataVencimento: expenseData.dataVencimento
          ? new Date(expenseData.dataVencimento).toISOString()
          : new Date().toISOString(),
        ...(processoAlvo
          ? {
            processoId: processoAlvo.id,
            clientId: processoAlvo.clientId,
            clienteNome: processoAlvo.clienteNome || processoAlvo.cliente || "Cliente",
          }
          : {
            clienteNome: "Escritório",
          }),
      };

      await apiClient.post('/financial/transactions', payload);

      alert("Despesa lançada com sucesso!");
      setIsExpenseModalOpen(false);

      setExpenseData({
        titulo: "",
        valor: "",
        tipo: "despesa",
        categoria: "custas",
        status: "paid",
        processoId: "",
        dataVencimento: ""
      });

      loadFinancialData();
    } catch (error) {
      console.error("Erro ao lançar despesa:", error);
      alert("Erro ao salvar. Verifique se todos os campos estão preenchidos.");
    }
  };

  const handleCreateRevenue = async () => {
    try {
      const processoAlvo = processes.find(p => p.id === revenueData.processoId);

      if (!revenueData.titulo || !revenueData.valor || !processoAlvo) {
        alert("Selecione um processo e preencha descrição e valor.");
        return;
      }

      const payload = {
        titulo: revenueData.titulo,
        valor: parseFloat(revenueData.valor),
        tipo: "receita",
        categoria: "honorarios",
        status: "pending",
        processoId: processoAlvo.id,
        clientId: processoAlvo.clientId,
        clienteNome: processoAlvo.clienteNome || processoAlvo.cliente || "Cliente",
        dataVencimento: revenueData.dataVencimento
          ? new Date(revenueData.dataVencimento).toISOString()
          : new Date().toISOString(),
      };

      await apiClient.post('/financial/transactions', payload);

      alert("Receita (honorários) lançada com sucesso!");
      setIsRevenueModalOpen(false);

      setRevenueData({
        titulo: "",
        valor: "",
        tipo: "receita",
        categoria: "honorarios",
        status: "pending",
        processoId: "",
        dataVencimento: ""
      });

      loadFinancialData();
    } catch (error) {
      console.error("Erro ao lançar receita:", error);
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

  useEffect(() => {
    let filtered = [...allTransactions];

    if (periodMode === "month") {
      filtered = filtered.filter((txn) => {
        const raw = txn.dataVencimento?._seconds
          ? txn.dataVencimento._seconds * 1000
          : txn.dataVencimento;
        const d = new Date(raw);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      });
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter((t) =>
        t.titulo?.toLowerCase().includes(term) ||
        t.cliente?.toLowerCase().includes(term) ||
        t.clienteNome?.toLowerCase().includes(term)
      );
    }
    setDisplayTransactions(filtered);

    const totalHonorariosCalc = filtered.reduce((acc, t) => {
      const v = Number(t.valor || 0);
      const isHonorario = t.categoria === "honorarios";
      const isReceita = !t.tipo || t.tipo === "receita";
      if (isHonorario && isReceita) return acc + v;
      return acc;
    }, 0);

    setHonorariosTotal(totalHonorariosCalc);

    const sum = filtered.reduce(
      (acc, t) => {
        const v = Number(t.valor || 0);
        if (t.status === "pending") acc.totalPendente += v;
        else if (t.status === "paid") acc.totalPago += v;
        else if (t.status === "overdue") acc.totalAtrasado += v;
        return acc;
      },
      { totalPendente: 0, totalPago: 0, totalAtrasado: 0 }
    );

    setSummary(sum);
  }, [allTransactions, filterStatus, searchQuery, selectedMonth, selectedYear, periodMode]);

  const getClientName = (txn) => {
    if (txn?.clienteNome) return txn.clienteNome;
    if (txn?.cliente) return txn.cliente;
    if (txn?.processoId) {
      const p = processes.find(x => x.id === txn.processoId);
      return p?.clienteNome || p?.cliente || "N/D";
    }
    return "N/D";
  };

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

  const openReciboModal = (txn) => {
    setReciboTxn(txn);
    setReciboFile(null);
    setIsReciboModalOpen(true);
  };

  const handleUploadRecibo = async () => {
    if (!reciboTxn?.id) return;
    if (!reciboFile) {
      alert("Selecione um arquivo (imagem ou PDF).");
      return;
    }

    setIsUploadingRecibo(true);
    try {
      const fd = new FormData();
      fd.append("recibo", reciboFile);

      await apiClient.post(`/financial/transactions/${reciboTxn.id}/recibo`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Recibo enviado com sucesso!");
      setIsReciboModalOpen(false);
      setReciboTxn(null);
      setReciboFile(null);
      loadFinancialData();
    } catch (e) {
      console.error("Erro ao enviar recibo:", e);
      alert("Falha ao enviar recibo.");
    } finally {
      setIsUploadingRecibo(false);
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
          <div className="flex gap-2">
            <Button
              onClick={() => setIsExpenseModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Lançar Despesa
            </Button>
            <Button
              onClick={() => setIsRevenueModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Lançar Receita
            </Button>
          </div>
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
        <Card>
          <CardHeader className="...">
            <CardTitle className="...">Honorários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatMoney(honorariosTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {periodMode === "all" ? "Total geral" : "Total do mês selecionado"}
            </p>
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

      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={periodMode} onValueChange={setPeriodMode}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Filtrar por mês/ano</SelectItem>
            <SelectItem value="all">Geral (tudo)</SelectItem>
          </SelectContent>
        </Select>

        {periodMode === "month" && (
          <>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-60 sm:w-auto border rounded p-3 bg-white"
            >
              {["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
                .map((mes, index) => <option key={index} value={index}>{mes}</option>)}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-60 sm:w-auto border rounded p-3 bg-white"
            >
              {[2024, 2025, 2026].map((ano) => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </>
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
                    {isAdmin && <TableCell>{getClientName(txn)}</TableCell>}
                    <TableCell>
                      {txn.dataVencimento && (
                        format(
                          new Date(txn.dataVencimento?._seconds * 1000 || txn.dataVencimento),
                          'dd/MM/yyyy',
                          { locale: ptBR }
                        )
                      )}
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

                      {txn.status === "paid" && (
                        <>
                          {/* Cliente: só vê se existir */}
                          {!isAdmin && txn.reciboUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs text-blue-600"
                              onClick={() => window.open(txn.reciboUrl, "_blank")}
                            >
                              <Receipt className="w-3 h-3 mr-1" /> Ver Recibo
                            </Button>
                          )}

                          {/* Admin/Advogado: pode anexar ou ver */}
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs text-blue-600"
                              onClick={() => openReciboModal(txn)}
                            >
                              <Receipt className="w-3 h-3 mr-1" /> {txn.reciboUrl ? "Ver / Trocar Recibo" : "Anexar Recibo"}
                            </Button>
                          )}
                        </>
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

            {/* Tipo de despesa */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de despesa</label>
              <Select
                value={expenseData.categoria}
                onValueChange={(val) =>
                  setExpenseData(prev => ({
                    ...prev,
                    categoria: val,
                    processoId: val === "despesa_geral" ? "" : prev.processoId
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custas">Despesa do processo (custas)</SelectItem>
                  <SelectItem value="despesa_geral">Despesa do escritório</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 👇 AQUI entra o trecho que você perguntou */}
            {expenseData.categoria === "custas" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Vincular Processo</label>
                <Select
                  onValueChange={(val) =>
                    setExpenseData({ ...expenseData, processoId: val })
                  }
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
            )}

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                placeholder="Ex: Custa judicial, cópia de documentos..."
                value={expenseData.titulo}
                onChange={(e) =>
                  setExpenseData({ ...expenseData, titulo: e.target.value })
                }
              />
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={expenseData.valor}
                onChange={(e) =>
                  setExpenseData({ ...expenseData, valor: e.target.value })
                }
              />
            </div>

            {/* Vencimento */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Vencimento</label>
              <Input
                type="date"
                value={expenseData.dataVencimento}
                onChange={(e) =>
                  setExpenseData({ ...expenseData, dataVencimento: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Se não escolher, será salvo com a data de hoje.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateExpense} className="bg-slate-900 text-white">Salvar Gasto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRevenueModalOpen} onOpenChange={setIsRevenueModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Lançar Receita (Honorários)</DialogTitle>
            <DialogDescription>
              Registre entradas vinculadas a um processo (honorários).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Processo</label>
              <Select
                onValueChange={(val) => setRevenueData({ ...revenueData, processoId: val })}
                value={revenueData.processoId}
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
                placeholder="Ex: Honorários iniciais, Honorários de êxito..."
                value={revenueData.titulo}
                onChange={(e) => setRevenueData({ ...revenueData, titulo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={revenueData.valor}
                onChange={(e) => setRevenueData({ ...revenueData, valor: e.target.value })}
              />
            </div>
            {/* Vencimento */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Vencimento</label>
              <Input
                type="date"
                value={revenueData.dataVencimento}
                onChange={(e) =>
                  setRevenueData({ ...revenueData, dataVencimento: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Se não escolher, será salvo com a data de hoje.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRevenueModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateRevenue} className="bg-slate-900 text-white">Salvar Receita</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReciboModalOpen} onOpenChange={setIsReciboModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Recibo</DialogTitle>
            <DialogDescription>
              {reciboTxn?.titulo} • {formatMoney(reciboTxn?.valor || 0)}
            </DialogDescription>
          </DialogHeader>

          {reciboTxn?.reciboUrl ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Recibo atual:</p>
              <Button variant="outline" onClick={() => window.open(reciboTxn.reciboUrl, "_blank")}>
                Abrir recibo
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum recibo anexado ainda.</p>
          )}

          {isAdmin && (
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">Enviar novo recibo (imagem ou PDF)</label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setReciboFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReciboModalOpen(false)}>Fechar</Button>
            {isAdmin && (
              <Button
                onClick={handleUploadRecibo}
                disabled={!reciboFile || isUploadingRecibo}
                className="bg-slate-900 text-white"
              >
                {isUploadingRecibo ? "Enviando..." : "Salvar Recibo"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TransactionsPage;