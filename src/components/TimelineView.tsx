import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertTriangle, Calendar, User, FileText, ExternalLink, Filter } from 'lucide-react';
import { MilestoneItem, ProjectAnalysis, ProjectDocument } from '../types/project';

interface TimelineViewProps {
  analysis: ProjectAnalysis;
  documents: ProjectDocument[];
  onSelectDocument: (doc: ProjectDocument) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  analysis,
  documents = [],
  onSelectDocument
}) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const allMilestones = analysis?.milestones || [];

  const milestones = allMilestones.filter(m => {
    if (filter === 'completed') return m.status === 'completed';
    if (filter === 'pending') return m.status !== 'completed';
    return true;
  });

  const getStatusIcon = (status: MilestoneItem['status']) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 ring-4 ring-white dark:ring-slate-900">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'on_track':
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 ring-4 ring-white dark:ring-slate-900 animate-pulse">
            <Clock className="w-4 h-4" />
          </div>
        );
      case 'delayed':
      case 'at_risk':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 ring-4 ring-white dark:ring-slate-900">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
            <Calendar className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-md shadow-sky-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Chronologie &amp; Reconstitution de l'Évolution du Projet dans le Temps
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historique des jalons, décalages absorbés et trajectoire consolidée vers le Go-Live du 28 novembre 2026.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Tous les jalons ({analysis.milestones.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Complétés
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'pending'
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            À venir
          </button>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative">
        <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-800" />

        <div className="space-y-8 relative">
          {milestones.map((m, idx) => {
            return (
              <div key={idx} className="flex items-start gap-6 group">
                {/* Milestone Node */}
                <div className="shrink-0 z-10">
                  {getStatusIcon(m.status)}
                </div>

                {/* Milestone Details Card */}
                <div className="flex-1 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 group-hover:border-blue-400 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                        {m.date}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {m.title}
                      </h3>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase self-start sm:self-auto ${
                      m.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : m.status === 'on_track'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : m.status === 'at_risk'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {m.status === 'completed' ? 'Complété' : m.status === 'on_track' ? 'En cours' : m.status === 'at_risk' ? 'Sous surveillance' : 'Planifié'}
                    </span>
                  </div>

                  {m.initialDate && m.initialDate !== m.date && (
                    <div className="mt-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800/50">
                      ⚠️ <strong>Historique de report :</strong> Initialement prévu au <strong>{m.initialDate}</strong>, décalé suite aux arbitrages du comité de direction (Transcript M04).
                    </div>
                  )}

                  {m.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                      {m.notes}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Responsable : <strong className="text-slate-700 dark:text-slate-300">{m.owner}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
