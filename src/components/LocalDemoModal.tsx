import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  HardDrive, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  Laptop, 
  WifiOff, 
  ShieldCheck, 
  ExternalLink,
  Cpu,
  FolderUp,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LocalDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalDemoModal: React.FC<LocalDemoModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  if (!isOpen) return null;

  const isEn = language === 'en';

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = isEn ? [
    {
      id: 'step1',
      title: '1. Clone or download the repository to your computer',
      desc: 'Open your terminal (macOS/Linux) or PowerShell (Windows) and enter your local workspace directory:',
      command: `git clone <your-repo-url> projet-360\ncd projet-360`
    },
    {
      id: 'step2',
      title: '2. Install Node.js dependencies',
      desc: 'Runs standard npm installation (requires Node.js v18 or newer):',
      command: `npm install`
    },
    {
      id: 'step3',
      title: '3. (Optional) Configure environment variables',
      desc: 'Create a .env file if you want live Gemini synthesis (uses lightweight gemini-3.1-flash-lite), or leave empty for offline demo mode:',
      command: `cp .env.example .env\n\n# Open .env and add your key:\nGEMINI_API_KEY="your_api_key_here"`
    },
    {
      id: 'step4',
      title: '4. Start the local development server',
      desc: 'Starts Express backend with Vite on port 3000:',
      command: `npm run dev`
    }
  ] : [
    {
      id: 'step1',
      title: '1. Télécharger ou cloner le projet sur votre ordinateur',
      desc: 'Ouvrez votre terminal (macOS/Linux) ou PowerShell (Windows) dans votre dossier de travail :',
      command: `git clone <votre-depot> projet-360\ncd projet-360`
    },
    {
      id: 'step2',
      title: '2. Installer les dépendances Node.js',
      desc: 'Installation standard via npm (nécessite Node.js v18 ou supérieur) :',
      command: `npm install`
    },
    {
      id: 'step3',
      title: '3. (Optionnel) Configurer les variables d\'environnement',
      desc: 'Créez un fichier .env si vous souhaitez activer l\'IA en direct (utilise le modèle ultra-léger gemini-3.1-flash-lite), ou laissez vide pour le mode hors-ligne :',
      command: `cp .env.example .env\n\n# Ouvrez .env et renseignez votre clé :\nGEMINI_API_KEY="votre_cle_api_ici"`
    },
    {
      id: 'step4',
      title: '4. Démarrer le serveur local',
      desc: 'Lance le serveur Express + Vite sur le port 3000 :',
      command: `npm run dev`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isEn ? 'Local Setup & Run Instructions' : 'Guide d\'Exécution en Local'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn ? 'How to run Projet 360 directly on your computer' : 'Comment exécuter Projet 360 à 100% sur votre propre machine'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-5 text-xs">
          
          {/* Key Guarantee Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950 dark:text-emerald-100">
                {isEn ? 'Standard Full-Stack TypeScript Architecture' : 'Architecture Full-Stack TypeScript Standard'}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {isEn 
                  ? 'Built on Node.js, Express, React 19, TypeScript and Tailwind CSS. Runs independently on any local machine without proprietary lock-in.'
                  : 'Développé en Node.js, Express, React 19, TypeScript et Tailwind CSS. S\'exécute de façon totalement autonome sur votre machine.'}
              </p>
            </div>
          </div>

          {/* Step by Step Instructions */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              {isEn ? 'Step-by-step Terminal Commands :' : 'Commandes Terminal pas-à-pas :'}
            </h4>

            {steps.map((st) => (
              <div key={st.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-500" />
                  <span>{st.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {st.desc}
                </p>

                <div className="relative">
                  <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800">
                    {st.command}
                  </pre>
                  <button
                    onClick={() => copyCode(st.id, st.command)}
                    className="absolute right-2 top-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title={isEn ? 'Copy command' : 'Copier la commande'}
                  >
                    {copiedStep === st.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStep === st.id ? (isEn ? 'Copied' : 'Copié') : (isEn ? 'Copy' : 'Copier')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Dataset Ingestion Info */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-1.5">
            <h5 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <FolderUp className="w-4 h-4 text-blue-600" />
              <span>{isEn ? 'Folder & Dataset Importation' : 'Importation de Dossier de Projet'}</span>
            </h5>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              {isEn 
                ? 'Once running, navigate to http://localhost:3000 and select your project directory. The app will automatically decode all .eml emails, meeting transcripts, Jira logs, and contracts to construct your verified RAG memory.'
                : 'Une fois lancé, rendez-vous sur http://localhost:3000 et sélectionnez votre dossier de fichiers. L\'application décode automatiquement les courriels .eml, comptes-rendus, tickets JIRA et contrats pour construire la mémoire opérationnelle.'}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">
            {isEn ? 'Ready for local development & presentations' : 'Prêt pour exécution locale et démonstration'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            {isEn ? 'Close' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};
