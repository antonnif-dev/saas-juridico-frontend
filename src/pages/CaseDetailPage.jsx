import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

function CaseDetailPage() {
  const { id: processoId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();

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

  const fetchData = useCallback(async () => {
    try {
      const [caseResponse, movimentacoesResponse] = await Promise.all([
        apiClient.get(`/processo/${processoId}`),
        apiClient.get(`/processo/${processoId}/movimentacoes`)
      ]);

      setCaseDetail(caseResponse.data);
      setMovimentacoes(movimentacoesResponse.data);

      setFormData(caseResponse.data);

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

  return (
    <div style={{ padding: '20px' }}>
      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <h3>Editando Processo</h3>
          <input name="titulo" value={formData.titulo} onChange={handleFormChange} className='input-base' placeholder="Título" />
          <input name="numeroProcesso" value={formData.numeroProcesso} onChange={handleFormChange} className='input-base' placeholder="Nº do Processo" />
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
          <button onClick={() => setIsEditing(true)}>Editar</button>
          <button onClick={handleDelete} style={{ marginLeft: '10px', background: 'darkred', color: 'white' }}>Excluir</button>
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

      <hr style={{ margin: '30px 0' }} />

      <div>
        <h3>Documentos</h3>
        <ul>
          {caseDetail.documentos && caseDetail.documentos.length > 0 ? (
            caseDetail.documentos.map((doc, index) => (
              <li key={doc.id || index}>
                <a href="#" onClick={(e) => { e.preventDefault(); handlePreviewClick(doc); }}>
                  {doc.nome}
                </a>
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
    </div>
  );
}

export default CaseDetailPage;