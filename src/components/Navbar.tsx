import React from 'react';
import { 
  Brain, 
  LayoutDashboard, 
  Network, 
  MessageSquareText, 
  Sparkles, 
  Scale, 
  AlertCircle, 
  Clock, 
  FolderGit2, 
  FileSpreadsheet, 
  Cpu,
  RotateCcw,
  RefreshCw,
  Search
} from 'lucide-react';
import { ProjectAnalysis } from '../types/project';

export type TabType = 
  | 'overview' 
  | 'brain' 
  | 'chat' 
  | 'new_event' 
  | 'decisions' 
  | 'contradictions' 
  | 'timeline' 
  | 'documents' 
  | 'briefing' 
  | 'advisor';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  analysis: ProjectAnalysis;
  onReset: () => void;
  onRefresh: () => void;
  isAnalyzing: boolean;
  onOpenQuickAsk: (question: string) => void;
  onOpenLocalGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  analysis,
  onReset,
  onRefresh,
  isAnalyzing,
  onOpenQuickAsk,
  onOpenLocalGuide
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onOpenQuickAsk(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number | string; highlight?: boolean }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'brain', label: 'Cerveau & Graphe', icon: <Network className="w-4 h-4 text-indigo-500" /> },
    { id: 'chat', label: 'Assistant RAG', icon: <MessageSquareText className="w-4 h-4 text-blue-500" /> },
    { id: 'new_event', label: 'Nouvel Événement', icon: <Sparkles className="w-4 h-4 text-amber-500" />, highlight: true },
    { id: 'decisions', label: 'Décisions & Preuves', icon: <Scale className="w-4 h-4 text-emerald-500" />, badge: analysis.decisions.length },
    { id: 'contradictions', label: 'Contradictions', icon: <AlertCircle className="w-4 h-4 text-rose-500" />, badge: analysis.contradictions.length },
    { id: 'timeline', label: 'Chronologie', icon: <Clock className="w-4 h-4 text-sky-500" /> },
    { id: 'documents', label: 'Sources & Fichiers', icon: <FolderGit2 className="w-4 h-4 text-slate-500" /> },
    { id: 'briefing', label: 'Briefing Exécutif', icon: <FileSpreadsheet className="w-4 h-4 text-teal-500" /> },
    { id: 'advisor', label: 'Frontier vs Local LLM', icon: <Cpu className="w-4 h-4 text-purple-500" /> },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-emerald-500 text-emerald-50 border-emerald-400';
      case 'at_risk':
        return 'bg-amber-500 text-amber-50 border-amber-400';
      case 'delayed':
        return 'bg-rose-500 text-rose-50 border-rose-400';
      default:
        return 'bg-blue-500 text-blue-50 border-blue-400';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/20">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  PROJET 360
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  RAG BRAIN
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none">
                Mémoire Opérationnelle &amp; Dashboard Dynamique
              </p>
            </div>
          </div>

          {/* Quick Search / Natural Language Ask Input */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Interroger le projet en langage naturel..."
                className="w-full pl-9 pr-24 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Poser
              </button>
            </div>
          </form>

          {/* Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Health Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className={`w-2.5 h-2.5 rounded-full ${analysis.healthScore >= 75 ? 'bg-emerald-500' : analysis.healthScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'} animate-ping`} />
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Santé Projet</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {analysis.healthScore}% • <span className="capitalize">{analysis.status === 'at_risk' ? 'Sous surveillance' : analysis.status === 'delayed' ? 'Critique' : 'Conforme'}</span>
                </div>
              </div>
            </div>

            {/* Local Run & Demo Guide Button */}
            <button
              onClick={onOpenLocalGuide}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs"
              title="Guide pour exécuter le projet 100% en local sur votre ordinateur"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Démo Locale / Terminal</span>
            </button>

            {/* AI Engine Pill */}
            <div 
              onClick={() => setActiveTab('advisor')} 
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-medium cursor-pointer hover:bg-purple-100 transition-colors"
              title="Cliquer pour voir le comparatif Frontier vs Local LLM"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              <span>Gemini 3.8 Flash + RAG</span>
            </div>

            {/* Re-analyze Button */}
            <button
              onClick={onRefresh}
              disabled={isAnalyzing}
              className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${isAnalyzing ? 'animate-spin text-blue-600' : ''}`}
              title="Réanalyser le projet avec l'IA"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Reset to Default Data */}
            <button
              onClick={onReset}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Réinitialiser au jeu de données NOVA initial"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-1.5 min-w-max">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-bold'
                      : item.highlight
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-200'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
