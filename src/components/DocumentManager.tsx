import React, { useState } from 'react';
import { 
  FolderGit2, 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Plus, 
  Mail, 
  Users, 
  FileSpreadsheet, 
  ShieldAlert, 
  FileCode, 
  MessageSquare, 
  Archive,
  RefreshCw,
  Loader2,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { ProjectAnalysis, ProjectDocument } from '../types/project';
import { parseUploadedFiles } from '../utils/folderParser';

interface DocumentManagerProps {
  documents: ProjectDocument[];
  onSelectDocument: (doc: ProjectDocument) => void;
  onRefreshAnalysis: () => void;
  isAnalyzing: boolean;
  onDocumentsAdded: (newDocs: ProjectDocument[]) => void;
  onDeleteDocument?: (doc: ProjectDocument) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  onSelectDocument,
  onRefreshAnalysis,
  isAnalyzing,
  onDocumentsAdded,
  onDeleteDocument
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    { id: 'all', label: 'Tous les fichiers', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'email', label: '01 Courriels (.eml)', icon: <Mail className="w-4 h-4 text-blue-500" /> },
    { id: 'meeting', label: '02 Réunions & Transcripts', icon: <Users className="w-4 h-4 text-purple-500" /> },
    { id: 'ticket', label: '03 Tickets JIRA & Incidents', icon: <ShieldAlert className="w-4 h-4 text-pink-500" /> },
    { id: 'project_doc', label: '04 Documents & Tableurs (.xlsx)', icon: <FileSpreadsheet className="w-4 h-4 text-sky-500" /> },
    { id: 'contract_finance', label: '05 Contrats & Finances', icon: <FileText className="w-4 h-4 text-emerald-500" /> },
    { id: 'architecture', label: '06 Architecture & ADR', icon: <FileCode className="w-4 h-4 text-amber-500" /> },
    { id: 'image', label: '07 Schémas & Images (.png)', icon: <ImageIcon className="w-4 h-4 text-violet-500" /> },
    { id: 'teams', label: '08 Conversations Teams', icon: <MessageSquare className="w-4 h-4 text-indigo-500" /> },
    { id: 'archive', label: '09 Archives & Annexes', icon: <Archive className="w-4 h-4 text-slate-500" /> }
  ];

  const filteredDocs = documents.filter(doc => {
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'image') {
        const isImg = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(doc.fileType?.toLowerCase() || '') || !!doc.previewUrl;
        if (!isImg) return false;
      } else if (doc.category !== selectedCategory) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const matchName = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchContent = doc.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSummary = doc.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAuthor = doc.author?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchName && !matchContent && !matchSummary && !matchAuthor) return false;
    }
    return true;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadStatus('Lecture et numérisation des fichiers...');

    try {
      const parsedDocs = await parseUploadedFiles(files, (msg) => setUploadStatus(msg));
      
      setUploadStatus('Synchronisation avec la mémoire opérationnelle...');
      const response = await fetch('/api/ingest-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: parsedDocs })
      });

      const data = await response.json();
      if (response.ok && data.addedDocuments) {
        onDocumentsAdded(data.addedDocuments);
      } else {
        onDocumentsAdded(parsedDocs);
      }
    } catch (err: any) {
      alert(`Erreur d'ingestion : ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadStatus('');
      e.target.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsUploading(true);
      setUploadStatus('Numérisation des fichiers déposés...');

      try {
        const parsedDocs = await parseUploadedFiles(e.dataTransfer.files, (msg) => setUploadStatus(msg));
        
        setUploadStatus('Synchronisation avec la mémoire opérationnelle...');
        const response = await fetch('/api/ingest-files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documents: parsedDocs })
        });

        const data = await response.json();
        if (response.ok && data.addedDocuments) {
          onDocumentsAdded(data.addedDocuments);
        } else {
          onDocumentsAdded(parsedDocs);
        }
      } catch (err: any) {
        alert(`Erreur d'ingestion : ${err.message}`);
      } finally {
        setIsUploading(false);
        setUploadStatus('');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-slate-700 text-white shadow-md shadow-blue-500/20">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Gestionnaire de Documents &amp; Ingestion Multi-Sources ({documents.length} fichiers)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Référentiel documentaire complet : courriels, procès-verbaux, contrats, tickets et feuilles de calcul.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 transition-all">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{isUploading ? 'Numérisation...' : 'Importer des fichiers'}</span>
            <input
              type="file"
              multiple
              disabled={isUploading}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.xlsx,.xls,.xlsm,.png,.jpg,.jpeg,.webp,.eml,.msg,.txt,.md,.csv,.json,.docx,.pptx"
            />
          </label>

          <button
            onClick={onRefreshAnalysis}
            disabled={isAnalyzing || isUploading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Relancer la synthèse complète du projet avec les nouveaux fichiers"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isAnalyzing ? 'Synthèse...' : 'Re-synthétiser'}</span>
          </button>
        </div>
      </div>

      {/* Uploading progress notification */}
      {isUploading && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center gap-3 text-xs text-blue-800 dark:text-blue-200 shadow-sm animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Traitement documentaire en cours...</p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">{uploadStatus || 'Numérisation haute fidélité (PDF, Excel, Images PNG)...'}</p>
          </div>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center ${
          dragActive
            ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/50'
        }`}
      >
        <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Glissez-déposez vos fichiers de projet ici
        </h4>
        <p className="text-[11px] text-slate-500 mt-0.5 max-w-lg mx-auto">
          Documents PDF (.pdf), Tableurs Excel (.xlsx / .xls), Schémas &amp; Images PNG (.png / .jpg), Courriels (.eml) et Transcripts (.txt)
        </p>
      </div>

      {/* Categories Tabs & Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const count = cat.id === 'all' ? documents.length : documents.filter(d => d.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat.icon}
                <span>{cat.label.split(' ')[1] || cat.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les documents..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          return (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 truncate">
                    {doc.categoryLabel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    .{doc.fileType}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  {doc.name}
                </h3>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                  {doc.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>{doc.date}</span>
                <div className="flex items-center gap-2">
                  {onDeleteDocument && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Supprimer ce fichier de la mémoire"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">
                    Ouvrir <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
