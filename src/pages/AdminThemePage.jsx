import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme.primary) root.style.setProperty('--primary-hsl', theme.primary); // Assumindo HSL
  if (theme.background) root.style.setProperty('--background-hsl', theme.background);
  if (theme.card) root.style.setProperty('--card-hsl', theme.card);
  if (theme.foreground) root.style.setProperty('--foreground-hsl', theme.foreground);
  if (theme.fontFamily) root.style.setProperty('font-family', theme.fontFamily);
  if (theme.fontSize) root.style.setProperty('font-size', theme.fontSize);
};

function AdminThemePage() {
  const [settings, setSettings] = useState({
    primary: '',
    background: '',
    card: '',
    foreground: '',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '16px'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await apiClient.get('/theme');
        setSettings(data);
        applyTheme(data);
      } catch (error) {
        console.warn("Nenhum tema salvo encontrado, usando padrões.");
      }
      setLoading(false);
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
      alert('Tema salvo com sucesso!');
    } catch (error) {
      alert('Falha ao salvar o tema.');
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Configurações de Aparência</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Personalize o tema do seu site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-lg font-medium">Cores</h3>
          <p className="text-sm text-muted-foreground">
            Insira os valores HSL (ex: "240 5.9% 10%").
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor Primária (Botões)</Label>
              <Input value={settings.primary} onChange={(e) => handleChange('primary', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cor de Fundo (Página)</Label>
              <Input value={settings.background} onChange={(e) => handleChange('background', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cor de Fundo (Cards)</Label>
              <Input value={settings.card} onChange={(e) => handleChange('card', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cor do Texto</Label>
              <Input value={settings.foreground} onChange={(e) => handleChange('foreground', e.target.value)} />
            </div>
          </div>
          
          <hr />
          
          <h3 className="text-lg font-medium">Tipografia</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fonte</Label>
              <Select value={settings.fontFamily} onValueChange={(val) => handleChange('fontFamily', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter, system-ui, sans-serif">Moderna (Inter)</SelectItem>
                  <SelectItem value="'Times New Roman', serif">Clássica (Serif)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tamanho Base</Label>
              <Select value={settings.fontSize} onValueChange={(val) => handleChange('fontSize', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="14px">Pequeno</SelectItem>
                  <SelectItem value="16px">Médio (Padrão)</SelectItem>
                  <SelectItem value="18px">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSave} className="mt-4">Salvar Alterações</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminThemePage;