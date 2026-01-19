import React from "react";

export default function ReportModalContent({ processo, cliente }) {
  if (!processo) return null;

  const formatDate = (value) => {
    if (!value) return "N/D";
    const d = value._seconds ? new Date(value._seconds * 1000) : new Date(value);
    return d.toLocaleString("pt-BR");
  };

  const formatMoney = (value) => {
    if (!value) return "R$ 0,00";
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const movimentacoes = processo.movimentacoes || [];
  const transacoes = processo.transactions || [];
  const documentos = processo.documentos || [];

  const receitas = transacoes.filter(
    (t) => t.tipo !== "despesa" && (t.categoria === "honorarios" || t.categoria === "pagamento")
  );

  const despesas = transacoes.filter(
    (t) => t.tipo === "despesa" || t.categoria === "custas"
  );

  const totalReceitas = receitas.reduce((sum, t) => sum + Number(t.valor || 0), 0);
  const totalDespesas = despesas.reduce((sum, t) => sum + Number(t.valor || 0), 0);

  // Timeline unificada
  const timeline = [
    {
      tipo: "processo",
      titulo: "Processo criado",
      data: processo.createdAt,
      descricao: processo.titulo,
    },

    ...movimentacoes.map((m) => ({
      tipo: "movimentacao",
      titulo: "Movimentação",
      data: m.data,
      descricao: m.descricao,
    })),

    ...documentos.map((d) => ({
      tipo: "documento",
      titulo: "Documento anexado",
      data: d.enviadoEm,
      descricao: d.nome,
      url: d.url,
    })),

    ...transacoes.map((t) => ({
      tipo: "financeiro",
      titulo: "Transação financeira",
      data: t.createdAt || t.data,
      descricao: `${t.titulo || t.descricao || "Transação"} — ${formatMoney(t.valor)}`,
    })),

    processo.dataEncerramento && {
      tipo: "processo",
      titulo: "Processo encerrado",
      data: processo.dataEncerramento,
      descricao: processo.status,
    },
  ]
    .filter(Boolean)
    .sort((a, b) => {
      const da = a.data?._seconds ? a.data._seconds : new Date(a.data).getTime();
      const db = b.data?._seconds ? b.data._seconds : new Date(b.data).getTime();
      return da - db;
    });

  return (
    <div className="space-y-8">

      {/* ================= FICHA TÉCNICA ================= */}
      <section>
        <h2 className="text-xl font-bold mb-3">Ficha Técnica do Processo</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><strong>Título:</strong> {processo.titulo}</div>
          <div><strong>Número:</strong> {processo.numeroProcesso || "N/D"}</div>
          <div><strong>Área:</strong> {processo.area || "N/D"}</div>
          <div><strong>Comarca:</strong> {processo.comarca || "N/D"}</div>
          <div><strong>Instância:</strong> {processo.instancia || "N/D"}</div>
          <div><strong>Status:</strong> {processo.status}</div>
          <div><strong>Criado em:</strong> {formatDate(processo.createdAt)}</div>
          <div><strong>Encerrado em:</strong> {formatDate(processo.dataEncerramento)}</div>
        </div>
      </section>

      {/* ================= CLIENTE ================= */}
      <section>
        <h2 className="text-xl font-bold mb-3">Cliente</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><strong>Nome:</strong> {cliente?.name}</div>
          <div><strong>CPF:</strong> {cliente?.cpf || "N/D"}</div>
          <div><strong>Email:</strong> {cliente?.email}</div>
          <div><strong>Telefone:</strong> {cliente?.phone || "N/D"}</div>
        </div>
      </section>

      {/* ================= CONTEXTO E ESTRATÉGIA ================= */}
      <section>
        <h2 className="text-xl font-bold mb-3">Contexto e Estratégia</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><strong>Assunto:</strong> {processo.assuntoEspecifico || "N/D"}</div>
          <div><strong>Partes envolvidas:</strong> {processo.partesEnvolvidas || "N/D"}</div>
          <div><strong>Localidade:</strong> {processo.localidade || "N/D"}</div>
          <div><strong>Complexidade:</strong> {processo.complexidade || "N/D"}</div>
          <div><strong>Urgência:</strong> {processo.urgencia || "N/D"}</div>
          <div><strong>Probabilidade:</strong> {processo.probabilidade || "N/D"}</div>
          <div><strong>Valor da causa:</strong> {formatMoney(processo.valorCausa)}</div>
          <div><strong>Origem:</strong> {processo.origem || "N/D"}</div>
        </div>
      </section>

      {/* ================= FINANCEIRO ================= */}
      <section>
        <h2 className="text-xl font-bold mb-3">Financeiro do Caso</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><strong>Valor acordado:</strong> {formatMoney(processo.valorAcordado)}</div>
          <div><strong>Total recebido:</strong> {formatMoney(totalReceitas)}</div>
          <div><strong>Total despesas:</strong> {formatMoney(totalDespesas)}</div>
          <div><strong>Resultado final:</strong> {formatMoney(totalReceitas - totalDespesas)}</div>
        </div>
      </section>

      {/* ================= DOCUMENTOS ================= */}
      <section>
        <h2 className="text-xl font-bold mb-3">Documentos do Processo</h2>
        {documentos.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum documento anexado.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {documentos.map((doc, idx) => (
              <li key={idx} className="border p-2 rounded">
                <div><strong>Arquivo:</strong> {doc.nome}</div>
                <div><strong>Tipo:</strong> {doc.tipo}</div>
                <div><strong>Enviado em:</strong> {formatDate(doc.enviadoEm)}</div>
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  Abrir documento
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ================= TIMELINE ================= */}
      <section>
        <h2 className="text-xl font-bold mb-3">Linha do Tempo Jurídica</h2>
        <ul className="space-y-2 text-sm">
          {timeline.map((item, idx) => (
            <li key={idx} className="border-l-4 border-blue-500 pl-3 py-2">
              <div className="font-semibold">{item.titulo}</div>
              <div className="text-slate-500 text-xs">{formatDate(item.data)}</div>
              <div>{item.descricao}</div>
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  Abrir arquivo
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ================= CONCLUSÃO ================= */}
      <section>
        <h2 className="text-xl font-bold mb-3">Conclusão do Escritório</h2>
        <p className="text-sm text-slate-600 italic">
          Este campo será utilizado futuramente para geração automática de relatórios com IA.
        </p>
      </section>
    </div>
  );
}
