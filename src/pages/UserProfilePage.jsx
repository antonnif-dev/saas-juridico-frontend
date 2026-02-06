import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Camera, Search } from 'lucide-react';

function validatePassword(pw) {
  const missing = [];
  if (!pw || pw.length < 8) missing.push("mínimo 8 caracteres");
  if (!/[A-Z]/.test(pw)) missing.push("1 letra maiúscula");
  if (!/[a-z]/.test(pw)) missing.push("1 letra minúscula");
  if (!/[0-9]/.test(pw)) missing.push("1 número");
  if (!/[^A-Za-z0-9]/.test(pw)) missing.push("1 caractere especial");
  return missing;
}

function UserProfilePage() {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Estado completo com todos os campos
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', // Nova senha (opcional)
    phone: '',
    role: '',
    tipoPessoa: 'Física',
    cpfCnpj: '',
    oab: '',
    dataNascimento: '',
    estadoCivil: '',
    endereco: {
      cep: "", rua: "", numero: "", complemento: "",
      bairro: "", cidade: "", estado: ""
    }
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data } = await apiClient.get('/users/me');
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          tipoPessoa: data.tipoPessoa || 'Física',
          cpfCnpj: data.cpfCnpj || '',
          role: data.role || '',
          oab: data.oab || '',
          dataNascimento: data.dataNascimento || '',
          estadoCivil: data.estadoCivil || '',
          // Garante objeto de endereço
          endereco: data.endereco || { cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" },
          password: '' // Senha sempre vazia
        });
        setPhotoPreview(data.photoUrl);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    };
    loadUserData();
  }, []);

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

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);
    setUploading(true);

    const data = new FormData();
    data.append('photo', file);

    try {
      const response = await apiClient.post('/users/me/photo', data);

      if (response.data && response.data.photoUrl) {
        setPhotoPreview(response.data.photoUrl);
        alert("Foto de perfil atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao enviar foto.");
      setPhotoPreview(formData.photoUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        cpfCnpj: formData.cpfCnpj,
        phone: formData.phone,
        oab: formData.oab,
        dataNascimento: formData.dataNascimento,
        estadoCivil: formData.estadoCivil,
        tipoPessoa: formData.tipoPessoa,

        endereco: {
          cep: formData.endereco?.cep || '',
          rua: formData.endereco?.rua || '',
          numero: formData.endereco?.numero || '',
          complemento: formData.endereco?.complemento || '',
          bairro: formData.endereco?.bairro || '',
          cidade: formData.endereco?.cidade || '',
          estado: formData.endereco?.estado || '',
        }
      };

      await apiClient.put('/users/me', dataToSend);

      if (formData.password) {
        const missing = validatePassword(formData.password);
        if (missing.length) {
          alert(`Senha fraca. Falta: ${missing.join(", ")}`);
          return;
        }

        try {
          await currentUser.updatePassword(formData.password);
          alert("Senha atualizada com sucesso!");
        } catch (err) {
          if (err.code === "auth/requires-recent-login") {
            alert("Por segurança, faça login novamente para trocar a senha.");
          } else {
            throw err;
          }
        }
      }

      alert("Perfil atualizado com sucesso!");
      setFormData(prev => ({ ...prev, password: '' }));

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || "Erro ao atualizar perfil.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* COLUNA DA FOTO */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="pt-6 flex flex-col items-center">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              <div className="h-32 w-32 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm">
                <Camera className="w-6 h-6" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <p className="mt-4 font-medium text-slate-900">{formData.name}</p>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">{formData.role}</p>
            {uploading && <p className="text-xs text-blue-500 mt-2 animate-pulse">Enviando foto...</p>}
          </CardContent>
        </Card>

        {/* COLUNA DO FORMULÁRIO */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Mantenha seus dados atualizados para o escritório.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Dados Cadastrais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>E-mail (Login)</Label>
                <Input name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>CPF/CNPJ</Label>
                <Input name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} placeholder="Apenas números" />
              </div>
              <div className="space-y-2">
                <Label>OAB</Label>
                <Input name="oab" value={formData.oab} onChange={handleChange} placeholder="UF000000" />
              </div>
              <div className="space-y-2">
                <Label>Telefone/WhatsApp</Label>
                <Input name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Estado Civil</Label>
                <Select value={formData.estadoCivil} onValueChange={(val) => handleSelectChange('estadoCivil', val)}>
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

            <hr className="border-slate-100" />

            {/* Endereço */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-slate-700">Endereço</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 relative">
                  <Label className="text-xs">CEP</Label>
                  <Input name="endereco.cep" value={formData.endereco.cep} onChange={handleChange} onBlur={handleCepBlur} />
                  <Search className="w-3 h-3 absolute right-2 top-8 text-slate-400" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Rua</Label>
                  <Input name="endereco.rua" value={formData.endereco.rua} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Número</Label>
                  <Input name="endereco.numero" value={formData.endereco.numero} onChange={handleChange} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Bairro</Label>
                  <Input name="endereco.bairro" value={formData.endereco.bairro} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cidade</Label>
                  <Input name="endereco.cidade" value={formData.endereco.cidade} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">UF</Label>
                  <Input name="endereco.estado" value={formData.endereco.estado} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Complemento</Label>
                  <Input name="endereco.complemento" value={formData.endereco.complemento} onChange={handleChange} />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Alteração de Senha */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <Label htmlFor="password">Alterar Senha</Label>
              <Input
                id="password"
                type="password"
                className="mt-1 bg-white"
                placeholder="Digite apenas se quiser alterar a senha"
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
              <p className="text-xs text-slate-500 mt-1">Mínimo de 6 caracteres. Deixe vazio para manter a atual.</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 px-8" disabled={loading}>
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