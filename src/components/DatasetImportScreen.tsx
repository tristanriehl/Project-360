import React, { useState, useRef } from 'react';
import { 
  FolderUp, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Loader2, 
  Files, 
  FolderArchive, 
  ShieldCheck, 
  ArrowRight,
  X,
  FileCode,
  HardDrive
} from 'lucide-react';
import { ProjectDocument, ProjectAnalysis } from '../types/project';
import { parseUploadedFiles } from '../utils/folderParser';
import { synthesizeDatasetLocally } from '../utils/datasetSynthesizer';
import { useLanguage } from '../context/LanguageContext';

interface DatasetImportScreenProps {
  onDatasetLoaded: (documents: ProjectDocument[], analysis: ProjectAnalysis) => void;
  onClose?: () => void;
  isModal?: boolean;
}

/**
 * Recursively scans directory entries dropped into the browser
 */
async function scanDataTransferItems(items: DataTransferItemList): Promise<{ files: File[]; rootFolder: string }> {
  const files: File[] = [];
  let rootFolder = '';

  async function traverseEntry(entry: any, currentPath = '') {
    if (!entry) return;
    if (entry.isFile) {
      const file: File = await new Promise((resolve, reject) => entry.file(resolve, reject));
      if (!file.name.startsWith('.') && file.name !== 'Thumbs.db' && file.name !== 'desktop.ini') {
        files.push(file);
      }
    } else if (entry.isDirectory) {
      if (!rootFolder && !currentPath) {
        rootFolder = entry.name;
      }
      const dirReader = entry.createReader();
      const readAllEntries = async (): Promise<any[]> => {
        const entries: any[] = [];
        let batch: any[] = [];
        do {
          batch = await new Promise((resolve, reject) => dirReader.readEntries(resolve, reject));
          entries.push(...batch);
        } while (batch.length > 0);
        return entries;
      };

      try {
        const entries = await readAllEntries();
        for (const child of entries) {
          await traverseEntry(child, currentPath ? `${currentPath}/${entry.name}` : entry.name);
        }
      } catch (e) {
        console.warn('Directory read error:', e);
      }
    }
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const entry = (item as any).webkitGetAsEntry ? (item as any).webkitGetAsEntry() : ((item as any).getAsEntry ? (item as any).getAsEntry() : null);
    if (entry) {
      await traverseEntry(entry);
    } else if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file && !file.name.startsWith('.') && file.name !== 'Thumbs.db') {
        files.push(file);
      }
    }
  }

  return { files, rootFolder };
}

