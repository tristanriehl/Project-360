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
  Layers,
  Github
} from 'lucide-react';
import { ProjectAnalysis } from '../types/project';
import { ThemeToggle } from '../context/ThemeContext';
import { LanguageToggle, useLanguage } from '../context/LanguageContext';

export type TabType = 
  | 'overview' 
  | 'chat' 
  | 'new_event' 
  | 'decisions' 
  | 'contradictions' 
  | 'timeline' 
  | 'briefing'
  | 'more';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  analysis: ProjectAnalysis;
  onReset: () => void;
  onRefresh: () => void;
  isAnalyzing: boolean;
  onOpenLocalGuide: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  analysis,
  onReset,
  onRefresh,
  isAnalyzing,
  onOpenLocalGuide
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number | string; highlight?: boolean }[] = [
    { id: 'overview', label: t('nav_overview'), icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { id: 'chat', label: t('nav_chat'), icon: <MessageSquareText className="w-4 h-4 text-blue-500 shrink-0" /> },
    { id: 'new_event', label: t('nav_new_event'), icon: <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />, highlight: true },
    { id: 'decisions', label: t('nav_decisions'), icon: <Scale className="w-4 h-4 text-emerald-500 shrink-0" />, badge: analysis?.decisions?.length ?? 0 },
    { id: 'contradictions', label: t('nav_contradictions'), icon: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />, badge: analysis?.contradictions?.length ?? 0 },
    { id: 'timeline', label: t('nav_timeline'), icon: <Clock className="w-4 h-4 text-sky-500 shrink-0" /> },
    { id: 'briefing', label: t('nav_briefing'), icon: <FileSpreadsheet className="w-4 h-4 text-teal-500 shrink-0" /> },
    { id: 'more', label: t('nav_more'), icon: <Layers className="w-4 h-4 text-indigo-500 shrink-0" /> },
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
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
        {/* GitHub Repository */}
        <a
          href="https://github.com/tristanriehl/Project-360"
          target="_blank"
          rel="noopener noreferrer"
          title={isCollapsed ? 'GitHub Repository' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <Github className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">GitHub Repo</span>}
        </a>

        {/* Local Demo Guide */}
        <button
          onClick={onOpenLocalGuide}
          title={isCollapsed ? t('nav_local_demo') : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <Laptop className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          {!isCollapsed && <span className="truncate">{t('nav_local_demo')}</span>}
        </button>

        {/* Re-analyze */}
        <button
          onClick={onRefresh}
          disabled={isAnalyzing}
          title={isCollapsed ? t('nav_resynthesize') : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            isAnalyzing ? 'text-blue-600 animate-pulse' : ''
          } ${isCollapsed ? 'justify-center px-2' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 shrink-0 ${isAnalyzing ? 'animate-spin text-blue-600' : ''}`} />
          {!isCollapsed && <span className="truncate">{isAnalyzing ? t('nav_analyzing') : t('nav_resynthesize')}</span>}
        </button>

        {/* Reset Data */}
        <button
          onClick={onReset}
          title={isCollapsed ? t('nav_reset') : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">{t('nav_reset')}</span>}
        </button>

        {/* Language Switcher (EN default, FR) - Placed right above the theme buttons */}
        <div className="pt-2">
          <LanguageToggle isCollapsed={isCollapsed} />
        </div>

        {/* Theme Switcher (System default, Light, Dark) */}
        <div className="pt-1">
          <ThemeToggle isCollapsed={isCollapsed} />
        </div>
      </div>
    </aside>
  );
};
