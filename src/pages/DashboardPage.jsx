import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient'; // Nosso conector da API
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca os clientes do backend quando o componente é montado
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await apiClient.get('/clients');
        setClients(response.data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        // Se o token for inválido (401/403), o interceptor do axios falhará
        // e podemos tratar o erro aqui, talvez deslogando o usuário.
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // O listener onAuthStateChanged no AuthContext vai detectar o logout
      // e o PrivateRoute vai automaticamente redirecionar para /login.
      // Poderíamos também forçar com navigate('/login'), mas o fluxo reativo é mais elegante.
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {currentUser && <p>Bem-vindo, {currentUser.email}!</p>}
      <button onClick={handleLogout}>Sair</button>
      
      <hr />

      <h2>Seus Clientes</h2>
      {loading ? (
        <p>Carregando clientes...</p>
      ) : (
        <ul>
          {clients.length > 0 ? (
            clients.map(client => <li key={client.id}>{client.name} - {client.email}</li>)
          ) : (
            <p>Nenhum cliente cadastrado ainda.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default DashboardPage;