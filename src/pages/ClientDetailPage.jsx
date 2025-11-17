import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [clientDetail, setClientDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', type: 'PF' });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await apiClient.get(`/clients/${id}`);
        setClientDetail(response.data);
        setFormData(response.data); // Preenche o formulário com os dados
      } catch (error) {
        console.error("Erro ao buscar detalhes do cliente:", error);
        navigate('/clientes');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await apiClient.delete(`/clients/${id}`);
        alert('Cliente excluído com sucesso.');
        navigate('/clientes');
      } catch (error) {
        alert('Não foi possível excluir o cliente.');
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
      const response = await apiClient.put(`/clients/${id}`, formData);
      setClientDetail(response.data);
      setIsEditing(false);
      alert('Cliente atualizado com sucesso!');
    } catch (error) {
      alert('Não foi possível atualizar o cliente.');
    }
  };

  if (loading) return <p>Carregando detalhes do cliente...</p>;
  if (!clientDetail) return <p>Cliente não encontrado.</p>;

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <h3>Editando Cliente</h3>
          <input type="text" name="name" value={formData.name} onChange={handleFormChange} className='input-base' placeholder="Nome" />
          <input type="email" name="email" value={formData.email} onChange={handleFormChange} className='input-base' placeholder="Email" />
          <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} className='input-base' placeholder="Telefone" />
          <select name="type" value={formData.type} onChange={handleFormChange} className='select-base'>
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </select>
          <button type="submit">Salvar Alterações</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancelar</button>
        </form>
      ) : (
        <div>
          <h1>{clientDetail.name}</h1>
          <p><strong>Email:</strong> {clientDetail.email}</p>
          <p><strong>Telefone:</strong> {clientDetail.phone}</p>
          <p><strong>Tipo:</strong> {clientDetail.type}</p>
          <button onClick={() => setIsEditing(true)}>Editar Cliente</button>
          <button onClick={handleDelete} style={{ background: 'red', color: 'white' }}>
            Excluir Cliente
          </button>
        </div>
      )}
    </div>
  );
}

export default ClientDetailPage;