import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../../services/apiClient";

import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

export default function ClientAtendimentosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const statusLabel = useMemo(
    () => (s) => {
      if (!s) return "Em análise";
      return String(s);
    },
    []
  );

  const formatDate = useMemo(
    () => (value) => {
      if (!value) return "-";

      // Firestore Timestamp { _seconds } ou string/date normal
      if (typeof value === "object" && value?._seconds) {
        const d = new Date(value._seconds * 1000);
        return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("pt-BR");
      }

      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("pt-BR");
    },
    []
  );

  const formatValue = useMemo(
    () => (val) => {
      if (val === null || val === undefined || val === "") return "—";
      if (typeof val === "boolean") return val ? "Sim" : "Não";
      if (Array.isArray(val)) return val.length ? val.join(", ") : "—";
      if (typeof val === "object") return JSON.stringify(val, null, 2);
      return String(val);
    },
    []
  );

  const renderTriagem = useMemo(
    () => (triagem) => {
      if (!triagem || typeof triagem !== "object") {
        return <p className="text-sm text-slate-500">Sem triagem específica.</p>;
      }

      const entries = Object.entries(triagem).filter(
        ([_, v]) => v !== undefined && v !== null && v !== ""
      );

      if (!entries.length) {
        return <p className="text-sm text-slate-500">Sem triagem específica.</p>;
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entries.map(([k, v]) => (
            <div key={k} className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold text-slate-500">{k}</p>
              <p className="text-sm text-slate-800">{formatValue(v)}</p>
            </div>
          ))}
        </div>
      );
    },
    [formatValue]
  );

  // 1) Carrega lista do cliente
  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get("/portal/meus-atendimentos");
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError("Não foi possível carregar seus atendimentos.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  // 2) Abre modal e carrega detalhes
  const openModal = async (id) => {
    setOpen(true);
    setSelected(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const res = await apiClient.get(`/portal/atendimentos/${id}`);
      setSelected(res.data || null);
    } catch (e) {
      setDetailsError("Não foi possível carregar os detalhes do atendimento.");
      setSelected(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
    setDetailsError("");
    setDetailsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Atendimentos</h1>
          <p className="text-sm text-slate-600">
            Aqui você acompanha seus pré-atendimentos e vê os detalhes enviados pelo escritório.
          </p>
        </div>
      </div>

      {loading && <div className="text-slate-600">Carregando...</div>}
      {!loading && error && <div className="text-red-600">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-700">
          Nenhum atendimento encontrado.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((it) => {
            const createdAt =
              it.createdAt || it.dataCriacao || it.created_at || it.dataSolicitacao;

            return (
              <Card key={it.id} className="border-slate-200">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      {it.titulo || it.assunto || "Pré-atendimento"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {it.numeroProtocolo
                        ? `Protocolo: ${it.numeroProtocolo}`
                        : "Protocolo não informado"}
                    </p>
                  </div>
                  <Badge variant="secondary">{statusLabel(it.status)}</Badge>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-700">Categoria:</span>{" "}
                      {it.categoria || it.area || "-"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Criado em:</span>{" "}
                      {formatDate(createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button onClick={() => openModal(it.id)}>Ver detalhes</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeModal();
          else setOpen(true);
        }}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do pré-atendimento</DialogTitle>
            <DialogDescription>
              Visualização das informações enviadas e do retorno do escritório.
            </DialogDescription>
          </DialogHeader>

          {detailsLoading && <div className="text-slate-600">Carregando detalhes...</div>}
          {detailsError && <div className="text-red-600">{detailsError}</div>}

          {!detailsLoading && !detailsError && selected && (
            <div className="space-y-6">
              {/* Cabeçalho estilo CaseDetail */}
              <Card className="border-slate-200">
                <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">
                      {selected.titulo || selected.assunto || "Pré-atendimento"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selected.numeroProtocolo
                        ? `Protocolo: ${selected.numeroProtocolo}`
                        : "Protocolo não informado"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{statusLabel(selected.status)}</Badge>
                    {selected.urgencia && <Badge variant="outline">{selected.urgencia}</Badge>}
                  </div>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Categoria" value={selected.categoria || selected.area || "—"} />
                  <Field
                    label="Criado em"
                    value={formatDate(
                      selected.createdAt ||
                        selected.dataCriacao ||
                        selected.created_at ||
                        selected.dataSolicitacao
                    )}
                  />
                  <Field label="E-mail" value={selected.email || "—"} />
                  <Field label="WhatsApp" value={selected.whatsapp || selected.telefone || "—"} />
                  <Field
                    label="Resumo do problema"
                    value={selected.resumoProblema || selected.resumo || selected.descricao || "—"}
                    multiline
                  />
                </CardContent>
              </Card>

              {/* Endereço (se existir) */}
              {selected.endereco && (
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-base">Endereço</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Rua" value={selected.endereco?.rua || "—"} />
                    <Field
                      label="Número / Compl."
                      value={
                        `${selected.endereco?.numero || "—"}${
                          selected.endereco?.complemento ? `, ${selected.endereco.complemento}` : ""
                        }`
                      }
                    />
                    <Field label="Bairro" value={selected.endereco?.bairro || "—"} />
                    <Field
                      label="Cidade / UF"
                      value={`${selected.endereco?.cidade || "—"} / ${selected.endereco?.estado || "—"}`}
                    />
                    <Field label="CEP" value={selected.endereco?.cep || "—"} />
                  </CardContent>
                </Card>
              )}

              {/* Triagem */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Triagem específica</CardTitle>
                </CardHeader>
                <CardContent>{renderTriagem(selected.triagem)}</CardContent>
              </Card>

              {/* Complementos */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Complementos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field label="Documentos selecionados" value={formatValue(selected.documentos)} />
                  <Field label="Objetivo" value={selected.objetivo || "—"} />
                  <Field
                    label="Informação extra"
                    value={selected.informacaoExtra || "—"}
                    multiline
                  />
                </CardContent>
              </Card>

              {/* Observações do escritório */}
              {(selected.parecerInicial ||
                selected.observacoes ||
                selected.proximosPassos ||
                selected.orientacoes) && (
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-base">Observações do escritório</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Parecer inicial"
                      value={selected.parecerInicial || selected.observacoes || "—"}
                      multiline
                    />
                    <Field
                      label="Próximos passos"
                      value={selected.proximosPassos || selected.orientacoes || "—"}
                      multiline
                    />
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={closeModal}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, multiline }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className={`text-sm text-slate-900 ${multiline ? "whitespace-pre-wrap" : ""}`}>
        {value}
      </div>
    </div>
  );
}
