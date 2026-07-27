import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Archive, ShieldAlert, Sparkles, PackageCheck, Pencil, Trash2, Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useToast } from '../Toast';

export const StockModule: React.FC = () => {
  const { stock, addStockItem, updateStockItem, removeStockItem } = useApp();
  const { showToast } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Movement modal
  const [movementItem, setMovementItem] = useState<string | null>(null);
  const [movementType, setMovementType] = useState<'entrada' | 'saida'>('entrada');
  const [movementQty, setMovementQty] = useState('');

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Defensivos');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('L');
  const [minQuantity, setMinQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [value, setValue] = useState('');

  const resetForm = () => {
    setName(''); setCategory('Defensivos'); setQuantity(''); setUnit('L');
    setMinQuantity(''); setLocation(''); setValue(''); setEditingUuid(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !value) return;
    const data = { name, category, quantity: parseFloat(quantity), unit, minQuantity: parseFloat(minQuantity) || 0, location: location || 'Almoxarifado Principal', value: parseFloat(value) };
    if (editingUuid) {
      updateStockItem(editingUuid, data);
      showToast('Insumo atualizado com sucesso!');
    } else {
      addStockItem(data);
      showToast('Novo insumo cadastrado!');
    }
    resetForm(); setShowAddForm(false);
  };

  const handleEdit = (s: typeof stock[0]) => {
    setEditingUuid(s.uuid); setName(s.name); setCategory(s.category); setQuantity(String(s.quantity));
    setUnit(s.unit); setMinQuantity(String(s.minQuantity)); setLocation(s.location); setValue(String(s.value));
    setShowAddForm(true);
  };

  const handleDelete = (uuid: string, n: string) => {
    if (confirm(`Excluir "${n}" do estoque?`)) { removeStockItem(uuid); showToast('Insumo excluído.', 'error'); }
  };

  const handleMovement = () => {
    if (!movementItem || !movementQty) return;
    const item = stock.find(s => s.uuid === movementItem);
    if (!item) return;
    const qty = parseFloat(movementQty);
    if (movementType === 'entrada') {
      updateStockItem(movementItem, { quantity: item.quantity + qty });
      showToast(`Entrada de ${qty} ${item.unit} registrada!`);
    } else {
      if (qty > item.quantity) { showToast('Quantidade insuficiente no estoque!', 'error'); return; }
      updateStockItem(movementItem, { quantity: item.quantity - qty });
      showToast(`Saída de ${qty} ${item.unit} registrada!`, 'info');
    }
    setMovementItem(null); setMovementQty('');
  };

  const totalStockValue = stock.reduce((sum, item) => sum + item.value, 0);
  const lowStockItems = stock.filter(item => item.quantity <= item.minQuantity);

  const filteredStock = stock.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100";

  return (
    <div className="space-y-6 animate-fade-in p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">Controle de Estoque e Almoxarifado</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitore a movimentação de sementes, defensivos, fertilizantes e combustíveis.</p>
        </div>
        <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) resetForm(); }}
          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start md:self-auto">
          {showAddForm ? 'Fechar Formulário' : 'Novo Insumo'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-xl grid grid-cols-1 md:grid-cols-6 gap-4 animate-fade-in">
          <div className="md:col-span-2"><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Nome</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ureia Agrícola" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Categoria</label><select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}><option value="Defensivos">Defensivos</option><option value="Nutrição">Nutrição</option><option value="Sementes">Sementes</option><option value="Combustível">Combustível</option><option value="Outros">Outros</option></select></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Quantidade</label><input type="number" required value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Unidade</label><select value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass}><option value="L">Litros</option><option value="Kg">Kg</option><option value="Tons">Tons</option><option value="Scs">Sacas</option><option value="Un">Unidades</option></select></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Qtd. Mínima</label><input type="number" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} placeholder="100" className={inputClass} /></div>
          <div className="md:col-span-2"><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Localização</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Depósito A" className={inputClass} /></div>
          <div className="md:col-span-2"><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Valor Estimado (R$)</label><input type="number" required value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00" className={inputClass} /></div>
          <div className="flex items-end md:col-span-2"><button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors ml-auto">{editingUuid ? 'Atualizar Insumo' : 'Salvar Insumo'}</button></div>
        </form>
      )}

      {/* Modal de Movimentação */}
      {movementItem && (
        <div className="glass-panel p-5 rounded-xl animate-fade-in border-2 border-brand-500/30">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-3">
            Movimentar Estoque: {stock.find(s => s.uuid === movementItem)?.name}
          </h3>
          <div className="flex items-end gap-3">
            <div>
              <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Tipo</label>
              <select value={movementType} onChange={(e) => setMovementType(e.target.value as typeof movementType)} className={inputClass}>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div>
              <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Quantidade</label>
              <input type="number" required value={movementQty} onChange={(e) => setMovementQty(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <button onClick={handleMovement} className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors">Confirmar</button>
            <button onClick={() => { setMovementItem(null); setMovementQty(''); }} className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400"><Archive size={22} /></div>
          <div><span className="text-3xs font-semibold text-slate-400 uppercase block">Valor Total Estocado</span><h3 className="text-xl font-bold text-slate-800 dark:text-white">R$ {totalStockValue.toLocaleString('pt-BR')}</h3></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400"><ShieldAlert size={22} /></div>
          <div><span className="text-3xs font-semibold text-slate-400 uppercase block">Itens em Ponto Crítico</span><h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">{lowStockItems.length} {lowStockItems.length === 1 ? 'Item' : 'Itens'}</h3></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><PackageCheck size={22} /></div>
          <div><span className="text-3xs font-semibold text-slate-400 uppercase block">Total de SKUs Cadastrados</span><h3 className="text-xl font-bold text-slate-800 dark:text-white">{stock.length}</h3></div>
        </div>
      </div>

      {/* Tabela */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200/50 dark:border-dark-border/50 bg-slate-50/40 dark:bg-slate-900/30 flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5"><Sparkles size={14} className="text-brand-600" /> Inventário de Insumos</h3>
          <div className="relative w-64"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar insumo..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-dark-border/50 text-slate-400 font-bold uppercase tracking-wider text-4xs">
                <th className="py-3 px-4">Insumo</th><th className="py-3 px-4">Categoria</th><th className="py-3 px-4 text-center">Qtd. Atual</th><th className="py-3 px-4 text-center">Qtd. Mín.</th><th className="py-3 px-4">Local</th><th className="py-3 px-4 text-right">Valor (R$)</th><th className="py-3 px-4 text-center">Situação</th><th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-dark-border/50">
              {filteredStock.map(s => {
                const isLow = s.quantity <= s.minQuantity;
                return (
                  <tr key={s.uuid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">{s.name}</td>
                    <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-3xs font-semibold">{s.category}</span></td>
                    <td className={`py-3.5 px-4 text-center font-bold ${isLow ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>{s.quantity} {s.unit}</td>
                    <td className="py-3.5 px-4 text-center text-slate-500">{s.minQuantity} {s.unit}</td>
                    <td className="py-3.5 px-4 text-slate-500">{s.location}</td>
                    <td className="py-3.5 px-4 text-right">R$ {s.value.toLocaleString('pt-BR')}</td>
                    <td className="py-3.5 px-4 text-center"><span className={`px-2 py-0.5 rounded text-3xs font-bold ${isLow ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>{isLow ? 'Crítico' : 'Normal'}</span></td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setMovementItem(s.uuid); setMovementType('entrada'); }} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-colors" title="Movimentar">
                          <ArrowUpCircle size={13} />
                        </button>
                        <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors" title="Editar"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(s.uuid, s.name)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors" title="Excluir"><Trash2 size={13} /></button>
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
