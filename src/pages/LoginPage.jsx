import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';

// Componentes Shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Ícones Lucide para identidade visual
import { Scale, Shield, Clock, Users, ChevronRight, ArrowRight } from 'lucide-react';

function LoginPage() {
  // --- LÓGICA DE AUTENTICAÇÃO (INTACTA) ---
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setIsLoading(false);
    }
  };
  // ----------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* 1. NAVBAR: Identidade e Navegação */}
      <header className="sticky top-0 z-40 w-full backdrop-blur bg-white/95">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center bg-slate-900">

          {/* Logo */}
          <div className="flex pr-4 items-center gap-2 text-white">
            <div className="bg-slate-900 p-1.5 rounded-md">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight leading-tight">
              <span className="block">Escritório</span>
              <span className="block">Saas &</span>
              <span className="block">Jurídico</span>
            </span>
          </div>

          {/* Nav + Botão */}
          {/* Nav + Botão */}
          <div className="flex flex-col items-center gap-3">
            <nav className="flex gap-2 md:gap-16 text-sm font-medium">
              <Link to="/escritorio/atuacao" className="!text-white hover:!text-primary transition-colors">
                Áreas de Atuação
              </Link>
              <Link to="/escritorio/equipe" className="!text-white hover:!text-primary transition-colors">
                Nossa Equipe
              </Link>
              <Link to="/escritorio/jurisprudencia" className="!text-white hover:!text-primary transition-colors">
                Jurisprudência
              </Link>
            </nav>

            <Button
              variant="outline"
              className="ml-auto text-white"
              onClick={() => navigate('/escritorio/contato')}
            >
              Fale Conosco
            </Button>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION: Apresentação Institucional */}
      <section className="bg-slate-900 text-white py-20 lg:py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-6xl font-serif font-bold mb-6 leading-tight">
            Defesa estratégica. <br /> Resultados concretos.
          </h1>
          <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Combinamos tradição jurídica com tecnologia de ponta para oferecer soluções ágeis e transparentes para você e sua empresa.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-200"
              onClick={() => navigate('/pre-atendimento')} /* <-- ESSA LINHA FAZ A MÁGICA */
            >
              Iniciar Pré-atendimento
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-white border-slate-700 hover:bg-slate-800 hover:text-white"
              onClick={() => navigate('/escritorio/atuacao')} // Ou /escritorio/equipe
            >
              Conhecer o Escritório
            </Button>
          </div>
        </div>
      </section>

      {/* 3. SECTION PORTAL: Informações + Login (A divisão que você pediu) */}
      <section className="py-20 container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* ESQUERDA: Informações sobre o Portal */}
          <div className="lg:w-1/2 space-y-8">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-4 text-slate-900">Acesso ao Cliente</h2>
              <p className="text-slate-600 text-lg">
                Acesse nossa plataforma exclusiva para acompanhar seus processos em tempo real, visualizar documentos e comunicar-se diretamente com nosso corpo jurídico.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-lg h-fit">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Segurança de Dados</h3>
                  <p className="text-slate-600 text-sm">Seus documentos protegidos com criptografia de ponta a ponta.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-lg h-fit">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Disponibilidade 24/7</h3>
                  <p className="text-slate-600 text-sm">Consulte o andamento dos seus casos a qualquer hora, de qualquer lugar.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-lg h-fit">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Atendimento Personalizado</h3>
                  <p className="text-slate-600 text-sm">Canal direto com o advogado responsável pelo seu caso.</p>
                </div>
              </div>
            </div>
          </div>

          {/* DIREITA: Card de Login */}
          <div className="lg:w-1/2 w-full flex justify-center lg:justify-end">
            <Card className="w-full max-w-md shadow-2xl border-slate-200">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-center">Área Restrita</CardTitle>
                <CardDescription className="text-center">
                  Identifique-se para acessar o sistema.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail Corporativo / CPF</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nome@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <a href="#" className="text-xs text-primary hover:underline">Esqueceu a senha?</a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  {error && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md font-medium">
                      {error}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-2">
                  <Button className="w-full h-11 text-base" type="submit" disabled={isLoading}>
                    {isLoading ? 'Autenticando...' : 'Acessar Painel'} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

        </div>
      </section>

      {/* 5. FOOTER SIMPLES */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <Scale className="h-5 w-5" />
            <span className="font-serif font-bold">Escritório (+)</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Todos os direitos reservados. OAB/UF 00.000.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/escritorio/privacidade" className="hover:text-white transition-colors">
              Privacidade
            </Link>
            <Link to="/escritorio/termos" className="hover:text-white transition-colors">
              Termos
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default LoginPage;