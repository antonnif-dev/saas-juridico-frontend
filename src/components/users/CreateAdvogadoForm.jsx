import React, { useState } from 'react';
import apiClient from '@/services/apiClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from 'lucide-react';

function CreateAdvogadoForm({ onUserCreated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado unificado para facilitar o envio do endereço
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    telefone: '',
    oab: '',
    dataNascimento: '',
    estadoCivil: '',
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    }
  });

  // Handler genérico (funciona para campos normais e aninhados como endereço)
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: { ...prev.endereco, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handler específico para o Select do Shadcn
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Busca CEP automática
  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: {
              ...prev.endereco,
              rua: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf,
              cep: cep
            }
          }));
        }
      } catch (error) { console.error("Erro CEP"); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await apiClient.post('/users/advogado', formData);
      alert('Advogado criado com sucesso!');
      if(onUserCreated) onUserCreated();
      
      // Limpa formulário
      setFormData({
        name: '', email: '', password: '', telefone: '', oab: '', dataNascimento: '', estadoCivil: '',
        endereco: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao criar advogado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email de Acesso</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha Provisória</Label>
          <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="oab">Número da OAB</Label>
          <Input id="oab" name="oab" placeholder="UF000000" value={formData.oab} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone / WhatsApp</Label>
          <Input id="telefone" name="telefone" placeholder="(00) 00000-0000" value={formData.telefone} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataNascimento">Data de Nascimento</Label>
          <Input id="dataNascimento" name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label>Estado Civil</Label>
          <Select name="estadoCivil" value={formData.estadoCivil} onValueChange={(val) => handleSelectChange('estadoCivil', val)}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
              <SelectItem value="Casado(a)">Casado(a)</SelectItem>
              <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
              <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
              <SelectItem value="União Estável">União Estável</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Seção de Endereço */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
        <p className="font-medium text-sm text-slate-700">Endereço</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="relative">
            <Input 
              name="endereco.cep" 
              placeholder="CEP" 
              value={formData.endereco.cep} 
              onChange={handleChange} 
              onBlur={handleCepBlur} 
            />
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
          </div>
          <div className="col-span-2">
            <Input name="endereco.rua" placeholder="Rua" value={formData.endereco.rua} onChange={handleChange} />
          </div>
          <Input name="endereco.numero" placeholder="Nº" value={formData.endereco.numero} onChange={handleChange} />
          <div className="col-span-2">
            <Input name="endereco.bairro" placeholder="Bairro" value={formData.endereco.bairro} onChange={handleChange} />
          </div>
          <Input name="endereco.cidade" placeholder="Cidade" value={formData.endereco.cidade} onChange={handleChange} />
          <Input name="endereco.estado" placeholder="UF" value={formData.endereco.estado} onChange={handleChange} />
          <Input name="endereco.complemento" placeholder="Complemento" className="col-span-3" value={formData.endereco.complemento} onChange={handleChange} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}
      
      <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
        {isLoading ? 'Salvando...' : 'Cadastrar Advogado'}
      </Button>
    </form>
  );
}

export default CreateAdvogadoForm;