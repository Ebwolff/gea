import React from 'react';
import { Truck, Users, UserCheck, FileText, CheckCircle } from 'lucide-react';

export const ImplementsModule: React.FC = () => (
  <div className="glass-panel p-6 rounded-xl space-y-4 animate-fade-in">
    <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
      <Truck size={18} className="text-brand-600" />
      Cadastro de Implementos Agrícolas
    </h2>
    <p className="text-xs text-slate-500">Mapeamento de arados, semeadoras, grades, grades niveladoras, pulverizadores de arrasto e distribuidores de calcário.</p>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-dark-border text-slate-400 font-bold uppercase tracking-wider text-4xs">
            <th className="py-2 px-3">Implemento</th>
            <th className="py-2 px-3">Marca</th>
            <th className="py-2 px-3 text-center">Largura de Trabalho</th>
            <th className="py-2 px-3 text-center">Última Lubrificação</th>
            <th className="py-2 px-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
          <tr>
            <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-200">Grade Niveladora 48 Discos</td>
            <td className="py-2 px-3">Baldan</td>
            <td className="py-2 px-3 text-center">5.4 m</td>
            <td className="py-2 px-3 text-center">10/07/2026</td>
            <td className="py-2 px-3 text-center"><span className="text-3xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">Disponível</span></td>
          </tr>
          <tr>
            <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-200">Distribuidor de Adubo e Calcário Hércules 10000</td>
            <td className="py-2 px-3">Stara</td>
            <td className="py-2 px-3 text-center">12.0 m</td>
            <td className="py-2 px-3 text-center">05/07/2026</td>
            <td className="py-2 px-3 text-center"><span className="text-3xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">Disponível</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export const SuppliersModule: React.FC = () => (
  <div className="glass-panel p-6 rounded-xl space-y-4 animate-fade-in">
    <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
      <Users size={18} className="text-brand-600" />
      Homologação de Fornecedores
    </h2>
    <p className="text-xs text-slate-500">Acompanhe contratos, cotações recorrentes e prazos médios de fertilizantes e agroquímicos.</p>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-dark-border text-slate-400 font-bold uppercase tracking-wider text-4xs">
            <th className="py-2 px-3">Fornecedor</th>
            <th className="py-2 px-3">CNPJ / Cidade</th>
            <th className="py-2 px-3">Categoria Chave</th>
            <th className="py-2 px-3 text-center">Prazo Médio</th>
            <th className="py-2 px-3 text-center">Classificação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
          <tr>
            <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-200">AgroComercial Sorriso Ltda</td>
            <td className="py-2 px-3 text-slate-500">12.345.678/0001-90 • Sorriso-MT</td>
            <td className="py-2 px-3">Defensivos e Sementes</td>
            <td className="py-2 px-3 text-center">60 Dias</td>
            <td className="py-2 px-3 text-center"><span className="text-3xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">A (Excelente)</span></td>
          </tr>
          <tr>
            <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-200">Adubos e Fertilizantes Planalto S/A</td>
            <td className="py-2 px-3 text-slate-500">98.765.432/0002-11 • Rondonópolis-MT</td>
            <td className="py-2 px-3">Nutrição Vegetal / NPK</td>
            <td className="py-2 px-3 text-center">90 Dias</td>
            <td className="py-2 px-3 text-center"><span className="text-3xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">A (Excelente)</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export const ClientsModule: React.FC = () => (
  <div className="glass-panel p-6 rounded-xl space-y-4 animate-fade-in">
    <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
      <UserCheck size={18} className="text-brand-600" />
      Carteira de Clientes e Tradings
    </h2>
    <p className="text-xs text-slate-500">Gerencie compradores de grãos chaves, contratos de venda futuros e liquidação física.</p>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-dark-border text-slate-400 font-bold uppercase tracking-wider text-4xs">
            <th className="py-2 px-3">Cliente / Trading</th>
            <th className="py-2 px-3">Local de Retirada</th>
            <th className="py-2 px-3 text-center">Volume Contratado</th>
            <th className="py-2 px-3 text-center">Preço Médio Acordado</th>
            <th className="py-2 px-3 text-center">Status Contrato</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
          <tr>
            <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-200">Cargill Alimentos S/A</td>
            <td className="py-2 px-3 text-slate-500">Terminal Rondonópolis (FOB)</td>
            <td className="py-2 px-3 text-center">25.000 Sacas (Soja)</td>
            <td className="py-2 px-3 text-center">R$ 135.00 / Saca</td>
            <td className="py-2 px-3 text-center"><span className="text-3xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">Em entrega</span></td>
          </tr>
          <tr>
            <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-200">Bunge Alimentos</td>
            <td className="py-2 px-3 text-slate-500">Silo Próprio (EXW)</td>
            <td className="py-2 px-3 text-center">15.000 Sacas (Milho)</td>
            <td className="py-2 px-3 text-center">R$ 54.50 / Saca</td>
            <td className="py-2 px-3 text-center"><span className="text-3xs text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded font-bold">Fixado</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export const DocumentsModule: React.FC = () => (
  <div className="glass-panel p-6 rounded-xl space-y-4 animate-fade-in">
    <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
      <FileText size={18} className="text-brand-600" />
      Documentos e Contratos
    </h2>
    <p className="text-xs text-slate-500">Repositório de CAR (Cadastro Ambiental), Contratos de Arrendamento, Apólices de Seguros e Matrículas.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border border-slate-200 dark:border-dark-border rounded-lg bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Matrícula de Terra Nua Lote 22A</h4>
          <span className="text-4xs text-slate-400">Regularizado • PDF 4.2 MB</span>
        </div>
        <span className="p-1 rounded bg-brand-500/10 text-brand-600"><CheckCircle size={14} /></span>
      </div>

      <div className="p-4 border border-slate-200 dark:border-dark-border rounded-lg bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Apólice de Seguro Agrícola Porto</h4>
          <span className="text-4xs text-slate-400">Vence em Jan/2027 • PDF 2.8 MB</span>
        </div>
        <span className="p-1 rounded bg-brand-500/10 text-brand-600"><CheckCircle size={14} /></span>
      </div>
    </div>
  </div>
);
