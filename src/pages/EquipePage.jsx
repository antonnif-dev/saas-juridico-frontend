import React, { useState } from 'react';
import CreateAdvogadoForm from '@/components/users/CreateAdvogadoForm';

function EquipePage() {
  const [users, setUsers] = useState([]);

  const handleUserCreated = (newUser) => {
    setUsers(currentUsers => [...currentUsers, newUser]);
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipe</h1>
        <p className="text-muted-foreground">Adicione e gerencie os advogados do seu escritório.</p>
      </div>
      
      <div>
        <CreateAdvogadoForm onUserCreated={handleUserCreated} />
      </div>

    </div>
  );
}

export default EquipePage;