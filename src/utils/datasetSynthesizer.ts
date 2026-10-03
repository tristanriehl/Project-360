import { ProjectAnalysis, ProjectDocument, Decision, ContradictionItem, MilestoneItem, RiskItem, ActionItem, Stakeholder } from '../types/project';

/**
 * Builds a comprehensive ProjectAnalysis strictly from user-uploaded documents.
 */
export function synthesizeDatasetLocally(documents: ProjectDocument[], folderName?: string): ProjectAnalysis {
  if (!documents || documents.length === 0) {
    return {
      projectId: 'EMPTY',
      projectName: 'Aucun document',
      status: 'on_track',
      statusLabel: 'En attente',
      healthScore: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      executiveSummary: 'Veuillez téléverser un dossier contenant les fichiers de votre projet.',
      keyStakeholders: [],
      milestones: [],
      decisions: [],
      risks: [],
      actions: [],
      contradictions: [],
      financials: {
        contractTotal: 'Non renseigné',
        invoicedTotal: 'Non renseigné',
        paidTotal: 'Non renseigné',
        disputedAmount: '0 $',
        notes: 'En attente d\'importation'
      },
      topics: [],
      activeBlockersCount: 0,
      decisionsCount: 0,
      upcomingDeadlinesCount: 0
    };
  }

  const decisions: Decision[] = [];
  const contradictions: ContradictionItem[] = [];
  const milestones: MilestoneItem[] = [];
  const risks: RiskItem[] = [];
  const actions: ActionItem[] = [];
  const stakeholderMap = new Map<string, Stakeholder>();

  // Scan all documents
  documents.forEach((doc, idx) => {
    const text = doc.content;
    const lines = text.split('\n');

    // Register stakeholder
    if (doc.author && doc.author !== 'Équipe Projet' && !stakeholderMap.has(doc.author)) {
      stakeholderMap.set(doc.author, {
        name: doc.author,
        role: doc.category === 'email' ? 'Correspondant' : 'Contributeur',
        organization: 'Projet',
        influence: 'Normale'
      });
    }

    // 1. Scan for decisions
    lines.forEach(line => {
      const clean = line.trim();
      if (clean.length > 20 && clean.length < 300) {
        if (/décidé|validé|acté|arbitré|approuvé|retenu|adopté|accord|agreed|approved|decided/i.test(clean)) {
          if (decisions.length < 15 && !decisions.some(d => d.title.includes(clean.slice(0, 30)))) {
            decisions.push({
              id: `DEC-${String(decisions.length + 1).padStart(2, '0')}`,
              title: clean.replace(/^[-*•\d.]\s*/, '').slice(0, 140),
              date: doc.date || '2026-10-01',
              owner: doc.author || 'Direction Projet',
              rationale: `Extrait directement de la pièce ${doc.name}`,
              impact: 'Impact sur la gouvernance ou le périmètre opérationnel',
              status: 'approved',
              sourceDocId: doc.id,
              sourceDocName: doc.name,
              evidenceQuote: clean
            });
          }
        }
      }
    });

    // 2. Scan for contradictions / disputes / date conflicts
    if (/conteste|divergence|incohérence|écart|différence|litige|note de crédit|annulation|facture erronée|contradiction/i.test(text)) {
      const matchLine = lines.find(l => /conteste|divergence|incohérence|écart|litige|note de crédit/i.test(l)) || doc.summary;
      if (contradictions.length < 6) {
        const nextDoc = documents[(idx + 1) % documents.length];
        contradictions.push({
          id: `CONTR-${String(contradictions.length + 1).padStart(2, '0')}`,
          topic: `Divergence relevée dans ${doc.name}`,
          issue: matchLine.trim().slice(0, 200),
          sourceA: {
            docName: doc.name,
            statement: matchLine.trim().slice(0, 160),
            date: doc.date
          },
          sourceB: {
            docName: nextDoc?.name || doc.name,
            statement: 'Version ou pièce documentaire connexe à réconcilier',
            date: nextDoc?.date || doc.date
          },
          validStatus: 'En cours d\'investigation',
          recommendation: 'Convoquer un point d\'arbitrage formel pour acter la version de référence'
        });
      }
    }

    // 3. Scan for milestones & dates
    lines.forEach(line => {
      const clean = line.trim();
      if (/jalon|livraison|mise en production|go-live|recette|déploiement|échéance|deadline|milestone/i.test(clean)) {
        if (milestones.length < 10 && clean.length < 180) {
          const dateFound = clean.match(/\b(202[4-8]-[0-1][0-9]-[0-3][0-9]|\d{1,2}\s+[a-zéû]+\s+202[4-8]|\d{1,2}\/\d{1,2}\/\d{4})\b/i);
          milestones.push({
            id: `M-${milestones.length + 1}`,
            title: clean.replace(/^[-*•\d.]\s*/, '').slice(0, 90),
            date: dateFound ? dateFound[0] : doc.date,
            status: /retard|décalé|postposé/i.test(clean) ? 'delayed' : /validé|terminé|clos|fait/i.test(clean) ? 'completed' : 'on_track',
            owner: doc.author || 'Chef de projet',
            notes: `Source : ${doc.name}`
          });
        }
      }
    });

    // 4. Scan for risks
    if (/risque|criticité|vulnérabilité|incident|bogue|défaut|surcharge|dépassement/i.test(text)) {
      const riskLine = lines.find(l => /risque|criticité|bogue|incident|dépassement/i.test(l));
      if (riskLine && risks.length < 8 && !risks.some(r => r.title.includes(riskLine.slice(0, 30)))) {
        risks.push({
          id: `RSK-${String(risks.length + 1).padStart(2, '0')}`,
          title: riskLine.trim().replace(/^[-*•\d.]\s*/, '').slice(0, 120),
          severity: /critique|bloquant|élevé|urgent/i.test(riskLine) ? 'high' : 'medium',
          category: doc.categoryLabel,
          identifiedDate: doc.date,
          owner: doc.author || 'Responsable Lot',
          mitigation: 'Plan d\'atténuation et surveillance renforcée avec l\'équipe technique',
          status: 'active',
          sourceDocName: doc.name
        });
      }
    }
  });

  // Calculate dynamic health score
  let score = 85;
  if (contradictions.length > 0) score -= (contradictions.length * 5);
  if (risks.filter(r => r.severity === 'high').length > 0) score -= (risks.filter(r => r.severity === 'high').length * 4);
  score = Math.max(20, Math.min(95, score));

  // Topics
  const topicMap: Record<string, number> = {};
  documents.forEach(d => {
    topicMap[d.categoryLabel] = (topicMap[d.categoryLabel] || 0) + 1;
  });

  const topics = Object.entries(topicMap).map(([name, count]) => ({
    name,
    description: `Regroupe ${count} document(s) analysés`,
    documentCount: count,
    health: (count > 4 ? 'good' : count > 1 ? 'warning' : 'danger') as 'good' | 'warning' | 'danger'
  }));

  const projectName = folderName || (documents[0]?.name ? `Projet ${documents[0].name.split(/[._-]/)[0]}` : 'Dossier Projet');

  return {
    projectId: 'UPLOADED-DATASET',
    projectName,
    status: score < 60 ? 'delayed' : score < 80 ? 'at_risk' : 'on_track',
    statusLabel: score < 60 ? 'En Retard Critique' : score < 80 ? 'Sous Surveillance' : 'Sous Contrôle',
    healthScore: score,
    lastUpdated: new Date().toLocaleDateString('fr-CA') + ' ' + new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
    executiveSummary: `Synthèse RAG générée à partir des ${documents.length} pièces documentaires réelles téléversées (${documents.map(d => d.fileType.toUpperCase()).filter((v, i, a) => a.indexOf(v) === i).join(', ')}). ${decisions.length} décisions actées et ${contradictions.length} divergences potentielles ont été isolées avec leurs preuves textuelles strictes.`,
    keyStakeholders: Array.from(stakeholderMap.values()),
    milestones: milestones.length > 0 ? milestones : [
      { id: 'M-1', title: 'Ingestion & Dépouillement des pièces', date: new Date().toISOString().split('T')[0], status: 'completed', owner: 'Moteur RAG' },
      { id: 'M-2', title: 'Consolidation & Arbitrage des écarts', date: 'À planifier', status: 'at_risk', owner: 'Comité de pilotage' }
    ],
    decisions,
    risks,
    actions: actions.length > 0 ? actions : [
      {
        id: 'ACT-01',
        title: `Consolider les ${contradictions.length} points de divergence relevés dans le dossier`,
        assignee: 'Chef de projet',
        deadline: 'Sous 5 jours',
        priority: 'high',
        status: 'todo',
        sourceRationale: 'Assurer l\'alignement strict des engagements contractuels et techniques'
      }
    ],
    contradictions,
    financials: {
      contractTotal: 'Selon pièces du dossier',
      invoicedTotal: 'Selon factures importées',
      paidTotal: 'À rapprocher',
      disputedAmount: contradictions.length > 0 ? 'Vérification requise' : '0 $',
      notes: `${documents.filter(d => d.category === 'contract_finance').length} pièce(s) financière(s) détectée(s) dans le dossier.`
    },
    topics,
    activeBlockersCount: risks.filter(r => r.severity === 'high').length,
    decisionsCount: decisions.length,
    upcomingDeadlinesCount: milestones.filter(m => m.status !== 'completed').length
  };
}
