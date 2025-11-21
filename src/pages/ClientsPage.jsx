import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { Link } from 'react-router-dom';

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, User, Phone, MapPin, FileText, Plus } from 'lucide-react';
import CreateClientForm from '@/components/clients/CreateClientForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/clients');
      setClients(response.data);
      setFilteredClients(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Lógica de Filtragem
  useEffect(() => {
    let result = clients;
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(c => 
        c.name?.toLowerCase().includes(term) || 
        c.email?.toLowerCase().includes(term) ||
        c.cpfCnpj?.includes(term)
      );
    }
    setFilteredClients(result);
  }, [search, clients]);

  const handleClientCreated = () => {
    setIsCreateModalOpen(false);
    fetchClients();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* --- CABEÇALHO + FILTROS (AGORA JUNTOS E NO TOPO) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500">Gerencie sua base de clientes.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Barra de Busca (Sempre visível) */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar nome, CPF, email..." 
                className="pl-8 bg-white" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Botão Novo Cliente */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto btn-primary">
                  <Plus className="mr-2 h-4 w-4" /> Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Cadastrar Cliente</DialogTitle></DialogHeader>
                <CreateClientForm onClientCreated={handleClientCreated} />
              </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* --- ÁREA DE CONTEÚDO (CARDS ABAIXO) --- */}
      {loading ? <p>Carregando...</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <Card key={client.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden">
                    <CardTitle className="text-lg truncate" title={client.name}>{client.name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{client.cpfCnpj}</p>
                  </div>
                  <Badge variant={client.status === 'ativo' ? 'default' : 'secondary'} className="shrink-0 ml-2">
                    {client.status || 'Ativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm pt-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="h-4 w-4 text-primary shrink-0" /> 
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4 text-primary shrink-0" /> {client.phone}
                </div>
                {client.address?.city && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-primary shrink-0" /> {client.address.city}/{client.address.state}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 border-t bg-slate-50/50">
                <Link to={`/clientes/${client.id}`} className="w-full">
                  <Button variant="ghost" className="w-full justify-between hover:bg-white">
                    Ver Detalhes <FileText className="w-4 h-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          {filteredClients.length === 0 && (
             <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ClientsPage;