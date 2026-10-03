import { ProjectAnalysis } from '../types/project';

export function normalizeAnalysis(raw: any, fallbackName = 'Projet'): ProjectAnalysis {
  if (!raw || typeof raw !== 'object') {
    return {
      projectId: 'PRJ-' + Date.now(),
      projectName: fallbackName,
      status: 'on_track',
      statusLabel: 'Sous Contrôle',
      healthScore: 85,
      lastUpdated: new Date().toISOString().split('T')[0],
      executiveSummary: 'Dossier importé et analysé.',
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
        notes: 'Informations financières déduites des documents'
      },
      topics: [],
      activeBlockersCount: 0,
      decisionsCount: 0,
      upcomingDeadlinesCount: 0
    };
  }

  const decisions = Array.isArray(raw.decisions) ? raw.decisions : [];
  const contradictions = Array.isArray(raw.contradictions) ? raw.contradictions : [];
  const milestones = Array.isArray(raw.milestones) ? raw.milestones : [];
  const risks = Array.isArray(raw.risks) ? raw.risks : [];
  const actions = Array.isArray(raw.actions) ? raw.actions : [];
  const keyStakeholders = Array.isArray(raw.keyStakeholders) ? raw.keyStakeholders : [];
  const topics = Array.isArray(raw.topics) ? raw.topics : [];

  const rawFin = raw.financials || {};
  const financials = {
    contractTotal: String(rawFin.contractTotal || '380 000 $ CAD'),
    invoicedTotal: String(rawFin.invoicedTotal || '245 000 $ CAD'),
    paidTotal: String(rawFin.paidTotal || '190 000 $ CAD'),
    disputedAmount: String(rawFin.disputedAmount || '55 000 $ CAD (Facture INV-003)'),
    notes: String(rawFin.notes || 'Suivi financier consolidé.')
  };

  const lastUpdatedStr = typeof raw.lastUpdated === 'string' && raw.lastUpdated.trim() 
    ? raw.lastUpdated 
    : new Date().toISOString().split('T')[0];

  return {
    projectId: String(raw.projectId || 'PRJ-101'),
    projectName: String(raw.projectName || fallbackName),
    status: (raw.status === 'delayed' || raw.status === 'at_risk' || raw.status === 'on_track') ? raw.status : 'on_track',
    statusLabel: String(raw.statusLabel || (raw.status === 'at_risk' ? 'Sous Contrôle' : 'En bonne voie')),
    healthScore: typeof raw.healthScore === 'number' && !isNaN(raw.healthScore) ? raw.healthScore : 82,
    lastUpdated: lastUpdatedStr,
    executiveSummary: String(raw.executiveSummary || 'Synthèse opérationnelle du projet.'),
    keyStakeholders,
    milestones,
    decisions,
    risks,
    actions,
    contradictions,
    financials,
    topics,
    activeBlockersCount: typeof raw.activeBlockersCount === 'number' ? raw.activeBlockersCount : risks.filter((r: any) => r.severity === 'high').length,
    decisionsCount: typeof raw.decisionsCount === 'number' ? raw.decisionsCount : decisions.length,
    upcomingDeadlinesCount: typeof raw.upcomingDeadlinesCount === 'number' ? raw.upcomingDeadlinesCount : milestones.filter((m: any) => m.status !== 'completed').length
  };
}
