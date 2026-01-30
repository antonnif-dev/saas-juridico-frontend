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

  const [showInfo, setShowInfo] = useState(true);
  const [activeTab, setActiveTab] = useState("movimentacoes");
  const [activeCommTab, setActiveCommTab] = useState("movimentacoes");
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [novaMovimentacao, setNovaMovimentacao] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

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

  const toDateSafe = (value) => {
    if (value?._seconds) return new Date(value._seconds * 1000);
    if (value?.seconds) return new Date(value.seconds * 1000);
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDateTimeBR = (d) => {
    if (!d) return "N/D";
    return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
  };


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

  const commBase = (atendimentoId) => `/portal/atendimentos/${atendimentoId}`;
  const commMovUrl = (atendimentoId) => `${commBase(atendimentoId)}/movimentacoes`;
  const commDocUrl = (atendimentoId) => `${commBase(atendimentoId)}/documentos`;

  // 2) Abre modal e carrega detalhes
  const openModal = async (id) => {
    setOpen(true);
    setSelected(null);
    setDetailsError("");
    setDetailsLoading(true);
    setShowInfo(true);
    setActiveCommTab("movimentacoes");
    setMovimentacoes([]);
    setNovaMovimentacao("");
    setSelectedFile(null);
    setPreviewFile(null);

    try {
      const res = await apiClient.get(`/portal/atendimentos/${id}`);
      setSelected(res.data || null);
      await fetchMovimentacoes(id);
    } catch (e) {
      setDetailsError("Não foi possível carregar os detalhes do atendimento.");
      setSelected(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchMovimentacoes = async (atendimentoId) => {
    try {
      const res = await apiClient.get(commMovUrl(atendimentoId));
      setMovimentacoes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      // silencioso pra não quebrar o modal caso endpoint ainda não exista
      setMovimentacoes([]);
    }
  };

  const handleAddMovimentacao = async (e) => {
    e.preventDefault();
    if (!selected?.id || !novaMovimentacao.trim()) return;

    try {
      await apiClient.post(commMovUrl(selected.id), {
        descricao: novaMovimentacao,
        origem: "cliente",
      });

      setNovaMovimentacao("");
      await fetchMovimentacoes(selected.id);
    } catch (e) {
      alert("Não foi possível enviar a mensagem ao escritório.");
    }
  };

  const handleUploadDocumento = async () => {
    if (!selected?.id) return;
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const form = new FormData();
      form.append("documento", selectedFile);

      // TODO: troque o endpoint para o correto do seu backend (pré-atendimento)
      await apiClient.post(`/portal/atendimentos/${selected.id}/documentos`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSelectedFile(null);

      // Recarrega detalhes pra refletir anexos/documentos novos
      const res = await apiClient.get(`/portal/atendimentos/${selected.id}`);
      setSelected(res.data || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files?.[0] || null);
  };

  const handleFileUpload = async () => {
    if (!selected?.id) return;

    if (!selectedFile) {
      alert("Selecione um arquivo primeiro.");
      return;
    }

    setIsUploading(true);

    try {
      const fd = new FormData();
      fd.append("documento", selectedFile);

      await apiClient.post(commDocUrl(selected.id), fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Documento enviado com sucesso!");
      setSelectedFile(null);

      // Recarrega detalhes para atualizar lista de documentos (se o backend salvar no objeto)
      const res = await apiClient.get(`/portal/atendimentos/${selected.id}`);
      setSelected(res.data || null);
    } catch (e) {
      alert("Falha ao enviar documento.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreviewClick = (doc) => {
    if (doc?.tipo?.startsWith("image/")) {
      setPreviewFile(doc);
    } else if (doc?.url) {
      window.open(doc.url, "_blank");
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
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowInfo((v) => !v)}>
                  {showInfo ? "Ocultar informações" : "Exibir informações"}
                </Button>
              </div>
              {showInfo && (
                <>
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
                            `${selected.endereco?.numero || "—"}${selected.endereco?.complemento ? `, ${selected.endereco.complemento}` : ""
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
                </>
              )}
              {/* Comunicação (Movimentações / Documentos) */}
              <Card className="border-slate-200">
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <CardTitle className="text-base">Comunicação</CardTitle>

                  <div className="flex gap-2">
                    {["movimentacoes", "documentos"].map((tab) => (
                      <Button
                        key={tab}
                        type="button"
                        variant={activeTab === tab ? "default" : "outline"}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab === "movimentacoes" ? "Movimentações" : "Documentos"}
                      </Button>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* MOVIMENTAÇÕES */}
                  {activeTab === "movimentacoes" && (
                    <>
                      <form onSubmit={handleAddMovimentacao} className="space-y-2">
                        <textarea
                          className="textarea-base min-h-[90px] w-full"
                          placeholder="Envie uma informação para o escritório."
                          value={novaMovimentacao}
                          onChange={(e) => setNovaMovimentacao(e.target.value)}
                          required
                        />
                        <div className="flex justify-end">
                          <Button type="submit">Enviar</Button>
                        </div>
                      </form>

                      {movimentacoes.length === 0 ? (
                        <p className="text-sm text-slate-600">Nenhuma movimentação registrada.</p>
                      ) : (
                        <div className="space-y-3">
                          {movimentacoes.map((mov) => (
                            <div key={mov.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <div className="text-xs text-slate-500">
                                {formatDateTimeBR(toDateSafe(mov.data))}
                              </div>
                              <div className="text-sm text-slate-900 whitespace-pre-wrap">{mov.descricao}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* DOCUMENTOS */}
                  {activeTab === "documentos" && (
                    <>
                      <div className="rounded-lg border border-slate-200 p-3 space-y-3">
                        <div className="text-sm font-semibold text-slate-800">
                          Enviar documento ao escritório
                        </div>

                        <input
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            onClick={handleUploadDocumento}
                            disabled={!selectedFile || isUploading}
                          >
                            {isUploading ? "Enviando..." : "Enviar documento"}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-slate-800 mb-2">Arquivos</div>

                        {/* AQUI: ajuste o campo conforme seu backend retornar (ex: selected.anexos ou selected.documentos) */}
                        {(selected?.anexos || []).length === 0 ? (
                          <p className="text-sm text-slate-600">Nenhum documento anexado.</p>
                        ) : (
                          <ul className="space-y-2">
                            {(selected?.anexos || []).map((doc, idx) => (
                              <li key={doc.id || idx} className="text-sm">
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handlePreviewClick(doc);
                                  }}
                                  className="underline"
                                >
                                  {doc.nome || `Documento ${idx + 1}`}
                                </a>
                                <div className="text-xs text-slate-500">
                                  {formatDateTimeBR(toDateSafe(doc.createdAt || doc.enviadoEm))}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Preview (imagem) */}
              {previewFile && (
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.7)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999,
                    padding: 16,
                  }}
                  onClick={() => setPreviewFile(null)}
                >
                  <div
                    style={{
                      background: "white",
                      padding: 16,
                      borderRadius: 12,
                      maxWidth: "90vw",
                      maxHeight: "90vh",
                      overflow: "auto",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 style={{ marginBottom: 10 }}>{previewFile.nome}</h3>
                    <img
                      src={previewFile.url}
                      alt={previewFile.nome}
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                      <Button type="button" variant="outline" onClick={() => setPreviewFile(null)}>
                        Fechar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

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
