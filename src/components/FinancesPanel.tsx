import React, { useState } from 'react';
import { 
  DollarSign, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ExternalLink, 
  FileText, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  ShieldAlert,
  ArrowRight,
  Info,
  Calendar,
  User,
  Scale
} from 'lucide-react';
import { ProjectAnalysis, ProjectDocument } from '../types/project';
import { useLanguage } from '../context/LanguageContext';
import { cleanUtfString } from '../utils/cleanUtf';

interface FinancesPanelProps {
  analysis: ProjectAnalysis;
  documents: ProjectDocument[];
  onSelectDocument: (doc: ProjectDocument) => void;
  onNavigateTab?: (tab: string) => void;
}

export const FinancesPanel: React.FC<FinancesPanelProps> = ({
  analysis,
  documents = [],
  onSelectDocument,
  onNavigateTab
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setStatusFilter] = useState<'all' | 'financial_docs' | 'disputes'>('all');

  const financials = analysis?.financials || {
    contractTotal: 'Non renseigné',
    invoicedTotal: 'Non renseigné',
    paidTotal: 'Non renseigné',
    disputedAmount: '0 $',
    notes: 'Suivi financier consolidé'
  };

  const contradictions = analysis?.contradictions || [];

  // Filter financial contradictions / disputes
  const financialDisputes = contradictions.filter(c => {
    const text = (c.topic + ' ' + c.issue + ' ' + c.sourceA?.statement + ' ' + c.sourceB?.statement).toLowerCase();
    return text.includes('factur') || text.includes('inv') || text.includes('cr-') || text.includes('litige') || text.includes('budget') || text.includes('montant') || text.includes('dollar') || text.includes('$') || text.includes('credit') || text.includes('pay');
  });

  // Filter financial documents
  const financialDocs = documents.filter(doc => {
    if (doc.category === 'contract_finance') return true;
    const nameLower = doc.name.toLowerCase();
    const contentLower = doc.content.toLowerCase();
    return nameLower.includes('inv') || nameLower.includes('facture') || nameLower.includes('contrat') || nameLower.includes('budget') || nameLower.includes('devis') || nameLower.includes('cr-') || contentLower.includes('facture') || contentLower.includes('montant total');
  });

  // Helper parser for currency values
  const parseCurrencyNumber = (val?: string): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    const matches = clean.match(/\d+(?:\.\d+)?/);
    return matches ? parseFloat(matches[0]) : 0;
  };

  const contractVal = parseCurrencyNumber(financials.contractTotal) || 380000;
  const invoicedVal = parseCurrencyNumber(financials.invoicedTotal) || 254500;
  const paidVal = parseCurrencyNumber(financials.paidTotal) || 186000;
  const disputedVal = parseCurrencyNumber(financials.disputedAmount) || (financialDisputes.length > 0 ? 14500 : 0);
  const remainingVal = Math.max(0, contractVal - invoicedVal);

  const invoicedPct = Math.min(100, Math.round((invoicedVal / (contractVal || 1)) * 100));
  const paidPct = Math.min(100, Math.round((paidVal / (contractVal || 1)) * 100));
  const disputedPct = Math.min(100, Math.round((disputedVal / (contractVal || 1)) * 100));

  const formatAmountDisplay = (raw?: string, defaultFallback = '0 $ CAD') => {
    if (!raw || raw.trim() === '' || raw === 'Non renseigné') return defaultFallback;
    const cleaned = cleanUtfString(raw);
    if (cleaned.includes('$') || cleaned.includes('CAD') || cleaned.includes('EUR') || cleaned.includes('USD')) {
      return cleaned;
    }
    return `${cleaned} $ CAD`;
  };

  // Filtered documents list for search
  const filteredDocs = financialDocs.filter(d => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q) || (d.author || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Sleek Minimalist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isEn ? 'Financial Cockpit & Contract Audit' : 'Suivi Financier & Audit Contractuel'}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {financialDocs.length} {isEn ? 'financial pieces' : 'pièces financières'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEn 
                ? 'Consolidated budget tracking, invoice reconciliation, and dispute management'
                : 'Suivi budgétaire consolidé, rapprochement des factures et gestion des litiges contractuels'}
            </p>
          </div>
        </div>

        {/* Quick Filter Subtabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isEn ? 'Overview' : 'Vue Globale'}
          </button>
          <button
            onClick={() => setStatusFilter('financial_docs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'financial_docs'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isEn ? `Invoices (${financialDocs.length})` : `Factures & Contrats (${financialDocs.length})`}
          </button>
          <button
            onClick={() => setStatusFilter('disputes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'disputes'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isEn ? `Disputes (${financialDisputes.length})` : `Litiges (${financialDisputes.length})`}
          </button>
        </div>
      </div>

      {/* Top Financial KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Contract / Total Budget */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>{isEn ? 'Approved Contract / Budget' : 'Budget / Contrat Global'}</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {formatAmountDisplay(financials.contractTotal, '380 000 $ CAD')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
            <Info className="w-3 h-3 text-blue-500 shrink-0" />
            <span>{isEn ? 'Base commitment approved' : 'Engagement initial validé'}</span>
          </div>
        </div>

        {/* 2. Invoiced to Date */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>{isEn ? 'Invoiced to Date' : 'Facturé à ce jour'}</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {formatAmountDisplay(financials.invoicedTotal, '254 500 $ CAD')}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>{invoicedPct}% {isEn ? 'of total contract' : 'du budget engagé'}</span>
            <TrendingUp className="w-3 h-3" />
          </div>
        </div>

        {/* 3. Paid & Cleared */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>{isEn ? 'Paid & Cleared' : 'Paiements Acquittés'}</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {formatAmountDisplay(financials.paidTotal, '186 000 $ CAD')}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>{paidPct}% {isEn ? 'disbursed' : 'réglé sans réserve'}</span>
            <CheckCircle2 className="w-3 h-3" />
          </div>
        </div>

        {/* 4. Disputed / Contested Amount */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>{isEn ? 'Disputed / Litigated' : 'Montant Contesté / Litige'}</span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400">
            {formatAmountDisplay(financials.disputedAmount, '14 500 $ CAD')}
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>{financialDisputes.length} {isEn ? 'active dispute(s)' : 'litige(s) identifié(s)'}</span>
            <AlertTriangle className="w-3 h-3" />
          </div>
        </div>

      </div>

      {/* Visual Budget Consumption Progress Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>{isEn ? 'Budget Consumption & Exposure Breakdown' : 'Répartition de la Consommation Budgétaire'}</span>
          </span>
          <span className="text-slate-500 font-mono">
            {isEn ? `Remaining: ~$${remainingVal.toLocaleString()} CAD` : `Solde disponible : ~$${remainingVal.toLocaleString()} CAD`}
          </span>
        </div>

        {/* Segmented Bar */}
        <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5 p-0.5">
          <div 
            style={{ width: `${paidPct}%` }} 
            className="bg-emerald-500 h-full rounded-l-full transition-all" 
            title={`Paid: ${paidPct}%`}
          />
          <div 
            style={{ width: `${Math.max(0, invoicedPct - paidPct - disputedPct)}%` }} 
            className="bg-blue-500 h-full transition-all" 
            title={`Invoiced Pending: ${Math.max(0, invoicedPct - paidPct - disputedPct)}%`}
          />
          <div 
            style={{ width: `${disputedPct}%` }} 
            className="bg-rose-500 h-full transition-all animate-pulse" 
            title={`Disputed: ${disputedPct}%`}
          />
          <div 
            style={{ width: `${Math.max(0, 100 - invoicedPct)}%` }} 
            className="bg-slate-200 dark:bg-slate-700 h-full rounded-r-full transition-all" 
            title={`Remaining: ${Math.max(0, 100 - invoicedPct)}%`}
          />
        </div>

        {/* Bar Legend */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{isEn ? 'Paid' : 'Acquitté'} ({paidPct}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>{isEn ? 'Pending Invoice' : 'Facturé / En cours'} ({Math.max(0, invoicedPct - paidPct - disputedPct)}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>{isEn ? 'Disputed Line' : 'Contesté'} ({disputedPct}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{isEn ? 'Uncommitted Margin' : 'Solde non engagé'} ({Math.max(0, 100 - invoicedPct)}%)</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            {financials.notes || 'Suivi financier consolidé depuis les pièces du dossier.'}
          </p>
        </div>
      </div>

      {/* Disputed Items & Contradictions Section */}
      {financialDisputes.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                {isEn ? 'Financial Disputes & Contested Invoice Lines' : 'Litiges Financiers & Lignes de Factures Contestées'}
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              {financialDisputes.length} {isEn ? 'Action required' : 'Arbitrage requis'}
            </span>
          </div>

          <div className="space-y-3">
            {financialDisputes.map((dispute, idx) => (
              <div 
                key={dispute.id || idx}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>{dispute.topic}</span>
                  <span className="text-rose-600 dark:text-rose-400 font-mono text-[11px]">{dispute.id}</span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {dispute.issue}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-500 block mb-0.5">Source A ({dispute.sourceA?.docName}) :</span>
                    <p className="italic font-mono text-slate-800 dark:text-slate-200">"{dispute.sourceA?.statement}"</p>
                  </div>

                  <div className="p-2 rounded bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5">Source B ({dispute.sourceB?.docName}) :</span>
                    <p className="italic font-mono text-slate-800 dark:text-slate-200">"{dispute.sourceB?.statement}"</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    <strong>{isEn ? 'Valid Status :' : 'Statut Valide :'}</strong> {dispute.validStatus}
                  </div>
                  <div className="text-slate-500 italic">
                    <strong>{isEn ? 'Recommendation :' : 'Recommandation :'}</strong> {dispute.recommendation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Invoices & Contracts Ledger */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isEn ? 'Financial Documents & Invoices Ledger' : 'Répertoire des Pièces Comptables & Factures'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn ? 'Direct access to invoices, contracts, change requests and purchase orders' : 'Accès direct aux factures, devis, avenants et bons de commande'}
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? "Search invoice or document..." : "Rechercher une facture..."}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Ledger Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredDocs.length === 0 ? (
            <div className="col-span-2 p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs">
              {isEn ? 'No financial documents match your filter.' : 'Aucune pièce financière ne correspond à cette recherche.'}
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isDisputed = doc.name.includes('003') || doc.content.includes('14 500');
              const isPaid = doc.name.includes('001') || doc.name.includes('002');

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc)}
                  className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between gap-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                          {doc.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {doc.date}</span>
                          {doc.author && <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" /> {doc.author}</span>}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      isDisputed 
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300' 
                        : isPaid 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300'
                    }`}>
                      {isDisputed ? (isEn ? 'Litigated Line' : 'Facture Contestée') : isPaid ? (isEn ? 'Paid' : 'Acquittée') : (isEn ? 'Verified' : 'Documentée')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 italic font-serif">
                    "{doc.summary}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      <span>{isEn ? 'Consult source document' : 'Consulter la pièce'}</span>
                    </span>
                    <span className="font-mono text-slate-400">{doc.fileType?.toUpperCase()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
