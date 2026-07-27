import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

export const DiagnosisModule: React.FC = () => {
  const { diagnosisQuestions, updateQuestionScore, indices } = useApp();
  const [activeArea, setActiveArea] = useState('Governança');
  const [searchQuery, setSearchQuery] = useState('');

  const areas = [
    'Governança',
    'Financeiro',
    'Produção',
    'Compras',
    'Estoque',
    'Máquinas',
    'Patrimônio',
    'Pessoas',
    'Planejamento',
    'Comercialização',
    'Tecnologia'
  ];

  // Filtra as perguntas pela área e termo de busca
  const filteredQuestions = diagnosisQuestions.filter(q => 
    q.area === activeArea && 
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcula a nota média da área atual
  const activeAreaIndex = indices[
    activeArea === 'Governança' ? 'governance' :
    activeArea === 'Financeiro' ? 'financial' :
    ['Produção', 'Máquinas', 'Estoque'].includes(activeArea) ? 'operational' :
    ['Comercialização', 'Compras'].includes(activeArea) ? 'commercial' :
    activeArea === 'Patrimônio' ? 'patrimonial' : 'administrative'
  ];

  const scoreLabels = [
    { score: 0, text: 'Não Existe', color: 'bg-red-500 hover:bg-red-600', textCol: 'text-red-600 dark:text-red-400' },
    { score: 1, text: 'Existe Parcialmente', color: 'bg-orange-500 hover:bg-orange-600', textCol: 'text-orange-600 dark:text-orange-400' },
    { score: 2, text: 'Existe', color: 'bg-amber-500 hover:bg-amber-600', textCol: 'text-amber-600 dark:text-amber-400' },
    { score: 3, text: 'Existe e Funciona Bem', color: 'bg-blue-500 hover:bg-blue-600', textCol: 'text-blue-600 dark:text-blue-400' },
    { score: 4, text: 'Excelente', color: 'bg-emerald-500 hover:bg-emerald-600', textCol: 'text-emerald-600 dark:text-emerald-400' }
  ];

  // Dados para o mini-gráfico de radar da maturidade geral
  const radarData = [
    { subject: 'Gov', valor: indices.governance },
    { subject: 'Fin', valor: indices.financial },
    { subject: 'Oper', valor: indices.operational },
    { subject: 'Com', valor: indices.commercial },
    { subject: 'Patr', valor: indices.patrimonial },
    { subject: 'Adm', valor: indices.administrative }
  ];

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">
            Diagnóstico de Controladoria Estratégica
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Responda às perguntas com notas de 0 a 4 para medir a governança e gerar planos de ação automáticos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="text-left">
              <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Índice Geral (IGR)</span>
              <span className="text-xl font-black text-brand-600 dark:text-brand-400">{indices.overall}%</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-500/20">
              {indices.overall >= 75 ? 'A' : indices.overall >= 50 ? 'B' : 'C'}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Menu de Áreas e Gráfico de Radar de Maturidade */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu de Áreas */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Áreas do Diagnóstico</h3>
          <div className="glass-panel rounded-xl overflow-hidden p-1 space-y-1">
            {areas.map(area => {
              const isActive = activeArea === area;
              // Filtra quantidade de perguntas e respondidas da área
              const totalQ = diagnosisQuestions.filter(q => q.area === area).length;
              const answeredQ = diagnosisQuestions.filter(q => q.area === area && q.score > 0).length;
              
              return (
                <button
                  key={area}
                  onClick={() => {
                    setActiveArea(area);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                    isActive 
                      ? 'bg-brand-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="truncate">{area}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-4xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-brand-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {answeredQ}/{totalQ}
                    </span>
                    <ChevronRight size={12} className="opacity-60" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quadro Central do Índice da Área e Radar Chart */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Maturidade da Área */}
          <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-brand-600 dark:text-brand-400" size={18} />
                <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider">Maturidade da Área</span>
              </div>
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-2">{activeArea}</h2>
              <p className="text-2xs text-slate-400 dark:text-slate-500 mt-1">
                Representação de processos, regras e conformidade de negócios na atividade rural.
              </p>
            </div>
            
            <div className="mt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-800 dark:text-white">{activeAreaIndex}%</span>
                <span className="text-2xs text-slate-400">de maturidade</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-brand-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${activeAreaIndex}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gráfico de Radar de Apoio */}
          <div className="glass-panel p-4 rounded-xl md:col-span-2 flex items-center justify-center h-44">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar name="IGR" dataKey="valor" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="text-left text-2xs space-y-1 pl-2 border-l border-slate-100 dark:border-slate-800 ml-2 flex-shrink-0">
              <div className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-4xs">Índices de Diagnóstico</div>
              <div>Gov: <span className="font-bold text-slate-800 dark:text-slate-100">{indices.governance}%</span></div>
              <div>Fin: <span className="font-bold text-slate-800 dark:text-slate-100">{indices.financial}%</span></div>
              <div>Oper: <span className="font-bold text-slate-800 dark:text-slate-100">{indices.operational}%</span></div>
              <div>Patr: <span className="font-bold text-slate-800 dark:text-slate-100">{indices.patrimonial}%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Caixa de Busca e Lista de Perguntas */}
      <div className="glass-panel rounded-xl overflow-hidden">
        {/* Barra de Filtros Interna */}
        <div className="p-4 border-b border-slate-200/50 dark:border-dark-border/50 bg-slate-50/40 dark:bg-slate-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Zap size={14} className="text-brand-600" />
            Perguntas de Conformidade ({filteredQuestions.length})
          </h4>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar pergunta específica..."
            className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-2xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-700 dark:text-slate-200"
          />
        </div>

        {/* Tabela de Diagnóstico */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-dark-border/50 text-slate-400 font-bold uppercase tracking-wider text-4xs">
                <th className="py-3 px-4 w-12 text-center">ID</th>
                <th className="py-3 px-4">Critério de Avaliação Estratégica</th>
                <th className="py-3 px-4 w-44">Nota Selecionada</th>
                <th className="py-3 px-4 w-64 text-center">Definir Nível de Maturidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-dark-border/50">
              {filteredQuestions.map(q => {
                const activeLabel = scoreLabels.find(l => l.score === q.score);
                
                return (
                  <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-400 text-center">{q.id}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200 font-medium">
                      {q.question}
                      {q.score <= 1 && (
                        <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-4xs font-bold">
                          <AlertCircle size={8} /> Plano de Ação Ativo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-2xs font-semibold ${activeLabel?.textCol} bg-slate-100 dark:bg-slate-800`}>
                        {q.score} - {activeLabel?.text}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {scoreLabels.map(opt => (
                          <button
                            key={opt.score}
                            onClick={() => updateQuestionScore(q.id, opt.score)}
                            className={`w-6 h-6 rounded flex items-center justify-center text-2xs font-extrabold transition-all border ${
                              q.score === opt.score
                                ? `${opt.color} text-white border-transparent scale-105 shadow-sm`
                                : 'bg-transparent text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title={opt.text}
                          >
                            {opt.score}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
