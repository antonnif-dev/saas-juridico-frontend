import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Ícone de SVG para o placeholder
const UserIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-slate-400">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

function UserProfilePage() {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  
  // Estado local para o formulário (Frontend apenas por enquanto)
  const [formData, setFormData] = useState({
    name: currentUser?.name || '', // Assumindo que teremos 'name' no futuro
    email: currentUser?.email || '',
    phone: '',
    role: 'Administrador', // Exemplo
    is2FAEnabled: false // Estado visual do 2FA
  });

  // Estado para pré-visualização da imagem local
  const [photoPreview, setPhotoPreview] = useState(currentUser?.photoUrl || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Função que dispara o clique no input de arquivo oculto
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // Gerencia a seleção do arquivo localmente (Preview)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Cria uma URL local temporária para mostrar o preview imediatamente
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      // Aqui no futuro você prepararia o 'file' para envio ao backend
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    // SIMULAÇÃO DE SALVAMENTO
    console.log("Dados para salvar no backend:", formData);
    console.log("Arquivo de foto para upload:", fileInputRef.current?.files[0]);

    setTimeout(() => {
      alert("Dados salvos com sucesso! (Simulação Frontend)");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Meu Perfil</h1>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- COLUNA 1: FOTO E INFO BÁSICA --- */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center text-center">
             {/* Área de Upload de Imagem */}
            <div className="relative group cursor-pointer" onClick={handleImageClick}>
              <div className="h-32 w-32 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm group-hover:border-blue-200 transition-all">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <UserIconSvg />
                )}
              </div>
               {/* Overlay com ícone de câmera ao passar o mouse */}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm">
                Alterar Foto
              </div>
            </div>

             {/* Input de arquivo oculto */}
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg"
              className="hidden"
            />

            <h2 className="mt-4 text-xl font-semibold break-all">{formData.email}</h2>
            <p className="text-sm text-muted-foreground">{formData.role}</p>
          </CardContent>
        </Card>

        {/* --- COLUNA 2: DADOS PESSOAIS --- */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize seus dados de cadastro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Seu nome" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="(00) 00000-0000" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail (Login)</Label>
              {/* Email geralmente é somente leitura para evitar problemas de segurança */}
              <Input 
                id="email" 
                name="email" 
                value={formData.email} 
                readOnly 
                className="bg-gray-100 cursor-not-allowed" 
              />
              <p className="text-xs text-muted-foreground">Para alterar seu e-mail, entre em contato com o suporte.</p>
            </div>

            <hr className="my-4" />

            {/* --- SEÇÃO DE SEGURANÇA / 2FA (Frontend Visual) --- */}
            <div>
              <h3 className="font-medium mb-3">Segurança da Conta</h3>
              
              <div className="border rounded-lg p-4 flex items-start justify-between bg-slate-50">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    Autenticação de Dois Fatores (2FA)
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Recomendado</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 pr-4">
                    Adicione uma camada extra de segurança. Exigiremos um código do seu aplicativo autenticador ao fazer login.
                  </p>
                </div>
                
                {/* Simulação de um "Switch" toggle usando Tailwind */}
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is2FAEnabled: !prev.is2FAEnabled }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.is2FAEnabled ? 'bg-green-600' : 'bg-gray-200'}`}
                >
                  <span className="sr-only">Ativar 2FA</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.is2FAEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
               {formData.is2FAEnabled && (
                  <p className="text-xs text-green-600 mt-2">
                    * No backend real, isso iniciaria o processo de configuração (QR Code).
                  </p>
               )}
            </div>

            <div className="flex justify-end mt-6">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default UserProfilePage;