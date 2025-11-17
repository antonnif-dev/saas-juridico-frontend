import React, { useState } from 'react';
import CreateAdvogadoForm from '@/components/users/CreateAdvogadoForm';
import EditAdvogadoForm from "@/components/users/EditAdvogadoForm";

function EquipePage() {
  const [users, setUsers] = useState([]);

  const handleUserCreated = (newUser) => {
    setUsers(currentUsers => [...currentUsers, newUser]);
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

        <div className="p-4 md:p-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 flex justify-center">Editar Perfil</h1>
          <EditAdvogadoForm />
        </div>
      </div>
    );
  }

  export default EquipePage;