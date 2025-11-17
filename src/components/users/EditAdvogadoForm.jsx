import React, { useEffect, useState } from "react";
import apiClient from "@/services/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function EditAdvogadoForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 📌 Carrega dados do usuário logado
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const response = await apiClient.get("/users/me");
        setFormData({
          name: response.data.name,
          email: response.data.email,
          password: "", // senha não vem do backend por segurança
        });
      } catch (err) {
        setError("Falha ao carregar dados do perfil.");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  // Atualiza inputs dinamicamente
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  // 📌 Salva alterações
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
      };

      // Envia somente se usuário tiver digitado senha nova
      if (formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      await apiClient.put("/users/me", payload);

      alert("Perfil atualizado com sucesso!");
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Meu Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha (opcional)</Label>
            <Input
              id="password"
              type="password"
              placeholder="Deixe vazio para não alterar"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default EditAdvogadoForm;
