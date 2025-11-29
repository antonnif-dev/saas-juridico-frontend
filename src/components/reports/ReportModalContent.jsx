import React from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FileText, DollarSign, Archive, User, AlertCircle } from 'lucide-react';

const ReportModalContent = ({ processo, cliente }) => {
  if (!processo) return <p className="p-4 text-center">Nenhum processo selecionado.</p>;

  // --- Helpers de Formatação ---
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(value) || 0);
  const formatDate = (date) => date ? format(new Date(date._seconds * 1000), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A';

  // --- CONTEÚDO DO RELATÓRIO ESTRUTURADO ---
  const reportSections = [
    { 
      title: "Resumo Geral e Arquivamento",
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      details: [
        { label: "Título do Caso", value: processo.titulo },
        { label: "Número do Processo", value: processo.numeroProcesso || "Não protocolado" },
        { label: "Área Jurídica", value: processo.area },
        { label: "Status Final", value: processo.status },
        { label: "Data de Início", value: formatDate(processo.createdAt) },
        { label: "Valor Acordado", value: formatCurrency(processo.valorAcordado) },
      ]
    },
    {
      title: "Detalhes do Cliente",
      icon: <User className="w-5 h-5 text-slate-600" />,
      details: [
        { label: "Nome", value: cliente?.name || 'Não disponível' },
        { label: "E-mail", value: cliente?.email || 'Não disponível' },
        { label: "CPF/CNPJ", value: cliente?.cpfCnpj || 'Não disponível' },
        { label: "Telefone", value: cliente?.phone || 'Não disponível' },
      ]
    },
    {
      title: "Dados da Triagem e Descrição",
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      details: [
        { label: "Urgência Inicial", value: processo.urgencia || 'Média' },
        { label: "Resumo", value: processo.descricao, multiline: true },
        { label: "Assunto Específico", value: processo.assuntoEspecifico || 'Geral' },
      ]
    },
    {
      title: "Encerramento e Metadados",
      icon: <Archive className="w-5 h-5 text-slate-400" />,
      details: [
        { label: "Advogado Responsável", value: processo.responsavelUid || 'ID Indefinido' },
        { label: "Localidade", value: processo.localidade || 'Não informada' },
        // Aqui entrariam a linha do tempo (movimentações), mas exigiria busca.
        { label: "OBS", value: "Este relatório não inclui a linha do tempo completa (Movimentações) que seria buscada no Backend." },
      ]
    }
  ];

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {reportSections.map((section, index) => (
        <div key={index} className="border-b pb-4">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-800">
            {section.icon} {section.title}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {section.details.map((item, i) => (
              <div key={i} className={item.multiline ? "col-span-2 mt-2" : "space-y-0"}>
                <p className="text-xs text-slate-500 uppercase">{item.label}</p>
                <p className="font-medium text-slate-800 whitespace-pre-wrap">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportModalContent;