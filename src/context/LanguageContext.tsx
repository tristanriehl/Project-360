import React, { createContext, useContext, useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export type Language = 'en' | 'fr';

export const translations = {
  en: {
    // Navigation
    nav_title: 'Navigation',
    nav_overview: 'Overview',
    nav_chat: 'RAG Assistant',
    nav_new_event: 'New Event',
    nav_decisions: 'Decisions & Evidence',
    nav_contradictions: 'Contradictions',
    nav_timeline: 'Timeline',
    nav_briefing: 'Executive Briefing',
    nav_more: 'More (Architecture & Docs)',
    nav_local_demo: 'Local Demo',
    nav_resynthesize: 'Re-synthesize',
    nav_analyzing: 'Analyzing...',
    nav_reset: 'Reset Data',

    // Themes
    theme_system: 'System',
    theme_light: 'Light',
    theme_dark: 'Dark',

    // Language
    lang_toggle_title: 'Language / Langue',
    lang_en: 'EN',
    lang_fr: 'FR',
    lang_english: 'English',
    lang_french: 'Français',

    // Top Header / Cockpit
    cockpit_title: 'Project Nova — Operational Memory Cockpit',
    cockpit_subtitle: 'RAG Ingestion Engine • 35+ Heterogeneous Documents • Verified Citations',
    health_score: 'Project Health Score',
    on_track: 'On Track with Deviations',
    critical_budget: 'Critical Overrun',
    calendar_slip: 'Calendar Slip',
    verified_decisions: 'Verified Decisions',
    open_contradictions: 'Open Contradictions',
    timeline_milestones: 'Key Milestones',
    sources_ingested: 'Ingested Sources',

    // New Event
    new_event_title: 'New Event & Direct Impact',
    new_event_desc: 'Inject an unexpected event (urgent email, security CVE, scope change) and watch the Gemini RAG engine recalculate impacts in < 30 seconds.',
    upload_file_title: 'Upload or Drop a Source Document',
    upload_file_hint: 'Drop a file here or browse your computer',
    upload_file_types: '.eml, .txt, .csv, .log, .md, .json',
    file_imported: 'File imported:',
    change_file: 'Change',
    event_title: 'Event Title',
    event_author: 'Sender / Author',
    event_category: 'Document Type',
    event_content: 'Full Content of Received Event',
    trigger_analysis: 'Trigger Impact Analysis (Gemini RAG)',
    triggering_analysis: 'Impact analysis in progress by Gemini RAG...',

    // More Page
    more_title: 'Advanced Technical Center',
    more_subtitle: 'Mermaid.js architecture flowcharts, document repository, and LLM comparison benchmark',
    more_tab_flowchart: 'Architecture & Flow (Mermaid)',
    more_tab_sources: 'Source Documents',
    more_tab_advisor: 'Frontier vs Local LLM',

    // Common
    view_details: 'View Details',
    close: 'Close',
    filter_all: 'All',
    search_placeholder: 'Search in 35+ documents...',
    download_report: 'Export Executive Briefing (PDF / Print)'
  },
  fr: {
    // Navigation
    nav_title: 'Navigation',
    nav_overview: 'Vue d\'ensemble',
    nav_chat: 'Assistant RAG',
    nav_new_event: 'Nouvel Événement',
    nav_decisions: 'Décisions & Preuves',
    nav_contradictions: 'Contradictions',
    nav_timeline: 'Chronologie',
    nav_briefing: 'Briefing Exécutif',
    nav_more: 'More (Architecture & Docs)',
    nav_local_demo: 'Démo Locale',
    nav_resynthesize: 'Re-synthétiser',
    nav_analyzing: 'Analyse...',
    nav_reset: 'Réinitialiser',

    // Themes
    theme_system: 'Système',
    theme_light: 'Clair',
    theme_dark: 'Sombre',

    // Language
    lang_toggle_title: 'Langue / Language',
    lang_en: 'EN',
    lang_fr: 'FR',
    lang_english: 'Anglais',
    lang_french: 'Français',

    // Top Header / Cockpit
    cockpit_title: 'Projet Nova — Cockpit de Mémoire Opérationnelle',
    cockpit_subtitle: 'Moteur RAG d\'Ingestion • 35+ Pièces Hétérogènes • Citations Certifiées',
    health_score: 'Indicateur de Santé',
    on_track: 'Sous Contrôle avec Écarts',
    critical_budget: 'Dépassement Critique',
    calendar_slip: 'Glissement Calendrier',
    verified_decisions: 'Décisions Actées',
    open_contradictions: 'Contradictions Ouvertes',
    timeline_milestones: 'Jalons Clés',
    sources_ingested: 'Sources Ingestées',

    // New Event
    new_event_title: 'Nouvel Événement & Impact Direct',
    new_event_desc: 'Injectez un événement imprévu (courriel urgent, audit sécurité, arbitrage) et observez le recalcul instantané en < 30 secondes.',
    upload_file_title: 'Téléverser ou Glisser un document source',
    upload_file_hint: 'Déposez un fichier ici ou parcourez votre ordinateur',
    upload_file_types: '.eml, .txt, .csv, .log, .md, .json',
    file_imported: 'Fichier importé :',
    change_file: 'Changer',
    event_title: 'Titre de l\'événement',
    event_author: 'Émetteur / Auteur',
    event_category: 'Type de document',
    event_content: 'Contenu intégral de l\'information reçue',
    trigger_analysis: 'Déclencher l\'analyse d\'impact (Gemini RAG)',
    triggering_analysis: 'Analyse d\'impact en cours par Gemini RAG...',

    // More Page
    more_title: 'Centre Technique Avancé',
    more_subtitle: 'Schémas d\'architecture Mermaid.js, répertoire documentaire et benchmark comparatif des LLMs',
    more_tab_flowchart: 'Architecture & Flux (Mermaid)',
    more_tab_sources: 'Sources Documentaires',
    more_tab_advisor: 'Frontier vs Local LLM',

    // Common
    view_details: 'Voir les détails',
    close: 'Fermer',
    filter_all: 'Tous',
    search_placeholder: 'Rechercher dans les 35+ documents...',
    download_report: 'Exporter le Briefing Exécutif (PDF / Impression)'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key) => translations.en[key] || key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('app-lang') as Language;
      if (saved === 'en' || saved === 'fr') return saved;
    } catch (e) {}
    return 'en'; // Defaulted to English mode as requested
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('app-lang', lang);
    } catch (e) {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  const t = (key: keyof typeof translations['en']): string => {
    const currentDict = translations[language] || translations.en;
    return currentDict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export const LanguageToggle: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed }) => {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (isCollapsed) {
    return (
      <button
        onClick={toggleLanguage}
        title={`Language: ${language === 'en' ? 'English (Click to switch to French)' : 'Français (Cliquer pour basculer en Anglais)'}`}
        className="w-full p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center font-bold text-xs"
      >
        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] uppercase font-mono">
          {language}
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
      <div className="flex items-center gap-1.5 pl-2 text-slate-400 dark:text-slate-500">
        <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider hidden xl:inline">Lang:</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setLanguage('en')}
          title="English (Default)"
          className={`flex items-center justify-center gap-1 py-1 px-2.5 rounded-lg text-[11px] font-bold transition-all ${
            language === 'en'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>EN</span>
        </button>

        <button
          onClick={() => setLanguage('fr')}
          title="Français"
          className={`flex items-center justify-center gap-1 py-1 px-2.5 rounded-lg text-[11px] font-bold transition-all ${
            language === 'fr'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>FR</span>
        </button>
      </div>
    </div>
  );
};
