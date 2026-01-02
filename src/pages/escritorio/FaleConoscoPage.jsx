import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, ArrowLeft, MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Label } from "@/components/ui/label";

function FaleConoscoPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulação de envio
    setTimeout(() => {
      setLoading(false);
      alert("Mensagem enviada com sucesso. Nossa equipe entrará em contato em breve.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">

      {/* HEADER */}
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

      {/* CONTEÚDO */}
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Canais de Atendimento</h1>
          <p className="text-lg text-slate-600">
            Estamos à disposição para esclarecer dúvidas e apresentar soluções jurídicas sob medida para sua necessidade.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {/* Informações de Contato */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 h-full">
              <CardHeader>
                <CardTitle className="font-serif">Dados de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Sede Principal</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Av. Paulista, 1000, Conj. 101<br />
                      Bela Vista, São Paulo - SP<br />
                      CEP 01310-100
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Telefones</h3>
                    <p className="text-sm text-slate-600">
                      (11) 3000-0000<br />
                      (11) 99999-9999 (WhatsApp)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">E-mail</h3>
                    <p className="text-sm text-slate-600">
                      contato@saasejuridico.com.br<br />
                      juridico@saasejuridico.com.br
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Horário de Funcionamento</h3>
                    <p className="text-sm text-slate-600">
                      Segunda a Sexta: 09h às 18h<br />
                      Plantão Criminal: 24h
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="font-serif">Envie sua Mensagem</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input id="nome" placeholder="Digite seu nome" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" required />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input id="telefone" placeholder="(00) 00000-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assunto">Assunto</Label>
                      <Input id="assunto" placeholder="Ex: Dúvida Trabalhista" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mensagem">Mensagem</Label>
                    <textarea
                      id="mensagem"
                      placeholder="Descreva brevemente sua solicitação..."
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full md:w-auto px-8" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Solicitação'} <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Saas & Jurídico. Excelência e Tradição.</p>
        </div>
      </footer>
    </div>
  );
}

export default FaleConoscoPage;