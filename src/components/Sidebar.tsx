import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  Sparkles, 
  Scale, 
  AlertCircle, 
  Clock, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  RotateCcw, 
  Laptop, 
  Workflow,
  Layers
} from 'lucide-react';
import { ProjectAnalysis } from '../types/project';
import { ThemeToggle } from '../context/ThemeContext';

export type TabType = 
  | 'overview' 
  | 'chat' 
  | 'new_event' 
  | 'decisions' 
  | 'contradictions' 
  | 'timeline' 
  | 'briefing';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  analysis: ProjectAnalysis;
  onReset: () => void;
  onRefresh: () => void;
  isAnalyzing: boolean;
  onOpenLocalGuide: () => void;
  onOpenFlowchart: () => void;
  onOpenMore: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  analysis,
  onReset,
  onRefresh,
  isAnalyzing,
  onOpenLocalGuide,
  onOpenFlowchart,
  onOpenMore
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number | string; highlight?: boolean }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { id: 'chat', label: 'Assistant RAG', icon: <MessageSquareText className="w-4 h-4 text-blue-500 shrink-0" /> },
    { id: 'new_event', label: 'Nouvel Événement', icon: <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />, highlight: true },
    { id: 'decisions', label: 'Décisions & Preuves', icon: <Scale className="w-4 h-4 text-emerald-500 shrink-0" />, badge: analysis.decisions.length },
    { id: 'contradictions', label: 'Contradictions', icon: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />, badge: analysis.contradictions.length },
    { id: 'timeline', label: 'Chronologie', icon: <Clock className="w-4 h-4 text-sky-500 shrink-0" /> },
    { id: 'briefing', label: 'Briefing Exécutif', icon: <FileSpreadsheet className="w-4 h-4 text-teal-500 shrink-0" /> },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out select-none shrink-0 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Header & Collapse Toggle */}
      <div>
        <div className={`flex items-center h-14 border-b border-slate-200 dark:border-slate-800 px-3 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              Navigation
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'}
            aria-label={isCollapsed ? 'Déplier' : 'Replier'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-bold'
                    : item.highlight
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100/80'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                {item.icon}

                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}

          {/* More Popup Trigger */}
          <button
            onClick={onOpenMore}
            title={isCollapsed ? 'More (Cerveau, Sources, LLM)' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200 transition-all mt-1 ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="truncate flex-1 text-left font-bold">More</span>
                <span className="text-[10px] text-slate-400 font-medium">Graphe &amp; LLM</span>
              </>
            )}
          </button>
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
        {/* Minimalist Flowchart & Architecture */}
        <button
          onClick={onOpenFlowchart}
          title={isCollapsed ? 'Architecture & Flux' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <Workflow className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          {!isCollapsed && <span className="truncate">Architecture &amp; Flux</span>}
        </button>

        {/* Local Demo Guide */}
        <button
          onClick={onOpenLocalGuide}
          title={isCollapsed ? 'Guide Démo Locale' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <Laptop className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          {!isCollapsed && <span className="truncate">Démo Locale</span>}
        </button>

        {/* Re-analyze */}
        <button
          onClick={onRefresh}
          disabled={isAnalyzing}
          title={isCollapsed ? 'Re-synthétiser avec l\'IA' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            isAnalyzing ? 'text-blue-600 animate-pulse' : ''
          } ${isCollapsed ? 'justify-center px-2' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 shrink-0 ${isAnalyzing ? 'animate-spin text-blue-600' : ''}`} />
          {!isCollapsed && <span className="truncate">{isAnalyzing ? 'Analyse...' : 'Re-synthétiser'}</span>}
        </button>

        {/* Reset Data */}
        <button
          onClick={onReset}
          title={isCollapsed ? 'Réinitialiser aux données par défaut' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Réinitialiser</span>}
        </button>

        {/* Theme Switcher (System default, Light, Dark) */}
        <div className="pt-1">
          <ThemeToggle isCollapsed={isCollapsed} />
        </div>
      </div>
    </aside>
  );
};
