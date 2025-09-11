import React, { useState } from 'react';
import apiClient from '../services/apiClient';

function CreateClientForm({ onClientCreated }) {
  // Estados para cada campo do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('PF'); // PF = Pessoa Física, PJ = Pessoa Jurídica
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const clientData = { name, email, phone, type };
      const response = await apiClient.post('/clients', clientData);
      
      alert('Cliente criado com sucesso!');
      onClientCreated(response.data); // Atualiza a lista na página pai
      
      // Limpa os campos do formulário
      setName('');
      setEmail('');
      setPhone('');
      setType('PF');
    } catch (err) {
      console.error("Erro detalhado ao criar cliente:", err.response || err);
      const errorMessage = err.response?.data?.[0]?.message || err.response?.data?.message || 'Ocorreu um erro desconhecido.';
      setError(`Falha ao criar cliente: ${errorMessage}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', marginBottom: '20px' }}>
      <h3>Novo Cliente</h3>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo / Razão Social" required />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail principal" required />
      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefone (opcional)" />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="PF">Pessoa Física</option>
        <option value="PJ">Pessoa Jurídica</option>
      </select>
      <button type="submit">Salvar Cliente</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default CreateClientForm;