import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sprout, TrendingUp, DollarSign, BarChart3, Pencil, Trash2, Search, MapPin, Map as MapIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useToast } from '../Toast';
import { FieldMap } from '../FieldMap';

const BRAZIL_CENTER: [number, number] = [-15.7801, -47.9292];

export const ProductionModule: React.FC = () => {
  const { fields, addField, updateField, removeField, cropFilter, farms, farmFilter } = useApp();
  const { showToast } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [editingBoundaryUuid, setEditingBoundaryUuid] = useState<string | null>(null);
  const mapPanelRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState('');
  const [cropYear, setCropYear] = useState('2025/26');
  const [culture, setCulture] = useState('Soja');
  const [area, setArea] = useState('');
  const [soilType, setSoilType] = useState('');
  const [expectedYield, setExpectedYield] = useState('');
  const [actualYield, setActualYield] = useState('');
  const [costHa, setCostHa] = useState('');
  const [revHa, setRevHa] = useState('');
  const [status, setStatus] = useState('Plantado');

  const resetForm = () => {
    setName(''); setCropYear('2025/26'); setCulture('Soja'); setArea('');
    setSoilType(''); setExpectedYield(''); setActualYield('');
    setCostHa(''); setRevHa(''); setStatus('Plantado'); setEditingUuid(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !area || !costHa) return;

    const data = {
      name, cropYear, culture, area: parseFloat(area),
      soilType: soilType || 'Argiloso', expectedYield: parseFloat(expectedYield) || 0,
      actualYield: actualYield ? parseFloat(actualYield) : undefined,
      productionCostHa: parseFloat(costHa), revenueHa: parseFloat(revHa) || 0, status
    };

    if (editingUuid) {
      updateField(editingUuid, data);
      showToast('Talhão atualizado com sucesso!');
    } else {
      addField(data);
      showToast('Novo talhão cadastrado com sucesso!');
    }
    resetForm();
    setShowAddForm(false);
  };

  const handleEdit = (f: typeof fields[0]) => {
    setEditingUuid(f.uuid); setName(f.name); setCropYear(f.cropYear); setCulture(f.culture);
    setArea(String(f.area)); setSoilType(f.soilType); setExpectedYield(String(f.expectedYield));
    setActualYield(f.actualYield ? String(f.actualYield) : '');
    setCostHa(String(f.productionCostHa)); setRevHa(String(f.revenueHa)); setStatus(f.status);
    setShowAddForm(true);
  };

  const handleDelete = (uuid: string, n: string) => {
    if (confirm(`Excluir talhão "${n}"?`)) { removeField(uuid); showToast('Talhão excluído.', 'error'); }
  };

  const handleMarkOnMap = (uuid: string) => {
    setShowMap(true);
    setEditingBoundaryUuid(uuid);
    setTimeout(() => mapPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleBoundaryChange = (uuid: string, boundary: [number, number][] | null, areaHa: number) => {
    if (boundary) {
      updateField(uuid, areaHa > 0 ? { boundary, area: areaHa } : { boundary });
      showToast(areaHa > 0 ? `Perímetro salvo! Área calculada: ${areaHa} ha` : 'Perímetro salvo!');
    } else {
      updateField(uuid, { boundary: null });
      showToast('Perímetro removido.', 'error');
    }
  };

  const selectedFarm = farms.find(fm => fm.name === farmFilter);
  const mapCenter: [number, number] = selectedFarm?.latitude && selectedFarm?.longitude
    ? [selectedFarm.latitude, selectedFarm.longitude]
    : BRAZIL_CENTER;

  const filteredFields = fields.filter(f => {
    const matchesCrop = f.cropYear === cropFilter;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.culture.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  const totalAreaProd = filteredFields.reduce((sum, f) => sum + f.area, 0);
  const totalCustoProd = filteredFields.reduce((sum, f) => sum + (f.productionCostHa * f.area), 0);
  const totalReceitaProd = filteredFields.reduce((sum, f) => sum + (f.revenueHa * f.area), 0);
  const totalLucroProd = totalReceitaProd - totalCustoProd;

  const inputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100";

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">Acompanhamento de Safra e Produção</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitore o plantio, colheita, produtividade de sacas por hectare e custos operacionais por talhão.</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button onClick={() => setShowMap(!showMap)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors">
            <MapIcon size={14} />
            {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
          </button>
          <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) resetForm(); }}
            className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors">
            {showAddForm ? 'Fechar Formulário' : 'Novo Talhão'}
          </button>
        </div>
      </div>

      {/* Formulário */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-4 animate-fade-in">
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Nome do Talhão</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Talhão 06" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Safra</label><input type="text" required value={cropYear} onChange={(e) => setCropYear(e.target.value)} placeholder="2025/26" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Cultura</label><select value={culture} onChange={(e) => setCulture(e.target.value)} className={inputClass}><option value="Soja">Soja</option><option value="Milho">Milho</option><option value="Algodão">Algodão</option></select></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Área (ha)</label><input type="number" required value={area} onChange={(e) => setArea(e.target.value)} placeholder="0" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Tipo de Solo</label><input type="text" value={soilType} onChange={(e) => setSoilType(e.target.value)} placeholder="Argiloso" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Meta Sacas/ha</label><input type="number" value={expectedYield} onChange={(e) => setExpectedYield(e.target.value)} placeholder="70" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Real Sacas/ha</label><input type="number" value={actualYield} onChange={(e) => setActualYield(e.target.value)} placeholder="72" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Custo Prod/ha (R$)</label><input type="number" required value={costHa} onChange={(e) => setCostHa(e.target.value)} placeholder="0.00" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Fat. Estimado/ha (R$)</label><input type="number" value={revHa} onChange={(e) => setRevHa(e.target.value)} placeholder="0.00" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Status</label><select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}><option value="Plantado">Plantado</option><option value="Colhido">Colhido</option><option value="Preparando Solo">Preparando Solo</option></select></div>
          <div className="flex items-end md:col-span-5"><button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors ml-auto">{editingUuid ? 'Atualizar Talhão' : 'Salvar Talhão'}</button></div>
        </form>
      )}

      {/* Mapa de Talhões */}
      {showMap && (
        <div ref={mapPanelRef} className="glass-panel rounded-xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-slate-200/50 dark:border-dark-border/50 bg-slate-50/40 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5"><MapIcon size={14} className="text-brand-600" /> Mapa de Talhões</h3>
              <p className="text-3xs text-slate-500 dark:text-slate-400 mt-0.5">
                Selecione um talhão e use a ferramenta de polígono (canto superior esquerdo do mapa) para desenhar o perímetro. A área em hectares é calculada automaticamente.
              </p>
            </div>
            <select
              value={editingBoundaryUuid ?? ''}
              onChange={(e) => setEditingBoundaryUuid(e.target.value || null)}
              className={inputClass + ' md:w-64'}
            >
              <option value="">— Apenas visualizar —</option>
              {fields.map(f => (
                <option key={f.uuid} value={f.uuid}>{f.name} {f.boundary ? '(perímetro definido)' : '(sem perímetro)'}</option>
              ))}
            </select>
          </div>
          <FieldMap
            fields={fields}
            center={mapCenter}
            editingFieldUuid={editingBoundaryUuid}
            onBoundaryChange={handleBoundaryChange}
            onSelectField={(uuid) => setEditingBoundaryUuid(uuid)}
          />
        </div>
      )}

      {/* Grid Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Sprout size={18} /></div>
          <div><span className="text-3xs text-slate-400 font-bold uppercase block">Área Cultivada</span><span className="text-base font-bold text-slate-800 dark:text-white">{totalAreaProd} Hectares</span></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500"><DollarSign size={18} /></div>
          <div><span className="text-3xs text-slate-400 font-bold uppercase block">Custo Total de Produção</span><span className="text-base font-bold text-slate-800 dark:text-white">R$ {totalCustoProd.toLocaleString('pt-BR')}</span></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500"><TrendingUp size={18} /></div>
          <div><span className="text-3xs text-slate-400 font-bold uppercase block">Faturamento Estimado</span><span className="text-base font-bold text-slate-800 dark:text-white">R$ {totalReceitaProd.toLocaleString('pt-BR')}</span></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${totalLucroProd >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}><BarChart3 size={18} /></div>
          <div><span className="text-3xs text-slate-400 font-bold uppercase block">Lucro/Prejuízo</span><span className={`text-base font-bold ${totalLucroProd >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>R$ {totalLucroProd.toLocaleString('pt-BR')}</span></div>
        </div>
      </div>

      {/* Tabela */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200/50 dark:border-dark-border/50 bg-slate-50/40 dark:bg-slate-900/30 flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white">Lista de Talhões</h3>
          <div className="relative w-64">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar talhão..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-dark-border/50 text-slate-400 font-bold uppercase tracking-wider text-4xs">
                <th className="py-3 px-4">Talhão</th><th className="py-3 px-4">Cultura</th><th className="py-3 px-4 text-center">Área (ha)</th><th className="py-3 px-4 text-center">Meta sc/ha</th><th className="py-3 px-4 text-center">Real sc/ha</th><th className="py-3 px-4 text-right">Custo/ha</th><th className="py-3 px-4 text-right">Receita/ha</th><th className="py-3 px-4 text-center">Status</th><th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-dark-border/50">
              {filteredFields.map(f => (
                <tr key={f.uuid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">{f.name}</td>
                  <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-3xs font-bold">{f.culture}</span></td>
                  <td className="py-3.5 px-4 text-center">{f.area}</td>
                  <td className="py-3.5 px-4 text-center">{f.expectedYield}</td>
                  <td className="py-3.5 px-4 text-center font-bold">{f.actualYield ?? '-'}</td>
                  <td className="py-3.5 px-4 text-right">R$ {f.productionCostHa.toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 text-right">R$ {f.revenueHa.toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 text-center"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 text-3xs font-bold">{f.status}</span></td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleMarkOnMap(f.uuid)} className={`p-1.5 rounded-lg transition-colors ${f.boundary ? 'text-emerald-600 hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-500/10'}`} title={f.boundary ? 'Editar perímetro no mapa' : 'Marcar perímetro no mapa'}><MapPin size={13} /></button>
                      <button onClick={() => handleEdit(f)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors" title="Editar"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(f.uuid, f.name)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors" title="Excluir"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico */}
      <div className="glass-panel rounded-xl p-5">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-4">Custo vs. Receita por Talhão (R$/ha)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={filteredFields.map(f => ({ name: f.name, Custo: f.productionCostHa, Receita: f.revenueHa }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="Custo" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
