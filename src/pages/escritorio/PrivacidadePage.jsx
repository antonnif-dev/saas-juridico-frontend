import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, ArrowLeft, ShieldCheck } from 'lucide-react';

function PrivacidadePage() {
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
          <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Política de Privacidade</h1>
          <p className="text-slate-500">Em conformidade com a Lei nº 13.709/2018 (LGPD)</p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-8 space-y-6 text-justify text-slate-700 leading-relaxed">
            <section>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">1. Introdução</h3>
              <p>O escritório Saas & Jurídico reafirma seu compromisso inegociável com a privacidade e a proteção dos dados pessoais de seus clientes e usuários.</p>
            </section>
            <section>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">2. Coleta de Dados</h3>
              <p>Coletamos apenas os dados estritamente necessários para a prestação de serviços jurídicos e segurança da plataforma (Nome, CPF, E-mail e Dados Processuais).</p>
            </section>
            <section>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">3. Finalidade</h3>
              <p>O tratamento ocorre para execução de contrato, cumprimento de obrigação legal e exercício regular de direitos em processo judicial.</p>
            </section>
            <section>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">4. Direitos do Titular</h3>
              <p>O titular pode solicitar a confirmação da existência de tratamento, acesso, correção de dados e revogação do consentimento através do canal oficial do DPO.</p>
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

export default PrivacidadePage;