import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

function ClientCaseDetailPage() {
  const { id: processoId } = useParams();
  const navigate = useNavigate();

  const [caseDetail, setCaseDetail] = useState(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novaMovimentacao, setNovaMovimentacao] = useState("");
  const [activeTab, setActiveTab] = useState("movimentacoes");
  const [previewFile, setPreviewFile] = useState(null);
  const [error, setError] = useState("");

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

  const fetchData = useCallback(async () => {
    try {
      const [processoRes, movRes] = await Promise.all([
        apiClient.get(`/processo/${processoId}`),
        apiClient.get(`/processo/${processoId}/movimentacoes`),
      ]);

      setCaseDetail(processoRes.data);
      setMovimentacoes(movRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar os dados do processo.");
    } finally {
      setLoading(false);
    }
  }, [processoId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMovimentacao = async (e) => {
    e.preventDefault();
    if (!novaMovimentacao.trim()) return;

    try {
      await apiClient.post(`/processo/${processoId}/movimentacoes`, {
        descricao: novaMovimentacao,
        origem: "cliente"
      });

      setNovaMovimentacao("");
      fetchData();
    } catch (err) {
      alert("Erro ao enviar informação ao advogado.");
    }
  };

  const handlePreviewClick = (doc) => {
    if (doc.tipo?.startsWith("image/")) {
      setPreviewFile(doc);
    } else {
      window.open(doc.url, "_blank");
    }
  };

  if (loading) return <p>Carregando processo...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!caseDetail) return <p>Processo não encontrado.</p>;

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <h1 style={{ marginTop: "20px" }}>{caseDetail.titulo}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <strong>Nº Processo:</strong> {caseDetail.numeroProcesso}
        </div>
        <div>
          <strong>Status:</strong> {caseDetail.status}
        </div>
        <div>
          <strong>Área:</strong> {caseDetail.area}
        </div>
        <div>
          <strong>Comarca:</strong> {caseDetail.comarca}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginTop: "30px" }}>
        {["movimentacoes", "documentos"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: activeTab === tab ? "#111827" : "white",
              color: activeTab === tab ? "white" : "#111827",
            }}
          >
            {tab === "movimentacoes" ? "Movimentações" : "Documentos"}
          </button>
        ))}
      </div>

      {/* MOVIMENTAÇÕES */}
      {activeTab === "movimentacoes" && (
        <>
          <hr style={{ margin: "30px 0" }} />

          <h3>Linha do tempo</h3>

          <form onSubmit={handleAddMovimentacao} style={{ marginBottom: "20px" }}>
            <textarea
              className="textarea-base"
              placeholder="Envie uma informação para o advogado responsável..."
              value={novaMovimentacao}
              onChange={(e) => setNovaMovimentacao(e.target.value)}
              required
            />
            <button type="submit">Enviar informação</button>
          </form>

          {movimentacoes.length === 0 && <p>Nenhuma movimentação registrada.</p>}

          {movimentacoes.map((mov) => (
            <div
              key={mov.id}
              style={{
                borderLeft: "3px solid #2563eb",
                padding: "10px 20px",
                marginBottom: "15px",
                background: "#f8fafc",
                borderRadius: "6px",
              }}
            >
              <strong>{formatDateTimeBR(toDateSafe(mov.data))}</strong>
              <p>{mov.descricao}</p>
            </div>
          ))}
        </>
      )}

      {/* DOCUMENTOS */}
      {activeTab === "documentos" && (
        <>
          <hr style={{ margin: "30px 0" }} />

          <h3>Documentos do processo</h3>

          {caseDetail.documentos?.length === 0 && (
            <p>Nenhum documento anexado.</p>
          )}

          <ul>
            {caseDetail.documentos?.map((doc, index) => (
              <li key={index} style={{ marginBottom: "10px" }}>
                <a href="#" onClick={(e) => { e.preventDefault(); handlePreviewClick(doc); }}>
                  {doc.nome}
                </a>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  {formatDateTimeBR(toDateSafe(doc.createdAt))}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* MODAL PREVIEW */}
      {previewFile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setPreviewFile(null)}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              maxWidth: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{previewFile.nome}</h3>
            <img
              src={previewFile.url}
              alt={previewFile.nome}
              style={{ maxWidth: "100%" }}
            />
            <button onClick={() => setPreviewFile(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientCaseDetailPage;
