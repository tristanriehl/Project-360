import React, { useState } from 'react';
import { Network, Cpu, Layers, Workflow } from 'lucide-react';
import { ProjectAnalysis, ProjectDocument } from '../types/project';
import { CombinedBrainAndSources } from './CombinedBrainAndSources';
import { ArchitectureAdvisor } from './ArchitectureAdvisor';
import { SystemFlowchart } from './SystemFlowchart';

export type MoreSubTabType = 'flowchart' | 'brain_sources' | 'advisor';

interface MorePageProps {
  analysis: ProjectAnalysis;
  documents: ProjectDocument[];
  onSelectDocument: (doc: ProjectDocument) => void;
  onRefreshAnalysis: () => void;
  isAnalyzing: boolean;
  onDocumentsAdded: (newDocs: ProjectDocument[]) => void;
  initialSubTab?: MoreSubTabType;
}

export const MorePage: React.FC<MorePageProps> = ({
  analysis,
  documents,
  onSelectDocument,
  onRefreshAnalysis,
  isAnalyzing,
  onDocumentsAdded,
  initialSubTab = 'flowchart'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<MoreSubTabType>(initialSubTab);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Centre Technique Avancé
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Diagrammes Mermaid.js, graphe de connaissances relationnel et benchmark comparatif des LLMs
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('flowchart')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'flowchart'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Architecture &amp; Flux (Mermaid)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('brain_sources')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'brain_sources'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Cerveau &amp; Sources</span>
          </button>

          <button
            onClick={() => setActiveSubTab('advisor')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'advisor'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Frontier vs Local LLM</span>
          </button>
        </div>
      </div>

      {/* Main Subtab Content */}
      <div>
        {activeSubTab === 'flowchart' && <SystemFlowchart />}
        {activeSubTab === 'brain_sources' && (
          <CombinedBrainAndSources
            analysis={analysis}
            documents={documents}
            onSelectDocument={onSelectDocument}
            onRefreshAnalysis={onRefreshAnalysis}
            isAnalyzing={isAnalyzing}
            onDocumentsAdded={onDocumentsAdded}
          />
        )}
        {activeSubTab === 'advisor' && <ArchitectureAdvisor />}
      </div>
    </div>
  );
};
