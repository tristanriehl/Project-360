import React from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight, XCircle, FileText, ExternalLink, ShieldAlert, Lightbulb } from 'lucide-react';
import { ProjectAnalysis, ProjectDocument } from '../types/project';

interface ContradictionsDetectorProps {
  analysis: ProjectAnalysis;
  documents: ProjectDocument[];
  onSelectDocument: (doc: ProjectDocument) => void;
}

export const ContradictionsDetector: React.FC<ContradictionsDetectorProps> = ({
  analysis,
  documents,
  onSelectDocument
}) => {
  const findDoc = (name: string) => {
    return documents.find(d => d.name.toLowerCase().includes(name.toLowerCase()));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white shadow-xl shadow-rose-500/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
            <AlertTriangle className="w-6 h-6 text-rose-200" />
          </div>
          <div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/20 tracking-wider">
              Détection des Conflits Documentaires
            </span>
            <h2 className="text-xl font-black tracking-tight">
              Incohérences, Informations Périmées &amp; Contradictions Détectées
            </h2>
          </div>
        </div>
        <p className="text-xs text-rose-100 max-w-3xl leading-relaxed">
          Le moteur RAG compare l'ensemble des documents historiques avec les décisions récentes pour isoler les dates caduques, les clauses non signées et les écarts contractuels.
        </p>
      </div>

      {/* Contradictions List */}
      <div className="space-y-6">
        {analysis.contradictions.map((item, idx) => {
          const docA = findDoc(item.sourceA.docName);
          const docB = findDoc(item.sourceB.docName);

          return (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/60 shadow-sm space-y-5"
            >
              {/* Contradiction Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono text-xs font-black flex items-center justify-center border border-rose-300 dark:border-rose-800">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.topic}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.issue}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                  Divergence Détectée
                </span>
              </div>

              {/* Side-by-Side Comparison of Conflicting Sources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Source A (Often Outdated / Incomplete) */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-amber-500" /> Source A (Document initial ou contesté)
                    </span>
                    <span className="text-[10px] text-slate-400">{item.sourceA.date}</span>
                  </div>

                  <p className="p-2.5 rounded-lg bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 italic">
                    "{item.sourceA.statement}"
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Doc : {item.sourceA.docName}
                    </span>
                    {docA && (
                      <button
                        onClick={() => onSelectDocument(docA)}
                        className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        Consulter <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Source B (Often Valid / Decision) */}
                <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Source B (Arbitrage récent ou jalon officiel)
                    </span>
                    <span className="text-[10px] text-blue-400">{item.sourceB.date}</span>
                  </div>

                  <p className="p-2.5 rounded-lg bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-800 dark:text-slate-200 border border-blue-100 dark:border-blue-900/40 italic">
                    "{item.sourceB.statement}"
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-blue-900 dark:text-blue-300">
                      Doc : {item.sourceB.docName}
                    </span>
                    {docB && (
                      <button
                        onClick={() => onSelectDocument(docB)}
                        className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        Consulter <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* RAG Verdict & Operational Recommendation */}
              <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Statut Actuellement Valide (Vérité Terrain) :</span>
                </div>
                <p className="text-xs text-emerald-950 dark:text-emerald-100 font-medium leading-relaxed">
                  {item.validStatus}
                </p>

                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/80 flex items-start gap-2 text-xs text-emerald-900 dark:text-emerald-300">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>Recommandation Opérationnelle :</strong> {item.recommendation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
