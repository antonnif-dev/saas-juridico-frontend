import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import CreateClientForm from '../components/CreateClientForm'; // Importa o formulário

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await apiClient.get('/clients');
        setClients(response.data);
      } catch (err) {
        console.error("Erro ao buscar clientes:", err);
        setError("Não foi possível carregar os clientes.");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Função para adicionar o novo cliente à lista sem recarregar a página
  const handleClientCreated = (newClient) => {
    setClients(prevClients => [newClient, ...prevClients]);
  };

  return (
    <div>
      <h1>Clientes</h1>
      <CreateClientForm onClientCreated={handleClientCreated} />
      <hr />
      <h2>Lista de Clientes</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {clients.length > 0 ? (
            clients.map(client => (
              <li key={client.id}>
                <Link to={`/clientes/${client.id}`}>
                  {client.name} ({client.type}) - {client.email}
                </Link>
              </li>
            ))
          ) : (
            <p>Nenhum cliente encontrado.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default ClientsPage;