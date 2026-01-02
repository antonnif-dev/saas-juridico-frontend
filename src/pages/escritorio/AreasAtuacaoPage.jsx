import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, ArrowLeft, Briefcase, Gavel, FileText, Globe, Building2, Users } from 'lucide-react';

function AreasAtuacaoPage() {
  const navigate = useNavigate();

  const areas = [
    {
      icon: <Gavel className="h-6 w-6 text-primary" />,
      title: "Contencioso Cível Estratégico",
      description: "Atuação vigorosa em disputas complexas nos tribunais estaduais e superiores, com foco na mitigação de riscos e na obtenção de resultados favoráveis em litígios de alta complexidade."
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Direito Trabalhista Empresarial",
      description: "Consultoria preventiva e defesa contenciosa focada na redução do passivo trabalhista, negociações sindicais e compliance nas relações de trabalho."
    },
    {
      icon: <Building2 className="h-6 w-6 text-primary" />,
      title: "Direito Tributário",
      description: "Planejamento tributário, recuperação de créditos e defesa administrativa e judicial contra autuações fiscais, visando a eficiência fiscal da operação."
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      title: "Direito Digital e LGPD",
      description: "Adequação à Lei Geral de Proteção de Dados, elaboração de contratos digitais, termos de uso e atuação em casos de incidentes de segurança da informação."
    },
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Contratos e Negócios",
      description: "Elaboração e revisão de instrumentos contratuais nacionais e internacionais, garantindo segurança jurídica nas transações comerciais."
    },
    {
      icon: <Scale className="h-6 w-6 text-primary" />,
      title: "Direito Societário",
      description: "Estruturação de sociedades, fusões e aquisições (M&A), acordos de acionistas e resolução de conflitos societários."
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
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="mx-auto bg-primary/10 w-fit p-3 rounded-full mb-6">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-6">Áreas de Atuação</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Nosso escritório adota uma abordagem multidisciplinar ("Full Service"), oferecendo suporte jurídico integral. 
            Aliamos profundidade técnica à visão de negócios para entregar soluções que agregam valor real aos nossos clientes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {areas.map((area, index) => (
            <Card key={index} className="border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  {area.icon}
                  {area.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {area.description}
                </p>
              </CardContent>
            </Card>
          ))}
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

export default AreasAtuacaoPage;