import React, { useState } from 'react';
import { Scale, CheckCircle2, FileText, ExternalLink, Filter, Search, Quote, Calendar, User, ShieldCheck } from 'lucide-react';
import { Decision, ProjectAnalysis, ProjectDocument } from '../types/project';

interface DecisionsRegisterProps {
  analysis: ProjectAnalysis;
  documents: ProjectDocument[];
  onSelectDocument: (doc: ProjectDocument) => void;
}

export const DecisionsRegister: React.FC<DecisionsRegisterProps> = ({
  analysis,
  documents,
  onSelectDocument
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredDecisions = analysis.decisions.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (search.trim()) {
      const match = d.title.toLowerCase().includes(search.toLowerCase()) ||
                    d.rationale.toLowerCase().includes(search.toLowerCase()) ||
                    d.owner.toLowerCase().includes(search.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const getSourceDoc = (sourceName?: string) => {
    if (!sourceName) return null;
    return documents.find(d => d.name.toLowerCase().includes(sourceName.toLowerCase()));
  };

  const getStatusBadge = (status: Decision['status']) => {
    switch (status) {
      case 'approved':
      case 'implemented':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approuvée &amp; Actée
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            En délibération
          </span>
        );
      case 'superseded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Remplacée
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Registre Officiel des Décisions &amp; Justifications (Preuves Auditables)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Traçabilité complète des arbitrages stratégiques, techniques et financiers avec extraits textuels authentifiés.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer les décisions..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="all">Tous statuts ({analysis.decisions.length})</option>
            <option value="approved">Approuvées</option>
            <option value="implemented">Implémentées</option>
          </select>
        </div>
      </div>

      {/* Decisions Cards List */}
      <div className="space-y-4">
        {filteredDecisions.map((dec) => {
          const doc = getSourceDoc(dec.sourceDocName);

          return (
            <div
              key={dec.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    {dec.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {dec.title}
                  </h3>
                </div>
                {getStatusBadge(dec.status)}
              </div>

              {/* Grid with Rationale & Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                    🎯 Justification / Contexte de la décision :
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {dec.rationale}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                  <div className="font-bold text-blue-900 dark:text-blue-300 mb-1">
                    ⚡ Impact Opérationnel &amp; Périmètre :
                  </div>
                  <p className="text-blue-950 dark:text-blue-200 leading-relaxed font-medium">
                    {dec.impact}
                  </p>
                </div>
              </div>

              {/* Evidence Quote Block */}
              {dec.evidenceQuote && (
                <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    <Quote className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Preuve Documentée &amp; Verbatim :</span>
                  </div>
                  <p className="text-xs font-mono italic text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 select-text">
                    "{dec.evidenceQuote}"
                  </p>
                </div>
              )}

              {/* Card Footer with Owner, Date & Source link */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Décidé par : <strong className="text-slate-800 dark:text-slate-200">{dec.owner}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Date : <strong className="text-slate-800 dark:text-slate-200">{dec.date}</strong></span>
                  </div>
                </div>

                {dec.sourceDocName && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Source :</span>
                    {doc ? (
                      <button
                        onClick={() => onSelectDocument(doc)}
                        className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{dec.sourceDocName}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{dec.sourceDocName}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
