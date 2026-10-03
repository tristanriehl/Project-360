import React, { useState } from 'react';
import { Cpu, Cloud, HardDrive, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Zap, DollarSign, HelpCircle, Code, Layers } from 'lucide-react';

export const ArchitectureAdvisor: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<'sovereignty' | 'scale' | 'cost' | 'offline'>('scale');

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-xl shadow-purple-500/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
            <Cpu className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/20 tracking-wider">
              Conseil &amp; Arbitrage Architectural
            </span>
            <h2 className="text-xl font-black tracking-tight">
              Frontier Model API (Gemini) vs Local Open-Source LLM (Ollama / WebLLM)
            </h2>
          </div>
        </div>
        <p className="text-xs text-purple-100 max-w-3xl leading-relaxed">
          Analyse comparative approfondie et guide d'architecture pour vous aider à choisir la solution optimale pour votre moteur RAG de projet et l'édition dynamique de votre tableau de bord.
        </p>
      </div>

      {/* Side by Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Option A: Frontier Cloud API (Gemini 3.8 Flash) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-400 dark:border-blue-700 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Frontier Model API (Gemini 3.8 Flash)
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    Recommandé pour RAG Complexe &amp; Défi 360
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Choix Actuel
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4">
              Idéal pour synthétiser des dizaines de documents volumineux, détecter des contradictions subtiles et raisonner sur des contextes étendus sans matériel lourd.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Fenêtre de contexte massive (1M+ tokens) :</strong> Ingestion directe de PDFs entiers, transcripts audio et courriels sans découpage destructeur.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Raisonnement &amp; Détection de contradictions :</strong> Excellente capacité à repérer qu'une charte v1 est contredite par un compte-rendu de comité.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Zéro infrastructure à gérer :</strong> Vitesse instantanée (sub-seconde), pas besoin de GPU dédié (RTX 4090 ou A100).</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Sorties JSON strictes garanties :</strong> Schémas typés pour piloter directement l'état React du tableau de bord.</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
            <span className="font-bold text-blue-900 dark:text-blue-300">Coût &amp; Latence :</span>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              Gratuit sur le tier standard, ultra-économique en production (&lt; 0.05 $ par analyse de projet complète).
            </div>
          </div>
        </div>

        {/* Option B: Local Open-Source LLM (Ollama / Llama 3 / Mistral) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Open-Source Local LLM (Ollama / Llama 3)
                  </h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                    Recommandé pour Souveraineté Totale &amp; Hors-Ligne
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Alternative
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4">
              Idéal si les données du projet ne peuvent en aucun cas sortir des serveurs locaux de l'entreprise (ex: secret défense ou contrainte air-gapped).
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Confidentialité absolue :</strong> 100% du traitement se fait en local sans aucun appel réseau sortant.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Fonctionnement 100% hors-ligne :</strong> Aucune dépendance à une connexion internet.</span>
              </div>
              <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span><strong>Contrainte matérielle forte :</strong> Nécessite au minimum 16 à 32 Go de VRAM GPU pour un modèle 8B/70B performant.</span>
              </div>
              <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span><strong>Contexte limité (8k à 32k tokens) :</strong> Oblige à mettre en place un pipeline de chunking + embeddings + vector database (Chroma/Qdrant).</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs">
            <span className="font-bold text-purple-900 dark:text-purple-300">Coût &amp; Latence :</span>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              Coût d'API nul, mais coût d'infrastructure serveur GPU élevé (4 000 $ à 15 000 $).
            </div>
          </div>
        </div>

      </div>

      {/* Decision Tree / Which one should you choose? */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Matrice de Décision : Lequel choisir pour votre projet ?</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedScenario('scale')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedScenario === 'scale'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 font-bold'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <div className="text-xs">📚 Volume &amp; RAG Multi-Docs</div>
            <div className="text-[10px] opacity-80 mt-1">30+ documents volumineux</div>
          </button>

          <button
            onClick={() => setSelectedScenario('sovereignty')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedScenario === 'sovereignty'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 font-bold'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <div className="text-xs">🔒 Souveraineté &amp; Loi 25</div>
            <div className="text-[10px] opacity-80 mt-1">Données ultra-sensibles</div>
          </button>

          <button
            onClick={() => setSelectedScenario('cost')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedScenario === 'cost'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 font-bold'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <div className="text-xs">⚡ Prototypage Rapide 24h</div>
            <div className="text-[10px] opacity-80 mt-1">Délai court &amp; résultat immédiat</div>
          </button>

          <button
            onClick={() => setSelectedScenario('offline')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedScenario === 'offline'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 font-bold'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <div className="text-xs">💻 Mode Déconnecté</div>
            <div className="text-[10px] opacity-80 mt-1">Accès sans internet</div>
          </button>
        </div>

        {/* Selected Recommendation */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed">
          {selectedScenario === 'scale' && (
            <div>
              <strong className="text-blue-600 dark:text-blue-400">Verdict : Choisissez un Frontier Model API (Gemini 3.8 Flash).</strong>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Avec plus de 30 fichiers hétérogènes (courriels .eml, procès-verbaux, tickets, contrats .pdf), la fenêtre de contexte géante de Gemini permet d'injecter tous les documents en mémoire sans perte d'information, ce qui évite les hallucinations de chunking des petits modèles locaux.
              </p>
            </div>
          )}

          {selectedScenario === 'sovereignty' && (
            <div>
              <strong className="text-purple-600 dark:text-purple-400">Verdict : Architecture Hybride Recommandée.</strong>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Utilisez un modèle Frontier hébergé en région Canada (ex: Gemini sur Google Cloud Vertex AI en région Montréal / Canada Central pour respecter la Loi 25) OU faites tourner un conteneur Ollama local sur vos serveurs internes pour les données de paie/RH.
              </p>
            </div>
          )}

          {selectedScenario === 'cost' && (
            <div>
              <strong className="text-emerald-600 dark:text-emerald-400">Verdict : Frontier Model API (Gemini 3.8 Flash).</strong>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Pour un hackathon de 24h ou une mise en production en moins de 3 jours, l'API Frontier offre un niveau de raisonnement supérieur dès la première seconde, sans aucune configuration CUDA, drivers GPU ou Docker.
              </p>
            </div>
          )}

          {selectedScenario === 'offline' && (
            <div>
              <strong className="text-amber-600 dark:text-amber-400">Verdict : Local Open-Source LLM (Ollama / Llama 3 8B).</strong>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Si vos utilisateurs sont des délégués terrain sans réseau 4G/5G, installez une instance locale Ollama avec un pipeline de RAG vectoriel local (SQLite-vss ou Chroma local).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Architecture Blueprint Code Snippet */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-purple-600" />
          <span>Architecture Recommandée : Le Schéma Hybride "Cerveau 360"</span>
        </h3>

        <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
          <pre>{`// Pipeline Architectural RAG Recommandé :
// 1. Ingestion Multi-Sources (PDF, EML, TXT, CSV, Teams)
// 2. Indexation & Structuration (Gemini 3.8 Flash avec Schéma JSON Typé)
// 3. Extraction des Entités : Décisions, Risques, Conflits, Jalons
// 4. Moteur de Détection d'Incohérences & Vérification de Preuves
// 5. Dashboard Réactif React 19 + Traçabilité des Citations`}</pre>
        </div>
      </div>
    </div>
  );
};
