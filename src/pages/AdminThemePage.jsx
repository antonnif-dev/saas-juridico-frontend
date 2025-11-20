import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { applyTheme } from '@/lib/theme';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const defaultSettings = {
  // Cores Base
  corPrimaria: '#4299e1',
  corFundo: '#f4f7f9',
  corFundoCard: '#ffffff',
  corBorda: '#e2e8f0',

  // Texto
  corTextoPrimario: '#1a202c',
  corTextoSecundario: '#718096',

  // Componentes
  corNavbarFundo: '#ffffff',
  corNavbarTexto: '#1a202c',
  corFooterFundo: '#1a202c',
  corFooterTexto: '#f4f7f9',

  // Tipografia
  fontFamilia: 'Inter, system-ui, sans-serif',
  fontSizeBase: '14px',
  fontSizeH1: '1.7rem',
  fontSizeH2: '1.5rem',

  // Header
  headerType: 'text',
  headerLogoSize: '1.7rem'
};

function AdminThemePage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await apiClient.get('/theme');
        // Define valores padrão se vier vazio
        setSettings(data || {});
        applyTheme(data || {});
      } catch (error) {
        console.warn("Usando tema padrão.");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (name, value) => {
    const newSettings = { ...settings, [name]: value };
    setSettings(newSettings);
    applyTheme({ [name]: value });
  };

  const handleSave = async () => {
    try {
      await apiClient.put('/theme', settings);
      alert('Aparência atualizada com sucesso!');
    } catch (error) {
      alert('Erro ao salvar.');
    }
  };

  // Componente Helper para Input de Cor
  const ColorPicker = ({ label, name, defaultValue }) => (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-slate-500 uppercase">{label}</Label>
      <div className="flex gap-2 items-center">
        <Input
          type="color"
          value={settings[name] || defaultValue || '#000000'}
          onChange={(e) => handleChange(name, e.target.value)}
          className="w-12 h-9 p-1 cursor-pointer"
        />
        <Input
          type="text"
          value={settings[name] || defaultValue || ''}
          onChange={(e) => handleChange(name, e.target.value)}
          className="flex-1 h-9"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  if (loading) return <p className="p-8">Carregando configurações...</p>;

  const ColorInput = ({ label, name, defaultValue }) => (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-slate-500 uppercase">{label}</Label>
      <div className="flex gap-2 items-center">
        <Input
          type="color"
          value={settings[name] || defaultValue || '#000000'}
          onChange={(e) => handleChange(name, e.target.value)}
          className="w-12 h-9 p-1 cursor-pointer"
        />
        <Input
          type="text"
          value={settings[name] || defaultValue || ''}
          onChange={(e) => handleChange(name, e.target.value)}
          className="flex-1 h-9"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const handleReset = async () => {
    if (!window.confirm("Tem certeza? Isso apagará todas as personalizações e voltará ao padrão original.")) {
      return;
    }

    setLoading(true);
    try {
      // 1. Atualiza o estado visual imediatamente
      setSettings(defaultSettings);
      applyTheme(defaultSettings);

      // 2. Salva o padrão no banco de dados (sobrescrevendo o personalizado)
      await apiClient.put('/theme', defaultSettings);

      alert("Tema resetado para o padrão com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao resetar tema.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Feedback visual rápido
    const tempUrl = URL.createObjectURL(file);
    // Atualiza o estado para mostrar o preview imediatamente (opcional)

    const formData = new FormData();
    formData.append('logo', file);

    try {
      // Mostra algum loading se quiser, ou usa o botão disabled
      const response = await apiClient.post('/theme/upload-logo', formData);

      // O backend retorna { url: '...' }
      const novaUrl = response.data.url;

      // Atualiza o estado principal 'settings' com a nova URL
      handleChange('logoUrl', novaUrl);

      alert("Logo enviado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar imagem.");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aparência do Site</h1>
          <p className="text-muted-foreground">Personalize cores, layout e tipografia.</p>
        </div>

        <div className="flex gap-2">
          {/* Botão de Reset */}
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Resetar Padrão
          </Button>

          {/* Botão de Salvar */}
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Salvar Alterações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="geral">Cores Gerais</TabsTrigger>
          <TabsTrigger value="cabecalho">Cabeçalho (Topo)</TabsTrigger>
          <TabsTrigger value="navegacao">Navegação (Lateral)</TabsTrigger>
        </TabsList>

        {/* --- ABA 1: CORES GERAIS --- */}
        <TabsContent value="geral">
          <Card>
            <CardHeader><CardTitle>Identidade Visual</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorPicker label="Cor Primária (Botões/Destaques)" name="corPrimaria" defaultValue="#000000" />
              <ColorPicker label="Fundo da Página" name="corFundo" defaultValue="#f4f7f9" />
              <ColorPicker label="Fundo dos Cards" name="corFundoCard" defaultValue="#ffffff" />
              <ColorPicker label="Cor da Borda" name="corBorda" defaultValue="#e2e8f0" />

              <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                <h3 className="font-bold mb-4">Tipografia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Cor do Texto Principal</Label>
                    <ColorPicker label="" name="corTextoPrimario" defaultValue="#0f172a" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor do Texto Adicional (Listas/Subtítulos)</Label>
                    <ColorPicker label="" name="corTextoSecundario" defaultValue="#64748b" />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label>Família da Fonte</Label>
                    <Select value={settings.fontFamilia} onValueChange={(val) => handleChange('fontFamilia', val)}>
                      <SelectTrigger><SelectValue placeholder="Selecione a fonte" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter, sans-serif">Padrão (Inter)</SelectItem>
                        <SelectItem value="'Times New Roman', serif">Jurídico (Serif)</SelectItem>
                        <SelectItem value="'Roboto', sans-serif">Moderno (Roboto)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ABA 2: CABEÇALHO (NAVBAR) --- */}
        <TabsContent value="cabecalho">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Barra Superior (Header)</h2>
            </div>
            <div className="card-content">

              {/* Cores do Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <ColorInput label="Cor de Fundo" name="headerBg" />
                <ColorInput label="Cor do Texto/Ícones" name="headerText" />
              </div>

              <hr />

              {/* Configuração do Logo/Título */}
              <h3 className="font-bold mb-4">Identidade Visual</h3>

              <div className="form-group">
                <Label>Tipo de Exibição</Label>
                <select
                  name="headerType"
                  value={settings.headerType || 'text'}
                  onChange={(e) => handleChange('headerType', e.target.value)}
                  className="form-select"
                >
                  <option value="text">Texto (Nome do Escritório)</option>
                  <option value="image">Imagem (Logo)</option>
                </select>
              </div>

              {settings.headerType === 'image' ? (
                <div className="form-group">
                  <Label>Upload da Logomarca</Label>

                  <div className="flex items-center gap-4 mt-2">
                    {settings.logoUrl && (
                      <div className="border p-2 rounded bg-gray-50">
                        <img
                          src={settings.logoUrl}
                          alt="Logo Atual"
                          className="h-12 object-contain"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml"
                        onChange={handleLogoUpload}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos aceitos: PNG, JPG, SVG. Fundo transparente recomendado.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <Label>Texto do Título</Label>
                  <Input
                    type="text"
                    name="headerTitle"
                    placeholder="Ex: Escritório Silva"
                    value={settings.headerTitle || ''}
                    onChange={(e) => handleChange('headerTitle', e.target.value)}
                    className="form-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use <b>&lt;br /&gt;</b> para quebrar a linha.</p>
                </div>
              )}

              {/* --- SELEÇÃO DE ESTILO (CONDICIONAL) --- */}

              {/* 1. Se for TEXTO: Mostra seletor de Tamanho da Fonte */}
              {settings.headerType === 'text' && (
                <div className="form-group mt-4 pt-4 border-t">
                  <Label>Tamanho do Texto</Label>
                  <select
                    name="headerLogoSize"
                    value={settings.headerLogoSize || '1.7rem'}
                    onChange={(e) => handleChange('headerLogoSize', e.target.value)}
                    className="form-select"
                  >
                    <option value="1.2rem">Pequeno</option>
                    <option value="1.4rem">Médio (Padrão)</option>
                    <option value="1.5rem">Grande</option>
                    <option value="1.6rem">Extra Grande</option>
                  </select>
                </div>
              )}

              {/* 2. Se for IMAGEM: Mostra seletor de Formato (Estilização) */}
              {settings.headerType === 'image' && (
                <div className="form-group mt-4 pt-4 border-t">
                  <Label>Estilização da Imagem (Tamanho fixo: 60px)</Label>
                  <select
                    name="headerLogoShape" // Nova configuração: 'headerLogoShape'
                    value={settings.headerLogoShape || 'square'}
                    onChange={(e) => handleChange('headerLogoShape', e.target.value)}
                    className="form-select"
                  >
                    <option value="square">Quadrado (Padrão)</option>
                    <option value="rounded">Quadrado com bordas arredondadas</option>
                    <option value="circle">Redondo</option>
                    <option value="triangle">Triangular</option>
                    <option value="diamond">Losangular</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">A imagem será automaticamente recortada para caber no formato.</p>
                </div>
              )}

            </div>
          </div>
        </TabsContent>

        {/* --- ABA 3: NAVEGAÇÃO (LATERAL/FOOTER) --- */}
        <TabsContent value="navegacao">
          <Card>
            <CardHeader><CardTitle>Barra de Navegação (Lateral/Inferior)</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ColorPicker label="Cor de Fundo" name="sidebarBg" defaultValue="#ffffff" />
              <ColorPicker label="Cor dos Ícones (Padrão)" name="sidebarText" defaultValue="#64748b" />
              <ColorPicker label="Cor do Ícone Ativo" name="sidebarActive" defaultValue="#0f172a" />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

export default AdminThemePage;