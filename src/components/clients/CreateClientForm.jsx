import React, { useState } from 'react';
import apiClient from '@/services/apiClient';
//import CreateClientForm from '../components/clients/CreateClientForm'

function CreateClientForm({ onClientCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('PF');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validação simples de senha no frontend
    if (password.length < 6) {
      setError('A senha de acesso deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      // Objeto enviado para a API, sem o ID customizado
      const clientData = { name, email, phone, type, password }; 
      const response = await apiClient.post('/clients', clientData);
      
      alert('Cliente e acesso ao portal criados com sucesso!');
      onClientCreated(response.data); 
      
      // Limpa todos os campos do formulário após o sucesso
      setName('');
      setEmail('');
      setPhone('');
      setType('PF');
      setPassword('');
    } catch (err) {
      // Exibe a mensagem de erro vinda do backend (ex: e-mail duplicado)
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro desconhecido.';
      setError(`Falha ao criar cliente: ${errorMessage}`);
      console.error("Erro detalhado ao criar cliente:", err.response || err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', marginBottom: '20px' }}>
      <h3>Novo Cliente e Acesso ao Portal</h3>
      
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Nome completo / Razão Social" 
        required 
      />
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="E-mail (será o login do cliente)" 
        required 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Senha de acesso para o cliente" 
        required 
      />
      <input 
        type="tel" 
        value={phone} 
        onChange={(e) => setPhone(e.target.value)} 
        placeholder="Telefone (opcional)" 
      />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="PF">Pessoa Física</option>
        <option value="PJ">Pessoa Jurídica</option>
      </select>
      <button type="submit">Salvar Cliente e Criar Acesso</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default CreateClientForm;
