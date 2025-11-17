import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { Button } from "@/components/ui/button"; // Assumindo que você voltou para o Shadcn/CSS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { applyTheme } from '@/lib/theme'; // Importa nosso novo helper

function AdminThemePage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Carrega as configurações salvas
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await apiClient.get('/theme');
        setSettings(data);
        applyTheme(data); // Aplica o tema salvo
      } catch (error) {
        console.warn("Nenhum tema salvo encontrado, usando padrões.");
      }
      setLoading(false);
    };
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newSettings = { ...settings, [name]: value };
    setSettings(newSettings);
    // Aplica o preview em tempo real
    applyTheme({ [name]: value }); 
  };
  
  const handleSelectChange = (name, value) => {
    handleChange({ target: { name, value } });
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

  // Função helper para criar um seletor de cor
  const ColorInput = ({ label, name }) => (
    <div className="form-group">
      <Label>{label}</Label>
      <Input 
        type="color" 
        name={name}
        value={settings[name] || '#ffffff'} 
        onChange={handleChange}
        className="h-10 p-1" // Estilo para o seletor de cor
      />
    </div>
  );

  return (
    <div className="page-container">
      <h1 className="page-title">Configurações de Aparência</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personalize o tema do seu site</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-medium">Cores Principais</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <ColorInput label="Cor Primária (Botões)" name="corPrimaria" />
            <ColorInput label="Fundo da Página" name="corFundo" />
            <ColorInput label="Fundo dos Cards" name="corFundoCard" />
            <ColorInput label="Texto Principal" name="corTextoPrimario" />
          </div>
          
          <hr />
          
          <h3 className="text-lg font-medium">Cores de Componentes</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <ColorInput label="Fundo Navbar" name="corNavbarFundo" />
            <ColorInput label="Texto Navbar" name="corNavbarTexto" />
            <ColorInput label="Fundo Footer" name="corFooterFundo" />
            <ColorInput label="Texto Footer" name="corFooterTexto" />
          </div>

          <hr />

          <h3 className="text-lg font-medium">Tipografia</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="form-group">
              <Label>Fonte Padrão</Label>
              <Select value={settings.fontFamilia} onValueChange={(val) => handleSelectChange('fontFamilia', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter, system-ui, sans-serif">Moderna (Inter)</SelectItem>
                  <SelectItem value="'Times New Roman', Times, serif">Clássica (Serif)</SelectItem>
                  <SelectItem value="'Courier New', Courier, monospace">Mono (Código)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="form-group">
              <Label>Tam. Texto Base (px)</Label>
              <Input type="number" name="fontSizeBase" value={parseInt(settings.fontSizeBase) || 16} onChange={e => handleChange('fontSizeBase', `${e.target.value}px`)} />
            </div>
            <div className="form-group">
              <Label>Tam. Título H1 (rem)</Label>
              <Input type="number" step="0.1" name="fontSizeH1" value={parseFloat(settings.fontSizeH1) || 2.25} onChange={e => handleChange('fontSizeH1', `${e.target.value}rem`)} />
            </div>
            <div className="form-group">
              <Label>Tam. Título H2 (rem)</Label>
              <Input type="number" step="0.1" name="fontSizeH2" value={parseFloat(settings.fontSizeH2) || 1.5} onChange={e => handleChange('fontSizeH2', `${e.target.value}rem`)} />
            </div>
          </div>

          <Button onClick={handleSave} className="btn btn-primary mt-6">Salvar Alterações</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminThemePage;