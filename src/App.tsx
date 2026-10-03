import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { ProjectBrainGraph } from './components/ProjectBrainGraph';
import { RagChat } from './components/RagChat';
import { NewEventSimulator } from './components/NewEventSimulator';
import { DecisionsRegister } from './components/DecisionsRegister';
import { ContradictionsDetector } from './components/ContradictionsDetector';
import { TimelineView } from './components/TimelineView';
import { DocumentManager } from './components/DocumentManager';
import { ExecutiveBriefing } from './components/ExecutiveBriefing';
import { ArchitectureAdvisor } from './components/ArchitectureAdvisor';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { LocalDemoModal } from './components/LocalDemoModal';
import { INITIAL_NOVA_ANALYSIS, SAMPLE_DOCUMENTS_NOVA } from './data/sampleProjects';
import { ProjectAnalysis, ProjectDocument } from './types/project';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [analysis, setAnalysis] = useState<ProjectAnalysis>(INITIAL_NOVA_ANALYSIS);
  const [documents, setDocuments] = useState<ProjectDocument[]>(SAMPLE_DOCUMENTS_NOVA);
  const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [initialChatQuery, setInitialChatQuery] = useState<string | undefined>(undefined);
  const [isLocalGuideOpen, setIsLocalGuideOpen] = useState(false);

  // Fetch current state from backend on mount
  useEffect(() => {
    fetch('/api/project')
      .then(res => res.json())
      .then(data => {
        if (data.project) setAnalysis(data.project);
        if (data.documents) setDocuments(data.documents);
      })
      .catch(err => {
        console.warn('Backend /api/project non accessible, chargement données locales:', err);
      });
  }, []);

  const handleResetProject = async () => {
    if (!window.confirm('Voulez-vous réinitialiser toutes les données au cas officiel NOVA ?')) return;

    try {
      const res = await fetch('/api/reset-project', { method: 'POST' });
      const data = await res.json();
      if (data.project) setAnalysis(data.project);
      if (data.documents) setDocuments(data.documents);
      setActiveTab('overview');
    } catch (err) {
      setAnalysis(INITIAL_NOVA_ANALYSIS);
      setDocuments(SAMPLE_DOCUMENTS_NOVA);
      setActiveTab('overview');
    }
  };

  const handleRefreshAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents })
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err: any) {
      alert(`Erreur lors de la réanalyse : ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickAsk = (question: string) => {
    setInitialChatQuery(question);
    setActiveTab('chat');
  };

  const handleEventApplied = (updatedProject: ProjectAnalysis, newDoc: ProjectDocument) => {
    setAnalysis(updatedProject);
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleDocumentsAdded = (newDocs: ProjectDocument[]) => {
    setDocuments(prev => [...newDocs, ...prev]);
    // Automatically trigger fresh analysis
    handleRefreshAnalysis();
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans flex flex-col">
      {/* Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'chat') setInitialChatQuery(undefined);
        }}
        analysis={analysis}
        onReset={handleResetProject}
        onRefresh={handleRefreshAnalysis}
        isAnalyzing={isAnalyzing}
        onOpenQuickAsk={handleQuickAsk}
        onOpenLocalGuide={() => setIsLocalGuideOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'overview' && (
          <DashboardOverview
            analysis={analysis}
            documents={documents}
            onSelectDocument={setSelectedDocument}
            onNavigateTab={setActiveTab}
            onQuickAsk={handleQuickAsk}
          />
        )}

        {activeTab === 'brain' && (
          <ProjectBrainGraph
            analysis={analysis}
            documents={documents}
            onSelectDocument={setSelectedDocument}
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

        {activeTab === 'documents' && (
          <DocumentManager
            documents={documents}
            onSelectDocument={setSelectedDocument}
            onRefreshAnalysis={handleRefreshAnalysis}
            isAnalyzing={isAnalyzing}
            onDocumentsAdded={handleDocumentsAdded}
          />
        )}

        {activeTab === 'briefing' && (
          <ExecutiveBriefing
            analysis={analysis}
            documents={documents}
          />
        )}

        {activeTab === 'advisor' && (
          <ArchitectureAdvisor />
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
    </div>
  );
}
