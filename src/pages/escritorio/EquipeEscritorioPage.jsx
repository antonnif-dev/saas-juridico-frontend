import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, ArrowLeft, Linkedin, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function EquipePage() {
  const navigate = useNavigate();

  const socios = [
    {
      nome: "Dr. [Nome do Sócio]",
      cargo: "Sócio Fundador",
      oab: "OAB/UF 00.000",
      bio: "Especialista em Direito Processual Civil com mais de 20 anos de experiência em tribunais superiores. Mestre em Direito pela Universidade [X].",
      linkedin: "#",
      email: "socio1@saasejuridico.com.br"
    },
    {
      nome: "Dra. [Nome da Sócia]",
      cargo: "Sócia Diretora",
      oab: "OAB/UF 00.000",
      bio: "Referência em Direito Empresarial e Compliance. Liderou negociações de M&A em grandes corporações nacionais.",
      linkedin: "#",
      email: "socio2@saasejuridico.com.br"
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
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-6">Corpo Jurídico</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Nossa equipe é formada por profissionais de elite, com sólida formação acadêmica e vasta experiência prática. 
            Prezamos pela atualização constante e pelo atendimento personalizado.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {socios.map((socio, index) => (
            <Card key={index} className="border-slate-200 overflow-hidden group hover:shadow-lg transition-all">
              <CardContent className="p-0 flex flex-col items-center pt-10 pb-8 px-6 text-center bg-white">
                <Avatar className="h-32 w-32 mb-6 border-4 border-slate-50 shadow-md">
                  <AvatarImage src="" /> 
                  <AvatarFallback className="text-2xl bg-slate-200 text-slate-500 font-serif">
                    {socio.nome.substring(4, 6)}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="text-xl font-bold text-slate-900">{socio.nome}</h3>
                <p className="text-primary font-medium text-sm mb-1">{socio.cargo}</p>
                <p className="text-slate-400 text-xs font-mono mb-4">{socio.oab}</p>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {socio.bio}
                </p>

                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Mail className="h-4 w-4" /> Contato
                  </Button>
                </div>
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

export default EquipePage;