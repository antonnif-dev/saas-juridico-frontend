import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import CreateAdvogadoForm from '@/components/users/CreateAdvogadoForm';

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Mail, Shield, Edit, Plus, X, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function EquipePage() {
  const navigate = useNavigate(); // Hook de navegação
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados de controle
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/users/advogados');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      setError('Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (search) {
      const term = search.toLowerCase();
      setFilteredUsers(users.filter(u => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)));
    } else {
      setFilteredUsers(users);
    }
  }, [search, users]);

  const handleUserCreated = () => {
    setIsCreateModalOpen(false);
    fetchUsers();
  };

  // Função para navegar para a edição
  const handleEditClick = (user) => {
    // Passamos o objeto 'user' no state para não precisar buscar de novo na próxima página
    navigate(`/equipe/${user.uid}`, { state: { user } });
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Tem certeza que deseja remover este advogado da equipe? Esta ação não pode ser desfeita.")) {
      try {
        await apiClient.delete(`/users/advogados/${userId}`);
        alert("Advogado removido com sucesso.");
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir o usuário.");
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Equipe</h1>
          <p className="text-slate-500">Gerencie os advogados do escritório.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar advogado..."
              className="pl-8 bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto btn-primary">
                <Plus className="mr-2 h-4 w-4" /> Novo Advogado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cadastrar Advogado</DialogTitle></DialogHeader>
              <CreateAdvogadoForm onUserCreated={handleUserCreated} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? <p>Carregando...</p> : error ? <p className="text-red-500">{error}</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <Card key={user.uid} className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <CardTitle className="text-lg truncate" title={user.name}>{user.name}</CardTitle>
                  <Badge variant="outline" className="mt-1 text-xs">Advogado</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="h-4 w-4 text-primary shrink-0" /> Acesso Total
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t bg-slate-50/50 flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1 hover:bg-white border border-transparent hover:border-slate-200"
                  onClick={() => handleEditClick(user)}                >
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button
                  variant="destructive"
                  size="icon" // Deixa o botão quadrado apenas com o ícone
                  title="Excluir Advogado"
                  onClick={() => handleDeleteUser(user.uid)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
          {filteredUsers.length === 0 && (
            <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Nenhum membro encontrado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EquipePage;