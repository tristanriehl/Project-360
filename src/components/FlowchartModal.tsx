import React from 'react';
import { X, ArrowRight, ArrowDown, Database, Cpu, LayoutDashboard, Sparkles, FileText } from 'lucide-react';

interface FlowchartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlowchartModal: React.FC<FlowchartModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Architecture &amp; Flux du Système
            </h3>
            <p className="text-xs text-slate-500">Pipeline de données et moteur RAG</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Minimalist Flowchart Canvas */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative items-stretch">
            
            {/* Step 1: Ingestion */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">01. Sources</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">Multi-Inputs</h4>
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">📧 Courriels (.eml)</div>
                  <div className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">🎙️ Réunions &amp; Transcripts</div>
                  <div className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">🎫 Billets Jira &amp; Logs</div>
                  <div className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">📑 Contrats &amp; Plans (.pdf/.xlsx)</div>
                </div>
              </div>
              <div className="hidden md:flex justify-end pt-3 text-slate-400">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Step 2: Indexation */}
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">02. Mémoire</span>
                <h4 className="text-xs font-bold text-blue-950 dark:text-blue-100 mt-1">Indexation RAG</h4>
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40">Extraction &amp; Typage</div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40">Dédoublonnage temporel</div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40">Index 35+ documents</div>
                </div>
              </div>
              <div className="hidden md:flex justify-end pt-3 text-blue-400">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Step 3: IA & Raisonnement */}
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/60 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase">03. Raisonnement</span>
                <h4 className="text-xs font-bold text-purple-950 dark:text-purple-100 mt-1">Cerveau IA</h4>
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">Détection contradictions</div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">Reconstitution timeline</div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">Preuves &amp; Justifications</div>
                </div>
              </div>
              <div className="hidden md:flex justify-end pt-3 text-purple-400">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Step 4: Dashboard Output */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">04. Cockpit</span>
                <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100 mt-1">Tableau de Bord</h4>
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40">Santé &amp; KPIs (78%)</div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40">Graphe de connaissances</div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40">Assistant RAG &amp; Preuves</div>
                </div>
              </div>
            </div>

          </div>

          {/* Feedback Loop for Live Surprise Event */}
          <div className="mt-6 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 uppercase">
                Boucle Temps Réel
              </span>
              <p className="text-xs text-amber-950 dark:text-amber-100 font-medium">
                <strong>Événement Imprévu :</strong> Ingestion immédiate → Calcul du delta → Réponse aux 3 questions → Mutation instantanée du cockpit.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 whitespace-nowrap">
              &lt; 30 sec
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
