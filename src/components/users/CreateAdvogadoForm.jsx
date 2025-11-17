import React, { useState } from 'react';
import apiClient from '@/services/apiClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function CreateAdvogadoForm({ onUserCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const userData = { name, email, password };
      const response = await apiClient.post('/users/advogado', userData);
      alert('Advogado criado com sucesso!');
      onUserCreated(response.data);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao criar advogado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Cadastrar Novo Advogado</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="input-base" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email de Acesso</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha Provisória</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-base" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Salvando...' : 'Salvar Advogado'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default CreateAdvogadoForm;