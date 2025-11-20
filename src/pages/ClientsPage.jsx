import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { Link } from 'react-router-dom';

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, User, Phone, MapPin, FileText, X } from 'lucide-react';
import CreateClientForm from '@/components/clients/CreateClientForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Estado dos filtros
  const [filters, setFilters] = useState({ search: '' });

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
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(c =>
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.cpfCnpj?.includes(term)
      );
    }
    setFilteredClients(result);
  }, [filters, clients]);

  const handleClientCreated = () => {
    setIsCreateModalOpen(false);
    fetchClients();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">

      {/* --- SIDEBAR DE FILTROS --- */}
      <aside className={`bg-white border-r border-slate-200 p-6 w-full h-auto md:w-80 md:h-screen md:sticky md:top-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-lg">Filtros</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="md:hidden"><X className="h-4 w-4" /></Button>
        </div>

        <div className="space-y-5">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nome, CPF, email..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          {/* Aqui você pode adicionar mais Selects de filtro no futuro (ex: Status, Cidade) */}
        </div>
      </aside>

      {/* --- ÁREA DE CONTEÚDO --- */}
      <main className="flex-1 p-4 md:p-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
            <p className="text-slate-500">Gerencie sua base de clientes.</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="md:hidden flex-1" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filtrar
            </Button>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none">Novo Cliente</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Cadastrar Cliente</DialogTitle></DialogHeader>
                <CreateClientForm onClientCreated={handleClientCreated} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? <p>Carregando...</p> : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClients.map(client => (
              <Card key={client.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{client.cpfCnpj}</p>
                    </div>
                    <Badge variant={client.status === 'ativo' ? 'default' : 'secondary'}>
                      {client.status || 'Ativo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm pt-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="h-4 w-4 text-primary" /> {client.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4 text-primary" /> {client.phone}
                  </div>
                  {client.address?.city && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-primary" /> {client.address.city}/{client.address.state}
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
            {filteredClients.length === 0 && <p className="text-center col-span-full text-muted-foreground">Nenhum cliente encontrado.</p>}
          </div>
        )}
      </main>
    </div>
  );
}

export default ClientsPage;