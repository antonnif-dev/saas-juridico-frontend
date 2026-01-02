import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, ArrowLeft, BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

function JurisprudenciaPage() {
  const navigate = useNavigate();

  const noticias = [
    {
      categoria: "Tributário",
      data: "15 Mai, 2024",
      titulo: "STF decide sobre a modulação de efeitos na exclusão do ICMS da base do PIS/COFINS",
      resumo: "Análise detalhada sobre o impacto financeiro da decisão para empresas do regime não-cumulativo e as novas diretrizes da Receita Federal."
    },
    {
      categoria: "Trabalhista",
      data: "10 Mai, 2024",
      titulo: "Novas regras para o teletrabalho e o controle de jornada",
      resumo: "Entenda as recentes alterações na CLT e como as empresas devem adaptar seus contratos de trabalho para garantir segurança jurídica no home office."
    },
    {
      categoria: "Civil",
      data: "02 Mai, 2024",
      titulo: "A responsabilidade civil na era da Inteligência Artificial",
      resumo: "Um estudo sobre como os tribunais brasileiros estão interpretando danos causados por algoritmos autônomos e a ausência de legislação específica."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 w-full backdrop-blur bg-white/95 border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/login')}>
            <div className="bg-slate-900 p-1.5 rounded-md">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-serif font-bold leading-tight">
              <span className="block">Saas &</span>
              <span className="block">Jurídico</span>
            </span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/login')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Jurisprudência & Informativos</h1>
          </div>

          <div className="space-y-6">
            {noticias.map((item, index) => (
              <Card key={index} className="border-slate-200 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="font-normal">{item.categoria}</Badge>
                    <div className="flex items-center text-slate-400 text-xs">
                      <Calendar className="h-3 w-3 mr-1" /> {item.data}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold leading-tight hover:text-primary transition-colors cursor-pointer">
                    {item.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.resumo}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="p-0 h-auto text-primary font-semibold">
                    Ler artigo completo <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Saas & Jurídico. Excelência e Tradição.</p>
        </div>
      </footer>
    </div>
  );
}

export default JurisprudenciaPage;