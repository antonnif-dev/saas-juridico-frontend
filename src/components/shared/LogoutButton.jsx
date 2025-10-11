import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';      // Usando o novo alias '@/'
import { Button } from '@/components/ui/button'; // Importando o novo botão do Shadcn

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Agora usamos o componente Button do Shadcn.
  // A prop 'variant="destructive"' aplica um estilo de "perigo" (vermelho).
  return (
    <Button variant="destructive" onClick={handleLogout}>
      Sair
    </Button>
  );
}

export default LogoutButton;