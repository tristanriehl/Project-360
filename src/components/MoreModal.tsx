import React, { useState } from 'react';
import { X, Network, Cpu, Layers } from 'lucide-react';
import { ProjectAnalysis, ProjectDocument } from '../types/project';
import { CombinedBrainAndSources } from './CombinedBrainAndSources';
import { ArchitectureAdvisor } from './ArchitectureAdvisor';

interface MoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ProjectAnalysis;
  documents: ProjectDocument[];
  onSelectDocument: (doc: ProjectDocument) => void;
  onRefreshAnalysis: () => void;
  isAnalyzing: boolean;
  onDocumentsAdded: (newDocs: ProjectDocument[]) => void;
  initialSubTab?: 'brain_sources' | 'advisor';
}

export const MoreModal: React.FC<MoreModalProps> = ({
  isOpen,
  onClose,
  analysis,
  documents,
  onSelectDocument,
  onRefreshAnalysis,
  isAnalyzing,
  onDocumentsAdded,
  initialSubTab = 'brain_sources'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'brain_sources' | 'advisor'>(initialSubTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                More
              </h3>
            </div>

            {/* Tab selection inside More */}
            <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveSubTab('brain_sources')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSubTab === 'brain_sources'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Cerveau &amp; Sources</span>
              </button>

              <button
                onClick={() => setActiveSubTab('advisor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSubTab === 'advisor'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Frontier vs Local LLM</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40">
          {activeSubTab === 'brain_sources' ? (
            <CombinedBrainAndSources
              analysis={analysis}
              documents={documents}
              onSelectDocument={onSelectDocument}
              onRefreshAnalysis={onRefreshAnalysis}
              isAnalyzing={isAnalyzing}
              onDocumentsAdded={onDocumentsAdded}
            />
          ) : (
            <ArchitectureAdvisor />
          )}
        </div>
      </div>
    </div>
  );
};
