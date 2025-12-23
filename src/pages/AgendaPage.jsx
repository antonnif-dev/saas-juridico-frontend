import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { format, isSameDay } from 'date-fns'; // Importei isSameDay para ajudar no calendário
import { useLocation, useNavigate } from 'react-router-dom';
import ptBR from 'date-fns/locale/pt-BR';

// Imports dos componentes Shadcn/ui e Ícones
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, X } from 'lucide-react';

function AgendaPage() {
  // --- Estados de Dados ---
  const [compromissos, setCompromissos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Estados de Controle (Modal) ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // --- Estados de Filtro ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [filteredCompromissos, setFilteredCompromissos] = useState([]);

  const location = useLocation();

  // --- Lógica de Busca de Dados ---
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [compromissosRes, processosRes] = await Promise.all([
        apiClient.get('/agenda'),
        apiClient.get('/processo')
      ]);

      // Filtra apenas datas válidas
      const compromissosValidos = compromissosRes.data.filter(
        c => c.dataHora && typeof c.dataHora === 'string'
      );

      // Ordena por data
      const sortedCompromissos = compromissosValidos.sort((a, b) =>
        new Date(a.dataHora) - new Date(b.dataHora)
      );

      setCompromissos(sortedCompromissos);
      setFilteredCompromissos(sortedCompromissos);
      setProcessos(processosRes.data);

      // Lógica de Navegação vinda de outra página (Ex: Botão "Agendar" na lista de processos)
      if (location.state?.processoId) {
        setSelectedEvent({
          titulo: `Audiência - ${location.state.processoId.slice(0, 5)}`,
          tipo: location.state.tipo || 'Audiência',
          processoId: location.state.processoId,
          dataHora: format(new Date(), "yyyy-MM-dd'T'10:00"),
        });
        setIsDialogOpen(true);
        // Limpa o state do location para não reabrir ao atualizar a página
        window.history.replaceState({}, document.title); 
      }
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setError("Não foi possível carregar os dados da agenda.");
    } finally {
      setLoading(false);
    }
  };

  // --- CORREÇÃO 1: O useEffect que faltava ---
  useEffect(() => {
    fetchData();
  }, []); // Executa apenas uma vez na montagem

  // --- Lógica de Filtragem (useEffect separado) ---
  useEffect(() => {
    const result = compromissos.filter((item) => {
      const matchesSearch = item.titulo?.toLowerCase().includes(searchTerm.toLowerCase()); // Corrigido de item.title para item.titulo (baseado no seu form)
      const matchesType = filterType === 'todos' || item.tipo === filterType; // Corrigido para item.tipo direto, caso não use item.resource
      return matchesSearch && matchesType;
    });
    setFilteredCompromissos(result);
  }, [compromissos, searchTerm, filterType]);


  // --- Lógica Visual do Calendário (Cores por tipo) ---
  // Extrai as datas para cada tipo de evento
  const datasAudiencia = compromissos
    .filter(c => c.tipo === 'Audiência')
    .map(c => new Date(c.dataHora));
    
  const datasPrazo = compromissos
    .filter(c => c.tipo === 'Prazo')
    .map(c => new Date(c.dataHora));

  const datasReuniao = compromissos
    .filter(c => c.tipo === 'Reunião')
    .map(c => new Date(c.dataHora));

  // --- Funções Handler ---

  const handleCreateClick = (date) => {
    if (!date) return;
    setSelectedEvent({
      titulo: '',
      tipo: 'Reunião',
      processoId: 'unselected',
      dataHora: format(date, "yyyy-MM-dd'T'09:00"),
    });
    setIsDialogOpen(true);
  };

  const handleEditClick = (compromisso) => {
    setSelectedEvent({
      ...compromisso,
      processoId: compromisso.processoId || 'unselected',
      dataHora: format(new Date(compromisso.dataHora), "yyyy-MM-dd'T'HH:mm"),
    });
    setIsDialogOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const { id, titulo, dataHora, tipo, processoId } = selectedEvent;
    
    // Tratamento para enviar null se for "unselected"
    const finalProcessoId = processoId === 'unselected' ? null : processoId;

    const dataToSend = { 
        titulo, 
        dataHora: new Date(dataHora).toISOString(), 
        tipo, 
        processoId: finalProcessoId 
    };

    try {
      if (id) {
        await apiClient.put(`/agenda/${id}`, dataToSend);
      } else {
        await apiClient.post('/agenda', dataToSend);
      }
      setIsDialogOpen(false);
      fetchData(); // Recarrega os dados para atualizar calendário e lista
    } catch (err) {
      alert('Falha ao salvar o compromisso.');
    }
  };

  const handleDelete = async (compromissoId) => {
    if (window.confirm('Tem certeza que deseja excluir este compromisso?')) {
      try {
        await apiClient.delete(`/agenda/${compromissoId}`);
        fetchData();
      } catch (err) {
        alert('Falha ao excluir o compromisso.');
      }
    }
  };

  const handleInputChange = (e) => setSelectedEvent(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setSelectedEvent(prev => ({ ...prev, [name]: value }));

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda e Prazos</h1>
        <p className="text-muted-foreground">Gerencie seus compromissos e adicione novos eventos no calendário.</p>
      </div>

      {loading ? <p>Carregando...</p> : error ? <p className="text-destructive">{error}</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* COLUNA ESQUERDA: LISTA COM FILTROS */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Compromissos</CardTitle>
                <CardDescription>Gerencie sua pauta do dia a dia.</CardDescription>
              </CardHeader>
              <CardContent>

                {/* --- BARRA DE FILTROS --- */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por título..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="w-full sm:w-[180px]">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Prazo">Prazo</SelectItem>
                        <SelectItem value="Audiência">Audiência</SelectItem>
                        <SelectItem value="Reunião">Reunião</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(searchTerm || filterType !== 'todos') && (
                    <Button variant="ghost" size="icon" onClick={() => { setSearchTerm(''); setFilterType('todos') }}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* --- TABELA FILTRADA --- */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Data e Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompromissos.length > 0 ? (
                      filteredCompromissos.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.titulo}</TableCell>
                          <TableCell>
                            {format(new Date(item.dataHora), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                              ${item.tipo === 'Prazo' ? 'bg-red-100 text-red-800' :
                                item.tipo === 'Audiência' ? 'bg-purple-100 text-purple-800' :
                                  'bg-blue-100 text-blue-800'}`}>
                              {item.tipo || 'Outro'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>Editar</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>Apagar</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          Nenhum compromisso encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* COLUNA DIREITA: CALENDÁRIO VISUAL */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendário</CardTitle>
                <CardDescription>Dias com compromissos estão destacados.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center p-4">
                <Calendar
                  mode="single"
                  onSelect={handleCreateClick}
                  className="w-full border rounded-md"
                  locale={ptBR}
                  
                  // --- AQUI ESTÁ A LÓGICA DE CORES ---
                  modifiers={{
                    audiencia: datasAudiencia,
                    prazo: datasPrazo,
                    reuniao: datasReuniao
                  }}
                  modifiersClassNames={{
                    audiencia: "bg-purple-100 text-purple-900 font-bold hover:bg-purple-200",
                    prazo: "bg-red-100 text-red-900 font-bold hover:bg-red-200",
                    reuniao: "bg-blue-100 text-blue-900 font-bold hover:bg-blue-200"
                  }}
                />
              </CardContent>
              <div className="px-6 pb-6 text-xs text-slate-500 space-y-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded-full"></div> Prazo</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded-full"></div> Audiência</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-full"></div> Reunião</div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleModalSubmit}>
            <DialogHeader>
              <DialogTitle>{selectedEvent?.id ? 'Editar Compromisso' : 'Novo Compromisso'}</DialogTitle>
              <DialogDescription>Preencha os detalhes do agendamento.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="titulo" className="text-right">Título</Label>
                <Input id="titulo" name="titulo" value={selectedEvent?.titulo || ''} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="dataHora" className="text-right">Data/Hora</Label>
                <Input id="dataHora" name="dataHora" type="datetime-local" value={selectedEvent?.dataHora || ''} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label className="text-right">Tipo</Label>
                <Select name="tipo" value={selectedEvent?.tipo || 'Reunião'} onValueChange={(value) => handleSelectChange('tipo', value)}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prazo">Prazo</SelectItem>
                    <SelectItem value="Audiência">Audiência</SelectItem>
                    <SelectItem value="Reunião">Reunião</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label className="text-right">Processo</Label>
                <Select name="processoId" value={selectedEvent?.processoId || 'unselected'} onValueChange={(value) => handleSelectChange('processoId', value)}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unselected">-- Nenhum Processo --</SelectItem>
                    {processos.length > 0 && processos.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.titulo || p.numeroProcesso}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              {selectedEvent?.id && (
                <Button type="button" variant="destructive" onClick={() => handleDelete(selectedEvent.id)}>
                  Excluir
                </Button>
              )}
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AgendaPage;