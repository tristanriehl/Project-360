import React, { useState } from 'react';
import { Brain, FileText, Scale, ShieldAlert, CheckCircle2, Search, Filter, ZoomIn, ZoomOut, Maximize2, ExternalLink, Sparkles, Trash2, X } from 'lucide-react';
import { ProjectAnalysis, ProjectDocument } from '../types/project';

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
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Generate nodes for visualization
  const width = 800;
  const height = 550;
  const centerX = width / 2;
  const centerY = height / 2;

  const categories = [
    { id: 'cat_email', label: 'Courriels & Communications', color: '#3b82f6', angle: 0 },
    { id: 'cat_meeting', label: 'Réunions & Transcripts', color: '#8b5cf6', angle: 51 },
    { id: 'cat_ticket', label: 'Billets JIRA & Incidents', color: '#ec4899', angle: 102 },
    { id: 'cat_finance', label: 'Contrats & Finances', color: '#10b981', angle: 153 },
    { id: 'cat_arch', label: 'Architecture & ADRs', color: '#f59e0b', angle: 204 },
    { id: 'cat_decision', label: 'Décisions Clés Actées', color: '#6366f1', angle: 255 },
    { id: 'cat_risk', label: 'Risques & Alertes', color: '#ef4444', angle: 306 }
  ];

  const nodes: GraphNode[] = [
    {
      id: 'brain_center',
      label: 'LE CERVEAU DU PROJET',
      type: 'brain',
      x: centerX,
      y: centerY,
      color: '#3b82f6',
      details: {
        title: 'Cerveau Opérationnel Projet 360',
        description: 'Moteur de synthèse globale unifiant ' + documents.length + ' documents, ' + analysis.decisions.length + ' décisions et ' + analysis.risks.length + ' risques.',
        healthScore: analysis.healthScore,
        status: analysis.statusLabel
      }
    }
  ];

  const links: GraphLink[] = [];

  // Category nodes in inner orbit (radius = 140)
  categories.forEach((cat) => {
    const rad = (cat.angle * Math.PI) / 180;
    const catX = centerX + 145 * Math.cos(rad);
    const catY = centerY + 145 * Math.sin(rad);

    nodes.push({
      id: cat.id,
      label: cat.label,
      type: 'category',
      x: catX,
      y: catY,
      color: cat.color,
      details: {
        title: cat.label,
        count: cat.id === 'cat_decision' ? analysis.decisions.length : cat.id === 'cat_risk' ? analysis.risks.length : documents.filter(d => cat.id.includes(d.category)).length
      }
    });

    links.push({
      source: 'brain_center',
      target: cat.id,
      color: cat.color
    });
  });

  // Document & Decision leaf nodes in outer orbit
  documents.forEach((doc, idx) => {
    let parentCatId = 'cat_doc';
    if (doc.category === 'email') parentCatId = 'cat_email';
    else if (doc.category === 'meeting') parentCatId = 'cat_meeting';
    else if (doc.category === 'ticket') parentCatId = 'cat_ticket';
    else if (doc.category === 'contract_finance') parentCatId = 'cat_finance';
    else if (doc.category === 'architecture') parentCatId = 'cat_arch';

    const parent = nodes.find(n => n.id === parentCatId) || nodes[1];
    const offsetAngle = (idx * 37 * Math.PI) / 180;
    const dist = 90 + (idx % 3) * 20;

    const docX = parent.x + dist * Math.cos(offsetAngle);
    const docY = parent.y + dist * Math.sin(offsetAngle);

    const docNode: GraphNode = {
      id: `doc_${doc.id}`,
      label: doc.name,
      type: 'document',
      category: doc.category,
      x: Math.max(40, Math.min(width - 40, docX)),
      y: Math.max(40, Math.min(height - 40, docY)),
      color: '#64748b',
      details: doc
    };

    nodes.push(docNode);
    links.push({
      source: parent.id,
      target: docNode.id,
      color: '#cbd5e1'
    });
  });

  // Add decision nodes
  analysis.decisions.forEach((dec, idx) => {
    const parent = nodes.find(n => n.id === 'cat_decision')!;
    const angle = (idx * 55 * Math.PI) / 180;
    const decX = parent.x + 85 * Math.cos(angle);
    const decY = parent.y + 85 * Math.sin(angle);

    const decNode: GraphNode = {
      id: `dec_${dec.id}`,
      label: dec.title,
      type: 'decision',
      x: Math.max(40, Math.min(width - 40, decX)),
      y: Math.max(40, Math.min(height - 40, decY)),
      color: '#6366f1',
      details: dec
    };

    nodes.push(decNode);
    links.push({
      source: 'cat_decision',
      target: decNode.id,
      color: '#c7d2fe'
    });
  });

  // Filter nodes
  const filteredNodes = nodes.filter(n => {
    if (filterType !== 'all') {
      if (filterType === 'decisions' && n.type !== 'decision' && n.id !== 'cat_decision' && n.id !== 'brain_center') return false;
      if (filterType === 'documents' && n.type !== 'document' && n.id !== 'brain_center' && !n.id.startsWith('cat_')) return false;
      if (filterType === 'risks' && n.type !== 'risk' && n.id !== 'cat_risk' && n.id !== 'brain_center') return false;
    }
    if (searchQuery.trim()) {
      return n.label.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Graphe de Connaissances &amp; Réseau Neuronal du Projet
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualisation topologique des interconnexions : documents sources, décisions, risques et thématiques.
          </p>
        </div>

        {/* Filter and Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Chercher un nœud..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="all">Tous les nœuds ({nodes.length})</option>
            <option value="documents">Documents ({documents.length})</option>
            <option value="decisions">Décisions ({analysis.decisions.length})</option>
          </select>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[10px] font-mono text-slate-500">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {onDeleteDocument && (
            <button
              onClick={() => setIsFilesModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl font-semibold transition-colors cursor-pointer"
              title="Gérer et supprimer des fichiers du graphe"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Gérer / Supprimer fichiers ({documents.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Graph Canvas & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive SVG Graph */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden relative min-h-[550px] flex items-center justify-center">
          
          {/* Subtle background network grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

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
              const isDecision = node.type === 'decision';

              const radius = isBrain ? 38 : isCategory ? 20 : 12;

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
                      className={`animate-ping opacity-25 fill-current ${isBrain ? 'text-blue-500' : 'text-indigo-400'}`}
                    />
                  )}

                  {/* Main Circle */}
                  <circle
                    r={radius}
                    fill={node.color}
                    className={`transition-transform duration-200 group-hover:scale-125 ${
                      isSelected ? 'stroke-white stroke-2 shadow-lg' : 'stroke-slate-900 stroke-1'
                    }`}
                  />

                  {/* Center icon / label indicator */}
                  {isBrain && (
                    <text
                      textAnchor="middle"
                      dy="5"
                      fill="white"
                      className="text-[11px] font-black uppercase pointer-events-none select-none"
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

          {/* Bottom helper tip */}
          <div className="absolute bottom-3 left-4 text-[10px] text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            💡 Cliquez sur un nœud pour inspecter ses relations et son contenu
          </div>
        </div>

        {/* Right 1 Col: Inspector Details Panel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Inspecteur de Nœud
              </span>
              {selectedNode && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {selectedNode.type}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedNode.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    ID : <code className="font-mono">{selectedNode.id}</code>
                  </p>
                </div>

                {/* Node details depending on type */}
                {selectedNode.type === 'brain' && (
                  <div className="space-y-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs">
                    <p className="font-medium text-blue-900 dark:text-blue-200">
                      {selectedNode.details.description}
                    </p>
                    <div className="pt-2 flex justify-between border-t border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 font-bold">
                      <span>Santé globale :</span>
                      <span>{selectedNode.details.healthScore}%</span>
                    </div>
                  </div>
                )}

                {selectedNode.type === 'document' && selectedNode.details && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="text-[11px] text-slate-400 mb-1">Résumé RAG :</div>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                        {selectedNode.details.summary}
                      </p>
                    </div>

                    <div className="text-xs space-y-1 text-slate-500">
                      <div>Date : <strong className="text-slate-800 dark:text-slate-200">{selectedNode.details.date}</strong></div>
                      <div>Auteur : <strong className="text-slate-800 dark:text-slate-200">{selectedNode.details.author || 'N/A'}</strong></div>
                      <div>Catégorie : <strong className="text-slate-800 dark:text-slate-200">{selectedNode.details.categoryLabel}</strong></div>
                    </div>

                    <button
                      onClick={() => onSelectDocument(selectedNode.details)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ouvrir le document complet</span>
                    </button>

                    {onDeleteDocument && (
                      <button
                        onClick={() => {
                          onDeleteDocument(selectedNode.details);
                          setSelectedNode(null);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        title="Supprimer ce fichier du graphe et recalculer le projet"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Supprimer ce fichier du graphe</span>
                      </button>
                    )}
                  </div>
                )}

                {selectedNode.type === 'decision' && selectedNode.details && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60">
                      <div className="text-[10px] font-bold text-indigo-500 uppercase mb-1">Justification :</div>
                      <p className="text-indigo-950 dark:text-indigo-200 font-medium">
                        {selectedNode.details.rationale}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Preuve documentée :</div>
                      <p className="text-slate-700 dark:text-slate-200 font-mono text-[11px] italic">
                        "{selectedNode.details.evidenceQuote}"
                      </p>
                    </div>

                    <div className="space-y-1 text-slate-500">
                      <div>Porteur : <strong className="text-slate-800 dark:text-slate-200">{selectedNode.details.owner}</strong></div>
                      <div>Date : <strong className="text-slate-800 dark:text-slate-200">{selectedNode.details.date}</strong></div>
                      <div>Source : <strong className="text-blue-600 dark:text-blue-400">{selectedNode.details.sourceDocName}</strong></div>
                    </div>
                  </div>
                )}

                {selectedNode.type === 'category' && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <p>Ce pôle regroupe les éléments liés à cette thématique essentielle du projet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <Brain className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs font-medium">Sélectionnez un élément dans le graphe</p>
                <p className="text-[11px] text-slate-500 mt-1">pour afficher ses preuves et métadonnées</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Topologie mise à jour automatiquement lors de l'ajout de nouveaux documents.
          </div>
        </div>

      </div>

      {/* Files Deletion & Management Modal for Graph */}
      {isFilesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Gérer &amp; Supprimer des Fichiers du Graphe ({documents.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Supprimez des fichiers pour retirer leurs nœuds du graphe et recalculer instantanément le projet.
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

            {/* Modal Search */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="Filtrer les fichiers à supprimer..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Modal Files List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {documents
                .filter(d => !modalSearchQuery.trim() || d.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) || d.categoryLabel.toLowerCase().includes(modalSearchQuery.toLowerCase()))
                .map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {doc.categoryLabel}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {doc.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {doc.date} • {doc.author || 'Inconnu'} • {doc.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          onSelectDocument(doc);
                          setIsFilesModalOpen(false);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        Voir
                      </button>

                      {onDeleteDocument && (
                        <button
                          onClick={() => {
                            if (selectedNode?.details?.id === doc.id) {
                              setSelectedNode(null);
                            }
                            onDeleteDocument(doc);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                          title="Supprimer ce fichier du graphe"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Supprimer</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {documents.length} document(s) modélisé(s) dans le graphe
              </span>
              <button
                onClick={() => setIsFilesModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
