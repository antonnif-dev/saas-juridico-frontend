import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

function CaseDetailPage() {
  const { id: processoId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAdmin, userRole } = useAuth();

  const [caseDetail, setCaseDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState('Carregando...');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [advogados, setAdvogados] = useState([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [activeTab, setActiveTab] = useState("movimentacoes"); // "movimentacoes" | "documentos" | "financeiro"
  const [loadingFinanceiro, setLoadingFinanceiro] = useState(false);

  const formatBRL = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return "N/D";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const fetchFinanceiro = useCallback(async () => {
    setLoadingFinanceiro(true);
    try {
      const res = await apiClient.get(`/financial/transactions/process/${processoId}`);
      setTransacoes(res.data || []);
    } catch (e) {
      console.error("Erro ao buscar financeiro:", e);
      setTransacoes([]);
    } finally {
      setLoadingFinanceiro(false);
    }
  }, [processoId]);

  useEffect(() => {
    if (activeTab === "financeiro") {
      fetchFinanceiro();
    }
  }, [activeTab, fetchFinanceiro]);

  useEffect(() => {
    if (isAdmin) {
      apiClient.get('/users/advogados') // Alinhado com a sua rota de listagem no backend
        .then(res => setAdvogados(res.data))
        .catch(err => console.error("Erro ao carregar advogados:", err));
    }
  }, [isAdmin, userRole]);

  const [movimentacoes, setMovimentacoes] = useState([]);
  const [novaMovimentacao, setNovaMovimentacao] = useState('');

  const [editingMovId, setEditingMovId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [transacoes, setTransacoes] = useState([]);

  const honorarios = transacoes.filter(t => t.categoria === "honorarios");
  const custas = transacoes.filter(t => t.categoria === "custas");
  const pagamentos = transacoes.filter(t => t.categoria === "pagamento");

  const toDateSafe = (value) => {
    // Firestore Timestamp (Admin) costuma vir como { _seconds: number }
    if (value && typeof value === "object" && typeof value._seconds === "number") {
      return new Date(value._seconds * 1000);
    }
    // Timestamp (client) às vezes vem como { seconds: number }
    if (value && typeof value === "object" && typeof value.seconds === "number") {
      return new Date(value.seconds * 1000);
    }
    // ISO string ou Date
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDateTimeBR = (d) => {
    if (!d) return "N/D";
    return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
  };

  const fetchData = useCallback(async () => {
    try {
      const [caseResponse, movimentacoesResponse, mensagensResponse] = await Promise.all([
        apiClient.get(`/processo/${processoId}`),
        apiClient.get(`/processo/${processoId}/movimentacoes`),

        apiClient.get(`/messages/processo/${processoId}`).catch(() => ({ data: [] })),
      ]);

      setCaseDetail(caseResponse.data);
      setMovimentacoes(movimentacoesResponse.data);
      setMensagens(mensagensResponse?.data || []);

      if (caseResponse.data.clientId) {
        const clientResponse = await apiClient.get(`/clients/${caseResponse.data.clientId}`);
        setClientName(clientResponse.data.name);
      } else {
        setClientName('Nenhum cliente vinculado.');
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do processo:", error);
      alert('Processo não encontrado ou acesso negado.');
      navigate('/processos');
    } finally {
      setLoading(false);
    }
  }, [processoId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMovimentacao = async (e) => {
    e.preventDefault();
    if (!novaMovimentacao.trim()) return;

    try {
      await apiClient.post(`/processo/${processoId}/movimentacoes`, {
        descricao: novaMovimentacao
      });
      setNovaMovimentacao('');
      fetchData();
    } catch (err) {
      console.error("Erro ao adicionar movimentação:", err);
      alert('Falha ao registrar movimentação.');
    }
  };

  const handleEditClick = (mov) => {
    setEditingMovId(mov.id);
    setEditingText(mov.descricao);
  };

  const handleCancelEdit = () => {
    setEditingMovId(null);
    setEditingText('');
  };

  const handleUpdateMovimentacao = async (movimentacaoId) => {
    try {
      await apiClient.put(`/processo/${processoId}/movimentacoes/${movimentacaoId}`, {
        descricao: editingText
      });
      setEditingMovId(null);
      setEditingText('');
      fetchData();
    } catch (err) {
      alert('Falha ao atualizar a movimentação.');
    }
  };

  const handleDeleteMovimentacao = async (movimentacaoId) => {
    if (window.confirm('Tem certeza que deseja excluir esta movimentação?')) {
      try {
        await apiClient.delete(`/processo/${processoId}/movimentacoes/${movimentacaoId}`);
        fetchData();
      } catch (err) {
        alert('Falha ao excluir a movimentação.');
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza?')) {
      try {
        await apiClient.delete(`/processo/${processoId}`);
        alert('Processo excluído.');
        navigate('/processos');
      } catch (error) {
        alert('Não foi possível excluir.');
      }
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo primeiro.');
      return;
    }
    setIsUploading(true);

    const uploadFormData = new FormData();
    uploadFormData.append('documento', selectedFile);

    try {
      await apiClient.post(`/processo/${processoId}/documentos`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Documento enviado com sucesso!');
      fetchData();
      setSelectedFile(null);
      document.getElementById('file-input').value = '';
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Falha ao enviar o documento.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/processo/${processoId}`, formData);
      setIsEditing(false);
      fetchData();
      alert('Processo atualizado!');
    } catch (error) {
      alert('Não foi possível atualizar.');
    }
  };

  const handleTransferCase = async (novoResponsavelUid) => {
    if (!window.confirm('Deseja transferir a responsabilidade deste processo?')) return;

    setIsTransferring(true);
    try {
      await apiClient.put(`/processo/${processoId}`, {
        responsavelUid: novoResponsavelUid
      });
      alert('Responsabilidade transferida com sucesso!');
      fetchData(); // Recarrega para atualizar o UID do responsável localmente
    } catch (error) {
      alert('Erro ao transferir processo.');
    } finally {
      setIsTransferring(false);
    }
  };

  const handlePreviewClick = (doc) => {
    if (doc.tipo && doc.tipo.startsWith('image/')) {
      setPreviewFile(doc);
    } else if (doc.tipo === 'application/pdf') {
      window.open(doc.url, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = doc.url;
      link.setAttribute('download', doc.nome);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) return <p>Carregando detalhes do processo...</p>;
  if (!caseDetail) return <p>Processo não encontrado.</p>;

  const podeEditar = isAdmin || caseDetail?.responsavelUid === currentUser?.uid;

  const eventosHistorico = [
    // Criação do processo (se existir createdAt no caseDetail)
    {
      tipo: "processo",
      titulo: "Processo criado",
      data: toDateSafe(caseDetail?.createdAt || caseDetail?.dataCriacao),
      detalhes: {
        criadoPor: caseDetail?.criadoPorNome || caseDetail?.criadoPorEmail || caseDetail?.criadoPorUid || "N/D",
        responsavelUid: caseDetail?.responsavelUid || "N/D",
        status: caseDetail?.status || "N/D",
      },
    },


    ...(movimentacoes || []).map((m) => ({
      tipo: "movimentacao",
      titulo: "Movimentação",
      data: toDateSafe(m?.data),
      detalhes: { descricao: m?.descricao || "" },
    })),
  ]
    .filter((e) => e.data || e.tipo) // mantém, mas você pode filtrar só os com data se quiser
    .sort((a, b) => {
      const da = a.data ? a.data.getTime() : 0;
      const db = b.data ? b.data.getTime() : 0;
      return db - da; // mais recente primeiro
    });

  return (
    <div style={{ padding: '20px' }}>
      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <h3>Editando Processo</h3>
          <input
            name="titulo"
            value={formData.titulo}
            onChange={handleFormChange}
            className="input-base"
            placeholder="Título"
          />
          <input
            name="numeroProcesso"
            value={formData.numeroProcesso}
            onChange={handleFormChange}
            className="input-base"
            placeholder="Nº do Processo"
          />

          {/* ✅ CAMPOS DO PRÉ-ATENDIMENTO (SEM DADOS PESSOAIS) */}
          <input
            name="categoria"
            value={formData.categoria || ''}
            onChange={handleFormChange}
            className="input-base"
            placeholder="Categoria / Área (Pré-atendimento)"
          />

          <textarea
            name="resumoProblema"
            value={formData.resumoProblema || ''}
            onChange={handleFormChange}
            className="textarea-base min-h-[120px] min-w-full"
            placeholder="Resumo do problema (Pré-atendimento)"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="dataProblema"
              type="date"
              value={formData.dataProblema || ''}
              onChange={handleFormChange}
              className="input-base"
              title="Data aproximada do ocorrido"
            />

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                name="problemaContinuo"
                type="checkbox"
                checked={!!formData.problemaContinuo}
                onChange={handleFormChange}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm">O problema ainda está ocorrendo?</span>
            </label>
          </div>

          <input
            name="parteContrariaNome"
            value={formData.parteContrariaNome || ''}
            onChange={handleFormChange}
            className="input-base"
            placeholder="Parte Contrária (nome)"
          />

          <input
            name="tipoRelacao"
            value={formData.tipoRelacao || ''}
            onChange={handleFormChange}
            className="input-base"
            placeholder="Tipo de relação (ex: vizinho, patrão, loja)"
          />

          <input
            name="objetivo"
            value={formData.objetivo || ''}
            onChange={handleFormChange}
            className="input-base"
            placeholder="Objetivo do cliente"
          />

          <select
            name="urgencia"
            value={formData.urgencia || 'Média'}
            onChange={handleFormChange}
            className="select-base"
          >
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
          </select>

          <textarea
            name="informacaoExtra"
            value={formData.informacaoExtra || ''}
            onChange={handleFormChange}
            className="textarea-base min-h-[100px] min-w-full"
            placeholder="Informações extras"
          />

          <button type="submit">Salvar Alterações</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancelar</button>
        </form>
      ) : (
        <div>
          {/* Detalhes do Processo */}
          <h1>{caseDetail.titulo}</h1>
          <p><strong>Cliente:</strong> {clientName}</p>
          <p><strong>Número do Processo:</strong> {caseDetail.numeroProcesso}</p>
          <p><strong>Área:</strong> {caseDetail.area}</p>
          <p><strong>Status:</strong> {caseDetail.status}</p>
          <p><strong>Comarca:</strong> {caseDetail.comarca}</p>
          <p><strong>Instância:</strong> {caseDetail.instancia}</p>

          {/* ✅ DETALHES COMPLETOS (SEM DADOS PESSOAIS) */}
          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 8 }}>Informações do Caso</h3>
            <p><strong>Categoria:</strong> {caseDetail.categoria || '-'}</p>
            <p><strong>Objetivo:</strong> {caseDetail.objetivo || '-'}</p>
            <p><strong>Urgência:</strong> {caseDetail.urgencia || '-'}</p>
          </div>

          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 8 }}>Histórico do problema</h3>
            <p><strong>Resumo do Problema:</strong> {caseDetail.resumoProblema || '-'}</p>
            <p><strong>Data aproximada do ocorrido:</strong> {caseDetail.dataProblema || '-'}</p>
            <p><strong>Problema contínuo:</strong> {caseDetail.problemaContinuo ? 'Sim' : 'Não'}</p>
          </div>

          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 8 }}>Parte contrária e relação</h3>
            <p><strong>Parte Contrária:</strong> {caseDetail.parteContrariaNome || '-'}</p>
            <p><strong>Tipo de Relação:</strong> {caseDetail.tipoRelacao || '-'}</p>
          </div>

          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 8 }}>Documentos informados</h3>
            {Array.isArray(caseDetail.documentos) && caseDetail.documentos.length > 0 ? (
              <ul style={{ marginLeft: 18 }}>
                {caseDetail.documentos.map((doc, idx) => (
                  <li key={`${doc}-${idx}`}>{doc}</li>
                ))}
              </ul>
            ) : (
              <p>-</p>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 8 }}>Triagem específica</h3>
            {caseDetail.triagem && typeof caseDetail.triagem === 'object' && Object.keys(caseDetail.triagem).length > 0 ? (
              <ul style={{ marginLeft: 18 }}>
                {Object.entries(caseDetail.triagem).map(([k, v]) => (
                  <li key={k}>
                    <strong>{k}:</strong> {String(v ?? '-')}
                  </li>
                ))}
              </ul>
            ) : (
              <p>-</p>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 8 }}>Informações extras</h3>
            <p>{caseDetail.informacaoExtra || '-'}</p>
          </div>

          {podeEditar && (
            <>
              <button onClick={() => setIsEditing(true)}>Editar</button>
              <button onClick={handleDelete} style={{ marginLeft: '10px', background: 'darkred', color: 'white' }}>
                Excluir
              </button>
            </>
          )}

          {isAdmin && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#eef2f7',
              borderRadius: '8px',
              border: '1px solid #d1d9e6'
            }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Gestão de Responsabilidade (Admin)</h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  value={formData.responsavelUid || ''}
                  onChange={(e) => handleTransferCase(e.target.value)}
                  disabled={isTransferring}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
                >
                  <option value="">Selecione um responsável...</option>
                  {advogados.map(adv => (
                    <option key={adv.uid} value={adv.uid}>
                      {adv.name} (OAB: {adv.oab || 'N/A'})
                    </option>
                  ))}
                </select>
                {isTransferring && <span style={{ fontSize: '0.8em' }}>Processando...</span>}
              </div>
              <p style={{ fontSize: '0.75em', color: '#666', marginTop: '5px' }}>
                * Ao transferir, o advogado anterior perderá permissão de edição.
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: 'center', gap: "8px", marginTop: "20px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("movimentacoes")}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: activeTab === "movimentacoes" ? "#111827" : "white",
            color: activeTab === "movimentacoes" ? "white" : "#111827",
          }}
        >
          Movimentações
        </button>

        <button
          onClick={() => setActiveTab("documentos")}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: activeTab === "documentos" ? "#111827" : "white",
            color: activeTab === "documentos" ? "white" : "#111827",
          }}
        >
          Documentos
        </button>

        <button
          onClick={() => setActiveTab("financeiro")}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: activeTab === "financeiro" ? "#111827" : "white",
            color: activeTab === "financeiro" ? "white" : "#111827",
          }}
        >
          Financeiro
        </button>
      </div>
      {activeTab === "movimentacoes" && (
        <>
          <hr style={{ margin: '30px 0' }} />
          <div className='w-full'>
            <h3>Linha do Tempo / Movimentações</h3>
            {podeEditar ? (
              <form onSubmit={handleAddMovimentacao} style={{ marginBottom: '20px' }}>
                <textarea
                  value={novaMovimentacao}
                  onChange={(e) => setNovaMovimentacao(e.target.value)}
                  placeholder="Registre uma nova movimentação..."
                  style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }}
                  className='textarea-base'
                  required
                />
                <button type="submit">Registrar Movimentação</button>
              </form>
            ) : (
              <p className="text-slate-500 italic">Apenas o advogado responsável pode registrar movimentações.</p>
            )}

            {movimentacoes.length > 0 ? (
              movimentacoes.map(mov => (
                <div key={mov.id} style={{ borderLeft: '3px solid #007bff', padding: '10px 20px', marginBottom: '15px', backgroundColor: '#f8f9fa' }}>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>{new Date(mov.data._seconds * 1000).toLocaleString('pt-BR')}</p>

                  {editingMovId === mov.id ? (
                    <div>
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        style={{ width: '100%', minHeight: '60px', marginTop: '5px' }}
                        className='textarea-base'
                      />
                      <button onClick={() => handleUpdateMovimentacao(mov.id)} style={{ marginTop: '5px' }}>Salvar</button>
                      <button onClick={handleCancelEdit} style={{ marginLeft: '5px', marginTop: '5px' }}>Cancelar</button>
                    </div>
                  ) : (
                    <div>
                      <p style={{ margin: 0 }}>{mov.descricao}</p>
                      {podeEditar && (
                        <div style={{ marginTop: '10px' }}>
                          <button onClick={() => handleEditClick(mov)} style={{ fontSize: '0.8em', padding: '2px 5px' }}>Editar</button>
                          <button onClick={() => handleDeleteMovimentacao(mov.id)} style={{ marginLeft: '5px', fontSize: '0.8em', padding: '2px 5px' }}>Excluir</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>Nenhuma movimentação registrada.</p>
            )}
          </div>
        </>
      )}

      {activeTab === "documentos" && (
        <>
          <hr style={{ margin: '30px 0' }} />
          <div>
            <h3>Documentos</h3>
            <ul>
              {caseDetail.documentos && caseDetail.documentos.length > 0 ? (
                caseDetail.documentos.map((doc, index) => (
                  <li key={doc.id || index} style={{ marginBottom: "8px" }}>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handlePreviewClick(doc); }}
                      style={{ display: "inline-block" }}
                    >
                      {doc.nome}
                    </a>

                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                      {formatDateTimeBR(
                        toDateSafe(
                          doc?.createdAt || doc?.uploadedAt || doc?.data || doc?.timestamp
                        )
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li>Nenhum documento anexado.</li>
              )}
            </ul>
            <div>
              <h4>Adicionar Novo Documento</h4>
              {podeEditar ? (
                <>
                  <input id="file-input" type="file" onChange={handleFileChange} className='input-base' />
                  <button onClick={handleFileUpload} disabled={!selectedFile || isUploading}>
                    {isUploading ? 'Enviando...' : 'Enviar Documento'}
                  </button>
                </>
              ) : (
                <p className="text-xs text-slate-400">Upload restrito ao responsável pelo caso.</p>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "financeiro" && (
        <>
          <hr style={{ margin: "30px 0" }} />

          <div>
            <h3>Financeiro do Processo</h3>

            {loadingFinanceiro && <p>Carregando financeiro...</p>}

            {!loadingFinanceiro && (
              <div style={{ display: "grid", gap: "12px" }}>
                {/* Valor acordado vem do processo */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px" }}>
                  <h4 style={{ marginTop: 0 }}>Valor acordado</h4>
                  <p style={{ fontSize: "18px", margin: 0 }}>
                    <strong>{formatBRL(caseDetail?.valorAcordado)}</strong>
                  </p>
                </div>

                {/* Honorários */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px" }}>
                  <h4 style={{ marginTop: 0 }}>Honorários</h4>
                  {honorarios.length === 0 ? (
                    <p>Nenhum honorário registrado.</p>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                      {honorarios.map((h, idx) => (
                        <li key={h.id || idx} style={{ marginBottom: "10px" }}>
                          <div>
                            <strong>{formatBRL(h.valor ?? h.amount)}</strong>
                            {" — "}
                            {h.titulo || h.descricao || "Sem descrição"}
                            {h.status ? ` (${h.status})` : ""}
                          </div>

                          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                            {formatDateTimeBR(toDateSafe(h?.createdAt || h?.data || h?.timestamp))}
                          </div>
                        </li>

                      ))}
                    </ul>
                  )}
                </div>

                {/* Custas / Despesas */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px" }}>
                  <h4 style={{ marginTop: 0 }}>Custos / Despesas</h4>
                  {custas.length === 0 ? (
                    <p>Nenhuma despesa registrada.</p>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                      {custas.map((d, idx) => (
                        <li key={d.id || idx} style={{ marginBottom: "6px" }}>
                          <strong>{formatBRL(d.valor ?? d.amount)}</strong>
                          {" — "}
                          {d.titulo || d.descricao || "Sem descrição"}
                          {d.status ? ` (${d.status})` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Pagamentos */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px" }}>
                  <h4 style={{ marginTop: 0 }}>Pagamentos</h4>
                  {pagamentos.length === 0 ? (
                    <p>Nenhum pagamento registrado.</p>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                      {pagamentos.map((p, idx) => (
                        <li key={d.id || idx} style={{ marginBottom: "10px" }}>
                          <div>
                            <strong>{formatBRL(d.valor ?? d.amount)}</strong>
                            {" — "}
                            {d.titulo || d.descricao || "Sem descrição"}
                            {d.status ? ` (${d.status})` : ""}
                          </div>

                          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                            {formatDateTimeBR(toDateSafe(d?.createdAt || d?.data || d?.timestamp))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {previewFile && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => setPreviewFile(null)} // Fecha o modal ao clicar no fundo
        >
          <div
            // Este div é o conteúdo branco do modal
            style={{
              background: 'white', padding: '20px', borderRadius: '8px',
              maxWidth: '90vw', maxHeight: '90vh'
            }}
            onClick={(e) => e.stopPropagation()} // Impede que o modal feche ao clicar nele
          >
            <h3>{previewFile.nome}</h3>
            <img
              src={previewFile.url}
              alt={`Pré-visualização de ${previewFile.nome}`}
              style={{ maxWidth: '100%', maxHeight: '80vh' }}
            />
            <br />
            <button onClick={() => setPreviewFile(null)} style={{ marginTop: '10px' }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      <hr style={{ margin: "30px 0" }} />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => setShowHistoricoModal(true)}
          style={{ background: "#111827", color: "white", padding: "10px 14px", borderRadius: "8px" }}
        >
          Ver histórico completo do processo
        </button>
      </div>

      {showHistoricoModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowHistoricoModal(false)}
        >
          <div
            style={{
              background: "white",
              width: "min(960px, 100%)",
              maxHeight: "85vh",
              borderRadius: "12px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
              <h2 style={{ margin: 0 }}>Histórico completo do processo</h2>
              <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: "14px" }}>
                {caseDetail?.titulo} • Nº {caseDetail?.numeroProcesso || "N/D"}
              </p>
            </div>

            <div style={{ padding: "16px", overflowY: "auto" }}>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <strong>Processo criado</strong>
                  <span style={{ color: "#6b7280", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {formatDateTimeBR(toDateSafe(caseDetail?.createdAt || caseDetail?.dataCriacao))}
                  </span>
                </div>
                {/* Dados do modal de histórido do processo */}
                <div style={{ marginTop: "8px", fontSize: "14px" }}>
                  <div>
                    <strong>Criado por:</strong>{" "}
                    {caseDetail?.criadoPorNome || caseDetail?.criadoPorEmail || caseDetail?.criadoPorUid || "N/D"}
                  </div>
                  <div><strong>Responsável (UID):</strong> {caseDetail?.responsavelUid || "N/D"}</div>
                  <div><strong>Status:</strong> {caseDetail?.status || "N/D"}</div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button onClick={() => setShowHistoricoModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaseDetailPage;