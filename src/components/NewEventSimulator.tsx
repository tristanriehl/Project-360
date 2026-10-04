import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Send, 
  Loader2, 
  Clock, 
  RefreshCw, 
  FileText, 
  ShieldAlert, 
  Users,
  Check,
  UploadCloud,
  FileUp,
  X
} from 'lucide-react';
import { NewEventImpact, ProjectAnalysis, ProjectDocument } from '../types/project';
import { parseUploadedFiles } from '../utils/folderParser';

interface NewEventSimulatorProps {
  analysis: ProjectAnalysis;
  onEventApplied: (updatedProject: ProjectAnalysis, newDoc: ProjectDocument) => void;
}

export const NewEventSimulator: React.FC<NewEventSimulatorProps> = ({
  analysis,
  onEventApplied
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Jean-Marc Dubois (Dir TI)');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'email' | 'ticket' | 'project_doc'>('email');
  
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [latestImpact, setLatestImpact] = useState<NewEventImpact | null>(null);
  const [latestDoc, setLatestDoc] = useState<ProjectDocument | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Pre-configured live challenge test scenarios for the 24h presentation
  const emergencyScenarios = [
    {
      label: "Scénario A : Audit de Sécurité Externe & Report au 15 Décembre",
      title: "Rapport d'audit de sécurité gouvernemental & demande de report",
      author: "Sophie Lavoie (Juridique)",
      category: 'email' as const,
      content: `De: Sophie Lavoie <s.lavoie@entreprise.ca>
À: Mathieu Gagnon <m.gagnon@entreprise.ca>, Jean-Marc Dubois <jm.dubois@entreprise.ca>
Date: 03 octobre 2026 10:15
Objet: URGENT : Audit externe de cybersécurité exigé avant tout Go-Live

Bonjour Mathieu et Jean-Marc,
Le Secrétariat du Conseil du Trésor vient d'imposer un audit d'intrusion externe (PenTest) par une firme tierce certifiée avant l'ouverture du portail au grand public.
Cet audit prendra 14 jours ouvrés.
En conséquence, la date de Go-Live du 28 novembre doit être impérativement repoussée au 15 décembre 2026.
Un budget d'audit exceptionnel de 18 000 $ est débloqué par la direction.`
    },
    {
      label: "Scénario B : Départ imprévu du Lead Dev de Boréal (Alexandre Gagné)",
      title: "Annonce de démission du Lead Architecte Boréal",
      author: "Stéphane Côté (Boréal Technologies)",
      category: 'email' as const,
      content: `De: Stéphane Côté <s.cote@borealtech.ca>
À: Mathieu Gagnon <m.gagnon@entreprise.ca>
Date: 03 octobre 2026 11:30
Objet: Changement d'équipe Boréal - Remplacement d'Alexandre Gagné

Mathieu,
Je t'informe qu'Alexandre Gagné quitte notre firme ce vendredi. Il sera remplacé dès lundi prochain par Maxime Perreault, développeur senior sur la stack NestJS.
Une passation de 48 heures est en cours pour le transfert des clés de chiffrement et des scripts de performance k6 (PERF-501).`
    },
    {
      label: "Scénario C : Découverte d'une faille critique Zero-Day sur la lib JWT",
      title: "Alerte de vulnérabilité critique CVE-2026-8812",
      author: "Nicolas Roy (Sécurité)",
      category: 'ticket' as const,
      content: `TICKET D'INCIDENT DE SÉCURITÉ MAJEUR
ID : SEC-999
Sévérité : CRITIQUE (CVSS 9.8)
Description : Une vulnérabilité critique a été publiée sur la bibliothèque d'authentification JWT utilisée par le backend NestJS. Elle permet le contournement complet de l'authentification 2FA.
Action requise : Mise à niveau immédiate de la version v4.2.1 vers v5.0.0 et régénération de tous les secrets d'API sous 24h.`
    }
  ];

  const handleApplyPreset = (sc: typeof emergencyScenarios[0]) => {
    setTitle(sc.title);
    setAuthor(sc.author);
    setContent(sc.content);
    setCategory(sc.category);
    setUploadedFileName(null);
  };

  const handleProcessFile = async (file: File) => {
    if (!file) return;
    setUploadedFileName(`${file.name} (${(file.size / 1024).toFixed(1)} Ko) - Numérisation...`);

    try {
      const parsedList = await parseUploadedFiles([file]);
      if (parsedList.length > 0) {
        const doc = parsedList[0];
        setContent(doc.content);
        setTitle(doc.summary || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
        if (doc.author && doc.author !== 'Équipe Projet') {
          setAuthor(doc.author);
        }
        if (doc.category === 'email') setCategory('email');
        else if (doc.category === 'ticket') setCategory('ticket');
        else setCategory('project_doc');

        setUploadedFileName(`${file.name} (${(file.size / 1024).toFixed(1)} Ko) - Prêt`);
        return;
      }
    } catch (err) {
      console.warn('Scan error in simulator:', err);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      setContent(text);

      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const capitalizedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      setTitle(capitalizedTitle);

      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith('.eml') || text.includes('De:') || text.includes('From:')) {
        setCategory('email');
        const fromMatch = text.match(/(?:De|From):\s*([^\r\n<]+)/i);
        if (fromMatch && fromMatch[1]) {
          setAuthor(fromMatch[1].trim());
        }
      } else if (lowerName.endsWith('.csv') || lowerName.endsWith('.log') || text.includes('TICKET') || text.includes('JIRA') || text.includes('SEC-') || text.includes('BUG')) {
        setCategory('ticket');
      } else {
        setCategory('project_doc');
      }
      setUploadedFileName(`${file.name} (${(file.size / 1024).toFixed(1)} Ko)`);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveUploadedFile = () => {
    setUploadedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isProcessing) return;

    setIsProcessing(true);
    setAppliedSuccess(false);

    try {
      const response = await fetch('/api/new-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Nouvel Événement Imprévu',
          author: author,
          content: content.trim(),
          category: category,
          documentName: `Evenement_${Date.now().toString().slice(-4)}.txt`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'analyse de l\'impact');
      }

      setLatestImpact(data.impactAnalysis);
      setLatestDoc(data.newDocument);
      setAppliedSuccess(true);

      // Mutate project state in parent
      if (data.updatedProject && data.newDocument) {
        onEventApplied(data.updatedProject, data.newDocument);
      }
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Sleek Minimalist Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Nouvel Événement &amp; Impact Direct
            </h2>
            <p className="text-xs text-slate-500">Intégration d'information surprise et réévaluation de la mémoire</p>
          </div>
        </div>
      </div>

      {/* Preset Scenarios for Quick Demo */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Scénarios d'urgence rapides (1-clic) :
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {emergencyScenarios.map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(sc)}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-left transition-all text-xs"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                {sc.title}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {sc.author}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmitEvent} className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.xlsx,.xls,.xlsm,.png,.jpg,.jpeg,.webp,.eml,.msg,.txt,.csv,.log,.md,.json"
          className="hidden"
        />

        {/* File Upload / Dropzone Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Téléverser ou Glisser un document source (PDF, Excel, Image PNG/JPG, Courriel...)
            </label>
            <span className="text-[10px] text-slate-400">.pdf, .xlsx, .png, .eml, .txt</span>
          </div>

          {!uploadedFileName ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                  : 'border-slate-300 dark:border-slate-700 hover:border-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Déposez un fichier ici ou <span className="text-amber-600 dark:text-amber-400 underline">parcourez votre ordinateur</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Le contenu, le titre et l'auteur seront automatiquement extraits
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 transition-colors shrink-0"
              >
                Sélectionner un fichier
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="truncate text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  Fichier importé : <span className="font-mono text-emerald-700 dark:text-emerald-300">{uploadedFileName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 hover:underline"
                >
                  Changer
                </button>
                <button
                  type="button"
                  onClick={handleRemoveUploadedFile}
                  className="p-1 rounded-md text-emerald-700 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Retirer le fichier"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Metadata inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Titre de l'événement
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Exigence d'un audit de sécurité externe"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Émetteur / Auteur
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ex : Sophie Lavoie (Juridique)"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Type de document
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="email">Courriel urgent (.eml)</option>
              <option value="ticket">Billet d'incident (.txt / Jira)</option>
              <option value="project_doc">Note de service / Rapport</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            Contenu intégral de l'information reçue
          </label>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Collez ici le texte du courriel, du compte-rendu, de la demande de changement ou du ticket incident..."
            className="w-full p-3.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
            required
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!content.trim() || isProcessing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyse d'impact en cours par Gemini RAG...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Déclencher l'analyse d'impact &amp; Intégrer à la mémoire</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Display : The 3 Core Challenge Questions */}
      {latestImpact && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-700 shadow-xl space-y-6 animate-fadeIn">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Résultats de l'Analyse d'Impact (Projet 360)
                </h3>
                <p className="text-xs text-slate-500">
                  Événement : <strong>{latestDoc?.name}</strong> • Horodatage : {new Date().toLocaleTimeString('fr-CA')}
                </p>
              </div>
            </div>

            {appliedSuccess && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Mémoire du projet mise à jour
              </span>
            )}
          </div>

          {/* 3 Questions Structured Output */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Question 1: Qu'est-ce qui vient de changer ? */}
            <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  1
                </span>
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Qu'est-ce qui vient de changer ?
                </h4>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {latestImpact.whatChanged}
              </p>
            </div>

            {/* Question 2: Quelles informations précédentes sont maintenant affectées ? */}
            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
                <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-black">
                  2
                </span>
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Quelles infos sont affectées ?
                </h4>
              </div>

              <div className="space-y-2">
                {latestImpact.affectedElements.map((elem, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-800/40 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {elem.element}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <span className="line-through text-rose-500">{elem.previousState}</span> → <span className="font-bold text-emerald-600">{elem.newState}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 italic">
                      {elem.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 3: Quelles actions devraient être prises ? */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                  3
                </span>
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Quelles actions prendre ?
                </h4>
              </div>

              <div className="space-y-2">
                {latestImpact.recommendedActions.map((act, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <span className={`w-2 h-2 rounded-full ${act.priority === 'urgent' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      <span>{act.action}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>Responsable : <strong>{act.assignee}</strong></span>
                      <span className="uppercase font-bold text-emerald-600">{act.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* New Project Status summary */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">
              Statut ajusté du projet : <strong className="uppercase font-black text-amber-600 dark:text-amber-400">{latestImpact.updatedProjectStatus}</strong>
            </span>
            <span className="text-[11px] text-slate-500">
              Toutes les vues du tableau de bord reflètent désormais cet événement.
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
