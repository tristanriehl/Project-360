import React from 'react';
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
  ExternalLink
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
  documents,
  onSelectDocument,
  onNavigateTab
}) => {

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner Alert if Contradictions or Critical Risks Exist */}
      {analysis.contradictions.length > 0 && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{analysis.contradictions.length} divergence{analysis.contradictions.length > 1 ? 's' : ''} identifiée{analysis.contradictions.length > 1 ? 's' : ''} :</strong> {analysis.contradictions[0]?.topic || analysis.contradictions[0]?.issue || 'Arbitrage documentaire requis'}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('contradictions')}
            className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 shrink-0"
          >
            Examiner <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main KPI Cards Grid (Matches "Mon Projet 360" Cockpit) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* 1. État du projet */}
        <div 
          onClick={() => onNavigateTab('timeline')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">État du projet</span>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
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
                  className="text-emerald-500"
                  strokeWidth="3.5"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * analysis.healthScore) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-800 dark:text-slate-100">
                {analysis.healthScore}%
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {analysis.status === 'at_risk' ? 'Sous contrôle' : 'En bonne voie'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {analysis.lastUpdated.split(' ')[0]}
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
              {analysis.decisions.length}
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
              {analysis.upcomingDeadlinesCount}
            </span>
            <span className="text-xs font-medium text-slate-500">à venir (30j)</span>
          </div>
          <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold mt-1">
            Go-Live: 28 Nov 2026
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
              {analysis.keyStakeholders.length}
            </span>
            <span className="text-xs font-medium text-slate-500">personnes clés</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            CP : Mathieu Gagnon
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
              {analysis.risks.filter(r => r.severity === 'high' || r.severity === 'medium').length}
            </span>
            <span className="text-xs font-medium text-slate-500">à surveiller</span>
          </div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
            PERF-501 &amp; Facture
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
              {analysis.actions.length}
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
          
          {/* Chronologie Synthétique du Projet (Horizontal interactive track) */}
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
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Vue détaillée <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Horizontal timeline bar */}
            <div className="relative pt-6 pb-4">
              <div className="absolute top-9 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
              
              <div className="grid grid-cols-4 gap-2 relative">
                
                {/* Step 1: Lancement */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-emerald-500/20 z-10 ring-4 ring-white dark:ring-slate-900">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-2">Juil 2026</div>
                  <div className="text-[10px] text-slate-500">Lancement &amp; ADR-007</div>
                </div>

                {/* Step 2: Bogue INT-101 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-emerald-500/20 z-10 ring-4 ring-white dark:ring-slate-900">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-2">Août - 19 Sept</div>
                  <div className="text-[10px] text-slate-500">API CRM Résolu</div>
                </div>

                {/* Step 3: Transition & Arbitrage Go-Live */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-500/20 z-10 ring-4 ring-white dark:ring-slate-900 animate-pulse">
                    3
                  </div>
                  <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-2">Octobre (Actuel)</div>
                  <div className="text-[10px] text-slate-500">PERF-501 &amp; WCAG</div>
                </div>

                {/* Step 4: Go-Live */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-500 flex items-center justify-center text-xs font-bold z-10 ring-4 ring-white dark:ring-slate-900">
                    4
                  </div>
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-2">28 Nov 2026</div>
                  <div className="text-[10px] text-slate-500">Mise en Prod (Go-Live)</div>
                </div>

              </div>
            </div>

            {/* Legend pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Événement</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Décision validée</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Risque sous contrôle</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Échéance officielle</span>
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
                Priorisées par impact
              </span>
            </div>

            <div className="space-y-3">
              {analysis.actions.map((act) => (
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
              ))}
            </div>
          </div>

          {/* Dossiers & Thématiques du Projet */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Dossiers Clés &amp; Pôles d'Activité
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.topics.map((t, idx) => (
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

        </div>

        {/* Right 1 Col: Documents récents, Données Financières et Équipe */}
        <div className="space-y-6">
          
          {/* Financials card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Suivi Financier &amp; Factures
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                CAD
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Contrat Boréal de base :</span>
                <span className="font-bold text-slate-900 dark:text-white">{analysis.financials.contractTotal.split(' ')[0]} $</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Facturé à ce jour :</span>
                <span className="font-bold text-slate-900 dark:text-white">{analysis.financials.invoicedTotal.split(' ')[0]} $</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Payé / Acquitté :</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{analysis.financials.paidTotal.split(' ')[0]} $</span>
              </div>
              <div className="flex justify-between py-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
                <span className="font-semibold">Litige facture (CR-04) :</span>
                <span className="font-black">{analysis.financials.disputedAmount}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              {analysis.financials.notes}
            </p>
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
            </div>

            <div className="space-y-2.5">
              {analysis.keyStakeholders.slice(0, 5).map((person, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{person.name}</div>
                    <div className="text-[10px] text-slate-400">{person.role} ({person.organization})</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {person.influence}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
