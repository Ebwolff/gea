import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { FinancialTransaction } from '../../context/AppContext';
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  FileText, 
  DollarSign, 
  Percent,
  Trash2
} from 'lucide-react';
import { useToast } from '../Toast';

export const FinancialModule: React.FC = () => {
  const { financialTransactions, addTransaction, removeTransaction, farmFilter, farms } = useApp();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'cashflow' | 'dre' | 'balance'>('cashflow');
  
  // Estados do formulário de novo lançamento
  const [showAddForm, setShowAddForm] = useState(false);
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'receita' | 'despesa'>('despesa');
  const [val, setVal] = useState('');
  const [bank, setBank] = useState('Banco do Brasil');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txCategory, setTxCategory] = useState('Outros Operacionais');
  const [txCostCenter, setTxCostCenter] = useState('Geral');
  const [txFarm, setTxFarm] = useState(farmFilter !== 'Todas' ? farmFilter : (farms[0]?.name ?? ''));
  const [txStatus, setTxStatus] = useState<'pago' | 'pendente'>('pago');

  // Filtragem
  const isAll = farmFilter === 'Todas';
  const transactions = financialTransactions.filter(t => isAll || t.farm === farmFilter);

  const receitas = transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.value, 0);
  const despesas = transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.value, 0);
  const saldo = receitas - despesas;

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !val) return;
    
    const newTx: Omit<FinancialTransaction, 'uuid'> = {
      date: txDate,
      description: desc,
      type,
      category: txCategory,
      costCenter: txCostCenter,
      farm: txFarm,
      value: parseFloat(val),
      account: bank,
      status: txStatus
    };

    addTransaction(newTx);
    showToast(type === 'receita' ? 'Receita lançada com sucesso!' : 'Despesa lançada com sucesso!');
    setDesc('');
    setVal('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  // Itens fixados para o DRE Simplificado
  // Receita Bruta = receitas
  // Custos Variáveis (Insumos, sementes) = 48% das despesas
  // Margem de Contribuição = Receita - Custos Variáveis
  // Despesas Operacionais (mão de obra, combustíveis, manutenção) = 37% das despesas
  // EBITDA = Margem Contribuição - Despesas Operacionais
  // Depreciação (simulada) = R$ 35.000
  // Resultado Líquido = EBITDA - Depreciação - Outras despesas financeiras (15% das despesas)
  const custoVariavel = despesas * 0.48;
  const margemContr = receitas - custoVariavel;
  const despesasOper = despesas * 0.37;
  const ebitda = margemContr - despesasOper;
  const depreciacao = 35000;
  const despesaFinanceira = despesas * 0.15;
  const lucroAntesImpostos = ebitda - depreciacao - despesaFinanceira;
  const irpj = lucroAntesImpostos > 0 ? lucroAntesImpostos * 0.08 : 0; // Alíquota rural simplificada
  const lucroLiquido = lucroAntesImpostos - irpj;

  // Porcentagens para análise vertical do DRE (em relação à Receita Bruta)
  const calcAV = (val: number) => {
    if (receitas === 0) return '0%';
    return `${Math.round((val / receitas) * 100)}%`;
  };

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">
            Gestão Financeira e Controladoria
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe o fluxo de caixa gerencial, DRE com análise vertical e balancetes da fazenda.
          </p>
        </div>
        
        {/* Abas Financeiras */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab('cashflow')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'cashflow' 
                ? 'bg-white dark:bg-dark-card text-brand-600 dark:text-brand-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Fluxo de Caixa
          </button>
          <button
            onClick={() => setActiveSubTab('dre')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'dre' 
                ? 'bg-white dark:bg-dark-card text-brand-600 dark:text-brand-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Demonstrativo (DRE)
          </button>
          <button
            onClick={() => setActiveSubTab('balance')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'balance' 
                ? 'bg-white dark:bg-dark-card text-brand-600 dark:text-brand-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Balanço Patrimonial
          </button>
        </div>
      </div>

      {/* Seção Fluxo de Caixa */}
      {activeSubTab === 'cashflow' && (
        <div className="space-y-6">
          {/* Cards Rápidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-emerald-500">
              <div>
                <span className="text-3xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Receitas Acumuladas</span>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1">R$ {receitas.toLocaleString('pt-BR')}</h3>
              </div>
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><ArrowUpCircle size={20} /></span>
            </div>
            
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-rose-500">
              <div>
                <span className="text-3xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Despesas Acumuladas</span>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1">R$ {despesas.toLocaleString('pt-BR')}</h3>
              </div>
              <span className="p-2 rounded-lg bg-rose-500/10 text-rose-500"><ArrowDownCircle size={20} /></span>
            </div>

            <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-blue-500">
              <div>
                <span className="text-3xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Saldo Operacional</span>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1">R$ {saldo.toLocaleString('pt-BR')}</h3>
              </div>
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><DollarSign size={20} /></span>
            </div>
          </div>

          {/* Lista de Transações e Botão de Adicionar */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200/50 dark:border-dark-border/50 bg-slate-50/40 dark:bg-slate-900/30 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <FileText size={14} className="text-brand-600" />
                Lançamentos no Livro Caixa ({transactions.length})
              </h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> Novo Lançamento
              </button>
            </div>

            {/* Formulário Novo Lançamento */}
            {showAddForm && (
              <form onSubmit={handleAddTransaction} className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-dark-border grid grid-cols-1 md:grid-cols-8 gap-3 animate-fade-in">
                <div className="md:col-span-2">
                  <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Descrição</label>
                  <input type="text" required value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição do lançamento..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Data</label>
                  <input type="date" required value={txDate} onChange={(e) => setTxDate(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Tipo</label>
                  <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100">
                    <option value="despesa">Despesa (Débito)</option>
                    <option value="receita">Receita (Crédito)</option>
                  </select>
                </div>
                <div>
                  <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Categoria</label>
                  <select value={txCategory} onChange={(e) => setTxCategory(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100">
                    <option value="Venda de Grãos">Venda de Grãos</option>
                    <option value="Arrendamento">Arrendamento</option>
                    <option value="Insumos">Insumos</option>
                    <option value="Mão de Obra">Mão de Obra</option>
                    <option value="Combustível">Combustível</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Frete">Frete</option>
                    <option value="Impostos">Impostos</option>
                    <option value="Outros Operacionais">Outros Operacionais</option>
                  </select>
                </div>
                <div>
                  <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Centro de Custo</label>
                  <select value={txCostCenter} onChange={(e) => setTxCostCenter(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100">
                    <option value="Geral">Geral</option>
                    {farms.map(f => <option key={f.uuid} value={f.name}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Fazenda</label>
                  <select value={txFarm} onChange={(e) => setTxFarm(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100">
                    {farms.map(f => <option key={f.uuid} value={f.name}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Valor (R$)</label>
                  <input type="number" required value={val} onChange={(e) => setVal(e.target.value)} placeholder="0.00" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Conta / Banco</label>
                  <select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100">
                    <option value="Banco do Brasil">Banco do Brasil</option>
                    <option value="Sicredi">Sicredi</option>
                    <option value="Itaú">Itaú</option>
                    <option value="Caixa">Caixa</option>
                  </select>
                </div>
                <div>
                  <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Status</label>
                  <select value={txStatus} onChange={(e) => setTxStatus(e.target.value as typeof txStatus)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100">
                    <option value="pago">Pago/Recebido</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
                <div className="flex items-end md:col-span-8">
                  <button type="submit" className="py-1.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors ml-auto">Confirmar Lançamento</button>
                </div>
              </form>
            )}

            {/* Tabela de Transações */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-dark-border/50 text-slate-400 font-bold uppercase tracking-wider text-4xs">
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Descrição</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Centro de Custo</th>
                    <th className="py-3 px-4 text-center">Tipo</th>
                    <th className="py-3 px-4">Conta</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-dark-border/50">
                  {transactions.map(t => (
                    <tr key={t.uuid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-4 text-slate-500">{t.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200">{t.description}</td>
                      <td className="py-3 px-4">{t.category}</td>
                      <td className="py-3 px-4 text-slate-500">{t.costCenter}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-4xs font-bold uppercase ${
                          t.type === 'receita' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{t.account}</td>
                      <td className={`py-3 px-4 text-right font-bold ${
                        t.type === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        R$ {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase ${t.status === 'pago' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>{t.status}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => { if (confirm(`Excluir "${t.description}"?`)) { removeTransaction(t.uuid); showToast('Lançamento excluído.', 'error'); } }} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors" title="Excluir"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Seção DRE */}
      {activeSubTab === 'dre' && (
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Demonstrativo do Resultado do Exercício (DRE)</h2>
              <p className="text-2xs text-slate-400 dark:text-slate-500">Estrutura de Controladoria Gerencial - Safra Corrente</p>
            </div>
            <div className="flex items-center gap-1 text-3xs font-bold bg-slate-100 dark:bg-slate-800 py-1 px-2.5 rounded-lg text-slate-500">
              <Percent size={12} /> Análise Vertical (AV)
            </div>
          </div>

          <div className="space-y-1 text-xs">
            {/* Linha Receita */}
            <div className="flex items-center justify-between py-2.5 border-b border-slate-200 dark:border-dark-border font-bold bg-slate-50/50 dark:bg-slate-900/30 px-3 rounded text-slate-800 dark:text-white">
              <span>(=) RECEITA BRUTA DE VENDAS</span>
              <div className="flex items-center gap-12">
                <span>R$ {receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="w-12 text-right">100%</span>
              </div>
            </div>

            {/* Custos Variáveis */}
            <div className="flex items-center justify-between py-2 px-3 text-slate-600 dark:text-slate-300">
              <span className="pl-4">(-) Custos Variáveis (Sementes, Fertilizantes e Insumos)</span>
              <div className="flex items-center gap-12">
                <span>R$ {custoVariavel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="w-12 text-right text-slate-400">{calcAV(custoVariavel)}</span>
              </div>
            </div>

            {/* Margem Contribuição */}
            <div className="flex items-center justify-between py-2.5 border-y border-slate-100 dark:border-slate-800/80 font-bold px-3 text-slate-700 dark:text-slate-200">
              <span>(=) MARGEM DE CONTRIBUIÇÃO BRUTA</span>
              <div className="flex items-center gap-12">
                <span>R$ {margemContr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="w-12 text-right">{calcAV(margemContr)}</span>
              </div>
            </div>

            {/* Despesas Operacionais */}
            <div className="flex items-center justify-between py-2 px-3 text-slate-600 dark:text-slate-300">
              <span className="pl-4">(-) Despesas Operacionais (Mão de Obra, Diesel, Manutenção)</span>
              <div className="flex items-center gap-12">
                <span>R$ {despesasOper.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="w-12 text-right text-slate-400">{calcAV(despesasOper)}</span>
              </div>
            </div>

            {/* EBITDA */}
            <div className="flex items-center justify-between py-2.5 border-y border-slate-200 dark:border-dark-border font-bold bg-brand-500/10 text-brand-700 dark:text-brand-400 px-3 rounded">
              <span>(=) EBITDA</span>
              <div className="flex items-center gap-12">
                <span>R$ {ebitda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="w-12 text-right">{calcAV(ebitda)}</span>
              </div>
            </div>

            {/* Depreciação */}
            <div className="flex items-center justify-between py-2 px-3 text-slate-600 dark:text-slate-300">
              <span className="pl-4">(-) Depreciação de Maquinários e Instalações (Gerencial)</span>
              <div className="flex items-center gap-12">
                <span>R$ {depreciacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="w-12 text-right text-slate-400">{calcAV(depreciacao)}</span>
              </div>
            </div>

            {/* Despesas Financeiras */}
            <div className="flex items-center justify-between py-2 px-3 text-slate-600 dark:text-slate-300">
              <span className="pl-4">(-) Resultado Financeiro (Juros de Empréstimos)</span>
              <div className="flex items-center gap-12">
                <span>R$ {despesaFinanceira.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="w-12 text-right text-slate-400">{calcAV(despesaFinanceira)}</span>
              </div>
            </div>

            {/* LAIR */}
            <div className="flex items-center justify-between py-2.5 border-y border-slate-100 dark:border-slate-800/80 font-bold px-3 text-slate-700 dark:text-slate-200">
              <span>(=) LUCRO ANTES DOS IMPOSTOS (LAIR)</span>
              <div className="flex items-center gap-12">
                <span>R$ {lucroAntesImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="w-12 text-right">{calcAV(lucroAntesImpostos)}</span>
              </div>
            </div>

            {/* IRPJ */}
            <div className="flex items-center justify-between py-2 px-3 text-slate-600 dark:text-slate-300">
              <span className="pl-4">(-) Provisão IRPJ / CSLL (Simplificado Rural)</span>
              <div className="flex items-center gap-12">
                <span>R$ {irpj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="w-12 text-right text-slate-400">{calcAV(irpj)}</span>
              </div>
            </div>

            {/* Lucro Líquido */}
            <div className="flex items-center justify-between py-3 border-t border-slate-300 dark:border-slate-700 font-extrabold text-sm bg-slate-900 text-white dark:bg-brand-600 px-3 rounded shadow-sm">
              <span>(=) RESULTADO LÍQUIDO DO EXERCÍCIO (LUCRO)</span>
              <div className="flex items-center gap-12">
                <span>R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="w-12 text-right">{calcAV(lucroLiquido)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seção Balanço */}
      {activeSubTab === 'balance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ativo */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-200 dark:border-dark-border">
              ATIVO (Bens e Direitos)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-200">
                  <span>Ativo Circulante</span>
                  <span>R$ 1.845.000,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Disponibilidades (Bancos)</span>
                  <span>R$ 485.000,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Estoque de Insumos</span>
                  <span>R$ 424.700,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Créditos a Receber (Vendas)</span>
                  <span>R$ 935.300,00</span>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-200">
                  <span>Ativo Não Circulante (Imobilizado)</span>
                  <span>R$ 28.471.000,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Terras de Produção</span>
                  <span>R$ 24.000.000,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Frota e Máquinas Agrícolas</span>
                  <span>R$ 2.874.000,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Benfeitorias e Instalações</span>
                  <span>R$ 1.224.000,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Semoventes (Nelore Cria)</span>
                  <span>R$ 373.000,00</span>
                </div>
              </div>

              <div className="flex justify-between font-extrabold text-sm border-t-2 border-slate-200 dark:border-slate-700 pt-3 text-slate-800 dark:text-white">
                <span>TOTAL DO ATIVO</span>
                <span>R$ 30.316.000,00</span>
              </div>
            </div>
          </div>

          {/* Passivo e PL */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-200 dark:border-dark-border">
              PASSIVO E PATRIMÔNIO LÍQUIDO
            </h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-200">
                  <span>Passivo Circulante</span>
                  <span>R$ 380.000,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Fornecedores a Pagar</span>
                  <span>R$ 215.000,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Salários e Encargos Sociais</span>
                  <span>R$ 120.000,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Outros Passivos Curto Prazo</span>
                  <span>R$ 45.000,00</span>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-200">
                  <span>Passivo Não Circulante</span>
                  <span>R$ 1.621.000,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Financiamentos BNDES</span>
                  <span>R$ 1.200.000,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Crédito Rural e Custeio</span>
                  <span>R$ 421.000,00</span>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-200">
                  <span>Patrimônio Líquido</span>
                  <span>R$ 28.315.000,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Capital Social Integralizado</span>
                  <span>R$ 27.035.000,00</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-500">
                  <span>Lucros Acumulados</span>
                  <span>R$ 1.280.000,00</span>
                </div>
              </div>

              <div className="flex justify-between font-extrabold text-sm border-t-2 border-slate-200 dark:border-slate-700 pt-3 text-slate-800 dark:text-white">
                <span>TOTAL DO PASSIVO E PL</span>
                <span>R$ 30.316.000,00</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
