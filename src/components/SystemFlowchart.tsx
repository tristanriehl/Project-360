import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  Workflow, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Code, 
  Eye, 
  Sparkles,
  Layers,
  FileCode,
  Download,
  Maximize2,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const SystemFlowchart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  
  const [activePreset, setActivePreset] = useState<'architecture' | 'event_loop' | 'rag_engine'>('architecture');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenZoom, setFullscreenZoom] = useState(1);

  const { resolvedTheme } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Multi-language diagrams with pristine, error-free Mermaid syntax
  const diagrams: Record<string, { title: string; subtitle: string; code: string; description: string }> = {
    architecture: {
      title: isEn ? "Global System Architecture & End-to-End RAG Pipeline" : "Architecture Globale & Pipeline RAG E2E",
      subtitle: isEn 
        ? "Multi-format ingestion, operational memory, reasoning core, and 360° cockpit"
        : "Ingestion multi-formats, mémoire hybride et cockpit opérationnel 360°",
      description: isEn
        ? "Complete operational pipeline demonstrating how emails, meeting minutes, contracts, spreadsheets, and JIRA tickets are normalized, embedded, and queried in real-time with certified citations."
        : "Flux de données complet illustrant comment les courriels, comptes-rendus, contrats, tableurs et billets d'incidents sont transformés en mémoire opérationnelle certifiée et restitués en temps réel.",
      code: isEn ? `flowchart TB
    subgraph S1["1. MULTI-SOURCE INGESTION LAYER"]
        direction TB
        A1["📧 Emails (.eml, headers & threads)"]
        A2["👥 Meeting Notes & Transcripts (.txt, .md)"]
        A3["🎫 JIRA Tickets & Bug Reports (.txt, .json)"]
        A4["📑 Contracts & Statements (.pdf)"]
        A5["📊 Tracking Sheets & Financials (.xlsx, .csv)"]
    end

    subgraph S2["2. AST NORMALIZATION & PARSING"]
        direction TB
        B1["Sanitization & UTF AST Cleaner"]
        B2["Semantic Chunking (512 tokens with overlap)"]
        B3["Metadata Extraction (Dates, Amounts, Owners)"]
        B1 --> B2 --> B3
    end

    subgraph S3["3. HYBRID OPERATIONAL MEMORY"]
        direction TB
        C1[("Vector RAG Store & Embeddings")]
        C2[("Relational Knowledge Graph")]
        C3[("Financial Calculation Engine")]
    end

    subgraph S4["4. INTELLIGENCE & REASONING CORE"]
        direction TB
        D1{"Gemini RAG Engine"}
        D2["Contradiction & Divergence Detector"]
        D3["Decisions Register & Evidence Quotes"]
        D4["Unforeseen Event Simulator"]
        D1 --> D2
        D1 --> D3
        D1 --> D4
    end

    subgraph S5["5. 360° OPERATIONAL COCKPIT"]
        direction TB
        E1["Health Score & Executive Gauge"]
        E2["Interactive Q&A with Citation Badges"]
        E3["Automated Financial Reconciliation"]
        E4["Audited Chronological Timeline"]
    end

    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> S5` : `flowchart TB
    subgraph S1["1. SOURCES DOCUMENTAIRES HÉTÉROGÈNES"]
        direction TB
        A1["📧 Courriels (.eml)"]
        A2["👥 Comptes-Rendus & PV (.txt, .md)"]
        A3["🎫 Tickets & Incidents JIRA"]
        A4["📑 Contrats & Factures (.pdf)"]
        A5["📊 Tableurs de Suivi (.xlsx, .csv)"]
    end

    subgraph S2["2. PIPELINE D'INGESTION & EXTRACTION"]
        direction TB
        B1["Normalisation & Sanitisation AST"]
        B2["Découpage Sémantique (512 tokens)"]
        B3["Extraction Métadonnées (Auteurs, Dates, Montants)"]
        B1 --> B2 --> B3
    end

    subgraph S3["3. MÉMOIRE OPÉRATIONNELLE DU PROJET"]
        direction TB
        C1[("Index Vectoriel RAG (Embeddings)")]
        C2[("Graphe de Connaissances Relationnel")]
        C3[("Moteur de Calcul Financier Intégré")]
    end

    subgraph S4["4. MOTEUR D'INTELLIGENCE & RAISONNEMENT"]
        direction TB
        D1{"Cerveau Opérationnel RAG"}
        D2["Détecteur de Contradictions"]
        D3["Registre des Décisions & Preuves"]
        D4["Simulateur d'Événements & Impact"]
        D1 --> D2
        D1 --> D3
        D1 --> D4
    end

    subgraph S5["5. COCKPIT 360° & RESTITUTION"]
        direction TB
        E1["Tableau de Bord & Score de Santé"]
        E2["Assistant RAG avec Citations Factuelles"]
        E3["Suivi Budgétaire & Factures Calculé"]
        E4["Chronologie Interactive & Jalons"]
    end

    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> S5`
    },
    event_loop: {
      title: isEn ? "Unforeseen Event Fast Reactive Loop (< 30s)" : "Boucle de Réaction à l'Événement Imprévu (< 30s)",
      subtitle: isEn ? "Hot-ingestion cycle and instant impact recalculation" : "Cycle d'ingestion à chaud et recalcul d'impact",
      description: isEn
        ? "When a new event occurs (urgent email, unapproved amendment, security issue), the agent instantly evaluates: What changed? What is affected? What immediate actions are required?"
        : "Lorsqu'un nouvel événement survient (courriel critique, avenant non signé, anomalie), l'agent évalue instantanément ce qui a changé, ce qui est affecté, et les actions prioritaires à engager.",
      code: isEn ? `flowchart LR
    E1["📥 New Unforeseen Event\n(Email, Alert, Ticket)"] --> E2["🔍 Parsing & Tokenization\n(Sender, Timestamp, Body)"]
    E2 --> E3{"⚡ Gemini Impact Ingestion\n(< 30s Processing)"}
    
    E3 -->|What changes?| O1["Delta Analysis\n(New ground truth state)"]
    E3 -->|What is affected?| O2["Historical Invalidation\n(Milestones, Contracts, Budget)"]
    E3 -->|Immediate actions| O3["Action Plan & Priorities\n(Mitigations under 48h)"]

    O1 --> R1["📊 Updated Cockpit\n(Health Score, Alerts, Registry)"]
    O2 --> R1
    O3 --> R1` : `flowchart LR
    E1["📥 Nouvel Événement Reçu\n(Courriel, Alerte, Ticket)"] --> E2["🔍 Extraction & Parsing\n(Auteur, Horodatage, Contenu)"]
    E2 --> E3{"⚡ Analyse d'Impact Dynamique\n(Moteur d'Inférence RAG)"}
    
    E3 -->|Qu'est-ce qui change ?| O1["Synthèse du Changement\n(Nouvel élément de vérité)"]
    E3 -->|Qu'est-ce qui est affecté ?| O2["Invalidation des Antériorités\n(Jalons, Contrats, Décisions)"]
    E3 -->|Actions immédiates| O3["Recommandations & Priorités\n(Plan d'action sous 48h)"]

    O1 --> R1["📊 Actualisation du Cockpit\n(Health Score, Alertes & Jalons)"]
    O2 --> R1
    O3 --> R1`
    },
    rag_engine: {
      title: isEn ? "RAG Reasoning Pipeline & Certified Citations" : "Pipeline de Raisonnement RAG & Preuves Certifiées",
      subtitle: isEn ? "From executive query to factual citations with source verification" : "De la question utilisateur aux citations vérifiables avec pages",
      description: isEn
        ? "Sequence flow detailing semantic chunk retrieval, zero-hallucination constraint enforcement, and verifiable citation badges linking directly to raw documents."
        : "Schéma d'échange séquentiel détaillant l'accès aux fragments documentaires indexés, l'interdiction de toute hallucination et le formatage des citations certifiées.",
      code: isEn ? `sequenceDiagram
    autonumber
    actor User as Executive / Project Director
    participant UI as Project 360 Cockpit
    participant API as RAG Controller (/api/chat-rag)
    participant Memory as Operational Memory
    participant LLM as Reasoning Engine (Gemini)

    User->>UI: Strategic prompt or question
    UI->>API: Send request with conversation history
    API->>Memory: Semantic vector query & document filtering
    Memory-->>API: Return top verified factual passages
    API->>LLM: Prompt augmented with strict source context
    Note over LLM: Golden Rule: Zero hallucinations,<br/>mandatory textual quotations
    LLM-->>API: Structured response (Facts, Badges, Next Steps)
    API-->>UI: Verified JSON payload with citations
    UI-->>User: Render verified answer with clickable source badges` : `sequenceDiagram
    autonumber
    actor User as Décideur / Direction
    participant UI as Cockpit Projet 360
    participant API as Contrôleur RAG (/api/chat-rag)
    participant Memory as Mémoire Opérationnelle
    participant LLM as Moteur de Raisonnement

    User->>UI: Pose une question stratégique
    UI->>API: Requête avec historique de conversation
    API->>Memory: Recherche sémantique & filtres par pièces
    Memory-->>API: Restitue les extraits factuels les plus pertinents
    API->>LLM: Prompt augmenté avec contexte documentaire strict
    Note over LLM: Règle d'or : Aucune invention,<br/>justifications textuelles obligatoires
    LLM-->>API: Réponse structurée (Faits, Citations, Suivi)
    API-->>UI: Payload JSON avec citations certifiées
    UI-->>User: Affichage clair avec badges de sources consultables`
    }
  };

  const currentDiagram = diagrams[activePreset];

  // Helper to render Mermaid diagram into a container
  const renderDiagram = async (targetElement: HTMLDivElement | null, idPrefix: string) => {
    if (!targetElement) return;
    try {
      setRenderError(null);
      targetElement.innerHTML = '';

      const isDark = resolvedTheme === 'dark';

      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'neutral',
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        themeVariables: isDark ? {
          background: '#0f172a',
          primaryColor: '#1e293b',
          primaryBorderColor: '#3b82f6',
          primaryTextColor: '#f8fafc',
          lineColor: '#60a5fa',
          secondaryColor: '#1e293b',
          tertiaryColor: '#0f172a',
          noteBkgColor: '#1e293b',
          noteTextColor: '#f8fafc',
          noteBorderColor: '#3b82f6',
          actorBkg: '#1e293b',
          actorTextColor: '#f8fafc',
          actorBorder: '#3b82f6',
          signalColor: '#60a5fa',
          signalTextColor: '#f8fafc',
          labelTextColor: '#f8fafc',
          edgeLabelBackground: '#1e293b'
        } : {
          background: '#ffffff',
          primaryColor: '#f1f5f9',
          primaryBorderColor: '#2563eb',
          primaryTextColor: '#0f172a',
          lineColor: '#2563eb',
          secondaryColor: '#f8fafc',
          tertiaryColor: '#e2e8f0',
          noteBkgColor: '#fef3c7',
          noteTextColor: '#78350f',
          noteBorderColor: '#f59e0b',
          actorBkg: '#eff6ff',
          actorTextColor: '#1e3a8a',
          actorBorder: '#3b82f6',
          signalColor: '#2563eb',
          signalTextColor: '#0f172a',
          labelTextColor: '#0f172a',
          edgeLabelBackground: '#f8fafc'
        }
      });

      const uniqueId = `${idPrefix}-${activePreset}-${Date.now()}`;
      const { svg } = await mermaid.render(uniqueId, currentDiagram.code);

      targetElement.innerHTML = svg;
      
      const svgElement = targetElement.querySelector('svg');
      if (svgElement) {
        svgElement.style.maxWidth = '100%';
        svgElement.style.height = 'auto';
        svgElement.style.margin = '0 auto';
        svgElement.classList.add('transition-all', 'duration-200');
      }
    } catch (err: any) {
      console.error('Mermaid render error:', err);
      setRenderError(err?.message || (isEn ? 'Error rendering Mermaid.js diagram' : 'Erreur lors du rendu du schéma Mermaid.js'));
    }
  };

  useEffect(() => {
    renderDiagram(containerRef.current, 'mermaid-main');
  }, [activePreset, resolvedTheme, currentDiagram.code]);

  useEffect(() => {
    if (isFullscreen) {
      renderDiagram(fullscreenContainerRef.current, 'mermaid-fullscreen');
    }
  }, [isFullscreen, activePreset, resolvedTheme, currentDiagram.code]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentDiagram.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const target = containerRef.current;
    if (!target) return;
    const svgElement = target.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowchart-${activePreset}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* Header & Preset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 tracking-wider">
                  {isEn ? 'Mermaid.js Engine v11' : 'Moteur Mermaid.js v11'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{isEn ? 'Vector SVG' : 'Vectoriel SVG'}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {currentDiagram.title}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {currentDiagram.subtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => {
                setActivePreset('architecture');
                setZoomLevel(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activePreset === 'architecture'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isEn ? '1. Architecture' : '1. Architecture'}
            </button>
            <button
              onClick={() => {
                setActivePreset('event_loop');
                setZoomLevel(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activePreset === 'event_loop'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isEn ? '2. Event Loop' : '2. Boucle Imprévu'}
            </button>
            <button
              onClick={() => {
                setActivePreset('rag_engine');
                setZoomLevel(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activePreset === 'rag_engine'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isEn ? '3. RAG Sequence' : '3. Séquence RAG'}
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => {
              setFullscreenZoom(1);
              setIsFullscreen(true);
            }}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title={isEn ? 'Fullscreen mode' : 'Plein écran'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Toggle Code / Diagram */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showCode
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title={isEn ? 'Toggle Mermaid source code' : 'Afficher le code source Mermaid.js'}
          >
            {showCode ? <Eye className="w-4 h-4" /> : <Code className="w-4 h-4" />}
            <span className="hidden md:inline">{showCode ? (isEn ? 'Diagram' : 'Schéma') : 'Code'}</span>
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title={isEn ? 'Copy Mermaid markdown' : 'Copier le code Mermaid'}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Export SVG */}
          <button
            onClick={handleDownloadSvg}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title={isEn ? 'Download SVG vector' : 'Télécharger le schéma en SVG'}
          >
            <Download className="w-4 h-4 text-blue-500" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {showCode ? (
        <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 font-mono text-xs shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>Source Mermaid.js ({activePreset})</span>
            </div>
            <span className="text-[11px] text-slate-500">Mermaid v11 syntax</span>
          </div>
          <pre className="overflow-x-auto p-3 leading-relaxed text-slate-200 bg-slate-950 rounded-xl border border-slate-800">
            {currentDiagram.code}
          </pre>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col items-center">
          
          {/* Zoom & Reset Controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 p-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.8))}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={isEn ? 'Zoom in' : 'Zoom avant'}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1.5 text-slate-500">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.6))}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={isEn ? 'Zoom out' : 'Zoom arrière'}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={isEn ? 'Reset scale' : 'Réinitialiser'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Description banner */}
          <div className="w-full text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 mb-4">
            {currentDiagram.description}
          </div>

          {/* Error fallback if any */}
          {renderError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs w-full mb-4">
              <strong>{isEn ? 'Mermaid render error:' : 'Erreur de rendu Mermaid :'}</strong> {renderError}
            </div>
          )}

          {/* Mermaid SVG Container */}
          <div 
            className="w-full overflow-x-auto py-6 flex justify-center transition-transform duration-200 origin-top min-h-[400px]"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div 
              ref={containerRef} 
              className="mermaid-wrapper w-full flex justify-center items-center select-none"
            />
          </div>

          {/* Footer Highlights */}
          <div className="w-full mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span>{isEn ? 'Normalized AST RAG Pipeline' : 'Pipeline RAG normalisé & vectorisé'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>{isEn ? 'Fast Reactive Loop (< 30s)' : 'Boucle à chaud événement imprévu (< 30s)'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{isEn ? 'Certified Citations with Evidence' : 'Restitution décisionnelle certifiée'}</span>
            </div>
          </div>

        </div>
      )}

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 animate-fadeIn">
          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white mb-4">
            <div>
              <h3 className="text-sm font-bold">{currentDiagram.title}</h3>
              <p className="text-xs text-slate-400">{currentDiagram.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-0.5">
                <button
                  onClick={() => setFullscreenZoom(prev => Math.min(prev + 0.2, 2.5))}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-mono text-slate-400">
                  {Math.round(fullscreenZoom * 100)}%
                </span>
                <button
                  onClick={() => setFullscreenZoom(prev => Math.max(prev - 0.2, 0.5))}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFullscreenZoom(1)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-center items-center">
            <div
              className="transition-transform duration-200 origin-center"
              style={{ transform: `scale(${fullscreenZoom})` }}
            >
              <div ref={fullscreenContainerRef} className="mermaid-fullscreen-wrapper flex justify-center" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
