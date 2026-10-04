import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  Scale, 
  ShieldAlert, 
  ArrowRight, 
  FileText, 
  Calendar, 
  DollarSign, 
  Check, 
  ExternalLink,
  Calculator,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';
import { ProjectAnalysis, ProjectDocument } from '../types/project';
import { TabType } from './Sidebar';

interface DashboardOverviewProps {
  analysis: ProjectAnalysis;
  documents: ProjectDocument[];
  onSelectDocument: (doc: ProjectDocument) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  analysis,
  documents = [],
  onSelectDocument,
  onNavigateTab
}) => {
  const [isFinDetailsOpen, setIsFinDetailsOpen] = useState(false);
  const contradictions = analysis?.contradictions || [];
  const decisions = analysis?.decisions || [];
  const milestones = analysis?.milestones || [];
  const risks = analysis?.risks || [];
  const actions = analysis?.actions || [];
  const keyStakeholders = analysis?.keyStakeholders || [];
  const topics = analysis?.topics || [];
  const financials = analysis?.financials || {
    contractTotal: 'Non renseigné',
    invoicedTotal: 'Non renseigné',
    paidTotal: 'Non renseigné',
    disputedAmount: '0 $',
    notes: 'Suivi financier consolidé'
  };

  const healthScore = typeof analysis?.healthScore === 'number' && !isNaN(analysis.healthScore) ? analysis.healthScore : 82;
  const lastUpdatedFormatted = String(analysis?.lastUpdated || new Date().toISOString().split('T')[0]).split(' ')[0];

  const formatAmount = (val?: string | number) => {
    if (val === undefined || val === null) return 'Non renseigné';
    const str = String(val).trim();
    if (!str || str === '0' || str === '0 $') return '0 $';
    if (str.includes('$') || str.includes('CAD') || str.includes('EUR') || str.includes('USD')) return str;
    return `${str} $ CAD`;
  };

  // Build 3 to 4 chronological milestones for the visual horizontal roadmap
  const displayMilestones = milestones.length > 0 
    ? milestones.slice(0, 4) 
    : [
        { title: 'Ingestion des documents', date: documents[0]?.date || 'Début', status: 'completed' as const },
        { title: 'Analyse et extraction RAG', date: documents[Math.floor(documents.length / 2)]?.date || 'En cours', status: 'on_track' as const },
        { title: 'Livraison et validation', date: documents[documents.length - 1]?.date || 'À venir', status: 'pending' as const }
      ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner Alert if Contradictions or Critical Risks Exist */}
      {contradictions.length > 0 && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{contradictions.length} divergence{contradictions.length > 1 ? 's' : ''} identifiée{contradictions.length > 1 ? 's' : ''} :</strong> {contradictions[0]?.topic || contradictions[0]?.issue || 'Arbitrage documentaire requis'}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('contradictions')}
            className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            Examiner <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* 1. État du projet */}
        <div 
          onClick={() => onNavigateTab('timeline')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">État du projet</span>
            <div className={`w-2 h-2 rounded-full ${analysis?.status === 'delayed' ? 'bg-rose-500' : analysis?.status === 'at_risk' ? 'bg-amber-500' : 'bg-emerald-500'} animate-ping`} />
          </div>
          <div className="flex items-center gap-3 my-1">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  className={healthScore < 60 ? 'text-rose-500' : healthScore < 80 ? 'text-amber-500' : 'text-emerald-500'}
                  strokeWidth="3.5"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * healthScore) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-800 dark:text-slate-100">
                {healthScore}%
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {analysis?.statusLabel || (analysis?.status === 'at_risk' ? 'Sous contrôle' : 'En bonne voie')}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {lastUpdatedFormatted}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Décisions clés */}
        <div 
          onClick={() => onNavigateTab('decisions')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Décisions clés</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {decisions.length}
            </span>
            <span className="text-xs font-medium text-slate-500">décisions actées</span>
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            Voir le registre <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* 3. Échéances */}
        <div 
          onClick={() => onNavigateTab('timeline')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Échéances</span>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {milestones.length || analysis?.upcomingDeadlinesCount || documents.length}
            </span>
            <span className="text-xs font-medium text-slate-500">jalons suivis</span>
          </div>
          <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold mt-1 truncate">
            {milestones[0]?.title || 'Chronologie consolidée'}
          </p>
        </div>

        {/* 4. Responsables */}
        <div 
          onClick={() => onNavigateTab('overview')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Responsables</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {keyStakeholders.length || (documents.length > 0 ? Array.from(new Set(documents.map(d => d.author).filter(Boolean))).length : 1)}
            </span>
            <span className="text-xs font-medium text-slate-500">personnes clés</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {keyStakeholders[0]?.name ? `${keyStakeholders[0].name}` : (documents[0]?.author || 'Équipe Projet')}
          </p>
        </div>

        {/* 5. Risques */}
        <div 
          onClick={() => onNavigateTab('overview')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Risques</span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {risks.length}
            </span>
            <span className="text-xs font-medium text-slate-500">à surveiller</span>
          </div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 truncate">
            {risks[0]?.title ? risks[0].title.slice(0, 24) : 'Sous surveillance'}
          </p>
        </div>

        {/* 6. Prochaines actions */}
        <div 
          onClick={() => onNavigateTab('overview')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Prochaines actions</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {actions.length}
            </span>
            <span className="text-xs font-medium text-slate-500">recommandées</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Priorisées par l'IA
          </p>
        </div>

      </div>

      {/* Middle Section: Chronologie visuelle & Synthèse du projet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Chronologie et Actions Prioritaires */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Executive Summary */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Synthèse Opérationnelle RAG
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {documents.length} pièces indexées
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {analysis?.executiveSummary}
            </p>
          </div>

          {/* Chronologie Synthétique du Projet */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chronologie &amp; Évolution du Projet dans le Temps
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                Vue détaillée <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Horizontal timeline bar */}
            <div className="relative pt-6 pb-4">
              <div className="absolute top-9 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
              
              <div className={`grid grid-cols-${displayMilestones.length} gap-2 relative`}>
                {displayMilestones.map((m, idx) => {
                  const isDone = m.status === 'completed';
                  return (
                    <div key={idx} className="flex flex-col items-center text-center group">
                      <div className={`w-7 h-7 rounded-full ${isDone ? 'bg-emerald-500 text-white' : idx === 1 ? 'bg-blue-600 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 border-2 border-indigo-500'} flex items-center justify-center text-xs font-bold shadow-md z-10 ring-4 ring-white dark:ring-slate-900`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : (idx + 1)}
                      </div>
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-2 truncate max-w-[140px]">
                        {m.date}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {m.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Documents &amp; Événements</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Décisions validées</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Risques surveillés</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Échéances officielles</span>
            </div>
          </div>

          {/* Prochaines Actions Recommandées par l'IA */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Prochaines Actions Immédiates Recommandées
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {actions.length} action(s)
              </span>
            </div>

            <div className="space-y-3">
              {actions.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Aucune action urgente en attente.</p>
              ) : (
                actions.map((act) => (
                  <div 
                    key={act.id} 
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-3 hover:border-blue-400 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          act.priority === 'high' 
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                        }`}>
                          {act.priority === 'high' ? 'Urgent' : 'Normal'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {act.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {act.sourceRationale}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {act.assignee}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {act.deadline}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dossiers & Thématiques du Projet */}
          {topics.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Dossiers Clés &amp; Pôles d'Activité
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topics.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.name}</h4>
                      <span className={`w-2 h-2 rounded-full ${t.health === 'good' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{t.description}</p>
                    <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-2">
                      {t.documentCount} document(s) associé(s)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Documents récents, Données Financières et Équipe */}
        <div className="space-y-6">
          
          {/* Financials card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Suivi Financier &amp; Factures
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      Calculé en direct des pièces
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Calcul consolidé
              </span>
            </div>

            {/* Calculations KPIs */}
            <div className="space-y-3 text-xs">
              {/* Budget Total */}
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Budget / Contrat approuvé :</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatAmount(financials.contractTotal)}</span>
              </div>

              {/* Facturé + Progress Bar */}
              <div className="py-1 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Facturé à ce jour :</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">{formatAmount(financials.invoicedTotal)}</span>
                    {financials.percentInvoiced !== undefined && (
                      <span className="ml-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                        {financials.percentInvoiced}% du budget
                      </span>
                    )}
                  </div>
                </div>
                {financials.percentInvoiced !== undefined && (
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, financials.percentInvoiced)}%` }} 
                    />
                  </div>
                )}
              </div>

              {/* Payé / Acquitté + Progress Bar */}
              <div className="py-1 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payé / Acquitté :</span>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatAmount(financials.paidTotal)}</span>
                    {financials.percentPaid !== undefined && (
                      <span className="ml-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {financials.percentPaid}% facturé
                      </span>
                    )}
                  </div>
                </div>
                {financials.percentPaid !== undefined && (
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, financials.percentPaid)}%` }} 
                    />
                  </div>
                )}
              </div>

              {/* Solde budgétaire restant calculé */}
              <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Solde budgétaire restant :</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {financials.numericRemaining !== undefined 
                    ? `${new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 0 }).format(financials.numericRemaining)} $ CAD`
                    : 'Calculé selon factures'}
                </span>
              </div>

              {/* Montant contesté / litige */}
              <div className="flex justify-between items-center py-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
                <span className="font-semibold">Montant contesté / litige :</span>
                <span className="font-black">{String(financials.disputedAmount || '0 $ CAD')}</span>
              </div>
            </div>

            {/* Notes */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
              {financials.notes || 'Suivi budgétaire consolidé.'}
            </p>

            {/* Toggle Detailed Breakdown Table */}
            {financials.items && financials.items.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsFinDetailsOpen(!isFinDetailsOpen)}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-blue-500" />
                    Détail des calculs ({financials.items.length} lignes)
                  </span>
                  {isFinDetailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isFinDetailsOpen && (
                  <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {financials.items.map((item) => (
                      <div 
                        key={item.id}
                        className={`p-2 rounded-lg text-[10px] flex items-center justify-between border ${
                          item.status === 'disputed' 
                            ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60' 
                            : item.status === 'paid'
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {item.label}
                          </div>
                          <div className="text-slate-400 text-[9px] truncate">
                            {item.sourceDocName || 'Document'} {item.date ? `• ${item.date}` : ''}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`font-black ${item.status === 'disputed' ? 'text-rose-600' : item.status === 'paid' ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}`}>
                            {item.formattedAmount}
                          </div>
                          <span className={`px-1 rounded text-[8px] font-bold uppercase ${
                            item.status === 'disputed' ? 'bg-rose-200 text-rose-800' : item.status === 'paid' ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {item.status === 'disputed' ? 'Contesté' : item.status === 'paid' ? 'Payé' : 'Validé'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Équipe & Parties Prenantes */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Parties Prenantes &amp; Rôles
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">
                {keyStakeholders.length} personnes
              </span>
            </div>

            <div className="space-y-2.5">
              {keyStakeholders.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Équipe projet déduite des courriels et documents.</p>
              ) : (
                keyStakeholders.slice(0, 6).map((person, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{person.name}</div>
                      <div className="text-[10px] text-slate-400">{person.role} {person.organization ? `(${person.organization})` : ''}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {person.influence || 'Contributeur'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Documents Sources Références */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pièces Documentaires Indexées
                </h3>
              </div>
              <button 
                onClick={() => onNavigateTab('more')} 
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Tout voir ({documents.length})
              </button>
            </div>

            <div className="space-y-2">
              {documents.slice(0, 5).map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => onSelectDocument(doc)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 transition-colors cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{doc.name}</div>
                    <div className="text-[10px] text-slate-400">{doc.categoryLabel} • {doc.date}</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
