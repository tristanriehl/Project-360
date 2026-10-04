import React from 'react';
import { ProjectDocument } from '../types/project';
import { 
  X, 
  FileText, 
  Calendar, 
  User, 
  Tag, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Copy, 
  Check, 
  Mail, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Download,
  Maximize2
} from 'lucide-react';

interface DocumentViewerModalProps {
  document: ProjectDocument | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!document) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(document.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isEmail = document.category === 'email' || document.fileType?.toLowerCase() === 'eml';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(document.fileType?.toLowerCase() || '') || !!document.previewUrl;
  const isExcel = ['xlsx', 'xls', 'xlsm', 'csv'].includes(document.fileType?.toLowerCase() || '');
  const isPdf = document.fileType?.toLowerCase() === 'pdf';

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Information Valide &amp; Active
          </span>
        );
      case 'outdated':
      case 'superseded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" /> Historique / Périmé
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <Clock className="w-3.5 h-3.5" /> Brouillon non approuvé
          </span>
        );
      default:
        return null;
    }
  };

  const getHeaderIcon = () => {
    if (isEmail) return <Mail className="w-6 h-6 text-sky-600 dark:text-sky-400" />;
    if (isImage) return <ImageIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
    if (isExcel) return <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
    if (isPdf) return <FileText className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
    return <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
  };

  const getHeaderBg = () => {
    if (isEmail) return 'bg-sky-100 dark:bg-sky-950';
    if (isImage) return 'bg-indigo-100 dark:bg-indigo-950';
    if (isExcel) return 'bg-emerald-100 dark:bg-emerald-950';
    if (isPdf) return 'bg-rose-100 dark:bg-rose-950';
    return 'bg-blue-100 dark:bg-blue-950';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${getHeaderBg()}`}>
              {getHeaderIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-md">
                  {document.name}
                </h3>
                {getStatusBadge(document.relevanceStatus)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {document.categoryLabel} • Format: <span className="uppercase font-mono font-semibold">{document.fileType}</span>
                {document.fileSize ? ` • ${(document.fileSize / 1024).toFixed(1)} Ko` : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copier le texte"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata bar */}
        <div className="px-5 py-3 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Date : <strong className="font-semibold text-slate-800 dark:text-slate-200">{document.date}</strong></span>
          </div>
          {document.author && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Auteur / Source : <strong className="font-semibold text-slate-800 dark:text-slate-200">{document.author}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex gap-1">
              {document.tags.map((t, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {/* Automatic Summary */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <SparklesIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Synthèse &amp; Points Clés
            </p>
            <p className="text-sm text-blue-950 dark:text-blue-100 font-medium leading-relaxed">
              {document.summary}
            </p>
          </div>

          {/* Image preview if image document */}
          {document.previewUrl && (
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 px-1">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-500" /> Aperçu visuel de l'image originale
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href={document.previewUrl}
                    download={document.name}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Télécharger
                  </a>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900/5 dark:bg-black/40 max-h-80 flex items-center justify-center p-2">
                <img
                  src={document.previewUrl}
                  alt={document.name}
                  className="max-h-76 w-auto object-contain rounded-lg shadow-sm hover:scale-[1.01] transition-transform"
                />
              </div>
            </div>
          )}

          {/* Full content / OCR text */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center justify-between">
              <span>
                {isEmail 
                  ? 'Texte Décrypté du Courriel (.EML)' 
                  : isImage 
                  ? 'Transcription Textuelle & Décomposition OCR' 
                  : isExcel 
                  ? 'Données Structurées des Feuilles de Calcul' 
                  : isPdf 
                  ? 'Transcription Intégrale du Document PDF' 
                  : 'Contenu Intégral du Document'}
              </span>
              <span className="text-[11px] font-normal text-slate-500 lowercase">{document.content.length} caractères</span>
            </h4>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-800 select-text shadow-inner">
              {document.content}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500">
          <span>ID Document : <code className="font-mono">{document.id}</code></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}
