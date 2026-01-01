import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';
import { FileText, MessageSquare, Clock, ArrowRight, Scale } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ClientDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [myCases, setMyCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        // Rota segura que busca apenas os processos vinculados ao UID do cliente
        const res = await apiClient.get(`/processo`); 
        setMyCases(res.data);
      } catch (err) {
        console.error("Erro ao carregar dashboard do cliente:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClientData();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Bem-vindo(a), {currentUser?.nome || 'Cliente'}
        </h1>
        <p className="text-slate-500">Acompanhe o andamento jurídico dos seus processos em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processos Ativos</CardTitle>
            <Scale className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myCases.length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">Hoje</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" /> Meus Processos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-400">Sincronizando processos...</p>
            ) : myCases.length > 0 ? (
              myCases.map(c => (
                <div key={c.id} className="flex justify-between items-center p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                  <div>
                    <p className="font-bold text-slate-800">{c.titulo}</p>
                    <p className="text-xs text-slate-500">Nº {c.numeroProcesso || 'Em processamento'}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">
                      {c.status}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/processos/${c.id}`)}>
                    Ver detalhes <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic py-4">Nenhum processo vinculado à sua conta no momento.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;