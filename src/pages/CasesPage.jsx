import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { Link } from 'react-router-dom';

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Search, X, FileText, DollarSign, AlertTriangle } from 'lucide-react';

// Componente auxiliar para os inputs de filtro
const FilterSelect = ({ label, value, onChange, options, placeholder }) => (
  <div className="space-y-1">
    <Label className="text-xs font-semibold text-white uppercase">{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 bg-white w-full">
        <SelectValue placeholder={placeholder || "Todos"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos</SelectItem>
        {options.map(opt => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

function CasesPage() {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  // Inicia fechado no mobile (false), mas a lógica CSS (md:block) garante que apareça no desktop
  const [showFilters, setShowFilters] = useState(false);

  // Estado inicial dos 12 filtros
  const initialFilters = {
    status: 'all',
    area: 'all',
    urgencia: 'all',
    tipoCliente: 'all',
    origem: 'all',
    probabilidade: 'all',
    localidade: 'all',
    responsavel: 'all',
    etapaTriagem: 'all',
    valorEstimado: 'all',
    complexidade: 'all',
    search: '' 
  };
  
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/processo');
        setCases(response.data);
        setFilteredCases(response.data);
      } catch (error) {
        console.error("Erro ao buscar processos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  useEffect(() => {
    let result = cases;

    if (filters.status !== 'all') result = result.filter(c => c.status === filters.status);
    if (filters.area !== 'all') result = result.filter(c => c.area === filters.area);
    if (filters.urgencia !== 'all') result = result.filter(c => c.urgencia === filters.urgencia);
    if (filters.tipoCliente !== 'all') result = result.filter(c => c.tipoCliente === filters.tipoCliente);
    if (filters.origem !== 'all') result = result.filter(c => c.origem === filters.origem);
    if (filters.probabilidade !== 'all') result = result.filter(c => c.probabilidade === filters.probabilidade);
    if (filters.localidade !== 'all') result = result.filter(c => c.localidade === filters.localidade);
    if (filters.complexidade !== 'all') result = result.filter(c => c.complexidade === filters.complexidade);
    
    if (filters.valorEstimado !== 'all') {
      result = result.filter(c => {
        const val = parseFloat(c.valorCausa || 0);
        if (filters.valorEstimado === 'Baixo') return val <= 5000;
        if (filters.valorEstimado === 'Médio') return val > 5000 && val <= 20000;
        if (filters.valorEstimado === 'Alto') return val > 20000;
        return true;
      });
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(c => 
        c.titulo?.toLowerCase().includes(term) || 
        c.numeroProcesso?.toLowerCase().includes(term) ||
        c.assuntoEspecifico?.toLowerCase().includes(term)
      );
    }

    setFilteredCases(result);
  }, [filters, cases]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters(initialFilters);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Em andamento': return 'bg-blue-100 text-blue-800';
      case 'Suspenso': return 'bg-yellow-100 text-yellow-800';
      case 'Arquivado': return 'bg-slate-100 text-slate-800';
      case 'Urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    // CORREÇÃO 1: flex-col no mobile, md:flex-row no desktop
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      
      {/* --- SIDEBAR DE FILTROS --- */}
      <aside 
        className={`
          bg-white border-r border-slate-200 p-6 overflow-y-auto
          /* Mobile: largura total, altura automática (empurra conteúdo) */
          w-full h-auto
          /* Desktop: largura fixa, altura tela, sticky */
          md:w-80 md:h-screen md:sticky md:top-0
          /* Controle de visibilidade */
          ${showFilters ? 'block' : 'hidden md:block'}
        `}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-lg">Filtros</h2>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8">Limpar</Button>
            {/* Botão Fechar (Só aparece no Mobile) */}
            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="md:hidden h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-5 pb-8 md:pb-0">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              className="pl-8" 
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Lista de Filtros */}
          <FilterSelect label="1. Status" value={filters.status} onChange={(v) => handleFilterChange('status', v)} options={['Em andamento', 'Suspenso', 'Arquivado', 'Encerrado']} />
          <FilterSelect label="2. Área do Direito" value={filters.area} onChange={(v) => handleFilterChange('area', v)} options={['Cível', 'Penal', 'Trabalhista', 'Previdenciário', 'Consumidor', 'Família', 'Empresarial', 'Tributário']} />
          <FilterSelect label="3. Urgência" value={filters.urgencia} onChange={(v) => handleFilterChange('urgencia', v)} options={['Baixa', 'Média', 'Alta', 'Urgente']} />
          <FilterSelect label="4. Tipo de Cliente" value={filters.tipoCliente} onChange={(v) => handleFilterChange('tipoCliente', v)} options={['Pessoa Física', 'Empresa', 'Prospect', 'Cliente Ativo']} />
          <FilterSelect label="5. Origem" value={filters.origem} onChange={(v) => handleFilterChange('origem', v)} options={['Site', 'WhatsApp', 'Indicação', 'Instagram', 'Google Ads', 'Outro']} />
          <FilterSelect label="6. Probabilidade" value={filters.probabilidade} onChange={(v) => handleFilterChange('probabilidade', v)} options={['Baixa', 'Média', 'Alta', 'Quase Certo']} />
          <FilterSelect label="7. Localidade" value={filters.localidade} onChange={(v) => handleFilterChange('localidade', v)} options={['SP', 'RJ', 'MG', 'RS', 'PR', 'BA']} />
          <FilterSelect label="10. Triagem" value={filters.etapaTriagem} onChange={(v) => handleFilterChange('etapaTriagem', v)} options={['Aguardando Docs', 'Análise', 'Em Revisão', 'Pronto']} />
          <FilterSelect label="11. Valor" value={filters.valorEstimado} onChange={(v) => handleFilterChange('valorEstimado', v)} options={['Baixo', 'Médio', 'Alto']} placeholder="Faixa" />
          <FilterSelect label="12. Complexidade" value={filters.complexidade} onChange={(v) => handleFilterChange('complexidade', v)} options={['Baixa', 'Média', 'Alta']} />
        </div>
      </aside>

      {/* --- ÁREA DE CONTEÚDO (CARDS) --- */}
      <main className="flex-1 p-4 md:p-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestão de Processos</h1>
            <p className="text-slate-500">
              Exibindo {filteredCases.length} de {cases.length} processos
            </p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
             {/* Botão Toggle (Só aparece no Mobile) */}
             <Button variant="outline" className="md:hidden flex-1" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {showFilters ? 'Ocultar Filtros' : 'Filtrar'}
            </Button>
            
            <Link to="/novo-processo" className="flex-1 sm:flex-none">
               {/* Botão de Novo Processo (se tiver página dedicada) */}
            </Link>
          </div>
        </div>

        {loading ? (
          <p>Carregando processos...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCases.map(processo => (
              <Card key={processo.id} className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${processo.urgencia === 'Alta' || processo.urgencia === 'Urgente' ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <div className="flex justify-between items-center w-full mb-2">
                        <Badge className={getStatusColor(processo.status)}>{processo.status}</Badge>
                        {processo.urgencia === 'Alta' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                      <CardTitle className="text-lg line-clamp-1" title={processo.titulo}>{processo.titulo}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{processo.numeroProcesso || 'Sem número'}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                     <div>
                       <span className="text-xs text-slate-400 uppercase block">Área</span>
                       <span className="font-medium">{processo.area}</span>
                     </div>
                     <div>
                       <span className="text-xs text-slate-400 uppercase block">Cliente</span>
                       <span className="font-medium truncate block">{processo.clienteNome || 'ID: ' + (processo.clientId ? processo.clientId.slice(0,5) : '?')}</span>
                     </div>
                     <div>
                       <span className="text-xs text-slate-400 uppercase block">Valor</span>
                       <span className="font-medium flex items-center gap-1">
                         <DollarSign className="w-3 h-3" /> {processo.valorCausa || '-'}
                       </span>
                     </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t bg-slate-50/50">
                   <Link to={`/processos/${processo.id}`} className="w-full">
                     <Button variant="ghost" className="w-full justify-between hover:bg-white">
                       Ver Detalhes <FileText className="w-4 h-4" />
                     </Button>
                   </Link>
                </CardFooter>
              </Card>
            ))}
            
            {filteredCases.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400 border-2 border-dashed rounded-lg bg-white">
                <p>Nenhum processo encontrado.</p>
                <Button variant="link" onClick={clearFilters}>Limpar Filtros</Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default CasesPage;