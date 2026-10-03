import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Layers, 
  Scale, 
  ShieldAlert, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  Users,
  Loader2,
  FileCheck
} from 'lucide-react';
import { ProjectAnalysis, ProjectDocument } from '../types/project';

interface ExecutiveBriefingProps {
  analysis: ProjectAnalysis;
  documents: ProjectDocument[];
}

export const ExecutiveBriefing: React.FC<ExecutiveBriefingProps> = ({
  analysis,
  documents = []
}) => {
  const [activeTab, setActiveTab] = useState<'briefing' | 'comparison' | 'audit_dossier'>('briefing');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customBriefingText, setCustomBriefingText] = useState<string | null>(null);

  const decisions = analysis?.decisions || [];
  const risks = analysis?.risks || [];
  const actions = analysis?.actions || [];
  const financials = analysis?.financials || {
    contractTotal: 'Non renseigné',
    invoicedTotal: 'Non renseigné',
    paidTotal: 'Non renseigné',
    disputedAmount: '0 $',
    notes: 'Suivi financier consolidé'
  };

  const handleGenerateAiBriefing = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetAudience: 'direction_generale' })
      });
      const data = await response.json();
      if (data.content) {
        setCustomBriefingText(data.content);
      }
    } catch (err: any) {
      console.warn(`Erreur : ${err?.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    let md = `# BRIEFING STRATÉGIQUE EXÉCUTIF - ${analysis?.projectName || 'PROJET 360'}\n\n`;
    md += `**Date du rapport :** ${new Date().toLocaleDateString('fr-CA')}\n`;
    md += `**Statut Global :** ${analysis?.statusLabel || 'En cours'} (Score de santé : ${analysis?.healthScore || 80}%)\n\n`;
    md += `## 1. Résumé Exécutif\n${analysis?.executiveSummary || 'Synthèse'}\n\n`;
    md += `## 2. Décisions Clés & Arbitrages\n`;
    decisions.forEach(d => {
      md += `- **${d.title}** (${d.date}, Porteur: ${d.owner})\n  Justification: ${d.rationale}\n  Preuve: "${d.evidenceQuote}" (Source: ${d.sourceDocName})\n`;
    });
    md += `\n## 3. Risques Actifs & Surveillance\n`;
    risks.forEach(r => {
      md += `- **[${(r.severity || 'medium').toUpperCase()}] ${r.title}**\n  Mitigation: ${r.mitigation}\n`;
    });
    md += `\n## 4. Bilan Financier & Litiges\n`;
    md += `- Contrat initial : ${financials.contractTotal}\n`;
    md += `- Total facturé : ${financials.invoicedTotal}\n`;
    md += `- Total payé : ${financials.paidTotal}\n`;
    md += `- Montant en litige : ${financials.disputedAmount}\n`;
    md += `\n## 5. Prochaines Actions Prioritaires\n`;
    actions.forEach(a => {
      md += `- [ ] **${a.title}** (Assigné à: ${a.assignee}, Échéance: ${a.deadline})\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Génération de Rapports Exécutifs, Audit &amp; Comparaison Multi-Projets
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Synthèses prêtes pour la direction générale, comités d'audit et transfert de connaissances inter-projets.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('briefing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'briefing'
                ? 'bg-teal-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Briefing Direction
          </button>
          <button
            onClick={() => setActiveTab('audit_dossier')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'audit_dossier'
                ? 'bg-teal-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Dossier d'Audit &amp; Preuves
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'comparison'
                ? 'bg-teal-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Comparaison Multi-Projets
          </button>
        </div>
      </div>

      {/* 1. Briefing Tab */}
      {activeTab === 'briefing' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateAiBriefing}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Régénérer la note exécutive (IA)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copier en Markdown</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer / PDF</span>
              </button>
            </div>
          </div>

          {/* Document Sheet */}
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 max-w-4xl mx-auto font-sans">
            <div className="flex justify-between items-start pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-teal-600 dark:text-teal-400">
                  Note Stratégique à l'Attention du Comité de Direction
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Briefing Exécutif 360° — Projet NOVA
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Généré le {new Date().toLocaleDateString('fr-CA')} • Porteur : Mathieu Gagnon (Chargé de projet)
                </p>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                  {analysis.statusLabel}
                </span>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                  Santé globale : {analysis.healthScore}%
                </div>
              </div>
            </div>

            {/* Custom AI generated note if generated */}
            {customBriefingText ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-serif leading-relaxed whitespace-pre-wrap border border-slate-200 dark:border-slate-700">
                {customBriefingText}
              </div>
            ) : (
              <>
                {/* 1. Résumé Exécutif */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    1. Synthèse Exécutive &amp; Contexte Opérationnel
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {analysis.executiveSummary}
                  </div>
                </div>

                {/* 2. Décisions majeures */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    2. Décisions &amp; Arbitrages Clés Actés
                  </h3>
                  <div className="space-y-2">
                    {analysis.decisions.slice(0, 3).map((d) => (
                      <div key={d.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                          <span>{d.title}</span>
                          <span className="text-[10px] text-slate-400">{d.date} • {d.owner}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 font-medium">
                          {d.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Statut Financier */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    3. Bilan Financier &amp; Suivi Budgétaire
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400">Budget Fournisseur</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-1">310 000 $</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400">Total Facturé</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-1">254 500 $</div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-300">Total Acquitté</div>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">186 000 $</div>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                      <div className="text-[10px] text-rose-700 dark:text-rose-300">Litige Facture Boréal</div>
                      <div className="text-sm font-black text-rose-600 dark:text-rose-400 mt-1">14 500 $</div>
                    </div>
                  </div>
                </div>

                {/* 4. Risques résiduels */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    4. Risques Résiduels &amp; Actions Immédiates
                  </h3>
                  <div className="space-y-2">
                    {analysis.risks.map((r) => (
                      <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{r.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Mitigation : {r.mitigation}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.severity === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                          {r.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. Dossier d'Audit & Preuves Tab */}
      {activeTab === 'audit_dossier' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Dossier de Conformité &amp; Preuves Documentées
            </h3>
          </div>

          <div className="space-y-4">
            {analysis.decisions.map((dec) => (
              <div key={dec.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{dec.id} — {dec.title}</span>
                  <span className="text-slate-400">{dec.date}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {dec.rationale}
                </p>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 italic">
                  Preuve : "{dec.evidenceQuote}" (Document : {dec.sourceDocName})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Multi-Project Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Comparaison Inter-Projets &amp; Transfert de Connaissances
              </h3>
              <p className="text-xs text-slate-500">
                Mise en perspective de <strong>Projet NOVA</strong> (En cours) face au <strong>Projet ORION</strong> (Clôturé avec succès).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Project NOVA Card */}
            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-blue-900 dark:text-blue-200">
                  Projet NOVA (Plateforme Client 360)
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  En cours (28 Nov 2026)
                </span>
              </div>
              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <div>Budget : <strong>380 000 $ CAD</strong></div>
                <div>Stack : <strong>Next.js SSR + NestJS + PostgreSQL (Canada Central)</strong></div>
                <div>Gouvernance : <strong>Passation de gestion mi-projet (Élodie → Mathieu)</strong></div>
                <div>Points chauds : <strong>Loi 25, bogue API CRM, litige facture INV-003</strong></div>
              </div>
            </div>

            {/* Project ORION Card */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                  Projet ORION (Chaîne Logistique)
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Clôturé avec Succès (Fév 2026)
                </span>
              </div>
              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <div>Budget : <strong>520 000 $ CAD (Réalisé : 512 000 $)</strong></div>
                <div>Stack : <strong>Microservices Go + Kafka + TimescaleDB</strong></div>
                <div>Gouvernance : <strong>Équipe stable avec chef de projet senior dédié</strong></div>
                <div>Leçon clé : <strong>Tests de charge menés dès le sprint 2 et formalisation stricte des CR</strong></div>
              </div>
            </div>
          </div>

          {/* Key Lessons Learned */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">
              💡 Leçons Apprises Transférables à l'Organisation :
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>
                <strong>Verrouillage contractuel des avenants (CR) :</strong> L'expérience d'ORION montre qu'une clause de signature préalable obligatoire sur bon de commande évite les contestations tardives comme celle de la facture INV-003 de Boréal.
              </li>
              <li>
                <strong>Tests de performance continus :</strong> Intégrer les tests de charge dès la mi-parcours permet de traiter les indexations de base de données en amont sans stress pré-livraison.
              </li>
              <li>
                <strong>Périmètre MVP strict :</strong> Le recentrage de NOVA sur le Web et le report de la fonction mobile en Phase 2 est un arbitrage exemplaire garantissant le respect de la date finale.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
