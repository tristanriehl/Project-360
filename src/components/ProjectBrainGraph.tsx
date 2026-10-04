import React, { useState, useMemo } from 'react';
import { 
  Brain, 
  FileText, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles, 
  Trash2, 
  X, 
  Filter, 
  ArrowUpDown, 
  ChevronRight, 
  AlertTriangle,
  FileSpreadsheet,
  Mail,
  Users,
  ShieldAlert,
  Layers,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { ProjectAnalysis, ProjectDocument } from '../types/project';
import { useLanguage } from '../context/LanguageContext';

interface ProjectBrainGraphProps {
  analysis: ProjectAnalysis;
  documents: ProjectDocument[];
  onSelectDocument: (doc: ProjectDocument) => void;
  onDeleteDocument?: (doc: ProjectDocument) => void;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'brain' | 'category' | 'document' | 'decision' | 'risk';
  category?: string;
  x: number;
  y: number;
  color: string;
  details?: any;
}

interface GraphLink {
  source: string;
  target: string;
  color?: string;
}

export const ProjectBrainGraph: React.FC<ProjectBrainGraphProps> = ({
  analysis,
  documents,
  onSelectDocument,
  onDeleteDocument
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalCategoryFilter, setModalCategoryFilter] = useState('all');
  const [modalSortOrder, setModalSortOrder] = useState<'date_desc' | 'date_asc' | 'name_asc'>('date_desc');
  
  // Dedicated side-panel quick search for deletion
  const [sideSearchQuery, setSideSearchQuery] = useState('');
  const [sideCategoryFilter, setSideCategoryFilter] = useState('all');

  // Canvas dimensions
  const width = 800;
  const height = 550;
  const centerX = width / 2;
  const centerY = height / 2;

  const categories = useMemo(() => [
    { id: 'cat_email', label: isEn ? 'Emails & Comms' : 'Courriels & Comms', color: '#3b82f6', angle: 0 },
    { id: 'cat_meeting', label: isEn ? 'Meetings & Minutes' : 'Réunions & PV', color: '#8b5cf6', angle: 51 },
    { id: 'cat_ticket', label: isEn ? 'Tickets & Issues' : 'Billets & Incidents', color: '#ec4899', angle: 102 },
    { id: 'cat_finance', label: isEn ? 'Contracts & Finances' : 'Contrats & Finances', color: '#10b981', angle: 153 },
    { id: 'cat_arch', label: isEn ? 'Architecture & ADRs' : 'Architecture & ADRs', color: '#f59e0b', angle: 204 },
    { id: 'cat_decision', label: isEn ? 'Decisions Log' : 'Décisions Clés Actées', color: '#6366f1', angle: 255 },
    { id: 'cat_risk', label: isEn ? 'Risks & Alerts' : 'Risques & Alertes', color: '#ef4444', angle: 306 }
  ], [isEn]);

  const nodes: GraphNode[] = useMemo(() => {
    const list: GraphNode[] = [
      {
        id: 'brain_center',
        label: isEn ? 'PROJECT BRAIN' : 'CERVEAU DU PROJET',
        type: 'brain',
        x: centerX,
        y: centerY,
        color: '#3b82f6',
        details: {
          title: isEn ? 'Project 360 Operational Brain' : 'Cerveau Opérationnel Projet 360',
          description: isEn 
            ? `Global synthesis engine unifying ${documents.length} documents, ${analysis.decisions.length} decisions, and ${analysis.risks.length} risks.`
            : `Moteur de synthèse globale unifiant ${documents.length} documents, ${analysis.decisions.length} décisions et ${analysis.risks.length} risques.`,
          healthScore: analysis.healthScore,
          status: analysis.statusLabel
        }
      }
    ];

    // Inner orbit: Category nodes
    categories.forEach((cat) => {
      const rad = (cat.angle * Math.PI) / 180;
      const catX = centerX + 145 * Math.cos(rad);
      const catY = centerY + 145 * Math.sin(rad);

      list.push({
        id: cat.id,
        label: cat.label,
        type: 'category',
        x: catX,
        y: catY,
        color: cat.color,
        details: {
          title: cat.label,
          count: cat.id === 'cat_decision' 
            ? analysis.decisions.length 
            : cat.id === 'cat_risk' 
            ? analysis.risks.length 
            : documents.filter(d => cat.id.includes(d.category)).length
        }
      });
    });

    // Outer orbit: Document nodes
    documents.forEach((doc, idx) => {
      let parentCatId = 'cat_doc';
      if (doc.category === 'email') parentCatId = 'cat_email';
      else if (doc.category === 'meeting') parentCatId = 'cat_meeting';
      else if (doc.category === 'ticket') parentCatId = 'cat_ticket';
      else if (doc.category === 'contract_finance') parentCatId = 'cat_finance';
      else if (doc.category === 'architecture') parentCatId = 'cat_arch';

      const parent = list.find(n => n.id === parentCatId) || list[1];
      const offsetAngle = (idx * 37 * Math.PI) / 180;
      const dist = 90 + (idx % 3) * 20;

      const docX = parent.x + dist * Math.cos(offsetAngle);
      const docY = parent.y + dist * Math.sin(offsetAngle);

      list.push({
        id: `doc_${doc.id}`,
        label: doc.name,
        type: 'document',
        category: doc.category,
        x: Math.max(40, Math.min(width - 40, docX)),
        y: Math.max(40, Math.min(height - 40, docY)),
        color: '#64748b',
        details: doc
      });
    });

    // Outer orbit: Decision nodes
    analysis.decisions.forEach((dec, idx) => {
      const parent = list.find(n => n.id === 'cat_decision') || list[1];
      const angle = (idx * 55 * Math.PI) / 180;
      const decX = parent.x + 85 * Math.cos(angle);
      const decY = parent.y + 85 * Math.sin(angle);

      list.push({
        id: `dec_${dec.id}`,
        label: dec.title,
        type: 'decision',
        x: Math.max(40, Math.min(width - 40, decX)),
        y: Math.max(40, Math.min(height - 40, decY)),
        color: '#6366f1',
        details: dec
      });
    });

    return list;
  }, [analysis, documents, categories, isEn]);

  const links: GraphLink[] = useMemo(() => {
    const list: GraphLink[] = [];

    // Brain to categories
    categories.forEach((cat) => {
      list.push({
        source: 'brain_center',
        target: cat.id,
        color: cat.color
      });
    });

    // Categories to documents
    documents.forEach((doc) => {
      let parentCatId = 'cat_doc';
      if (doc.category === 'email') parentCatId = 'cat_email';
      else if (doc.category === 'meeting') parentCatId = 'cat_meeting';
      else if (doc.category === 'ticket') parentCatId = 'cat_ticket';
      else if (doc.category === 'contract_finance') parentCatId = 'cat_finance';
      else if (doc.category === 'architecture') parentCatId = 'cat_arch';

      const parent = nodes.find(n => n.id === parentCatId) || nodes[1];
      list.push({
        source: parent.id,
        target: `doc_${doc.id}`,
        color: '#cbd5e1'
      });
    });

    // Categories to decisions
    analysis.decisions.forEach((dec) => {
      list.push({
        source: 'cat_decision',
        target: `dec_${dec.id}`,
        color: '#c7d2fe'
      });
    });

    return list;
  }, [analysis, documents, categories, nodes]);

  // Filter nodes displayed on the graph canvas
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (filterType !== 'all') {
        if (filterType === 'decisions' && n.type !== 'decision' && n.id !== 'cat_decision' && n.id !== 'brain_center') return false;
        if (filterType === 'documents' && n.type !== 'document' && n.id !== 'brain_center' && !n.id.startsWith('cat_')) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return n.label.toLowerCase().includes(q) || (n.details?.summary && String(n.details.summary).toLowerCase().includes(q));
      }
      return true;
    });
  }, [nodes, filterType, searchQuery]);

  // Documents matching the search query for quick delete inspection
  const matchingDocumentsForDelete = useMemo(() => {
    const activeQuery = (sideSearchQuery || searchQuery).trim().toLowerCase();
    return documents
      .filter(d => sideCategoryFilter === 'all' || d.category === sideCategoryFilter)
      .filter(d => {
        if (!activeQuery) return true;
        return (
          d.name.toLowerCase().includes(activeQuery) ||
          d.categoryLabel.toLowerCase().includes(activeQuery) ||
          d.summary.toLowerCase().includes(activeQuery) ||
          (d.author && d.author.toLowerCase().includes(activeQuery)) ||
          (d.fileType && d.fileType.toLowerCase().includes(activeQuery)) ||
          d.date.includes(activeQuery)
        );
      });
  }, [documents, sideSearchQuery, searchQuery, sideCategoryFilter]);

  const handleDelete = (doc: ProjectDocument) => {
    const promptMsg = isEn 
      ? `Are you sure you want to delete "${doc.name}" from the project graph and memory?`
      : `Voulez-vous vraiment supprimer "${doc.name}" du graphe et de la mémoire du projet ?`;
    if (window.confirm(promptMsg)) {
      if (selectedNode?.details?.id === doc.id) {
        setSelectedNode(null);
      }
      if (onDeleteDocument) {
        onDeleteDocument(doc);
      }
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Header Info & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isEn ? 'Project Knowledge Graph & Neural Memory' : 'Graphe de Connaissances & Réseau Neuronal du Projet'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn 
                  ? 'Topological view connecting source documents, verified decisions, and risk signals.'
                  : 'Visualisation topologique des interconnexions : documents sources, décisions et alertes.'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter, Search & Delete Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Node Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Search node or file to delete...' : 'Chercher un nœud ou fichier à supprimer...'}
              className="pl-8 pr-7 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 sm:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Node type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="all">{isEn ? `All Nodes (${nodes.length})` : `Tous les nœuds (${nodes.length})`}</option>
            <option value="documents">{isEn ? `Documents (${documents.length})` : `Documents (${documents.length})`}</option>
            <option value="decisions">{isEn ? `Decisions (${analysis.decisions.length})` : `Décisions (${analysis.decisions.length})`}</option>
          </select>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title={isEn ? 'Zoom out' : 'Zoom arrière'}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[10px] font-mono text-slate-500">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title={isEn ? 'Zoom in' : 'Zoom avant'}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dedicated "Find & Delete Files" button */}
          {onDeleteDocument && (
            <button
              onClick={() => {
                setModalSearchQuery(searchQuery);
                setIsFilesModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl font-bold transition-all shadow-2xs cursor-pointer"
              title={isEn ? 'Search and delete files from graph' : 'Rechercher et supprimer des fichiers du graphe'}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{isEn ? `Find & Delete Files (${documents.length})` : `Trouver & Supprimer fichiers (${documents.length})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Graph Canvas & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive SVG Graph */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden relative min-h-[550px] flex items-center justify-center">
          
          {/* Background network grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Quick instructions badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>{isEn ? 'Click any node to inspect or delete' : 'Cliquer sur un nœud pour inspecter ou supprimer'}</span>
          </div>

          {/* Reset Zoom Button */}
          {zoomLevel !== 1 && (
            <button
              onClick={() => setZoomLevel(1)}
              className="absolute top-3 right-3 z-10 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>100%</span>
            </button>
          )}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Links */}
            {links.map((link, idx) => {
              const sourceNode = nodes.find(n => n.id === link.source);
              const targetNode = nodes.find(n => n.id === link.target);
              if (!sourceNode || !targetNode) return null;

              const isHighlighted = selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id);

              return (
                <line
                  key={idx}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={isHighlighted ? '#38bdf8' : link.color || '#334155'}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  strokeDasharray={isHighlighted ? '4 2' : undefined}
                  className="transition-all duration-300"
                  opacity={isHighlighted ? 0.9 : 0.4}
                />
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isBrain = node.type === 'brain';
              const isCategory = node.type === 'category';
              const isDoc = node.type === 'document';

              const radius = isBrain ? 36 : isCategory ? 20 : 12;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  {/* Outer pulse glow for brain or selected node */}
                  {(isBrain || isSelected) && (
                    <circle
                      r={radius + 8}
                      className={`animate-ping opacity-25 fill-current ${isBrain ? 'text-blue-500' : isDoc ? 'text-rose-500' : 'text-indigo-400'}`}
                    />
                  )}

                  {/* Main Circle */}
                  <circle
                    r={radius}
                    fill={node.color}
                    className={`transition-transform duration-200 group-hover:scale-125 ${
                      isSelected 
                        ? 'stroke-white stroke-2 shadow-lg' 
                        : isDoc 
                        ? 'stroke-slate-700 stroke-1 group-hover:stroke-rose-400' 
                        : 'stroke-slate-900 stroke-1'
                    }`}
                  />

                  {/* Center icon / label indicator */}
                  {isBrain && (
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="white"
                      className="text-[10px] font-black uppercase pointer-events-none select-none"
                    >
                      360°
                    </text>
                  )}

                  {/* Text Label on hover or category */}
                  <text
                    textAnchor="middle"
                    dy={radius + 12}
                    fill={isSelected ? '#38bdf8' : '#94a3b8'}
                    className={`text-[9px] font-semibold pointer-events-none select-none transition-all ${
                      isCategory || isBrain || isSelected ? 'opacity-100 font-bold' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Graph Legend */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur-xs p-2 rounded-xl border border-slate-800 pointer-events-none">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>{isEn ? 'Core Brain' : 'Cerveau Central'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>{isEn ? 'Decisions' : 'Décisions'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span>{isEn ? 'Documents (Clickable & Deletable)' : 'Documents (Cliquables & Supprimables)'}</span>
              </span>
            </div>
            <span className="hidden sm:inline font-mono">
              {filteredNodes.length} / {nodes.length} {isEn ? 'nodes active' : 'nœuds'}
            </span>
          </div>
        </div>

        {/* Right Col: Node Inspector OR Dedicated File Search & Delete Tool */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full max-h-[600px] overflow-hidden">
          
          {selectedNode ? (
            /* Selected Node Inspector View */
            <div className="space-y-4 flex-1 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: selectedNode.color }}
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {selectedNode.type === 'document' ? (isEn ? 'Source Document' : 'Document Source') : selectedNode.type.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isEn ? '← Back to Search' : '← Chercher un fichier'}
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedNode.label}
                </h3>
              </div>

              {selectedNode.type === 'document' && selectedNode.details && (
                <div className="space-y-3.5 text-xs flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                        {isEn ? 'Factual Summary' : 'Synthèse Factuelle'} :
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                        {selectedNode.details.summary}
                      </p>
                    </div>

                    <div className="text-xs space-y-1.5 text-slate-500 bg-slate-50/50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>Date : <strong className="text-slate-800 dark:text-slate-200">{selectedNode.details.date}</strong></div>
                      <div>{isEn ? 'Author' : 'Auteur'} : <strong className="text-slate-800 dark:text-slate-200">{selectedNode.details.author || 'N/A'}</strong></div>
                      <div>{isEn ? 'Category' : 'Catégorie'} : <strong className="text-slate-800 dark:text-slate-200">{selectedNode.details.categoryLabel}</strong></div>
                      <div>{isEn ? 'Type' : 'Format'} : <strong className="text-slate-800 dark:text-slate-200 uppercase font-mono">.{selectedNode.details.fileType}</strong></div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onSelectDocument(selectedNode.details)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Open Full Document' : 'Ouvrir le document complet'}</span>
                    </button>

                    {onDeleteDocument && (
                      <button
                        onClick={() => handleDelete(selectedNode.details)}
                        className="w-full py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        title={isEn ? 'Delete this file from graph and recalculate' : 'Supprimer ce fichier du graphe et recalculer le projet'}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>{isEn ? 'Delete File from Memory' : 'Supprimer ce fichier de la mémoire'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {selectedNode.type === 'decision' && selectedNode.details && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60">
                    <div className="text-[10px] font-bold text-indigo-500 uppercase mb-1">
                      {isEn ? 'Rationale' : 'Justification'} :
                    </div>
                    <p className="text-indigo-950 dark:text-indigo-200 font-medium text-[11px]">
                      {selectedNode.details.rationale}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      {isEn ? 'Documented Evidence' : 'Preuve documentée'} :
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 font-mono text-[11px] italic">
                      "{selectedNode.details.evidenceQuote}"
                    </p>
                  </div>

                  <div className="space-y-1 text-slate-500">
                    <div>{isEn ? 'Owner' : 'Porteur'} : <strong className="text-slate-800 dark:text-slate-200">{selectedNode.details.owner}</strong></div>
                    <div>Date : <strong className="text-slate-800 dark:text-slate-200">{selectedNode.details.date}</strong></div>
                    <div>Source : <strong className="text-blue-600 dark:text-blue-400">{selectedNode.details.sourceDocName}</strong></div>
                  </div>
                </div>
              )}

              {selectedNode.type === 'brain' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                    <p className="text-blue-950 dark:text-blue-200 font-medium">
                      {selectedNode.details.description}
                    </p>
                  </div>
                  <div className="space-y-1 text-slate-500">
                    <div>{isEn ? 'Health Score' : 'Score de Santé'} : <strong className="text-slate-900 dark:text-white">{selectedNode.details.healthScore}%</strong></div>
                    <div>{isEn ? 'Status' : 'Statut'} : <strong className="text-slate-900 dark:text-white">{selectedNode.details.status}</strong></div>
                  </div>
                </div>
              )}

              {selectedNode.type === 'category' && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <p>{isEn ? 'This hub unifies all elements related to this project core pillar.' : 'Ce pôle regroupe les éléments liés à cette thématique essentielle du projet.'}</p>
                </div>
              )}
            </div>
          ) : (
            /* Dedicated In-Place "Find File to Delete" Console when no node is selected */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {isEn ? 'Find File to Delete' : 'Rechercher un fichier à supprimer'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {matchingDocumentsForDelete.length} / {documents.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isEn 
                    ? 'Search through memory to inspect or permanently remove documents.' 
                    : 'Recherchez dans la mémoire pour inspecter ou supprimer un document.'}
                </p>
              </div>

              {/* Side Search Input */}
              <div className="py-2 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={sideSearchQuery}
                    onChange={(e) => setSideSearchQuery(e.target.value)}
                    placeholder={isEn ? 'Search by name, sender, .pdf...' : 'Chercher par nom, auteur, .pdf...'}
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  {sideSearchQuery && (
                    <button
                      onClick={() => setSideSearchQuery('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter chips */}
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: isEn ? 'All' : 'Tous' },
                    { id: 'email', label: isEn ? 'Emails' : 'Courriels' },
                    { id: 'contract_finance', label: isEn ? 'Finances' : 'Finances' },
                    { id: 'meeting', label: isEn ? 'Meetings' : 'Réunions' },
                    { id: 'ticket', label: isEn ? 'Tickets' : 'Tickets' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSideCategoryFilter(cat.id)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold shrink-0 transition-colors cursor-pointer ${
                        sideCategoryFilter === cat.id
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable list of files matching search */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 pt-1">
                {matchingDocumentsForDelete.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-1">
                    <Search className="w-6 h-6 mx-auto opacity-30" />
                    <p className="text-xs font-semibold">{isEn ? 'No documents match' : 'Aucun fichier correspondant'}</p>
                    <button
                      onClick={() => {
                        setSideSearchQuery('');
                        setSideCategoryFilter('all');
                      }}
                      className="text-[11px] text-rose-600 hover:underline font-bold"
                    >
                      {isEn ? 'Clear filters' : 'Réinitialiser les filtres'}
                    </button>
                  </div>
                ) : (
                  matchingDocumentsForDelete.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-rose-300 dark:hover:border-rose-800 transition-colors flex items-center justify-between gap-2 group"
                    >
                      <div 
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => {
                          const node = nodes.find(n => n.id === `doc_${doc.id}`);
                          if (node) setSelectedNode(node);
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            .{doc.fileType}
                          </span>
                          <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate block">
                            {doc.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {doc.date} {doc.author ? `• ${doc.author}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onSelectDocument(doc)}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title={isEn ? 'Preview document' : 'Voir le document'}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {onDeleteDocument && (
                          <button
                            onClick={() => handleDelete(doc)}
                            className="p-1 rounded-lg text-rose-500 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer"
                            title={isEn ? `Delete "${doc.name}"` : `Supprimer "${doc.name}"`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Advanced Fullscreen File Deletion Modal */}
      {isFilesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isEn ? 'Search & Delete Files from Project Memory' : 'Rechercher & Supprimer des fichiers de la mémoire'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isEn 
                      ? 'Find the file you wish to delete by name, extension, author, or keywords'
                      : 'Trouvez le document à supprimer par nom, extension, émetteur ou mot-clé'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFilesModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder={isEn ? 'Search by name, sender, format (.eml, .pdf, .xlsx), date...' : 'Chercher par nom, auteur, format (.eml, .pdf, .xlsx), date...'}
                    className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
                    autoFocus
                  />
                  {modalSearchQuery && (
                    <button
                      onClick={() => setModalSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={modalSortOrder}
                  onChange={(e) => setModalSortOrder(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold focus:outline-none shrink-0"
                >
                  <option value="date_desc">{isEn ? 'Newest first' : 'Plus récents'}</option>
                  <option value="date_asc">{isEn ? 'Oldest first' : 'Plus anciens'}</option>
                  <option value="name_asc">{isEn ? 'Name (A-Z)' : 'Nom (A-Z)'}</option>
                </select>
              </div>

              {/* Category Pills */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: isEn ? 'All' : 'Tous' },
                    { id: 'email', label: isEn ? 'Emails' : 'Courriels' },
                    { id: 'meeting', label: isEn ? 'Meetings' : 'Réunions' },
                    { id: 'ticket', label: isEn ? 'Tickets' : 'Tickets' },
                    { id: 'contract_finance', label: isEn ? 'Finances' : 'Finances' },
                    { id: 'architecture', label: isEn ? 'Architecture' : 'Architecture' }
                  ].map((cat) => {
                    const count = cat.id === 'all' 
                      ? documents.length 
                      : documents.filter(d => d.category === cat.id).length;
                    const isSelected = modalCategoryFilter === cat.id;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setModalCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white font-bold shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {cat.label} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Match count */}
                <span className="text-[11px] font-mono text-slate-400">
                  {documents
                    .filter(d => modalCategoryFilter === 'all' || d.category === modalCategoryFilter)
                    .filter(d => {
                      if (!modalSearchQuery.trim()) return true;
                      const q = modalSearchQuery.toLowerCase();
                      return (
                        d.name.toLowerCase().includes(q) ||
                        d.categoryLabel.toLowerCase().includes(q) ||
                        d.summary.toLowerCase().includes(q) ||
                        (d.author && d.author.toLowerCase().includes(q)) ||
                        (d.fileType && d.fileType.toLowerCase().includes(q)) ||
                        d.date.includes(q)
                      );
                    }).length} {isEn ? 'found' : 'trouvé(s)'}
                </span>
              </div>
            </div>

            {/* Modal Files List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {(() => {
                const filtered = documents
                  .filter(d => modalCategoryFilter === 'all' || d.category === modalCategoryFilter)
                  .filter(d => {
                    if (!modalSearchQuery.trim()) return true;
                    const q = modalSearchQuery.toLowerCase();
                    return (
                      d.name.toLowerCase().includes(q) ||
                      d.categoryLabel.toLowerCase().includes(q) ||
                      d.summary.toLowerCase().includes(q) ||
                      (d.author && d.author.toLowerCase().includes(q)) ||
                      (d.fileType && d.fileType.toLowerCase().includes(q)) ||
                      d.date.includes(q)
                    );
                  })
                  .sort((a, b) => {
                    if (modalSortOrder === 'name_asc') return a.name.localeCompare(b.name);
                    if (modalSortOrder === 'date_asc') return a.date.localeCompare(b.date);
                    return b.date.localeCompare(a.date);
                  });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <Search className="w-8 h-8 mx-auto opacity-30" />
                      <p className="text-xs font-semibold">
                        {isEn ? 'No documents match your search' : 'Aucun document ne correspond à votre recherche'}
                      </p>
                      <button
                        onClick={() => {
                          setModalSearchQuery('');
                          setModalCategoryFilter('all');
                        }}
                        className="px-3 py-1.5 text-xs text-rose-600 hover:underline font-bold"
                      >
                        {isEn ? 'Reset search filters' : 'Réinitialiser les filtres'}
                      </button>
                    </div>
                  );
                }

                return filtered.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:border-rose-300 dark:hover:border-rose-800 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {doc.categoryLabel}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          .{doc.fileType}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {doc.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {doc.date} {doc.author ? `• ${doc.author}` : ''} • {doc.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onSelectDocument(doc);
                          setIsFilesModalOpen(false);
                        }}
                        className="px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        {isEn ? 'View' : 'Voir'}
                      </button>

                      {onDeleteDocument && (
                        <button
                          onClick={() => handleDelete(doc)}
                          className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer shadow-xs"
                          title={isEn ? 'Permanently delete this file' : 'Supprimer définitivement ce fichier'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Delete' : 'Supprimer'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                {documents.length} {isEn ? 'total files indexed in project memory' : 'fichiers indexés dans la mémoire'}
              </span>
              <button
                onClick={() => setIsFilesModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
              >
                {isEn ? 'Close' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
