import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../Toast';
import { Truck, Users, UserCheck, FileText, CheckCircle, Pencil, Trash2, Plus, Receipt, Download, Paperclip } from 'lucide-react';

const inputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100";

// ============================================================
// Implementos
// ============================================================
export const ImplementsModule: React.FC = () => {
  const { implementsList, addImplement, updateImplement, removeImplement } = useApp();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [workingWidth, setWorkingWidth] = useState('');
  const [lastLubricationDate, setLastLubricationDate] = useState('');
  const [status, setStatus] = useState('Disponível');

  const resetForm = () => {
    setName(''); setBrand(''); setWorkingWidth(''); setLastLubricationDate(''); setStatus('Disponível'); setEditingUuid(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const data = { name, brand, workingWidth, lastLubricationDate, status };
    if (editingUuid) { updateImplement(editingUuid, data); showToast('Implemento atualizado!'); }
    else { addImplement(data); showToast('Novo implemento cadastrado!'); }
    resetForm(); setShowForm(false);
  };

  const handleEdit = (i: typeof implementsList[0]) => {
    setEditingUuid(i.uuid); setName(i.name); setBrand(i.brand); setWorkingWidth(i.workingWidth);
    setLastLubricationDate(i.lastLubricationDate); setStatus(i.status);
    setShowForm(true);
  };

  const handleDelete = (uuid: string, n: string) => {
    if (confirm(`Excluir "${n}"?`)) { removeImplement(uuid); showToast('Implemento excluído.', 'error'); }
  };

  return (
    <div className="glass-panel p-6 rounded-xl space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Truck size={18} className="text-brand-600" />
          Cadastro de Implementos Agrícolas
        </h2>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors">
          {showForm ? 'Fechar' : (<><Plus size={14} /> Novo Implemento</>)}
        </button>
      </div>
      <p className="text-xs text-slate-500">Mapeamento de arados, semeadoras, grades, pulverizadores de arrasto e distribuidores de calcário.</p>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-dark-border animate-fade-in">
          <div className="md:col-span-2"><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Nome</label><input required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Grade Niveladora 48 Discos" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Marca</label><input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Baldan" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Largura de Trabalho</label><input value={workingWidth} onChange={e => setWorkingWidth(e.target.value)} placeholder="5.4 m" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Última Lubrificação</label><input type="date" value={lastLubricationDate} onChange={e => setLastLubricationDate(e.target.value)} className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Status</label><select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}><option value="Disponível">Disponível</option><option value="Em Manutenção">Em Manutenção</option></select></div>
          <div className="flex items-end md:col-span-4"><button type="submit" className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold ml-auto">{editingUuid ? 'Atualizar' : 'Salvar'}</button></div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-dark-border text-slate-400 font-bold uppercase tracking-wider text-4xs">
              <th className="py-2 px-3">Implemento</th>
              <th className="py-2 px-3">Marca</th>
              <th className="py-2 px-3 text-center">Largura de Trabalho</th>
              <th className="py-2 px-3 text-center">Última Lubrificação</th>
              <th className="py-2 px-3 text-center">Status</th>
              <th className="py-2 px-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
            {implementsList.map(i => (
              <tr key={i.uuid}>
                <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-200">{i.name}</td>
                <td className="py-2 px-3">{i.brand}</td>
                <td className="py-2 px-3 text-center">{i.workingWidth}</td>
                <td className="py-2 px-3 text-center">{i.lastLubricationDate}</td>
                <td className="py-2 px-3 text-center"><span className="text-3xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">{i.status}</span></td>
                <td className="py-2 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleEdit(i)} className="p-1 rounded hover:bg-blue-500/10 text-blue-500" title="Editar"><Pencil size={12} /></button>
                    <button onClick={() => handleDelete(i.uuid, i.name)} className="p-1 rounded hover:bg-rose-500/10 text-rose-500" title="Excluir"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================
// Fornecedores
// ============================================================
export const SuppliersModule: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, removeSupplier } = useApp();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [avgPaymentDays, setAvgPaymentDays] = useState('');
  const [rating, setRating] = useState('A (Excelente)');

  const resetForm = () => {
    setName(''); setCnpj(''); setCity(''); setCategory(''); setAvgPaymentDays(''); setRating('A (Excelente)'); setEditingUuid(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const data = { name, cnpj, city, category, avgPaymentDays: parseFloat(avgPaymentDays) || 0, rating };
    if (editingUuid) { updateSupplier(editingUuid, data); showToast('Fornecedor atualizado!'); }
    else { addSupplier(data); showToast('Novo fornecedor cadastrado!'); }
    resetForm(); setShowForm(false);
  };

  const handleEdit = (s: typeof suppliers[0]) => {
    setEditingUuid(s.uuid); setName(s.name); setCnpj(s.cnpj); setCity(s.city); setCategory(s.category);
    setAvgPaymentDays(String(s.avgPaymentDays)); setRating(s.rating);
    setShowForm(true);
  };

  const handleDelete = (uuid: string, n: string) => {
    if (confirm(`Excluir "${n}"?`)) { removeSupplier(uuid); showToast('Fornecedor excluído.', 'error'); }
  };

  return (
    <div className="glass-panel p-6 rounded-xl space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Users size={18} className="text-brand-600" />
          Homologação de Fornecedores
        </h2>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors">
          {showForm ? 'Fechar' : (<><Plus size={14} /> Novo Fornecedor</>)}
        </button>
      </div>
      <p className="text-xs text-slate-500">Acompanhe contratos, cotações recorrentes e prazos médios de fertilizantes e agroquímicos.</p>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-dark-border animate-fade-in">
          <div className="md:col-span-2"><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Fornecedor</label><input required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: AgroComercial Sorriso Ltda" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">CNPJ</label><input value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Cidade</label><input value={city} onChange={e => setCity(e.target.value)} placeholder="Sorriso-MT" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Categoria</label><input value={category} onChange={e => setCategory(e.target.value)} placeholder="Defensivos e Sementes" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Prazo Médio (dias)</label><input type="number" value={avgPaymentDays} onChange={e => setAvgPaymentDays(e.target.value)} placeholder="60" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Classificação</label><select value={rating} onChange={e => setRating(e.target.value)} className={inputClass}><option value="A (Excelente)">A (Excelente)</option><option value="B (Bom)">B (Bom)</option><option value="C (Regular)">C (Regular)</option></select></div>
          <div className="flex items-end md:col-span-5"><button type="submit" className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold ml-auto">{editingUuid ? 'Atualizar' : 'Salvar'}</button></div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-dark-border text-slate-400 font-bold uppercase tracking-wider text-4xs">
              <th className="py-2 px-3">Fornecedor</th>
              <th className="py-2 px-3">CNPJ / Cidade</th>
              <th className="py-2 px-3">Categoria Chave</th>
              <th className="py-2 px-3 text-center">Prazo Médio</th>
              <th className="py-2 px-3 text-center">Classificação</th>
              <th className="py-2 px-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
            {suppliers.map(s => (
              <tr key={s.uuid}>
                <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-200">{s.name}</td>
                <td className="py-2 px-3 text-slate-500">{s.cnpj} • {s.city}</td>
                <td className="py-2 px-3">{s.category}</td>
                <td className="py-2 px-3 text-center">{s.avgPaymentDays} Dias</td>
                <td className="py-2 px-3 text-center"><span className="text-3xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">{s.rating}</span></td>
                <td className="py-2 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleEdit(s)} className="p-1 rounded hover:bg-blue-500/10 text-blue-500" title="Editar"><Pencil size={12} /></button>
                    <button onClick={() => handleDelete(s.uuid, s.name)} className="p-1 rounded hover:bg-rose-500/10 text-rose-500" title="Excluir"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================
// Clientes
// ============================================================
export const ClientsModule: React.FC = () => {
  const { clients, addClient, updateClient, removeClient, invoices, addInvoice, removeInvoice, getInvoiceDownloadUrl } = useApp();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [contractedVolume, setContractedVolume] = useState('');
  const [volumeUnit, setVolumeUnit] = useState('Sacas (Soja)');
  const [avgPrice, setAvgPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('/ Saca');
  const [contractStatus, setContractStatus] = useState('Fixado');

  const [invoicesClientUuid, setInvoicesClientUuid] = useState<string | null>(null);
  const [invNumber, setInvNumber] = useState('');
  const [invIssueDate, setInvIssueDate] = useState('');
  const [invValue, setInvValue] = useState('');
  const [invFile, setInvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const invoicesPanelRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setName(''); setPickupLocation(''); setContractedVolume(''); setVolumeUnit('Sacas (Soja)');
    setAvgPrice(''); setPriceUnit('/ Saca'); setContractStatus('Fixado'); setEditingUuid(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const data = { name, pickupLocation, contractedVolume: parseFloat(contractedVolume) || 0, volumeUnit, avgPrice: parseFloat(avgPrice) || 0, priceUnit, contractStatus };
    if (editingUuid) { updateClient(editingUuid, data); showToast('Cliente atualizado!'); }
    else { addClient(data); showToast('Novo cliente cadastrado!'); }
    resetForm(); setShowForm(false);
  };

  const handleEdit = (c: typeof clients[0]) => {
    setEditingUuid(c.uuid); setName(c.name); setPickupLocation(c.pickupLocation); setContractedVolume(String(c.contractedVolume));
    setVolumeUnit(c.volumeUnit); setAvgPrice(String(c.avgPrice)); setPriceUnit(c.priceUnit); setContractStatus(c.contractStatus);
    setShowForm(true);
  };

  const handleDelete = (uuid: string, n: string) => {
    if (confirm(`Excluir "${n}"?`)) { removeClient(uuid); showToast('Cliente excluído.', 'error'); }
  };

  const resetInvoiceForm = () => {
    setInvNumber(''); setInvIssueDate(''); setInvValue(''); setInvFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenInvoices = (uuid: string) => {
    setInvoicesClientUuid(prev => prev === uuid ? null : uuid);
    resetInvoiceForm();
    setTimeout(() => invoicesPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  };

  const handleUploadInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoicesClientUuid || !invFile) return;
    setUploading(true);
    try {
      await addInvoice(invoicesClientUuid, invNumber, invIssueDate, parseFloat(invValue) || 0, invFile);
      showToast('Nota fiscal enviada com sucesso!');
      resetInvoiceForm();
    } catch {
      showToast('Erro ao enviar a nota fiscal.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadInvoice = async (filePath: string) => {
    try {
      const url = await getInvoiceDownloadUrl(filePath);
      window.open(url, '_blank');
    } catch {
      showToast('Erro ao gerar o link de download.', 'error');
    }
  };

  const handleDeleteInvoice = (uuid: string, fileName: string) => {
    if (confirm(`Excluir a nota fiscal "${fileName}"?`)) { removeInvoice(uuid); showToast('Nota fiscal excluída.', 'error'); }
  };

  const clientInvoices = invoices.filter(i => i.clientUuid === invoicesClientUuid);
  const invoicesClient = clients.find(c => c.uuid === invoicesClientUuid);

  return (
    <div className="glass-panel p-6 rounded-xl space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <UserCheck size={18} className="text-brand-600" />
          Carteira de Clientes e Tradings
        </h2>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors">
          {showForm ? 'Fechar' : (<><Plus size={14} /> Novo Cliente</>)}
        </button>
      </div>
      <p className="text-xs text-slate-500">Gerencie compradores de grãos chaves, contratos de venda futuros e liquidação física.</p>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-dark-border animate-fade-in">
          <div className="md:col-span-2"><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Cliente / Trading</label><input required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Cargill Alimentos S/A" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Local de Retirada</label><input value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} placeholder="Terminal Rondonópolis (FOB)" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Volume Contratado</label><input type="number" value={contractedVolume} onChange={e => setContractedVolume(e.target.value)} placeholder="25000" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Unidade</label><input value={volumeUnit} onChange={e => setVolumeUnit(e.target.value)} placeholder="Sacas (Soja)" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Preço Médio</label><input type="number" step="0.01" value={avgPrice} onChange={e => setAvgPrice(e.target.value)} placeholder="135.00" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Status Contrato</label><select value={contractStatus} onChange={e => setContractStatus(e.target.value)} className={inputClass}><option value="Fixado">Fixado</option><option value="Em entrega">Em entrega</option><option value="Concluído">Concluído</option></select></div>
          <div className="flex items-end md:col-span-6"><button type="submit" className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold ml-auto">{editingUuid ? 'Atualizar' : 'Salvar'}</button></div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-dark-border text-slate-400 font-bold uppercase tracking-wider text-4xs">
              <th className="py-2 px-3">Cliente / Trading</th>
              <th className="py-2 px-3">Local de Retirada</th>
              <th className="py-2 px-3 text-center">Volume Contratado</th>
              <th className="py-2 px-3 text-center">Preço Médio Acordado</th>
              <th className="py-2 px-3 text-center">Status Contrato</th>
              <th className="py-2 px-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
            {clients.map(c => (
              <tr key={c.uuid}>
                <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-200">{c.name}</td>
                <td className="py-2 px-3 text-slate-500">{c.pickupLocation}</td>
                <td className="py-2 px-3 text-center">{c.contractedVolume.toLocaleString('pt-BR')} {c.volumeUnit}</td>
                <td className="py-2 px-3 text-center">R$ {c.avgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} {c.priceUnit}</td>
                <td className="py-2 px-3 text-center"><span className="text-3xs text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded font-bold">{c.contractStatus}</span></td>
                <td className="py-2 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleOpenInvoices(c.uuid)} className={`p-1 rounded transition-colors ${invoicesClientUuid === c.uuid ? 'bg-brand-600 text-white' : 'hover:bg-brand-500/10 text-brand-600'}`} title="Notas Fiscais"><Receipt size={12} /></button>
                    <button onClick={() => handleEdit(c)} className="p-1 rounded hover:bg-blue-500/10 text-blue-500" title="Editar"><Pencil size={12} /></button>
                    <button onClick={() => handleDelete(c.uuid, c.name)} className="p-1 rounded hover:bg-rose-500/10 text-rose-500" title="Excluir"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invoicesClientUuid && (
        <div ref={invoicesPanelRef} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-dark-border animate-fade-in space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Receipt size={15} className="text-brand-600" />
            Notas Fiscais — {invoicesClient?.name}
          </h3>

          <form onSubmit={handleUploadInvoice} className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Arquivo (PDF/XML)</label>
              <input ref={fileInputRef} type="file" required accept=".pdf,.xml,image/*" onChange={e => setInvFile(e.target.files?.[0] ?? null)} className={inputClass + ' py-1'} />
            </div>
            <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Número da NF</label><input value={invNumber} onChange={e => setInvNumber(e.target.value)} placeholder="000123" className={inputClass} /></div>
            <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Data de Emissão</label><input type="date" value={invIssueDate} onChange={e => setInvIssueDate(e.target.value)} className={inputClass} /></div>
            <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Valor (R$)</label><input type="number" step="0.01" value={invValue} onChange={e => setInvValue(e.target.value)} placeholder="0.00" className={inputClass} /></div>
            <div className="flex items-end md:col-span-5">
              <button type="submit" disabled={uploading || !invFile} className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold ml-auto flex items-center gap-1.5">
                <Paperclip size={13} /> {uploading ? 'Enviando...' : 'Enviar Nota Fiscal'}
              </button>
            </div>
          </form>

          {clientInvoices.length === 0 ? (
            <p className="text-3xs text-slate-400">Nenhuma nota fiscal enviada para este cliente ainda.</p>
          ) : (
            <div className="space-y-2">
              {clientInvoices.map(inv => (
                <div key={inv.uuid} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border">
                  <div className="min-w-0 flex items-center gap-2">
                    <FileText size={14} className="text-brand-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-3xs font-bold text-slate-700 dark:text-slate-200 truncate">{inv.fileName}</p>
                      <p className="text-4xs text-slate-400">
                        {inv.number ? `NF ${inv.number}` : 'Sem número'}
                        {inv.issueDate ? ` • ${inv.issueDate}` : ''}
                        {inv.value ? ` • R$ ${inv.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleDownloadInvoice(inv.filePath)} className="p-1.5 rounded hover:bg-brand-500/10 text-brand-600" title="Baixar"><Download size={13} /></button>
                    <button onClick={() => handleDeleteInvoice(inv.uuid, inv.fileName)} className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500" title="Excluir"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Documentos
// (sem upload de arquivo real — exigiria configurar Supabase Storage;
// "notes" guarda um texto livre tipo "PDF 4.2 MB" só como referência)
// ============================================================
export const DocumentsModule: React.FC = () => {
  const { documents, addDocument, updateDocument, removeDocument } = useApp();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Regularizado');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setTitle(''); setStatus('Regularizado'); setExpiryDate(''); setNotes(''); setEditingUuid(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const data = { title, status, expiryDate, notes };
    if (editingUuid) { updateDocument(editingUuid, data); showToast('Documento atualizado!'); }
    else { addDocument(data); showToast('Novo documento cadastrado!'); }
    resetForm(); setShowForm(false);
  };

  const handleEdit = (d: typeof documents[0]) => {
    setEditingUuid(d.uuid); setTitle(d.title); setStatus(d.status); setExpiryDate(d.expiryDate ?? ''); setNotes(d.notes);
    setShowForm(true);
  };

  const handleDelete = (uuid: string, t: string) => {
    if (confirm(`Excluir "${t}"?`)) { removeDocument(uuid); showToast('Documento excluído.', 'error'); }
  };

  return (
    <div className="glass-panel p-6 rounded-xl space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FileText size={18} className="text-brand-600" />
          Documentos e Contratos
        </h2>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors">
          {showForm ? 'Fechar' : (<><Plus size={14} /> Novo Documento</>)}
        </button>
      </div>
      <p className="text-xs text-slate-500">Repositório de CAR (Cadastro Ambiental), Contratos de Arrendamento, Apólices de Seguros e Matrículas.</p>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-dark-border animate-fade-in">
          <div className="md:col-span-2"><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Título</label><input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Apólice de Seguro Agrícola" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Status</label><select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}><option value="Regularizado">Regularizado</option><option value="Pendente">Pendente</option><option value="Vencido">Vencido</option></select></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Vencimento</label><input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className={inputClass} /></div>
          <div className="md:col-span-3"><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Observação</label><input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: PDF 4.2 MB" className={inputClass} /></div>
          <div className="flex items-end"><button type="submit" className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold ml-auto w-full">{editingUuid ? 'Atualizar' : 'Salvar'}</button></div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map(d => (
          <div key={d.uuid} className="p-4 border border-slate-200 dark:border-dark-border rounded-lg bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{d.title}</h4>
              <span className="text-4xs text-slate-400">
                {d.status}{d.expiryDate ? ` • Vence em ${d.expiryDate}` : ''}{d.notes ? ` • ${d.notes}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="p-1 rounded bg-brand-500/10 text-brand-600"><CheckCircle size={14} /></span>
              <button onClick={() => handleEdit(d)} className="p-1 rounded hover:bg-blue-500/10 text-blue-500" title="Editar"><Pencil size={12} /></button>
              <button onClick={() => handleDelete(d.uuid, d.title)} className="p-1 rounded hover:bg-rose-500/10 text-rose-500" title="Excluir"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
