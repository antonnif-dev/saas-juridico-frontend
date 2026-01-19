import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, FileText, DollarSign } from "lucide-react";

function ClientCasesPage() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isCliente = userRole === "cliente";

  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");

  const fetchMyCases = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/portal/meus-processos");
      setCases(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Erro ao buscar meus processos:", e);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCliente) return;
    fetchMyCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCliente]);

  const filteredCases = useMemo(() => {
    const term = (search || "").trim().toLowerCase();
    if (!term) return cases;

    return cases.filter((c) => {
      const titulo = (c.titulo || "").toLowerCase();
      const numero = (c.numeroProcesso || "").toLowerCase();
      const area = (c.area || "").toLowerCase();
      const status = (c.status || "").toLowerCase();
      return (
        titulo.includes(term) ||
        numero.includes(term) ||
        area.includes(term) ||
        status.includes(term)
      );
    });
  }, [cases, search]);

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();

    if (s.includes("encerr")) {
      return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Encerrado</Badge>;
    }
    if (s.includes("andament") || s.includes("em andamento")) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Em andamento</Badge>;
    }
    if (s.includes("suspens")) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Suspenso</Badge>;
    }
    if (s.includes("arquiv")) {
      return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Arquivado</Badge>;
    }
    return <Badge variant="outline">{status || "N/D"}</Badge>;
  };

  const formatBRL = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return "—";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Meus Processos</h1>
          <p className="text-slate-500">
            {loading ? "Carregando..." : `Exibindo ${filteredCases.length} processos`}
          </p>
        </div>

        <div className="w-full md:w-96 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-full"
            placeholder="Buscar por título, nº, área, status..."
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-32 bg-slate-200 rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-64 bg-slate-200 rounded" />
                <div className="h-9 w-32 bg-slate-200 rounded mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum processo encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Você ainda não possui processos vinculados ou sua busca não encontrou resultados.
            </p>
            <Button className="mt-4" onClick={() => navigate("/portal/triagem")}>
              Abrir novo atendimento
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((c) => (
            <Card key={c.id} className="border-slate-200">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-lg truncate">{c.titulo || "Processo"}</CardTitle>
                    <p className="text-sm text-slate-500 truncate">
                      Nº {c.numeroProcesso || "N/D"} • {c.area || "Área N/D"}
                    </p>
                  </div>
                  <div className="shrink-0">{getStatusBadge(c.status)}</div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <span className="font-semibold">{formatBRL(c.valorAcordado)}</span>
                    <span className="text-slate-500">(Valor acordado)</span>
                  </div>

                  {(c.comarca || c.instancia) && (
                    <div className="text-slate-500 sm:ml-auto">
                      {c.comarca ? `Comarca: ${c.comarca}` : ""}
                      {c.comarca && c.instancia ? " • " : ""}
                      {c.instancia ? `Instância: ${c.instancia}` : ""}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => navigate(`/portal/processos/${c.id}`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ver detalhes
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => navigate("/portal/mensagens")}
                  >
                    Ir para mensagens
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClientCasesPage;
