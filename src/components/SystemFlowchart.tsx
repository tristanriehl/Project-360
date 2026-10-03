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
  Download, 
  Sparkles,
  Zap,
  Layers,
  FileCode
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const SystemFlowchart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<'architecture' | 'event_loop' | 'rag_engine'>('architecture');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  // Mermaid diagrams
  const diagrams: Record<string, { title: string; subtitle: string; code: string }> = {
    architecture: {
      title: "Architecture Globale & Pipeline RAG E2E",
      subtitle: "Ingestion multi-sources, mémoire hybride et cockpit opérationnel",
      code: `flowchart TD
    subgraph S1["📂 01. INGESTION DES SOURCES (35+ DOCS)"]
        A1["📧 Courriels (.eml)<br/><small>34 pièces échanges clés</small>"]
        A2["👥 Réunions & Transcripts<br/><small>Comptes-rendus Copil</small>"]
        A3["🎫 Incidents JIRA<br/><small>PERF-501 & logs</small>"]
        A4["📑 Contrats & ADRs<br/><small>Architecture, budgets</small>"]
    end

    subgraph S2["⚙️ 02. NORMALISATION & PIPELINE"]
        B1["AST Parser & Sanitizer<br/><small>Dédoublonnage & dates</small>"]
        B2["Chunking Sémantique<br/><small>Fenêtres 512 tokens</small>"]
    end

    subgraph S3["🧠 03. MÉMOIRE OPÉRATIONNELLE"]
        C1[("Index Vectoriel<br/><small>Embeddings sémantiques</small>")]
        C2[("Graphe de Connaissances<br/><small>Dépendances & acteurs</small>")]
    end

    subgraph S4["🤖 04. MOTEUR DE RAISONNEMENT (GEMINI FLASH)"]
        D1{"Cerveau RAG<br/><small>Gemini 3.8 Flash</small>"}
        D2["Détecteur de Contradictions<br/><small>Divergences temporelles</small>"]
        D3["Registre des Décisions<br/><small>Preuves & pages citées</small>"]
    end

    subgraph S5["⚡ 05. BOUCLE ÉVÉNEMENT IMPRÉVU"]
        E1["📥 Événement Surprise<br/><small>Courriel urgent ou CVE</small>"]
        E2["⚡ Calcul Delta Impact<br/><small>Exécution en &lt; 30s</small>"]
    end

    subgraph S6["📊 06. COCKPIT 360° & RESTITUTION"]
        F1["Score de Santé : 78%<br/><small>Recalculé en direct</small>"]
        F2["Assistant RAG Certifié<br/><small>Questions & justifications</small>"]
        F3["Chronologie Interactive<br/><small>Traçabilité des jalons</small>"]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1

    B1 --> B2
    B2 --> C1
    B2 --> C2

    C1 --> D1
    C2 --> D1
    D1 --> D2
    D1 --> D3

    E1 --> E2
    E2 -.->|Mise à jour immédiate| D1
    E2 -.->|Alerte instantanée| F1

    D2 --> F1
    D3 --> F2
    D1 --> F3

    classDef source fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#1e3a8a
    classDef process fill:#f5f3ff,stroke:#8b5cf6,stroke-width:2px,color:#4c1d95
    classDef memory fill:#fdf4ff,stroke:#d946ef,stroke-width:2px,color:#701a75
    classDef engine fill:#ecfdf5,stroke:#10b981,stroke-width:2px,color:#064e3b
    classDef event fill:#fffbeb,stroke:#f59e0b,stroke-width:2px,color:#78350f
    classDef ui fill:#f8fafc,stroke:#0f172a,stroke-width:2px,color:#0f172a

    class A1,A2,A3,A4 source
    class B1,B2 process
    class C1,C2 memory
    class D1,D2,D3 engine
    class E1,E2 event
    class F1,F2,F3 ui`
    },
    event_loop: {
      title: "Boucle de Réaction à l'Événement Imprévu (< 30s)",
      subtitle: "Cycle d'ingestion à chaud imposé par le challenge",
      code: `flowchart LR
    E1["🚨 Ingestion d'un nouvel événement<br/><small>Fichier .eml / texte collé</small>"] --> E2["AST Ingest & Extraction<br/><small>Titre, date, expéditeur</small>"]
    E2 --> E3{"RAG Impact Agent<br/><small>Gemini 3.8 Flash</small>"}
    
    E3 -->|Impact Financier| O1["Actualisation Budget<br/><small>Pénalités / Retards</small>"]
    E3 -->|Impact Calendrier| O2["Reprogrammation Jalons<br/><small>Go-live décalé</small>"]
    E3 -->|3 Actions Obligatoires| O3["Recommandations Immédiates<br/><small>Plans de remédiation</small>"]

    O1 --> R1["⚡ Cockpit Mis à Jour<br/><small>Health Score recalculé</small>"]
    O2 --> R1
    O3 --> R1

    style E1 fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#7f1d1d
    style E3 fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#78350f
    style R1 fill:#dcfce7,stroke:#10b981,stroke-width:2px,color:#064e3b`
    },
    rag_engine: {
      title: "Pipeline de Raisonnement RAG & Preuves Certifiées",
      subtitle: "De la question utilisateur aux citations vérifiables avec pages",
      code: `sequenceDiagram
    autonumber
    actor User as Décideur / Direction
    participant UI as Interface RAG
    participant Router as Contrôleur API (/api/chat)
    participant Memory as Mémoire Vectorielle (35+ Docs)
    participant LLM as Gemini 3.8 Flash
    
    User->>UI: Pose une question stratégique
    UI->>Router: Requête avec filtre temporel
    Router->>Memory: Recherche sémantique top-K (Embeddings)
    Memory-->>Router: Retourne les 5 chunks les plus pertinents + métadonnées
    Router->>LLM: Prompt augmenté avec contexte et consigne stricte de citation
    LLM-->>Router: Réponse structurée (Synthèse + Preuves + Risques)
    Router-->>UI: Payload JSON avec badges de citations
    UI-->>User: Affichage avec liens vers documents sources originaux`
    }
  };

  const currentDiagram = diagrams[activePreset];

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!containerRef.current) return;
      try {
        setRenderError(null);
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'neutral',
          securityLevel: 'loose',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          themeVariables: resolvedTheme === 'dark' ? {
            primaryColor: '#1e293b',
            primaryBorderColor: '#3b82f6',
            primaryTextColor: '#f8fafc',
            lineColor: '#60a5fa',
            secondaryColor: '#0f172a',
            tertiaryColor: '#1e1b4b'
          } : {
            primaryColor: '#eff6ff',
            primaryBorderColor: '#2563eb',
            primaryTextColor: '#1e293b',
            lineColor: '#3b82f6',
            secondaryColor: '#f8fafc',
            tertiaryColor: '#f1f5f9'
          }
        });

        const uniqueId = `mermaid-${activePreset}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, currentDiagram.code);

        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
          
          // Style SVG for responsiveness
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.margin = '0 auto';
          }
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setRenderError(err?.message || 'Erreur lors du rendu Mermaid');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [activePreset, resolvedTheme, currentDiagram.code]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentDiagram.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* Header & Preset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 tracking-wider">
                  Mermaid.js Flowchart
                </span>
                <span className="text-[10px] text-slate-400">Rendu SVG Vectoriel</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {currentDiagram.title}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {currentDiagram.subtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setActivePreset('architecture')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activePreset === 'architecture'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Vue Complète
            </button>
            <button
              onClick={() => setActivePreset('event_loop')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activePreset === 'event_loop'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Boucle Imprévu
            </button>
            <button
              onClick={() => setActivePreset('rag_engine')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activePreset === 'rag_engine'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Séquence RAG
            </button>
          </div>

          {/* Toggle Code / Diagram */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showCode
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
            title="Afficher le code source Mermaid.js"
          >
            {showCode ? <Eye className="w-4 h-4" /> : <Code className="w-4 h-4" />}
            <span className="hidden md:inline">{showCode ? 'Voir Diagramme' : 'Code Mermaid'}</span>
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            title="Copier le code Mermaid"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {showCode ? (
        <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 font-mono text-xs shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>Source Mermaid.js</span>
            </div>
            <span className="text-[11px] text-slate-500">Syntaxe standardisée Mermaid v11</span>
          </div>
          <pre className="overflow-x-auto p-2 leading-relaxed text-slate-200">
            {currentDiagram.code}
          </pre>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col items-center">
          
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 p-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.8))}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Zoom avant"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1 text-slate-500">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.6))}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Zoom arrière"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Réinitialiser le zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Error fallback if any */}
          {renderError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs w-full mb-4">
              <strong>Erreur de rendu Mermaid :</strong> {renderError}
            </div>
          )}

          {/* Mermaid SVG Container */}
          <div 
            className="w-full overflow-x-auto py-4 flex justify-center transition-transform duration-200 origin-top"
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
              <span>Pipeline RAG normalisé &amp; vectorisé</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Boucle à chaud événement imprévu (&lt; 30s)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Restitution décisionnelle certifiée</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
