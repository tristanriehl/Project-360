import React, { useState } from 'react';
import { Network, FolderGit2 } from 'lucide-react';
import { ProjectAnalysis, ProjectDocument } from '../types/project';
import { ProjectBrainGraph } from './ProjectBrainGraph';
import { DocumentManager } from './DocumentManager';

interface CombinedBrainAndSourcesProps {
  analysis: ProjectAnalysis;
  documents: ProjectDocument[];
  onSelectDocument: (doc: ProjectDocument) => void;
  onRefreshAnalysis: () => void;
  isAnalyzing: boolean;
  onDocumentsAdded: (newDocs: ProjectDocument[]) => void;
}

export const CombinedBrainAndSources: React.FC<CombinedBrainAndSourcesProps> = ({
  analysis,
  documents,
  onSelectDocument,
  onRefreshAnalysis,
  isAnalyzing,
  onDocumentsAdded
}) => {
  const [viewMode, setViewMode] = useState<'graph' | 'documents'>('graph');

  return (
    <div className="space-y-4">
      {/* Sub-navigation switcher */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('graph')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'graph'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Graphe Neuronal</span>
          </button>

          <button
            onClick={() => setViewMode('documents')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'documents'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Répertoire des Sources ({documents.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline px-2">
          Mémoire Opérationnelle Unifiée
        </span>
      </div>

      {/* Content View */}
      {viewMode === 'graph' ? (
        <ProjectBrainGraph
          analysis={analysis}
          documents={documents}
          onSelectDocument={onSelectDocument}
        />
      ) : (
        <DocumentManager
          documents={documents}
          onSelectDocument={onSelectDocument}
          onRefreshAnalysis={onRefreshAnalysis}
          isAnalyzing={isAnalyzing}
          onDocumentsAdded={onDocumentsAdded}
        />
      )}
    </div>
  );
};
