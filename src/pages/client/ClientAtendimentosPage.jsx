import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../../services/apiClient"; // o seu já existe

export default function ClientAtendimentosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get("/portal/meus-atendimentos");
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError("Não foi possível carregar seus atendimentos.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const statusLabel = useMemo(() => (s) => {
    if (!s) return "Em análise";
    return String(s);
  }, []);

  const openModal = async (id) => {
    setOpen(true);
    setDetailsLoading(true);
    setDetailsError("");
    setSelected(null);

    try {
      const res = await apiClient.get(`/portal/atendimentos/${id}`);
      setSelected(res.data);
    } catch (err) {
      setDetailsError("Não foi possível carregar os detalhes do atendimento.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
    setDetailsError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Atendimentos</h1>
          <p className="text-slate-600">
            Aqui você acompanha os pré-atendimentos enviados e as observações registradas pelo escritório.
          </p>
        </div>
      </div>

      {loading && <div className="text-slate-600">Carregando atendimentos...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-700">
          Você ainda não possui atendimentos cadastrados.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
            <div className="col-span-5">Título</div>
            <div className="col-span-3">Categoria</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>

          {items.map((it) => (
            <div key={it.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-100 items-center">
              <div className="col-span-5">
                <div className="font-semibold text-slate-900">{it.titulo || it.assunto || "Pré-atendimento"}</div>
                <div className="text-xs text-slate-500">
                  {it.numeroProtocolo ? `Protocolo: ${it.numeroProtocolo}` : ""}
                </div>
              </div>

              <div className="col-span-3 text-slate-700 text-sm">
                {it.categoria || it.area || "-"}
              </div>

              <div className="col-span-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-slate-100 text-slate-700">
                  {statusLabel(it.status)}
                </span>
              </div>

              <div className="col-span-2 text-right">
                <button
                  className="px-3 py-2 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => openModal(it.id)}
                >
                  Ver detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <div className="text-xs text-slate-500">Detalhes do atendimento</div>
                <div className="text-lg font-bold text-slate-900">
                  {selected?.titulo || selected?.assunto || "Pré-atendimento"}
                </div>
              </div>

              <button
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                onClick={closeModal}
              >
                Fechar
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-auto">
              {detailsLoading && <div className="text-slate-600">Carregando detalhes...</div>}
              {detailsError && <div className="text-red-600">{detailsError}</div>}

              {!detailsLoading && !detailsError && selected && (
                <div className="space-y-6">
                  {/* Bloco “estilo CaseDetailPage” */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <div className="text-xs text-slate-500">Categoria</div>
                      <div className="font-semibold text-slate-900">{selected.categoria || selected.area || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Status</div>
                      <div className="font-semibold text-slate-900">{statusLabel(selected.status)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Protocolo</div>
                      <div className="font-semibold text-slate-900">{selected.numeroProtocolo || "-"}</div>
                    </div>
                  </div>

                  {/* Dados do cliente / triagem enviada */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <h3 className="font-bold text-slate-900 mb-3">Informações enviadas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Nome" value={selected.nome || selected.clienteNome || "-"} />
                      <Field label="WhatsApp" value={selected.whatsapp || selected.telefone || "-"} />
                      <Field label="E-mail" value={selected.email || "-"} />
                      <Field label="Resumo" value={selected.resumo || selected.descricao || "-"} multiline />
                    </div>
                  </div>

                  {/* Observações do escritório (admin/advogado) */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <h3 className="font-bold text-slate-900 mb-3">Observações do escritório</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        label="Parecer inicial"
                        value={selected.parecerInicial || selected.observacoes || "-"}
                        multiline
                      />
                      <Field
                        label="Próximos passos"
                        value={selected.proximosPassos || selected.orientacoes || "-"}
                        multiline
                      />
                    </div>
                  </div>

                  {/* Se seu preatendimento tiver campos extras: triagem */}
                  {selected.triagem && (
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <h3 className="font-bold text-slate-900 mb-3">Triagem</h3>
                      <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-auto">
                        {JSON.stringify(selected.triagem, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, multiline }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-sm text-slate-900 ${multiline ? "whitespace-pre-wrap" : ""}`}>
        {value}
      </div>
    </div>
  );
}
