export interface ProjectDocument {
  id: string;
  name: string;
  category: 'email' | 'meeting' | 'ticket' | 'project_doc' | 'contract_finance' | 'architecture' | 'teams' | 'archive';
  categoryLabel: string;
  date: string;
  author?: string;
  summary: string;
  content: string;
  tags: string[];
  fileType: string;
  relevanceStatus?: 'valid' | 'outdated' | 'superseded' | 'draft';
}

export interface Decision {
  id: string;
  title: string;
  date: string;
  owner: string;
  rationale: string;
  impact: string;
  status: 'approved' | 'in_review' | 'implemented' | 'superseded';
  sourceDocId?: string;
  sourceDocName?: string;
  evidenceQuote?: string;
}

export interface RiskItem {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  identifiedDate: string;
  owner: string;
  mitigation: string;
  status: 'active' | 'mitigated' | 'monitoring';
  sourceDocName?: string;
}

export interface MilestoneItem {
  id?: string;
  title: string;
  date: string;
  status: 'completed' | 'on_track' | 'at_risk' | 'delayed' | 'pending';
  initialDate?: string;
  owner: string;
  notes?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'done';
  sourceRationale: string;
}

export interface ContradictionItem {
  id: string;
  topic: string;
  issue: string;
  sourceA: { docName: string; statement: string; date: string };
  sourceB: { docName: string; statement: string; date: string };
  validStatus: string;
  recommendation: string;
}

export interface Stakeholder {
  name: string;
  role: string;
  organization: string;
  email?: string;
  influence: string;
}

export interface FinancialMetric {
  contractTotal: string;
  invoicedTotal: string;
  paidTotal: string;
  disputedAmount?: string;
  notes: string;
}

export interface ProjectAnalysis {
  projectId: string;
  projectName: string;
  lastUpdated: string;
  status: 'on_track' | 'at_risk' | 'delayed';
  statusLabel: string;
  healthScore: number;
  executiveSummary: string;
  keyStakeholders: Stakeholder[];
  milestones: MilestoneItem[];
  decisions: Decision[];
  risks: RiskItem[];
  actions: ActionItem[];
  contradictions: ContradictionItem[];
  financials: FinancialMetric;
  topics: {
    name: string;
    description: string;
    documentCount: number;
    health: 'good' | 'warning' | 'danger';
  }[];
  activeBlockersCount: number;
  decisionsCount: number;
  upcomingDeadlinesCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: {
    docId?: string;
    docName: string;
    quote: string;
    relevance: string;
  }[];
  suggestedFollowUps?: string[];
  isStreaming?: boolean;
}

export interface NewEventImpact {
  eventId: string;
  eventDescription: string;
  timestamp: string;
  whatChanged: string;
  affectedElements: {
    element: string;
    previousState: string;
    newState: string;
    reason: string;
  }[];
  recommendedActions: {
    action: string;
    priority: 'urgent' | 'high' | 'medium';
    assignee: string;
  }[];
  updatedProjectStatus: 'on_track' | 'at_risk' | 'delayed';
}
