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

  const rawDecisions = Array.isArray(raw.decisions) ? raw.decisions : [];
  const decisions = rawDecisions.map((d: any, idx: number) => ({
    id: String(d.id || `DEC-${String(idx + 1).padStart(2, '0')}`),
    title: String(d.title || d.name || `Décision ${idx + 1}`),
    date: String(d.date || new Date().toISOString().split('T')[0]),
    owner: String(d.owner || d.author || 'Direction Projet'),
    rationale: String(d.rationale || d.description || 'Justification déduite des pièces du projet'),
    impact: String(d.impact || 'Impact sur le calendrier et les livrables'),
    status: (d.status === 'approved' || d.status === 'in_review' || d.status === 'rejected' || d.status === 'implemented') ? d.status : 'approved',
    sourceDocId: d.sourceDocId ? String(d.sourceDocId) : undefined,
    sourceDocName: String(d.sourceDocName || d.sourceDoc || d.source || 'Document de référence'),
    evidenceQuote: String(d.evidenceQuote || d.quote || d.title || '')
  }));

  const rawContradictions = Array.isArray(raw.contradictions) ? raw.contradictions : [];
  const contradictions = rawContradictions.map((c: any, idx: number) => ({
    id: String(c.id || `CONTR-${String(idx + 1).padStart(2, '0')}`),
    topic: String(c.topic || c.title || `Divergence ${idx + 1}`),
    issue: String(c.issue || c.description || 'Écart relevé entre les sources documentaires'),
    sourceA: {
      docName: String(c.sourceA?.docName || c.sourceA?.name || 'Document source A'),
      statement: String(c.sourceA?.statement || c.sourceA?.quote || 'Version initiale'),
      date: String(c.sourceA?.date || '')
    },
    sourceB: {
      docName: String(c.sourceB?.docName || c.sourceB?.name || 'Document source B'),
      statement: String(c.sourceB?.statement || c.sourceB?.quote || 'Version concurrente'),
      date: String(c.sourceB?.date || '')
    },
    validStatus: String(c.validStatus || c.status || 'Sous réserve d\'arbitrage formel'),
    recommendation: String(c.recommendation || 'Consulter le compte-rendu ou la décision la plus récente')
  }));

  const rawMilestones = Array.isArray(raw.milestones) ? raw.milestones : [];
  const milestones = rawMilestones.map((m: any, idx: number) => ({
    id: String(m.id || `M-${idx + 1}`),
    title: String(m.title || m.name || `Jalon ${idx + 1}`),
    date: String(m.date || 'À planifier'),
    status: (m.status === 'completed' || m.status === 'on_track' || m.status === 'at_risk' || m.status === 'delayed' || m.status === 'pending') ? m.status : 'on_track',
    initialDate: m.initialDate ? String(m.initialDate) : undefined,
    owner: String(m.owner || m.assignee || 'Chef de projet'),
    notes: m.notes ? String(m.notes) : undefined
  }));

  const rawRisks = Array.isArray(raw.risks) ? raw.risks : [];
  const risks = rawRisks.map((r: any, idx: number) => ({
    id: String(r.id || `RSK-${String(idx + 1).padStart(2, '0')}`),
    title: String(r.title || r.name || `Risque ${idx + 1}`),
    severity: (r.severity === 'high' || r.severity === 'medium' || r.severity === 'low') ? r.severity : 'medium',
    category: String(r.category || 'Général'),
    identifiedDate: String(r.identifiedDate || r.date || new Date().toISOString().split('T')[0]),
    owner: String(r.owner || 'Responsable de lot'),
    mitigation: String(r.mitigation || 'Surveillance et plan d\'atténuation avec l\'équipe'),
    status: (r.status === 'active' || r.status === 'mitigated' || r.status === 'monitoring') ? r.status : 'active',
    sourceDocName: r.sourceDocName ? String(r.sourceDocName) : undefined
  }));

  const rawActions = Array.isArray(raw.actions) ? raw.actions : [];
  const actions = rawActions.map((a: any, idx: number) => ({
    id: String(a.id || `ACT-${String(idx + 1).padStart(2, '0')}`),
    title: String(a.title || a.name || `Action ${idx + 1}`),
    assignee: String(a.assignee || a.owner || 'Responsable assigné'),
    deadline: String(a.deadline || a.date || 'Sous 5 jours'),
    priority: (a.priority === 'high' || a.priority === 'medium' || a.priority === 'low') ? a.priority : 'medium',
    status: (a.status === 'todo' || a.status === 'in_progress' || a.status === 'completed') ? a.status : 'todo',
    sourceRationale: String(a.sourceRationale || a.rationale || 'Action priorisée pour sécuriser les livrables')
  }));

  const rawStakeholders = Array.isArray(raw.keyStakeholders) ? raw.keyStakeholders : [];
  const keyStakeholders = rawStakeholders.map((s: any) => ({
    name: String(s.name || 'Contributeur'),
    role: String(s.role || 'Rôle projet'),
    organization: String(s.organization || 'Projet'),
    influence: String(s.influence || 'Opérationnelle')
  }));

  const rawTopics = Array.isArray(raw.topics) ? raw.topics : [];
  const topics = rawTopics.map((t: any) => ({
    name: String(t.name || 'Général'),
    description: String(t.description || 'Pôle thématique du projet'),
    documentCount: typeof t.documentCount === 'number' ? t.documentCount : 1,
    health: (t.health === 'good' || t.health === 'warning' || t.health === 'danger') ? t.health : 'good'
  }));

  const rawFin = raw.financials || {};
  const financials = {
    contractTotal: String(rawFin.contractTotal || 'Selon pièces du dossier'),
    invoicedTotal: String(rawFin.invoicedTotal || 'Selon factures importées'),
    paidTotal: String(rawFin.paidTotal || 'À rapprocher'),
    disputedAmount: String(rawFin.disputedAmount || (contradictions.length > 0 ? 'Vérification requise' : '0 $')),
    notes: String(rawFin.notes || 'Suivi financier consolidé depuis les pièces du dossier.')
  };

  const lastUpdatedStr = typeof raw.lastUpdated === 'string' && raw.lastUpdated.trim() 
    ? raw.lastUpdated 
    : new Date().toLocaleDateString('fr-CA') + ' ' + new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });

  const healthScore = typeof raw.healthScore === 'number' && !isNaN(raw.healthScore) 
    ? raw.healthScore 
    : Math.max(40, 85 - (contradictions.length * 4) - (risks.filter((r: any) => r.severity === 'high').length * 5));

  const computedStatus = (raw.status === 'delayed' || raw.status === 'at_risk' || raw.status === 'on_track')
    ? raw.status
    : healthScore < 60 ? 'delayed' : healthScore < 80 ? 'at_risk' : 'on_track';

  const computedStatusLabel = raw.statusLabel
    ? String(raw.statusLabel)
    : computedStatus === 'delayed' ? 'En Retard Critique' : computedStatus === 'at_risk' ? 'Sous Surveillance' : 'Sous Contrôle';

  return {
    projectId: String(raw.projectId || `PRJ-${Date.now().toString().slice(-4)}`),
    projectName: String(raw.projectName || fallbackName),
    status: computedStatus,
    statusLabel: computedStatusLabel,
    healthScore,
    lastUpdated: lastUpdatedStr,
    executiveSummary: String(raw.executiveSummary || 'Synthèse opérationnelle consolidée à partir des pièces documentaires.'),
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
