import React, { useState } from 'react';
import { Scale, CheckCircle2, FileText, ExternalLink, Search, Quote, Calendar, User } from 'lucide-react';
import { Decision, ProjectAnalysis, ProjectDocument } from '../types/project';
import { cleanUtfString } from '../utils/cleanUtf';

interface DecisionsRegisterProps {
  analysis: ProjectAnalysis;
  documents: ProjectDocument[];
  onSelectDocument: (doc: ProjectDocument) => void;
}

export const DecisionsRegister: React.FC<DecisionsRegisterProps> = ({
  analysis,
  documents = [],
  onSelectDocument
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const decisionsList = analysis?.decisions || [];

  const filteredDecisions = decisionsList.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = (d.title || '').toLowerCase().includes(q) ||
                    (d.rationale || '').toLowerCase().includes(q) ||
                    (d.owner || '').toLowerCase().includes(q) ||
                    (d.sourceDocName || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getSourceDoc = (sourceName?: string, sourceId?: string) => {
    if (!documents || documents.length === 0) return null;
    if (sourceId) {
      const byId = documents.find(d => d.id === sourceId);
      if (byId) return byId;
    }
    if (!sourceName) return documents[0] || null;
    const cleanSource = sourceName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return documents.find(d => {
      const cleanDoc = d.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanDoc.includes(cleanSource) || cleanSource.includes(cleanDoc);
    }) || documents[0] || null;
  };

  const getStatusBadge = (status: Decision['status']) => {
    switch (status) {
      case 'approved':
      case 'implemented':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Actée
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            En délibération
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            Documentée
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Sleek Minimalist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Décisions &amp; Preuves Documentées ({decisionsList.length})
            </h2>
            <p className="text-xs text-slate-500">Traçabilité et citations textuelles issues de vos documents</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une décision..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="all">Toutes ({decisionsList.length})</option>
            <option value="approved">Actées</option>
          </select>
        </div>
      </div>

      {/* Decisions List */}
      <div className="space-y-3">
        {filteredDecisions.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            Aucune décision trouvée pour cette recherche.
          </div>
        ) : (
          filteredDecisions.map((dec) => {
            const doc = getSourceDoc(dec.sourceDocName, dec.sourceDocId);

            return (
              <div
                key={dec.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {dec.id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {dec.title}
                    </h3>
                  </div>
                  {getStatusBadge(dec.status)}
                </div>

                {/* Rationale & Impact */}
                <div className="text-xs space-y-1">
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Justification :</strong> {dec.rationale}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    <strong>Impact :</strong> {dec.impact}
                  </p>
                </div>

                {/* Evidence Quote */}
                {dec.evidenceQuote && (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-semibold text-slate-500 text-[10px] uppercase block mb-0.5">Preuve textuelle :</span>
                    <p className="font-mono italic text-slate-800 dark:text-slate-200 text-[11px]">
                      "{cleanUtfString(dec.evidenceQuote)}"
                    </p>
                  </div>
                )}

                {/* Meta footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span>Par : <strong className="text-slate-700 dark:text-slate-300">{dec.owner}</strong></span>
                    <span>Date : <strong>{dec.date}</strong></span>
                  </div>
                  {doc && (
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{dec.sourceDocName || doc.name}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
