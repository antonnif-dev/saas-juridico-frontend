import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import CreateClientForm from '../components/clients/CreateClientForm';

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

  const handleClientCreated = (newClient) => {
    setClients(prevClients => [newClient, ...prevClients]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="lg:w-2/5">
        <h1>Clientes</h1>
        <CreateClientForm onClientCreated={handleClientCreated} />
        <hr />
      </div>
      <div className="lg:w-3/5">
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
    </div>
  );
}

export default ClientsPage;