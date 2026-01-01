import React, { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function EditAdvogadoForm({ user, onEditComplete, onCancel }) {
  
  // Estado inicial com TODOS os campos do banco
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cpfCnpj: "",
    oab: "",
    phone: "",
    dataNascimento: "",
    estadoCivil: "",
    endereco: {
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: ""
    }
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 📌 Preenche o formulário com os dados do usuário recebido
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "", // Senha sempre vazia
        cpfCnpj: user.cpfCnpj || "",
        oab: user.oab || "",
        phone: user.phone || "", // Note que no banco salvamos como 'phone'
        dataNascimento: user.dataNascimento || "",
        estadoCivil: user.estadoCivil || "",
        // Garante que endereço seja um objeto, mesmo que vazio
        endereco: user.endereco || { cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" }
      });
    }
  }, [user]);

  // Atualiza inputs (Lida com campos normais e aninhados de endereço)
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

  // Handler para Selects do Shadcn
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Busca CEP (Opcional na edição, mas útil)
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

  // 📌 Salva alterações
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Prepara o payload removendo senha se estiver vazia
      const payload = { ...formData };
      if (!payload.password || payload.password.trim() === "") {
        delete payload.password;
      } else if (payload.password.length < 6) {
        throw new Error("A senha deve ter no mínimo 6 caracteres.");
      }

      await apiClient.put(`/users/advogados/${user.uid}`, payload);

      alert("Perfil atualizado com sucesso!");
      if (onEditComplete) onEditComplete(); 

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Erro ao atualizar perfil.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full border-0 shadow-none"> 
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* DADOS PESSOAIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              <Input id="cpfCnpj" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oab">OAB</Label>
              <Input id="oab" name="oab" value={formData.oab} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
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

          <hr className="border-gray-100 my-2" />

          {/* ENDEREÇO */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-slate-700">Endereço</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">CEP</Label>
                <Input name="endereco.cep" value={formData.endereco.cep} onChange={handleChange} onBlur={handleCepBlur} />
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

          <hr className="border-gray-100 my-2" />

          {/* SEGURANÇA */}
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha (opcional)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Deixe vazio para não alterar"
              value={formData.password}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres.</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-4 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={onCancel} 
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90">
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default EditAdvogadoForm;