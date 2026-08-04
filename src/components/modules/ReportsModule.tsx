import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../lib/roles';
import { Printer, Download, Sparkles, FileText } from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { indices, financialTransactions, farmFilter } = useApp();
  const { profile } = useAuth();
  const [selectedReport, setSelectedReport] = useState<'executivo' | 'financeiro' | 'diagnostico'>('executivo');
  const today = new Date().toLocaleDateString('pt-BR');
  const responsibleName = profile?.fullName ?? '-';
  const responsibleRole = profile ? ROLE_LABELS[profile.role] : '';

  const handlePrint = () => {
    window.print();
  };

  // Usa o diálogo de impressão do navegador (permite "Salvar como PDF") —
  // não gera um PDF de verdade no servidor, mas é uma exportação real.
  const handleDownload = () => {
    window.print();
  };

  const nivelLabel = (score: number) => score >= 75 ? 'Nível Excelente' : score >= 50 ? 'Nível Elevado' : score >= 25 ? 'Nível Médio' : 'Nível Crítico';

  const indexEntries: [string, number][] = [
    ['Governança', indices.governance], ['Financeiro', indices.financial], ['Operacional', indices.operational],
    ['Comercial', indices.commercial], ['Patrimonial', indices.patrimonial], ['Administrativo', indices.administrative],
  ];
  const lowestIndexLabel = indexEntries.reduce((lowest, entry) => entry[1] < lowest[1] ? entry : lowest, indexEntries[0])[0];

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">
            Relatórios e Documentos Gerenciais
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gere laudos de diagnóstico, relatórios de DRE e planos de ação formatados para impressão ou exportação.
          </p>
        </div>
        
        {/* Ações */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors text-slate-700 dark:text-slate-300"
          >
            <Printer size={14} /> Imprimir Relatório
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} /> Baixar PDF
          </button>
        </div>
      </div>

      {/* Grid Menu Relatórios e Visualização */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Seleção do Tipo de Relatório */}
        <div className="lg:col-span-1 space-y-2">
          <span className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 block">Tipos de Laudo</span>
          <div className="glass-panel p-1 rounded-xl space-y-1">
            <button
              onClick={() => setSelectedReport('executivo')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 ${
                selectedReport === 'executivo' 
                  ? 'bg-brand-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <FileText size={16} /> Relatório Executivo
            </button>

            <button
              onClick={() => setSelectedReport('financeiro')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 ${
                selectedReport === 'financeiro' 
                  ? 'bg-brand-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <FileText size={16} /> Relatório Financeiro
            </button>

            <button
              onClick={() => setSelectedReport('diagnostico')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 ${
                selectedReport === 'diagnostico' 
                  ? 'bg-brand-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <FileText size={16} /> Diagnóstico da Fazenda
            </button>
          </div>
        </div>

        {/* Pré-visualização do Relatório Formatado - Pronto para window.print */}
        <div id="printable-report-area" className="lg:col-span-3 glass-panel p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border shadow-md space-y-6 text-slate-800 dark:text-slate-200 font-sans">
          
          {/* Cabeçalho do Laudo */}
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase font-display tracking-tight">Gea • Controladoria Agropecuária</h2>
              <p className="text-3xs text-slate-400 font-semibold mt-0.5">LAUDO ESTRATÉGICO DE COMPLIANCE E MATURIDADE ORGANIZACIONAL</p>
            </div>
            <div className="text-right text-3xs text-slate-400">
              <div>Fazenda Ativa: **{farmFilter}**</div>
              <div>Data de Emissão: {today}</div>
              <div>Responsável: {responsibleName}{responsibleRole ? ` (${responsibleRole})` : ''}</div>
            </div>
          </div>

          {/* Relatório Executivo */}
          {selectedReport === 'executivo' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-500" />
                Resumo Executivo da Operação
              </h3>
              <p>
                Este documento apresenta a análise de conformidade de processos corporativos da propriedade rural **{farmFilter}**.
                O Índice de Gestão Rural (IGR) calculado situa-se em **{indices.overall}%**, refletindo uma maturidade de gestão considerada **{nivelLabel(indices.overall).replace('Nível ', '').toLowerCase()}**.
                A área com menor pontuação atualmente é **{lowestIndexLabel}**, recomenda-se priorizar ações nela.
              </p>
              
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-2">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">Resumo dos Índices (%)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                  <div>Governança: <span className="font-bold text-slate-800 dark:text-white">{indices.governance}%</span></div>
                  <div>Financeiro: <span className="font-bold text-slate-800 dark:text-white">{indices.financial}%</span></div>
                  <div>Operacional: <span className="font-bold text-slate-800 dark:text-white">{indices.operational}%</span></div>
                  <div>Comercial: <span className="font-bold text-slate-800 dark:text-white">{indices.commercial}%</span></div>
                  <div>Patrimonial: <span className="font-bold text-slate-800 dark:text-white">{indices.patrimonial}%</span></div>
                  <div>Administrativo: <span className="font-bold text-slate-800 dark:text-white">{indices.administrative}%</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Relatório Financeiro */}
          {selectedReport === 'financeiro' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Relatório Consolidado de Custos e Faturamento</h3>
              <p>
                Os resultados de caixa consolidados para o período indicam receitas brutas de R$ {financialTransactions.filter(t => t.type === 'receita').reduce((s,t)=>s+t.value, 0).toLocaleString('pt-BR')}
                {' '}e despesas totais de R$ {financialTransactions.filter(t => t.type === 'despesa').reduce((s,t)=>s+t.value, 0).toLocaleString('pt-BR')}, com base em {financialTransactions.length} lançamento(s) cadastrado(s).
              </p>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-2xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 font-bold text-slate-400">
                      <th className="py-2">Descrição</th>
                      <th className="py-2">Categoria</th>
                      <th className="py-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialTransactions.slice(0, 4).map(t => (
                      <tr key={t.uuid} className="border-b border-slate-100 dark:border-slate-800/40">
                        <td className="py-2 font-medium">{t.description}</td>
                        <td className="py-2 text-slate-500">{t.category}</td>
                        <td className="py-2 text-right font-bold">R$ {t.value.toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Diagnóstico da Fazenda */}
          {selectedReport === 'diagnostico' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Laudo Geral de Diagnóstico Estrutural</h3>
              <p>
                Mapeamento das conformidades administrativas por área estratégica do Gea.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                  <span>Conformidade Societária e Governança:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{indices.governance}% ({nivelLabel(indices.governance)})</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                  <span>Controles e Fluxo de Caixa Financeiro:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{indices.financial}% ({nivelLabel(indices.financial)})</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                  <span>Rendimento de Máquinas e Lavouras:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{indices.operational}% ({nivelLabel(indices.operational)})</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                  <span>Regularidade e Inventário do Patrimônio:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{indices.patrimonial}% ({nivelLabel(indices.patrimonial)})</span>
                </div>
              </div>
            </div>
          )}

          {/* Rodapé de Assinatura */}
          <div className="pt-12 mt-12 border-t border-slate-100 dark:border-slate-800 flex justify-between text-3xs text-slate-400">
            <div className="text-center w-48 border-t border-slate-300 dark:border-slate-700 pt-1">
              {responsibleName}
              <div className="font-semibold text-4xs">{responsibleRole}</div>
            </div>
            <div className="text-center w-48 border-t border-slate-300 dark:border-slate-700 pt-1">
              Diretoria Operacional
              <div className="font-semibold text-4xs">Produtor / Gestor Executivo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
