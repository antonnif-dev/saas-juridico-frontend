import React, { useEffect, useMemo, useState } from "react";
import apiClient from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { DollarSign, CalendarClock, CheckCircle2, AlertCircle, Receipt, Search } from "lucide-react";

function ClientPaymentsPage() {
  const { userRole } = useAuth();
  const isCliente = userRole === "cliente";

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalPendente: 0, totalPago: 0, totalAtrasado: 0 });

  const [myCases, setMyCases] = useState([]);
  const [search, setSearch] = useState("");

  // Período
  const [periodMode, setPeriodMode] = useState("all"); // "all" | "month"
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth())); // 0-11 string
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  const toDateSafe = (value) => {
    if (!value) return null;
    if (typeof value === "object" && typeof value._seconds === "number") return new Date(value._seconds * 1000);
    if (typeof value === "object" && typeof value.seconds === "number") return new Date(value.seconds * 1000);
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatDateBR = (value) => {
    const d = toDateSafe(value);
    if (!d) return "N/D";
    return format(d, "dd/MM/yyyy", { locale: ptBR });
  };

  const formatBRL = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return "—";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Pago</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pendente</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Atrasado</Badge>;
      default:
        return <Badge variant="outline">N/D</Badge>;
    }
  };

  const getTipoLabel = (tipo) => {
    if (tipo === "receita") return "Cobrança";
    if (tipo === "despesa") return "Despesa";
    return "Mov.";
  };

  const getCategoriaLabel = (cat) => {
    if (cat === "custas") return "Custas/Desp.";
    if (cat === "pagamento") return "Pagamento";
    if (cat === "despesa_geral") return "Despesa (Escritório)";
    return cat || "N/D";
  };

  const getCaseTitle = (txn) => {
    if (!txn?.processoId) return "—";
    const c = myCases.find((p) => p.id === txn.processoId);
    return c?.titulo || "Processo";
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // 1) financeiro do cliente
      const financialReq = apiClient.get("/financial/transactions");

      // 2) meus processos (pra mapear titulo do processo no histórico)
      const casesReq = apiClient.get("/portal/meus-processos").catch(() => ({ data: [] }));

      const [financialRes, casesRes] = await Promise.all([financialReq, casesReq]);

      const txs = financialRes?.data?.transactions || [];
      setTransactions(Array.isArray(txs) ? txs : []);
      setSummary(financialRes?.data?.summary || { totalPendente: 0, totalPago: 0, totalAtrasado: 0 });

      setMyCases(Array.isArray(casesRes.data) ? casesRes.data : []);
    } catch (e) {
      console.error("Erro ao carregar financeiro do cliente:", e);
      setTransactions([]);
      setSummary({ totalPendente: 0, totalPago: 0, totalAtrasado: 0 });
      setMyCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCliente) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCliente]);

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    // período
    if (periodMode === "month") {
      const m = Number(selectedMonth);
      const y = Number(selectedYear);

      list = list.filter((t) => {
        const d = toDateSafe(t?.createdAt || t?.data || t?.dataCriacao || t?.updatedAt);
        if (!d) return true; // se não tiver data, não elimina
        return d.getMonth() === m && d.getFullYear() === y;
      });
    }

    // busca
    const term = (search || "").trim().toLowerCase();
    if (term) {
      list = list.filter((t) => {
        const titulo = (t.titulo || "").toLowerCase();
        const categoria = (t.categoria || "").toLowerCase();
        const status = (t.status || "").toLowerCase();
        const procTitle = getCaseTitle(t).toLowerCase();
        return (
          titulo.includes(term) ||
          categoria.includes(term) ||
          status.includes(term) ||
          procTitle.includes(term)
        );
      });
    }

    // ordena por data desc (se tiver)
    list.sort((a, b) => {
      const da = toDateSafe(a?.createdAt || a?.data || a?.updatedAt);
      const db = toDateSafe(b?.createdAt || b?.data || b?.updatedAt);
      const ta = da ? da.getTime() : 0;
      const tb = db ? db.getTime() : 0;
      return tb - ta;
    });

    return list;
  }, [transactions, periodMode, selectedMonth, selectedYear, search, myCases]);

  const honorariosTotal = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.categoria === "honorarios")
      .reduce((acc, t) => acc + Number(t.valor || 0), 0);
  }, [filteredTransactions]);

  const handlePay = (txn) => {
    // Seu backend atual restringe o PATCH /pay para admin/advogado.
    // Para cliente, o correto é criar um endpoint de checkout (MercadoPago) depois.
    alert("Pagamento online será habilitado via Mercado Pago na etapa final. Por enquanto, acompanhe o status pelo escritório.");
  };

  if (!isCliente) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">Esta área é exclusiva para clientes.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Pagamentos</h1>
          <p className="text-slate-500">Acompanhe cobranças, pagamentos e recibos.</p>
        </div>

        <div className="w-full md:w-[520px] flex flex-col sm:flex-row gap-2">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-full"
              placeholder="Buscar por descrição, processo, status..."
            />
          </div>

          <Select value={periodMode} onValueChange={setPeriodMode}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Geral</SelectItem>
              <SelectItem value="month">Mês/Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Seletor mês/ano (só quando periodMode === month) */}
      {periodMode === "month" && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, idx) => (
                <SelectItem key={m} value={String(idx)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Em aberto
            </CardDescription>
            <CardTitle className="text-2xl">{formatBRL(summary.totalPendente)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">
            Valores pendentes no período selecionado.
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Pago
            </CardDescription>
            <CardTitle className="text-2xl">{formatBRL(summary.totalPago)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">
            Pagamentos confirmados no período selecionado.
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-red-600" />
              Atrasado
            </CardDescription>
            <CardTitle className="text-2xl">{formatBRL(summary.totalAtrasado)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">
            Cobranças vencidas (quando houver vencimento).
          </CardContent>
        </Card>
      </div>

      {/* Histórico */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>Veja cobranças, pagamentos e recibos vinculados aos seus processos.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-600">Carregando...</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-slate-600">Nenhuma transação encontrada.</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="hidden md:table-cell">Processo</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Venc.</TableHead>
                    <TableHead>Dados de pagamento</TableHead>
                    <TableHead>Recibo</TableHead>                    
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{formatDateBR(t.createdAt || t.data || t.updatedAt)}</TableCell>

                      <TableCell>
                        <div className="font-medium text-slate-900">{t.titulo || "Movimentação"}</div>

                        {/* Compacto no mobile */}
                        <div className="text-xs text-slate-500 md:hidden mt-1">
                          {getCaseTitle(t)} • {getCategoriaLabel(t.categoria)} • {getTipoLabel(t.tipo)}
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">{getCaseTitle(t)}</TableCell>

                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">{getTipoLabel(t.tipo)}</div>
                        <div className="text-xs text-slate-500">{getCategoriaLabel(t.categoria)}</div>
                      </TableCell>

                      <TableCell className="font-semibold">{formatBRL(t.valor)}</TableCell>

                      <TableCell>{getStatusBadge(t.status)}</TableCell>

                      <TableCell>
                        {t.status === "pending" ? (
                          <Button size="sm" onClick={() => handlePay(t)}>
                            Pagar
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            —
                          </Button>
                        )}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {t.dataVencimento ? formatDateBR(t.dataVencimento) : "—"}
                      </TableCell>

                      <TableCell>
                        {t.reciboUrl ? (
                          <Button variant="outline" size="sm" onClick={() => window.open(t.reciboUrl, "_blank")}>
                            <Receipt className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </TableCell>
                      
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ClientPaymentsPage;