export const DatasetImportScreen: React.FC<DatasetImportScreenProps> = ({
  onDatasetLoaded,
  onClose,
  isModal = false
}) => {
  const { language } = useLanguage();
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [folderName, setFolderName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEn = language === 'en';

  const processAndLoadFiles = async (files: File[], detectedFolderName?: string) => {
    const fileArray = Array.from(files).filter(f => !f.name.startsWith('.') && f.name !== 'Thumbs.db' && f.name !== 'desktop.ini');
    if (fileArray.length === 0) {
      setErrorMsg(isEn ? 'No valid files detected in the folder.' : 'Aucun fichier valide détecté dans le dossier.');
      return;
    }

    const projName = detectedFolderName || folderName || (isEn ? 'Imported Project' : 'Projet Importé');
    setFolderName(projName);
    setStagedFiles(fileArray);
    setErrorMsg(null);

    try {
      setIsProcessing(true);

      // Step 1: Parse and read local files
      setProcessingStep(
        isEn 
          ? `Reading and indexing ${fileArray.length} files...` 
          : `Lecture et indexation des ${fileArray.length} pièces du dossier...`
      );
      const parsedDocs = await parseUploadedFiles(fileArray);

      if (parsedDocs.length === 0) {
        throw new Error(isEn ? 'Could not extract valid text from the selected files.' : 'Impossible d\'extraire du texte valide des fichiers sélectionnés.');
      }

      // Step 2: Local baseline synthesis
      setProcessingStep(
        isEn 
          ? 'Extracting decisions, contradictions and timeline...' 
          : 'Extraction des décisions, contradictions et jalons clés...'
      );
      const initialSynthesis = synthesizeDatasetLocally(parsedDocs, projName);

      // Step 3: Send to backend
      setProcessingStep(
        isEn 
          ? 'Synchronizing operational memory...' 
          : 'Synchronisation de la mémoire opérationnelle...'
      );

      try {
        const res = await fetch('/api/upload-dataset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documents: parsedDocs,
            folderName: projName
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.project && data.documents && data.documents.length > 0) {
            onDatasetLoaded(data.documents, data.project);
            if (onClose) onClose();
            return;
          }
        }
      } catch (backendErr) {
        console.warn('Backend /api/upload-dataset unavailable, using local synthesis:', backendErr);
      }

      // Fallback to local synthesis if backend is running offline
      onDatasetLoaded(parsedDocs, initialSynthesis);
      if (onClose) onClose();

    } catch (err: any) {
      console.error('Ingestion error:', err);
      setErrorMsg(err?.message || (isEn ? 'Failed to process folder.' : 'Échec du traitement du dossier.'));
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      let detectedName = '';
      const firstRel = (files[0] as any).webkitRelativePath;
      if (firstRel && firstRel.includes('/')) {
        detectedName = firstRel.split('/')[0];
      }
      processAndLoadFiles(files, detectedName);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndLoadFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    try {
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        const { files, rootFolder } = await scanDataTransferItems(e.dataTransfer.items);
        if (files.length > 0) {
          processAndLoadFiles(files, rootFolder);
          return;
        }
      }

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processAndLoadFiles(Array.from(e.dataTransfer.files));
      }
    } catch (dropErr) {
      console.error('Drop error:', dropErr);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processAndLoadFiles(Array.from(e.dataTransfer.files));
      }
    }
  };

  const content = (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title & Explanations */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 shadow-sm mb-1">
          <FolderUp className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          {isEn ? 'Import Your Project Folder' : 'Importez votre Dossier de Projet'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          {isEn
            ? 'The RAG engine will consult strictly and exclusively the documents inside this folder. No fabricated or pre-loaded data will be used.'
            : 'Le moteur RAG consultera exclusivement les documents réels de ce dossier. Aucune donnée inventée ou pré-chargée ne sera consultée.'}
        </p>
      </div>

      {/* Hidden inputs */}
      <input
        type="file"
        ref={folderInputRef}
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderInputChange}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept=".txt,.pdf,.eml,.md,.csv,.json,.xlsx,.xls,.png,.jpg,.jpeg,.webp,.docx,.pptx"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Main Drag & Drop / Selection Card */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-8 rounded-3xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-4 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 ring-4 ring-blue-500/20 scale-[1.01]'
            : isProcessing
            ? 'border-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400'
        }`}
      >
        {isProcessing ? (
          <div className="py-8 space-y-3 flex flex-col items-center justify-center">
            <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEn ? 'Processing and Indexing Documents...' : 'Traitement et indexation des documents...'}
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
              {processingStep}
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <UploadCloud className="w-10 h-10 text-blue-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEn ? 'Drag & drop your project folder or files here' : 'Glissez votre dossier ou vos fichiers ici'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn ? 'Supports all file formats (.eml, .txt, .pdf, .docx, .xlsx, .md, .json, .csv)' : 'Prend en charge tous les formats (.eml, .txt, .pdf, .docx, .xlsx, .md, .json, .csv)'}
              </p>
            </div>

            {/* Direct action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <FolderArchive className="w-4 h-4" />
                <span>{isEn ? 'Select Folder from Disk' : 'Sélectionner un dossier sur le disque'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Files className="w-4 h-4" />
                <span>{isEn ? 'Select Individual Files' : 'Sélectionner des fichiers'}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>{isEn ? '100% Real Information' : '100% Données Réelles'}</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {isEn 
              ? 'Zero hallucinations: every single quote, decision, and contradiction is linked to an exact file.'
              : 'Zéro hallucination : chaque décision et contradiction est directement liée à votre fichier d\'origine.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <FileCode className="w-4 h-4" />
            <span>{isEn ? 'Multi-format Parsers' : 'Parsers Multi-formats'}</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {isEn 
              ? 'Reads .eml email threads with headers, meeting minutes, Jira logs, and contract specs.'
              : 'Décode les courriels .eml avec en-têtes, comptes-rendus, tickets JIRA et spécifications.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <HardDrive className="w-4 h-4" />
            <span>{isEn ? 'Local or Server RAG' : 'RAG Hybride'}</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {isEn 
              ? 'Works seamlessly in local demo mode or accelerated by Gemini Flash Lite.'
              : 'Fonctionne en mode démo autonome ou accéléré par le modèle Gemini Flash Lite.'}
          </p>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div className="relative w-full max-w-3xl bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-8">
      {content}
    </div>
  );
};
