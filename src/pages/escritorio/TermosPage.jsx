import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, ArrowLeft, FileText } from 'lucide-react';

function TermosPage() {
  const navigate = useNavigate();

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

      <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8 text-center">
          <FileText className="h-10 w-10 text-slate-700 mx-auto mb-4" />
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Termos de Uso</h1>
          <p className="text-slate-500">Regras de utilização da plataforma digital</p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-8 space-y-6 text-justify text-slate-700 leading-relaxed">
            <section>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">1. Aceitação</h3>
              <p>O acesso à plataforma implica na concordância plena com estes termos. O uso é pessoal e as credenciais são intransferíveis.</p>
            </section>
            <section>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">2. Propriedade Intelectual</h3>
              <p>Todo o conteúdo, layout e código da plataforma são propriedade exclusiva do escritório, protegidos por direitos autorais.</p>
            </section>
            <section>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">3. Responsabilidades</h3>
              <p>O escritório não se responsabiliza por danos decorrentes de mau uso da plataforma ou falhas de internet do usuário. As informações no site público têm caráter informativo e não substituem consulta formal.</p>
            </section>
            <section>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">4. Foro</h3>
              <p>Fica eleito o foro da Comarca da Capital para dirimir quaisquer litígios oriundos destes termos.</p>
            </section>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Saas & Jurídico. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default TermosPage;