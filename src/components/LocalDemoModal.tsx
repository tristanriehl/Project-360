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
  Cpu
} from 'lucide-react';

interface LocalDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalDemoModal: React.FC<LocalDemoModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      id: 'step1',
      title: '1. Télécharger ou cloner le projet sur votre ordinateur',
      desc: 'Exportez le code source dans un dossier local sur votre machine.',
      command: `git clone <votre-repo-ou-dezippez-le-code> projet-360\ncd projet-360`
    },
    {
      id: 'step2',
      title: '2. Installer les dépendances Node.js',
      desc: 'Une seule commande standard avec npm ou bun (aucun outil propriétaire requis) :',
      command: `npm install`
    },
    {
      id: 'step3',
      title: '3. (Optionnel) Configurer votre mode d\'exécution',
      desc: 'Créez un fichier .env à la racine si vous souhaitez brancher une clé API, ou laissez vide pour le mode démo local 100% autonome :',
      command: `# Option A : Mode Autonome / Hors-Ligne (Aucune clé requise pour la démo)\n\n# Option B : Clé Gemini\nGEMINI_API_KEY="votre_cle_ici"\n\n# Option C : Serveur Local Ollama (100% sur votre GPU)\nOLLAMA_HOST="http://localhost:11434"\nOLLAMA_MODEL="llama3.2"`
    },
    {
      id: 'step4',
      title: '4. Lancer l\'application localement sur votre machine',
      desc: 'Le serveur Express + Vite démarre en local sur le port 3000 :',
      command: `npm run dev`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Guide Démo Locale &amp; Indépendance Technique
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comment exécuter Projet 360 à 100% sur votre propre machine pour la présentation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-5 text-xs">
          
          {/* Key Guarantee Banner */}
          <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950 dark:text-emerald-100">
                100% Indépendant &amp; Présentable sur votre ordinateur
              </h4>
              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Ce projet est un logiciel complet écrit en <strong>TypeScript standard, React 19, Tailwind CSS et Express</strong>. 
                Il n'y a aucun filigrane, aucune bannière externe, et aucune dépendance forcée à une interface tierce. Vous pouvez l'exécuter directement dans votre terminal local sur <code>http://localhost:3000</code>.
              </p>
            </div>
          </div>

          {/* 3 Presentation Modes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-1">
                <WifiOff className="w-4 h-4 text-emerald-500" />
                <span>Mode Démo Hors-Ligne</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Idéal pour la présentation en direct. Zéro risque de coupure Wi-Fi : toutes les données, graphiques et réponses du cas d'étude NOVA sont pré-indexées en local.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-1">
                <HardDrive className="w-4 h-4 text-purple-500" />
                <span>Mode Local LLM (Ollama)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Si vous avez Ollama installé (<code>ollama run llama3</code>), le backend peut s'y connecter directement via votre GPU en local.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-1">
                <Cpu className="w-4 h-4 text-blue-500" />
                <span>Mode Cloud API</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Fournissez votre clé dans le fichier <code>.env</code> pour activer le raisonnement multimodal illimité de Gemini.
              </p>
            </div>
          </div>

          {/* Step by Step Instructions */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Instructions pas-à-pas pour votre terminal :
            </h4>

            {steps.map((st) => (
              <div key={st.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white">
                  {st.title}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {st.desc}
                </p>

                <div className="relative">
                  <pre className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800">
                    {st.command}
                  </pre>
                  <button
                    onClick={() => copyCode(st.id, st.command)}
                    className="absolute right-2 top-2 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors"
                    title="Copier la commande"
                  >
                    {copiedStep === st.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedStep === st.id ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Advice for Presentation */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-1.5">
            <h5 className="font-bold text-blue-900 dark:text-blue-200">
              🎯 Conseils pour votre présentation devant les juges :
            </h5>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
              <li>Ouvrez votre navigateur sur <code>http://localhost:3000</code> en plein écran (F11).</li>
              <li>Montrez la <strong>Vue d'ensemble</strong> avec la reconstitution des 35 documents du cas d'étude NOVA.</li>
              <li>Faites la démonstration du <strong>Cerveau &amp; Graphe</strong> pour illustrer le croisement des informations.</li>
              <li>Posez une question clé dans l'<strong>Assistant RAG</strong> pour montrer les citations justificatives directes.</li>
              <li>Déclenchez l'épreuve <strong>« Un nouvel événement survient »</strong> avec un des scénarios d'urgence pour prouver l'adaptabilité en temps réel du système !</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">
            Application autonome prête pour le déploiement local
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
