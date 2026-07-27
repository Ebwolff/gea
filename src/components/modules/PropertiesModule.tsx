import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, User, Compass, Landmark, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '../Toast';

export const PropertiesModule: React.FC = () => {
  const { farms, addFarm, updateFarm, removeFarm } = useApp();
  const { showToast } = useToast();
  const [editingUuid, setEditingUuid] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [estado, setEstado] = useState('MT');
  const [areaTotal, setAreaTotal] = useState('');
  const [areaPropria, setAreaPropria] = useState('');
  const [areaArrendada, setAreaArrendada] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [tipoSolo, setTipoSolo] = useState('');
  const [altitude, setAltitude] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [culturas, setCulturas] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !municipio || !areaTotal) return;

    const data = {
      name, municipio, estado,
      areaTotal: parseFloat(areaTotal),
      areaPropria: parseFloat(areaPropria) || 0,
      areaArrendada: parseFloat(areaArrendada) || 0,
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0,
      tipoSolo: tipoSolo || 'Misto',
      altitude: parseFloat(altitude) || 0,
      responsavel: responsavel || 'Gerente Técnico',
      culturas: culturas ? culturas.split(',').map(c => c.trim()) : ['Soja']
    };

    if (editingUuid) {
      updateFarm(editingUuid, data);
      showToast('Propriedade atualizada com sucesso!');
    } else {
      addFarm(data);
      showToast('Nova propriedade cadastrada!');
    }

    setName('');
    setMunicipio('');
    setAreaTotal('');
    setAreaPropria('');
    setAreaArrendada('');
    setLatitude('');
    setLongitude('');
    setTipoSolo('');
    setAltitude('');
    setResponsavel('');
    setCulturas('');
    setShowAddForm(false);
    setEditingUuid(null);
  };

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">
            Cadastro de Propriedades Rurais
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie as fazendas registradas, áreas próprias, arrendamentos e fichas agronômicas completas.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          {showAddForm ? 'Fechar Formulário' : 'Nova Propriedade'}
        </button>
      </div>

      {/* Formulário Nova Propriedade */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          <div className="md:col-span-2">
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Nome da Fazenda</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Fazenda Bela Vista"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Município</label>
            <input
              type="text"
              required
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              placeholder="Ex: Sorriso"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Estado</label>
            <input
              type="text"
              required
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              placeholder="Ex: MT"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Área Total (ha)</label>
            <input
              type="number"
              required
              value={areaTotal}
              onChange={(e) => setAreaTotal(e.target.value)}
              placeholder="0"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Área Própria (ha)</label>
            <input
              type="number"
              required
              value={areaPropria}
              onChange={(e) => setAreaPropria(e.target.value)}
              placeholder="0"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Área Arrendada (ha)</label>
            <input
              type="number"
              required
              value={areaArrendada}
              onChange={(e) => setAreaArrendada(e.target.value)}
              placeholder="0"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Tipo de Solo</label>
            <input
              type="text"
              required
              value={tipoSolo}
              onChange={(e) => setTipoSolo(e.target.value)}
              placeholder="Ex: Argiloso"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Altitude (m)</label>
            <input
              type="number"
              required
              value={altitude}
              onChange={(e) => setAltitude(e.target.value)}
              placeholder="350"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Latitude</label>
            <input
              type="number"
              step="any"
              required
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="-12.5"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Longitude</label>
            <input
              type="number"
              step="any"
              required
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="-55.7"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Resp. Técnico</label>
            <input
              type="text"
              required
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Ex: Dr. Lucas"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Culturas (Separadas por vírgula)</label>
            <input
              type="text"
              required
              value={culturas}
              onChange={(e) => setCulturas(e.target.value)}
              placeholder="Ex: Soja, Milho, Algodão"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="flex items-end md:col-span-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors ml-auto w-full md:w-auto"
            >
              Salvar Propriedade
            </button>
          </div>
        </form>
      )}

      {/* Grid de Propriedades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {farms.map(farm => (
          <div key={farm.uuid} className="glass-panel p-6 rounded-xl flex flex-col justify-between hover:shadow-lg transition-shadow">
            {/* Cabeçalho do Card */}
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Landmark size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{farm.name}</h3>
                    <p className="text-3xs text-slate-400 font-semibold uppercase">{farm.municipio} - {farm.estado}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-4xs uppercase tracking-wider">{farm.status}</span>
                  <button onClick={() => { setEditingUuid(farm.uuid); setName(farm.name); setMunicipio(farm.municipio); setEstado(farm.estado); setAreaTotal(String(farm.areaTotal)); setAreaPropria(String(farm.areaPropria)); setAreaArrendada(String(farm.areaArrendada)); setLatitude(String(farm.latitude)); setLongitude(String(farm.longitude)); setTipoSolo(farm.tipoSolo); setAltitude(String(farm.altitude)); setResponsavel(farm.responsavel); setCulturas(farm.culturas.join(', ')); setShowAddForm(true); }} className="p-1 rounded hover:bg-blue-500/10 text-blue-500 transition-colors" title="Editar"><Pencil size={12} /></button>
                  <button onClick={() => { if (confirm(`Excluir "${farm.name}"?`)) { removeFarm(farm.uuid); showToast('Propriedade excluída.', 'error'); } }} className="p-1 rounded hover:bg-rose-500/10 text-rose-500 transition-colors" title="Excluir"><Trash2 size={12} /></button>
                </div>
              </div>

              {/* Informações de Área */}
              <div className="grid grid-cols-3 gap-3 my-5 py-4 border-y border-slate-100 dark:border-slate-800/80 text-center">
                <div>
                  <span className="text-4xs text-slate-400 font-bold block uppercase">Área Total</span>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200">{farm.areaTotal} ha</span>
                </div>
                <div>
                  <span className="text-4xs text-slate-400 font-bold block uppercase">Área Própria</span>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200">{farm.areaPropria} ha</span>
                </div>
                <div>
                  <span className="text-4xs text-slate-400 font-bold block uppercase">Arrendamentos</span>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200">{farm.areaArrendada} ha</span>
                </div>
              </div>

              {/* Dados Agronômicos */}
              <div className="space-y-2 text-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5"><Compass size={12} /> Localização:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{farm.latitude}, {farm.longitude}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5"><MapPin size={12} /> Solo e Altitude:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{farm.tipoSolo} • {farm.altitude}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5"><User size={12} /> Responsável Técnico:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{farm.responsavel}</span>
                </div>
              </div>
            </div>

            {/* Cultivos */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
              <span className="text-3xs font-bold text-slate-400 uppercase">Culturas Chaves:</span>
              <div className="flex gap-1.5">
                {farm.culturas.map(c => (
                  <span key={c} className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-3xs">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
