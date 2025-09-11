import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

// Função auxiliar para formatar a data do Firestore para o input
const formatDateForInput = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return '';
  const date = new Date(timestamp.seconds * 1000);
  // Ajusta para o fuso horário local e formata para 'YYYY-MM-DDTHH:MM'
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().slice(0, 16);
};

function AgendaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [compromissoDetail, setCompromissoDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', dataHora: '', tipo: '' });

  useEffect(() => {
    const fetchCompromisso = async () => {
      try {
        const response = await apiClient.get(`/agenda/${id}`);
        setCompromissoDetail(response.data);
        // Preenche o formulário com os dados formatados
        setFormData({
          titulo: response.data.titulo,
          dataHora: formatDateForInput(response.data.dataHora),
          tipo: response.data.tipo,
        });
      } catch (error) {
        console.error("Erro ao buscar detalhes do compromisso:", error);
        navigate('/agenda');
      } finally {
        setLoading(false);
      }
    };
    fetchCompromisso();
  }, [id, navigate]);

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`/agenda/${id}`, formData);
      setCompromissoDetail(response.data);
      setIsEditing(false);
      alert('Compromisso atualizado com sucesso!');
    } catch (error) {
      alert('Não foi possível atualizar o compromisso.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este compromisso?')) {
      try {
        await apiClient.delete(`/agenda/${id}`);
        alert('Compromisso excluído com sucesso.');
        navigate('/agenda');
      } catch (error) {
        alert('Não foi possível excluir o compromisso.');
      }
    }
  };

  if (loading) return <p>Carregando compromisso...</p>;
  if (!compromissoDetail) return <p>Compromisso não encontrado.</p>;

  // Função para formatar a data para exibição
  const formatDisplayDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return 'Data inválida';
    return new Date(timestamp.seconds * 1000).toLocaleString('pt-BR');
  };

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <h3>Editando Compromisso</h3>
          <input type="text" name="titulo" value={formData.titulo} onChange={handleFormChange} />
          <input type="datetime-local" name="dataHora" value={formData.dataHora} onChange={handleFormChange} />
          <select name="tipo" value={formData.tipo} onChange={handleFormChange}>
            <option>Prazo</option> <option>Audiência</option> <option>Reunião</option> <option>Outro</option>
          </select>
          <button type="submit">Salvar</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancelar</button>
        </form>
      ) : (
        <div>
          <h1>{compromissoDetail.titulo}</h1>
          <p><strong>Tipo:</strong> {compromissoDetail.tipo}</p>
          <p><strong>Data e Hora:</strong> {formatDisplayDate(compromissoDetail.dataHora)}</p>
          {/* Adicionar aqui a exibição do processo vinculado, se desejar */}
          <button onClick={() => setIsEditing(true)}>Editar</button>
          <button onClick={handleDelete} style={{ background: 'red', color: 'white' }}>Excluir</button>
        </div>
      )}
    </div>
  );
}

export default AgendaDetailPage;