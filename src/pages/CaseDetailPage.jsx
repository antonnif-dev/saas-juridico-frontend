import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [caseDetail, setCaseDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState('Carregando...');
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', area: '' });

  // ESTADO E FUNÇÕES PARA UPLOAD DE ARQUIVOS (ESTAVAM FALTANDO)
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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
      const response = await apiClient.post(`/processo/${id}/documentos`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Documento enviado com sucesso!');
      setCaseDetail(prev => ({
        ...prev,
        documentos: [...(prev.documentos || []), response.data.document],
      }));
      setSelectedFile(null);
      // Limpa o input de arquivo (solução comum para React)
      document.getElementById('file-input').value = '';
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Falha ao enviar o documento.');
    } finally {
      setIsUploading(false);
    }
  };
  // FIM DO TRECHO QUE FALTAVA

  useEffect(() => {
    const fetchCaseAndClient = async () => {
      try {
        const caseResponse = await apiClient.get(`/processo/${id}`);
        setCaseDetail(caseResponse.data);
        setFormData({ titulo: caseResponse.data.titulo, area: caseResponse.data.area });

        if (caseResponse.data.clienteId) {
          const clientResponse = await apiClient.get(`/clients/${caseResponse.data.clienteId}`);
          setClientName(clientResponse.data.name);
        } else {
          setClientName('Nenhum cliente vinculado.');
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes:", error);
        alert('Processo não encontrado ou acesso negado.');
        navigate('/processos');
      } finally {
        setLoading(false);
      }
    };
    fetchCaseAndClient();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este processo?')) {
      try {
        await apiClient.delete(`/processo/${id}`);
        alert('Processo excluído com sucesso.');
        navigate('/processos');
      } catch (error) {
        alert('Não foi possível excluir o processo.');
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`/processo/${id}`, formData);
      // Atualiza o caseDetail com todos os dados, não apenas os do formulário
      setCaseDetail(prev => ({ ...prev, ...response.data }));
      setIsEditing(false);
      alert('Processo atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar processo:", error);
      alert('Não foi possível atualizar o processo.');
    }
  };

  if (loading) return <p>Carregando detalhes do processo...</p>;
  if (!caseDetail) return <p>Processo não encontrado.</p>;

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleUpdate}>
          {/* ... seu formulário de edição ... */}
        </form>
      ) : (
        <div>
          <h1>{caseDetail.titulo}</h1>
          <p><strong>Cliente:</strong> {clientName}</p>
          <p><strong>Número do Processo:</strong> {caseDetail.numeroProcesso}</p>
          <p><strong>Área:</strong> {caseDetail.area}</p>
          <p><strong>Status:</strong> {caseDetail.status}</p>
          <button onClick={() => setIsEditing(true)}>Editar Processo</button>
          <button onClick={handleDelete} style={{ background: 'red', color: 'white' }}>
            Excluir Processo
          </button>
        </div>
      )}
      <hr />
      <h3>Documentos</h3>
      <ul>
        {/* RENDERIZAÇÃO SEGURA DA LISTA DE DOCUMENTOS */}
        {caseDetail.documentos && caseDetail.documentos.length > 0 ? (
          caseDetail.documentos.map(doc => (
            <li key={doc.id}>
              <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.nome}</a>
            </li>
          ))
        ) : (
          <li>Nenhum documento anexado.</li>
        )}
      </ul>
      <div>
        <h4>Adicionar Novo Documento</h4>
        {/* Adicionado um id para podermos limpá-lo */}
        <input id="file-input" type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload} disabled={!selectedFile || isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar Documento'}
        </button>
      </div>
    </div>
  );
}

export default CaseDetailPage;