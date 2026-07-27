import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Check, X } from 'lucide-react';

export const PurchaseModule: React.FC = () => {
  const { purchases, addPurchaseRequest, updatePurchaseStatus } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('L');
  const [supplier, setSupplier] = useState('');
  const [value, setValue] = useState('');
  const [requester, setRequester] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !quantity || !value) return;

    addPurchaseRequest({
      item,
      quantity: parseFloat(quantity),
      unit,
      supplier: supplier || 'A definir',
      value: parseFloat(value),
      requester: requester || 'Gerente da Fazenda'
    });

    setItem('');
    setQuantity('');
    setSupplier('');
    setValue('');
    setRequester('');
    setShowAddForm(false);
  };

  const handleApprove = (uuid: string) => {
    updatePurchaseStatus(uuid, 'aprovado');
  };

  const handleReject = (uuid: string) => {
    updatePurchaseStatus(uuid, 'rejeitado');
  };

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">
            Compras, Cotações e Suprimentos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe as solicitações de cotação e aprove orçamentos com fluxo de conformidade.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          {showAddForm ? 'Fechar Formulário' : 'Solicitar Compra'}
        </button>
      </div>

      {/* Formulário Novo Pedido */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-xl grid grid-cols-1 md:grid-cols-6 gap-4 animate-fade-in">
          <div className="md:col-span-2">
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Item / Descrição</label>
            <input
              type="text"
              required
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Ex: Semente de Milho DKB 290 PRO3 (100 scs)"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Quantidade</label>
            <input
              type="number"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Unidade</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            >
              <option value="L">Litros (L)</option>
              <option value="Kg">Quilogramas (Kg)</option>
              <option value="Tons">Toneladas (Tons)</option>
              <option value="Scs">Sacas (Scs)</option>
              <option value="Un">Unidades (Un)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Fornecedor Recomendado</label>
            <input
              type="text"
              required
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Ex: Dekalb Distribuidora"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Solicitante</label>
            <input
              type="text"
              required
              value={requester}
              onChange={(e) => setRequester(e.target.value)}
              placeholder="Ex: Eng. Agr. Lucas Mantovani"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Valor Estimado (R$)</label>
            <input
              type="number"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="flex items-end md:col-span-6">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors ml-auto w-full md:w-auto"
            >
              Enviar Solicitação
            </button>
          </div>
        </form>
      )}

      {/* Tabela de Solicitações */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200/50 dark:border-dark-border/50 bg-slate-50/40 dark:bg-slate-900/30 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <ShoppingBag size={14} className="text-brand-600" />
            Solicitações de Compra Pendentes de Alçada
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-dark-border/50 text-slate-400 font-bold uppercase tracking-wider text-4xs">
                <th className="py-3 px-4">Item / Produto</th>
                <th className="py-3 px-4 text-center">Quantidade</th>
                <th className="py-3 px-4">Fornecedor</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4">Solicitante</th>
                <th className="py-3 px-4 text-center">Data</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-dark-border/50">
              {purchases.map(p => {
                const isPending = p.status === 'aprovacao';
                
                return (
                  <tr key={p.uuid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">{p.item}</td>
                    <td className="py-3.5 px-4 text-center">{p.quantity} {p.unit}</td>
                    <td className="py-3.5 px-4 text-slate-500">{p.supplier}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                      R$ {p.value.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{p.requester}</td>
                    <td className="py-3.5 px-4 text-center text-slate-500">{p.date}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-4xs font-bold uppercase ${
                        p.status === 'aprovado' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : p.status === 'rejeitado'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse'
                      }`}>
                        {p.status === 'aprovacao' ? 'Aprovação pendente' : p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isPending ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleApprove(p.uuid)}
                            className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                            title="Aprovar Pedido"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => handleReject(p.uuid)}
                            className="p-1 rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                            title="Rejeitar Pedido"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-3xs text-slate-400 font-medium">-</span>
                      )}
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
