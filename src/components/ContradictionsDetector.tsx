import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, ExternalLink, Lightbulb } from 'lucide-react';
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
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Sleek Minimalist Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Contradictions &amp; Données Périmées
            </h2>
            <p className="text-xs text-slate-500">Conflits documentaires et écarts identifiés</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          {analysis.contradictions.length} détectées
        </span>
      </div>

      {/* Contradictions List */}
      <div className="space-y-4">
        {analysis.contradictions.map((item, idx) => {
          const docA = findDoc(item.sourceA.docName);
          const docB = findDoc(item.sourceB.docName);

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.topic}
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  Divergence
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                {item.issue}
              </p>

              {/* Side-by-Side Sources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                {/* Source A */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <XCircle className="w-3.5 h-3.5 text-amber-500" /> {item.sourceA.docName}
                    </span>
                    <span>{item.sourceA.date}</span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                    "{item.sourceA.statement}"
                  </p>
                  {docA && (
                    <button
                      onClick={() => onSelectDocument(docA)}
                      className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      Voir le document <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

                {/* Source B */}
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-blue-800 dark:text-blue-300">
                    <span className="flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {item.sourceB.docName}
                    </span>
                    <span>{item.sourceB.date}</span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded border border-blue-100 dark:border-blue-900/30">
                    "{item.sourceB.statement}"
                  </p>
                  {docB && (
                    <button
                      onClick={() => onSelectDocument(docB)}
                      className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      Voir le document <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

              </div>

              {/* Current Truth */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Statut Valide :</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{item.validStatus}</span>
                </div>
                <div className="text-[11px] text-emerald-950 dark:text-emerald-200 flex items-center gap-1 pt-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span><strong>Action :</strong> {item.recommendation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
