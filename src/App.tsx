import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { RagChat } from './components/RagChat';
import { NewEventSimulator } from './components/NewEventSimulator';
import { DecisionsRegister } from './components/DecisionsRegister';
import { ContradictionsDetector } from './components/ContradictionsDetector';
import { TimelineView } from './components/TimelineView';
import { ExecutiveBriefing } from './components/ExecutiveBriefing';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { LocalDemoModal } from './components/LocalDemoModal';
import { MorePage } from './components/MorePage';
import { DatasetImportScreen } from './components/DatasetImportScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { normalizeAnalysis } from './utils/normalizeAnalysis';
import { EMPTY_PROJECT_ANALYSIS } from './data/sampleProjects';
import { ProjectAnalysis, ProjectDocument } from './types/project';
import { FolderUp, Trash2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [analysis, setAnalysis] = useState<ProjectAnalysis>(EMPTY_PROJECT_ANALYSIS);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [initialChatQuery, setInitialChatQuery] = useState<string | undefined>(undefined);
  const [isLocalGuideOpen, setIsLocalGuideOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const isEn = language === 'en';

  // Fetch current state from backend on mount
  useEffect(() => {
    fetch('/api/project')
      .then(res => res.json())
      .then(data => {
        if (data.documents && Array.isArray(data.documents) && data.documents.length > 0) {
          setDocuments(data.documents);
          if (data.project) {
            setAnalysis(normalizeAnalysis(data.project));
          }
        }
      })
      .catch(err => {
        console.warn('Backend /api/project initial check:', err);
      });
  }, []);

  const handleResetProject = async () => {
    if (!window.confirm(isEn ? 'Clear all documents and import a new folder?' : 'Voulez-vous vider tous les documents et importer un nouveau dossier ?')) return;

    try {
      await fetch('/api/clear-dataset', { method: 'POST' });
    } catch (err) {}
    
    setAnalysis(EMPTY_PROJECT_ANALYSIS);
    setDocuments([]);
    setActiveTab('overview');
  };

  const handleRefreshAnalysis = async () => {
    if (documents.length === 0) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents })
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(normalizeAnalysis(data.analysis));
      }
    } catch (err) {
      console.warn('Erreur lors du rafraîchissement:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEventApplied = (updatedAnalysis: ProjectAnalysis, newDoc: ProjectDocument) => {
    setDocuments(prev => [newDoc, ...prev]);
    setAnalysis(normalizeAnalysis(updatedAnalysis));
  };

  const handleDocumentsAdded = (newDocs: ProjectDocument[]) => {
    setDocuments(prev => [...newDocs, ...prev]);
  };

  const handleDatasetLoaded = (newDocs: ProjectDocument[], newAnalysis: ProjectAnalysis) => {
    const safeDocs = Array.isArray(newDocs) ? newDocs : [];
    const safeAnalysis = normalizeAnalysis(newAnalysis);
    setDocuments(safeDocs);
    setAnalysis(safeAnalysis);
    setIsFolderModalOpen(false);
    setActiveTab('overview');
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased overflow-hidden">
        {/* Collapsible Side Navigation Bar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'chat') setInitialChatQuery(undefined);
          }}
          analysis={analysis}
          onReset={handleResetProject}
          onRefresh={handleRefreshAnalysis}
          isAnalyzing={isAnalyzing}
          onOpenLocalGuide={() => setIsLocalGuideOpen(true)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 max-w-7xl mx-auto overflow-y-auto flex flex-col">
          
          {/* If no documents are loaded yet, display the Dataset Folder Import Screen */}
          {documents.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <DatasetImportScreen onDatasetLoaded={handleDatasetLoaded} />
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {/* Top Operational Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {analysis.projectName || (isEn ? 'Imported Project' : 'Projet Importé')}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-2 font-mono">
                      ({documents.length} {isEn ? 'real documents in RAG memory' : 'pièces réelles en mémoire RAG'})
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFolderModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <FolderUp className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Change / Import Folder' : 'Changer / Importer Dossier'}</span>
                  </button>

                  <button
                    onClick={handleResetProject}
                    title={isEn ? 'Clear dataset' : 'Vider le dossier'}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Normal Full Tab Views */}
              {activeTab === 'overview' && (
                <DashboardOverview
                  analysis={analysis}
                  documents={documents}
                  onSelectDocument={setSelectedDocument}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'chat' && (
                <RagChat
                  documents={documents}
                  onSelectDocument={setSelectedDocument}
                  initialQuery={initialChatQuery}
                />
              )}

              {activeTab === 'new_event' && (
                <NewEventSimulator
                  analysis={analysis}
                  onEventApplied={handleEventApplied}
                />
              )}

              {activeTab === 'decisions' && (
                <DecisionsRegister
                  analysis={analysis}
                  documents={documents}
                  onSelectDocument={setSelectedDocument}
                />
              )}

              {activeTab === 'contradictions' && (
                <ContradictionsDetector
                  analysis={analysis}
                  documents={documents}
                  onSelectDocument={setSelectedDocument}
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineView
                  analysis={analysis}
                  documents={documents}
                  onSelectDocument={setSelectedDocument}
                />
              )}

              {activeTab === 'briefing' && (
                <ExecutiveBriefing
                  analysis={analysis}
                  documents={documents}
                />
              )}

              {activeTab === 'more' && (
                <MorePage
                  analysis={analysis}
                  documents={documents}
                  onSelectDocument={setSelectedDocument}
                  onRefreshAnalysis={handleRefreshAnalysis}
                  isAnalyzing={isAnalyzing}
                  onDocumentsAdded={handleDocumentsAdded}
                />
              )}
            </div>
          )}
        </main>

        {/* Global Document Viewer Modal */}
        <DocumentViewerModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />

        {/* Local Demo & Run Instructions Modal */}
        <LocalDemoModal
          isOpen={isLocalGuideOpen}
          onClose={() => setIsLocalGuideOpen(false)}
        />

        {/* Dataset Folder Re-Import Modal */}
        {isFolderModalOpen && (
          <DatasetImportScreen
            isModal
            onClose={() => setIsFolderModalOpen(false)}
            onDatasetLoaded={handleDatasetLoaded}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
