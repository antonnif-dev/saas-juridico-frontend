import React, { useState, useEffect } from 'react';
import CreateAdvogadoForm from '@/components/users/CreateAdvogadoForm';
import EditAdvogadoForm from "@/components/users/EditAdvogadoForm";
import apiClient from '@/services/apiClient';
import { Button } from "@/components/ui/button";

function EquipePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userToEdit, setUserToEdit] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/users/advogados');
      setUsers(response.data);
    } catch (err) {
      setError('Não foi possível carregar os usuários.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserCreated = (newUser) => {
    fetchUsers();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="lg:w-2/5">
        <div className=' flex flex-col justify-center'>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipe</h1>
          <p className="text-muted-foreground">Adicione e gerencie os advogados do seu escritório.</p>
        </div>
        <div className='flex justify-center'>
          <CreateAdvogadoForm onUserCreated={handleUserCreated} />
        </div>
      </div>

      <div className="lg:w-3/5">
        {userToEdit ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Editando: {userToEdit.name}</h2>
            <EditAdvogadoForm
              user={userToEdit} // Passa os dados do usuário para o formulário
              onEditComplete={() => { // Função para o form avisar que terminou
                setUserToEdit(null); // Volta para a lista
                fetchUsers(); // Atualiza os dados
              }}
              onCancel={() => setUserToEdit(null)}
            />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">Advogados Cadastrados</h2>
            {loading && <p>Carregando...</p>}
            {error && <p className="text-destructive">{error}</p>}
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.uid} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setUserToEdit(user)}>
                    Editar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EquipePage;