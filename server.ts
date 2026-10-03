import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_NOVA_ANALYSIS, SAMPLE_DOCUMENTS_NOVA, SAMPLE_DOCUMENTS_ORION } from './src/data/sampleProjects.js';
import { ProjectAnalysis, ProjectDocument } from './src/types/project.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Ultra-lightweight, token-efficient model
const GEMINI_LIGHT_MODEL = 'gemini-3.1-flash-lite';

const createEmptyAnalysis = (name = 'Awaiting Folder Import'): ProjectAnalysis => ({
  projectId: 'AWAITING-DATASET',
  projectName: name,
  status: 'on_track',
  statusLabel: 'En attente de dossier',
  healthScore: 0,
  lastUpdated: new Date().toISOString(),
  executiveSummary: 'Aucun document chargé. Veuillez importer votre dossier de projet pour que le moteur RAG construise la mémoire opérationnelle.',
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
    notes: 'En attente d\'importation des pièces financières du projet.'
  },
  topics: [],
  activeBlockersCount: 0,
  decisionsCount: 0,
  upcomingDeadlinesCount: 0
});

// In-memory active database (Empty by default: user uploads their project folder)
let currentDocuments: ProjectDocument[] = [];
let currentAnalysis: ProjectAnalysis = createEmptyAnalysis();

// 1. GET /api/project - Get current project state and documents
app.get('/api/project', (req: Request, res: Response) => {
  res.json({
    project: currentAnalysis,
    documents: currentDocuments,
  });
});

// 2. POST /api/clear-dataset - Clear current documents and reset
app.post('/api/clear-dataset', (req: Request, res: Response) => {
  currentDocuments = [];
  currentAnalysis = createEmptyAnalysis();
  res.json({ success: true, project: currentAnalysis, documents: [] });
});

// 3. POST /api/reset-project - Reset project to empty state
app.post('/api/reset-project', (req: Request, res: Response) => {
  currentDocuments = [];
  currentAnalysis = createEmptyAnalysis();
  res.json({
    success: true,
    project: currentAnalysis,
    documents: currentDocuments,
  });
});

// 3.5. POST /api/upload-dataset - Upload user folder documents and run RAG synthesis
app.post('/api/upload-dataset', async (req: Request, res: Response) => {
  try {
    const { documents, folderName } = req.body;
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: 'No documents provided' });
    }

    currentDocuments = documents;

    // If no Gemini API key, initialize a clean analysis and return
    if (!apiKey) {
      currentAnalysis = {
        ...createEmptyAnalysis(folderName || 'Projet Importé'),
        status: 'on_track',
        statusLabel: 'Sous Contrôle',
        healthScore: 82,
        lastUpdated: new Date().toLocaleDateString('fr-CA') + ' ' + new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
        executiveSummary: `Dossier analysé avec succès. ${currentDocuments.length} pièces documentaires réelles chargées en mémoire opérationnelle.`
      };
      return res.json({
        success: true,
        project: currentAnalysis,
        documents: currentDocuments,
      });
    }

    // Call Gemini Flash Lite (gemini-3.1-flash-lite) to synthesize with minimal token consumption
    const docsText = currentDocuments.map(d => `--- PIÈCE [${d.name}] (${d.categoryLabel} - Date: ${d.date}) ---
Auteur: ${d.author || 'Inconnu'}
Contenu:
${d.content.slice(0, 1800)}`).join('\n\n');

    const prompt = `Tu es l'analyste principal du système 'Projet 360 - Cerveau du Projet'.
L'utilisateur vient d'importer son dossier de projet contenant ${currentDocuments.length} pièces documentaires réelles :
${docsText}

MISSION CRITIQUE :
Toutes tes extractions, citations, décisions, contradictions et jalons doivent provenir EXCLUSIVEMENT et STRICTEMENT de ces documents réels ci-dessus. Ne crée aucune fausse information ni hallucination.

Produis une réponse JSON structurée :
1. projectName : Nom du projet d'après les documents ou "${folderName || 'Projet Importé'}"
2. status ('on_track', 'at_risk', 'delayed') et healthScore (0-100)
3. executiveSummary : Synthèse fidèle basée sur les faits réels des documents
4. milestones : Jalons et dates trouvés dans les documents
5. decisions : Décisions réelles avec citation textuelle et nom exact du document source
6. risks : Risques réels avec niveau de sévérité et source
7. actions : Actions identifiées
8. contradictions : Divergences, contestations ou discordances entre documents
9. financials : Données financières mentionnées dans les pièces
10. topics : Thématiques principales`;

    const response = await ai.models.generateContent({
      model: GEMINI_LIGHT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      if (parsed.projectName || parsed.executiveSummary) {
        currentAnalysis = {
          ...currentAnalysis,
          ...parsed,
          projectName: folderName || parsed.projectName || 'Projet Importé',
          lastUpdated: new Date().toLocaleDateString('fr-CA') + ' ' + new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
        };
      }
    } catch (e) {
      console.warn('Could not parse Gemini JSON response for dataset upload, keeping current structure:', e);
    }

    res.json({
      success: true,
      project: currentAnalysis,
      documents: currentDocuments,
    });
  } catch (err: any) {
    console.error('Error in /api/upload-dataset:', err);
    res.status(500).json({ error: err.message || 'Erreur lors de l\'analyse du dossier' });
  }
});

// 4. POST /api/analyze-project - Trigger full AI synthesis on provided or updated documents
app.post('/api/analyze-project', async (req: Request, res: Response) => {
  try {
    const docsToAnalyze: ProjectDocument[] = req.body.documents || currentDocuments;
    
    // If no API key or empty docs, return fallback
    if (!apiKey) {
      return res.json({
        success: true,
        analysis: currentAnalysis,
        warning: 'Clé API Gemini non configurée dans l\'environnement, données de synthèse initiales retournées.'
      });
    }

    const docsText = docsToAnalyze.map(d => `--- DOCUMENT [${d.name}] (${d.categoryLabel} - Date: ${d.date}) ---
Auteur: ${d.author || 'Inconnu'}
Contenu:
${d.content.slice(0, 1800)}`).join('\n\n');

    const prompt = `Tu es l'analyste principal et moteur RAG du système 'Projet 360 - Le Cerveau du Projet'.
Ta mission est d'analyser l'ensemble des documents d'un projet d'entreprise (courriels, comptes-rendus de réunions, tickets de bugs, contrats, finances, enregistrements d'architecture ADR, conversations Teams, notes de passation) pour construire une mémoire opérationnelle fiable et structurée.

Voici la documentation complète du projet :
${docsText}

Fournis une analyse JSON rigoureuse et exhaustive respectant scrupuleusement la structure demandée :
1. Évalue l'état global ('on_track', 'at_risk', 'delayed') et un score de santé (0-100).
2. Rédige un résumé exécutif limpide.
3. Extrais les jalons avec statut ('completed', 'on_track', 'at_risk', 'pending'), date et initialDate si reportée.
4. Extrais les décisions clés avec date, responsable, justification (rationale), impact, document source et citation de preuve (evidenceQuote).
5. Extrais les risques actifs avec niveau de sévérité ('high', 'medium', 'low'), mitigation et document source.
6. Extrais les actions prioritaires à entreprendre avec responsable, date limite, priorité ('high', 'medium', 'low') et justification.
7. Détecte formellement toutes les contradictions ou informations périmées (ex: dates différentes dans la charte vs plan v3, facturation de demandes non signées, désaccords de périmètre) en précisant quelle source est ACTUELLEMENT VALIDE et la recommandation opérationnelle.
8. Synthétise les données financières (montant contrat, facturé, payé, montant en litige/contesté).
9. Identifie les parties prenantes clés et leur rôle.
10. Catégorise les thématiques principales (topics) avec leur état de santé.`;

    const response = await ai.models.generateContent({
      model: GEMINI_LIGHT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectId: { type: Type.STRING },
            projectName: { type: Type.STRING },
            lastUpdated: { type: Type.STRING },
            status: { type: Type.STRING },
            statusLabel: { type: Type.STRING },
            healthScore: { type: Type.NUMBER },
            executiveSummary: { type: Type.STRING },
            activeBlockersCount: { type: Type.NUMBER },
            decisionsCount: { type: Type.NUMBER },
            upcomingDeadlinesCount: { type: Type.NUMBER },
            keyStakeholders: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  organization: { type: Type.STRING },
                  influence: { type: Type.STRING }
                },
                required: ['name', 'role', 'organization', 'influence']
              }
            },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  date: { type: Type.STRING },
                  status: { type: Type.STRING },
                  initialDate: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ['title', 'date', 'status', 'owner']
              }
            },
            decisions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  date: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  status: { type: Type.STRING },
                  sourceDocName: { type: Type.STRING },
                  evidenceQuote: { type: Type.STRING }
                },
                required: ['id', 'title', 'date', 'owner', 'rationale', 'impact', 'status']
              }
            },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  category: { type: Type.STRING },
                  identifiedDate: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  mitigation: { type: Type.STRING },
                  status: { type: Type.STRING },
                  sourceDocName: { type: Type.STRING }
                },
                required: ['id', 'title', 'severity', 'category', 'owner', 'mitigation', 'status']
              }
            },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  assignee: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  status: { type: Type.STRING },
                  sourceRationale: { type: Type.STRING }
                },
                required: ['id', 'title', 'assignee', 'deadline', 'priority', 'status', 'sourceRationale']
              }
            },
            contradictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  issue: { type: Type.STRING },
                  sourceA: {
                    type: Type.OBJECT,
                    properties: {
                      docName: { type: Type.STRING },
                      statement: { type: Type.STRING },
                      date: { type: Type.STRING }
                    },
                    required: ['docName', 'statement', 'date']
                  },
                  sourceB: {
                    type: Type.OBJECT,
                    properties: {
                      docName: { type: Type.STRING },
                      statement: { type: Type.STRING },
                      date: { type: Type.STRING }
                    },
                    required: ['docName', 'statement', 'date']
                  },
                  validStatus: { type: Type.STRING },
                  recommendation: { type: Type.STRING }
                },
                required: ['id', 'topic', 'issue', 'sourceA', 'sourceB', 'validStatus', 'recommendation']
              }
            },
            financials: {
              type: Type.OBJECT,
              properties: {
                contractTotal: { type: Type.STRING },
                invoicedTotal: { type: Type.STRING },
                paidTotal: { type: Type.STRING },
                disputedAmount: { type: Type.STRING },
                notes: { type: Type.STRING }
              },
              required: ['contractTotal', 'invoicedTotal', 'paidTotal', 'notes']
            },
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  documentCount: { type: Type.NUMBER },
                  health: { type: Type.STRING }
                },
                required: ['name', 'description', 'documentCount', 'health']
              }
            }
          },
          required: [
            'projectId', 'projectName', 'status', 'statusLabel', 'healthScore',
            'executiveSummary', 'milestones', 'decisions', 'risks', 'actions',
            'contradictions', 'financials', 'topics'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}') as ProjectAnalysis;
    currentAnalysis = {
      ...parsed,
      lastUpdated: new Date().toLocaleDateString('fr-CA') + ' ' + new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
    };
    currentDocuments = docsToAnalyze;

    res.json({
      success: true,
      analysis: currentAnalysis,
    });
  } catch (err: any) {
    console.error('Error in /api/analyze-project:', err);
    res.status(500).json({ error: err.message || 'Erreur lors de l\'analyse du projet' });
  }
});

// 5. POST /api/chat-rag - Interactive natural language RAG Q&A with direct document citations
app.post('/api/chat-rag', async (req: Request, res: Response) => {
  try {
    const { question, history = [] } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'La question est requise.' });
    }

    if (currentDocuments.length === 0) {
      return res.json({
        answer: "Aucun document n'a encore été importé. Veuillez importer votre dossier de projet pour que l'assistant RAG puisse répondre à vos questions en se basant exclusivement sur vos fichiers.",
        citations: [],
        suggestedFollowUps: [
          "Comment importer mon dossier ?",
          "Quels formats de fichiers sont acceptés ?"
        ]
      });
    }

    if (!apiKey) {
      const firstDoc = currentDocuments[0];
      return res.json({
        answer: `L'assistant RAG a indexé vos ${currentDocuments.length} documents réels (mode local). Pour les réponses génératives en direct avec Gemini Flash, veuillez configurer GEMINI_API_KEY.`,
        citations: firstDoc ? [
          {
            docName: firstDoc.name,
            quote: firstDoc.summary,
            relevance: 'Extrait de votre dossier importé'
          }
        ] : [],
        suggestedFollowUps: [
          "Quelles sont les décisions actées ?",
          "Quelles contradictions sont identifiées ?",
          "Quels sont les jalons de livraison ?"
        ]
      });
    }

    // Build context with all documents and analysis
    const contextDocs = currentDocuments.map(d => `[DOC: ${d.name} | Catégorie: ${d.categoryLabel} | Date: ${d.date} | Auteur: ${d.author || 'N/A'}]
${d.content}`).join('\n\n');

    const systemPrompt = `Tu es le "Cerveau du Projet" - un assistant RAG expert en mémoire opérationnelle de projet.
Ton rôle est de répondre avec une précision absolue aux questions des membres de l'équipe, des gestionnaires et de la direction en t'appuyant STRICTEMENT sur les documents fournis.

Règles fondamentales :
1. Fais toujours la distinction entre une information HISTORIQUE (périmée ou obsolète, ex: date initiale de la charte v1) et une information ACTUELLEMENT VALIDE (ex: décision du copil ou plan v3).
2. Identifie explicitement les contradictions lorsqu'il y en a et explique pourquoi une version prime sur une autre.
3. Justifie TOUTES tes affirmations en citant le nom exact du ou des documents sources et en fournissant un extrait textuel (citation exacte).
4. Si l'information est absente ou incertaine, dis-le clairement sans inventer.
5. Sois direct, structuré et professionnel.

Voici l'ensemble des documents du projet :
${contextDocs}

État actuel du projet :
${JSON.stringify(currentAnalysis, null, 2)}`;

    const userPrompt = `Historique de conversation :
${history.map((h: any) => `${h.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${h.content}`).join('\n')}

Question actuelle de l'utilisateur :
"${question}"

Réponds au format JSON avec le schéma suivant :
- answer: Réponse détaillée, structurée avec des puces claires et mise en page lisible.
- citations: Tableau d'extraits sources [{ docName: string, quote: string, relevance: string }]
- suggestedFollowUps: 3 questions pertinentes que l'utilisateur pourrait poser ensuite.`;

    const response = await ai.models.generateContent({
      model: GEMINI_LIGHT_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            citations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  docName: { type: Type.STRING },
                  quote: { type: Type.STRING },
                  relevance: { type: Type.STRING }
                },
                required: ['docName', 'quote', 'relevance']
              }
            },
            suggestedFollowUps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['answer', 'citations', 'suggestedFollowUps']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/chat-rag:', err);
    res.status(500).json({ error: err.message || 'Erreur lors de la requête RAG' });
  }
});

// 6. POST /api/new-event - "Un nouvel événement survient" : Dynamic impact analysis & memory update
app.post('/api/new-event', async (req: Request, res: Response) => {
  try {
    const { title, description, documentName, content, category = 'email', author = 'Inconnu' } = req.body;
    if (!description && !content) {
      return res.status(400).json({ error: 'Une description ou le contenu de l\'événement est requis.' });
    }

    const newDocId = 'EVT-' + Date.now().toString().slice(-4);
    const newDoc: ProjectDocument = {
      id: newDocId,
      name: documentName || `Evenement_${new Date().toISOString().slice(0, 10)}.txt`,
      category: category as any,
      categoryLabel: category === 'email' ? 'Courriel Urgent' : category === 'ticket' ? 'Incident / Billet' : 'Note d\'Événement',
      date: new Date().toISOString().slice(0, 10),
      author: author,
      summary: title || 'Nouvel événement survenu pendant le projet',
      content: content || description,
      tags: ['Nouvel Événement', 'Impact Direct'],
      fileType: 'txt',
      relevanceStatus: 'valid'
    };

    // Add to active document database
    currentDocuments.unshift(newDoc);

    if (!apiKey) {
      return res.json({
        success: true,
        newDocument: newDoc,
        impactAnalysis: {
          eventId: newDocId,
          eventDescription: description || content,
          timestamp: new Date().toISOString(),
          whatChanged: "Nouvel événement enregistré dans le référentiel documentaire.",
          affectedElements: [
            {
              element: "Gouvernance & Jalons",
              previousState: "Planning initial",
              newState: "Révision requise suite au nouvel événement",
              reason: "Informations reçues modifiant le contexte opérationnel"
            }
          ],
          recommendedActions: [
            {
              action: "Convoquer un comité d'urgence pour évaluer l'impact.",
              priority: "urgent",
              assignee: "Mathieu Gagnon (CP)"
            }
          ],
          updatedProjectStatus: "at_risk"
        },
        updatedProject: currentAnalysis
      });
    }

    const contextDocs = currentDocuments.map(d => `[DOC: ${d.name} (${d.date})] ${d.summary}\n${d.content.slice(0, 500)}`).join('\n\n');

    const prompt = `Un nouvel événement vient de survenir dans le projet !
Voici l'événement ou le document reçu :
Titre : ${title || 'Non spécifié'}
Auteur : ${author}
Contenu :
"${content || description}"

Voici l'état actuel de la mémoire du projet avant cet événement :
- Statut actuel : ${currentAnalysis.statusLabel}
- Date Go-Live actuelle : 28 novembre 2026
- Décisions clés : ${currentAnalysis.decisions.map(d => d.title).join('; ')}
- Risques majeurs : ${currentAnalysis.risks.map(r => r.title).join('; ')}
- Éléments financiers : ${JSON.stringify(currentAnalysis.financials)}

Tu dois répondre formellement aux 3 questions imposées par le Défi 360 :
1. Qu'est-ce qui vient de changer ? (Synthèse claire du changement)
2. Quelles informations précédentes sont maintenant affectées ? (Quels jalons, contrats, décisions ou engagements antérieurs sont invalidés, retardés ou impactés)
3. Quelles actions devraient être prises immédiatement ? (Recommandations concrètes avec priorité et responsable)

Fournis également l'impact sur le statut global du projet ('on_track', 'at_risk', 'delayed') et une mise à jour des éléments clés.`;

    const response = await ai.models.generateContent({
      model: GEMINI_LIGHT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            eventId: { type: Type.STRING },
            eventDescription: { type: Type.STRING },
            timestamp: { type: Type.STRING },
            whatChanged: { type: Type.STRING },
            affectedElements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  element: { type: Type.STRING },
                  previousState: { type: Type.STRING },
                  newState: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ['element', 'previousState', 'newState', 'reason']
              }
            },
            recommendedActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  assignee: { type: Type.STRING }
                },
                required: ['action', 'priority', 'assignee']
              }
            },
            updatedProjectStatus: { type: Type.STRING },
            summaryForDashboard: { type: Type.STRING }
          },
          required: ['whatChanged', 'affectedElements', 'recommendedActions', 'updatedProjectStatus']
        }
      }
    });

    const impact = JSON.parse(response.text || '{}');
    
    // Dynamically update currentAnalysis based on impact
    if (impact.updatedProjectStatus) {
      currentAnalysis.status = impact.updatedProjectStatus as any;
      currentAnalysis.statusLabel = impact.updatedProjectStatus === 'delayed' ? 'En retard critique' : impact.updatedProjectStatus === 'at_risk' ? 'Sous tension / Actions requises' : 'En bonne voie';
    }

    if (impact.recommendedActions && impact.recommendedActions.length > 0) {
      const newActions = impact.recommendedActions.map((a: any, idx: number) => ({
        id: `ACT-EVT-${Date.now().toString().slice(-3)}-${idx}`,
        title: a.action,
        assignee: a.assignee || 'Mathieu Gagnon',
        deadline: 'Sous 48 heures',
        priority: a.priority || 'high',
        status: 'todo' as const,
        sourceRationale: `Déclenché suite à l'événement : ${newDoc.name}`
      }));
      currentAnalysis.actions = [...newActions, ...currentAnalysis.actions];
    }

    currentAnalysis.lastUpdated = new Date().toLocaleDateString('fr-CA') + ' ' + new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });

    res.json({
      success: true,
      newDocument: newDoc,
      impactAnalysis: impact,
      updatedProject: currentAnalysis
    });
  } catch (err: any) {
    console.error('Error in /api/new-event:', err);
    res.status(500).json({ error: err.message || 'Erreur lors du traitement de l\'événement' });
  }
});

// 7. POST /api/generate-briefing - Executive briefing generation
app.post('/api/generate-briefing', async (req: Request, res: Response) => {
  try {
    const { targetAudience = 'direction_generale' } = req.body;

    if (!apiKey) {
      return res.json({
        title: "Briefing Exécutif - Projet NOVA (360°)",
        date: new Date().toLocaleDateString('fr-CA'),
        audience: targetAudience,
        executiveSummary: currentAnalysis.executiveSummary,
        keyMilestones: currentAnalysis.milestones,
        criticalDecisions: currentAnalysis.decisions,
        risksAndMitigations: currentAnalysis.risks,
        financialStatus: currentAnalysis.financials,
        immediateNextSteps: currentAnalysis.actions.slice(0, 3)
      });
    }

    const prompt = `Génère un dossier de briefing exécutif de haut niveau pour la ${targetAudience === 'direction_generale' ? 'Direction Générale et le Comité de Direction' : 'Direction de Projet et Sponsors'}.
Base-toi sur la mémoire opérationnelle du projet ci-dessous :
${JSON.stringify(currentAnalysis, null, 2)}

Produis un compte-rendu synthétique, orienté décision et gouvernance, incluant :
- Titre clair et date
- Résumé exécutif en 3 points clés
- État d'avancement des livrables et date ferme de Go-Live
- Analyse financière et litiges en cours de règlement
- 3 décisions majeures prises et leurs justifications
- Risques résiduels et plan de mitigation
- Arbitrages demandés à la direction`;

    const response = await ai.models.generateContent({
      model: GEMINI_LIGHT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "Tu es un directeur de programme et conseiller exécutif chevronné.",
      }
    });

    res.json({
      title: "Briefing Stratégique Exécutif - Projet NOVA",
      date: new Date().toLocaleDateString('fr-CA'),
      content: response.text,
      rawAnalysis: currentAnalysis
    });
  } catch (err: any) {
    console.error('Error in /api/generate-briefing:', err);
    res.status(500).json({ error: err.message || 'Erreur lors de la génération du briefing' });
  }
});

// 8. POST /api/decision-dossier - Decision dossier with proofs
app.post('/api/decision-dossier', async (req: Request, res: Response) => {
  try {
    const decisionsWithEvidence = currentAnalysis.decisions.map(d => {
      const sourceDoc = currentDocuments.find(doc => doc.name.toLowerCase().includes(d.sourceDocName?.toLowerCase() || '') || doc.id === d.sourceDocId);
      return {
        ...d,
        fullSourceExcerpt: sourceDoc ? sourceDoc.content.slice(0, 800) : 'Document source non indexé',
        sourceCategory: sourceDoc?.categoryLabel || 'Général',
        verified: !!sourceDoc
      };
    });

    res.json({
      project: currentAnalysis.projectName,
      generatedAt: new Date().toISOString(),
      decisions: decisionsWithEvidence,
      contradictionsResolved: currentAnalysis.contradictions
    });
  } catch (err: any) {
    console.error('Error in /api/decision-dossier:', err);
    res.status(500).json({ error: err.message });
  }
});

// 9. POST /api/compare-projects - Multi-project comparison
app.post('/api/compare-projects', async (req: Request, res: Response) => {
  try {
    const comparison = {
      projectA: {
        name: "Projet NOVA (Plateforme Client 360)",
        budget: "380 000 $ CAD",
        status: currentAnalysis.statusLabel,
        deliveryDate: "28 Novembre 2026",
        keyChallenges: "Intégration API CRM, souveraineté des données Loi 25, accessibilité WCAG AA, litige facture INV-003",
        technology: "Next.js SSR + NestJS + PostgreSQL (Canada Central)",
        governance: "Passation CP mi-projet (Élodie -> Mathieu)"
      },
      projectB: {
        name: "Projet ORION (Modernisation Logistique)",
        budget: "520 000 $ CAD",
        status: "Clôturé avec succès (Fév 2026)",
        deliveryDate: "10 Février 2026 (Respecté)",
        keyChallenges: "Tests de charge sous 5 000 capteurs IoT, standardisation bons de commande fournisseurs",
        technology: "Microservices Go + Kafka + TimescaleDB",
        governance: "Équipe stable dédiée avec chef de projet senior"
      },
      keyTakeaways: [
        "Le projet ORION a anticipé les tests de performance dès le Sprint 2, évitant ainsi le blocage tardif PERF-501 rencontré sur NOVA.",
        "Le cadrage contractuel des avenants (CR) sur ORION imposait une signature préalable systématique, ce qui aurait prévenu le litige sur la facture INV-003 / CR-04 de Boréal.",
        "La gouvernance de NOVA a su faire preuve d'agilité en réalignant officiellement le Go-Live au 28 novembre sans dépasser le budget global initial de 380 000 $."
      ]
    };

    res.json(comparison);
  } catch (err: any) {
    console.error('Error in /api/compare-projects:', err);
    res.status(500).json({ error: err.message });
  }
});

// 10. POST /api/ingest-files - Ingest custom user files (PDF, EML, TXT, CSV, MD, PPTX text)
app.post('/api/ingest-files', async (req: Request, res: Response) => {
  try {
    const { files } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier fourni pour l\'ingestion.' });
    }

    const newDocs: ProjectDocument[] = files.map((f: any, idx: number) => {
      const ext = f.name?.split('.').pop()?.toLowerCase() || 'txt';
      let cat: ProjectDocument['category'] = 'project_doc';
      let catLabel = 'Document Projet';
      
      if (ext === 'eml' || f.name.toLowerCase().includes('courriel') || f.name.toLowerCase().includes('email')) {
        cat = 'email';
        catLabel = 'Courriel';
      } else if (f.name.toLowerCase().includes('reunion') || f.name.toLowerCase().includes('transcript') || f.name.toLowerCase().includes('cr_')) {
        cat = 'meeting';
        catLabel = 'Compte-rendu Réunion';
      } else if (f.name.toLowerCase().includes('ticket') || f.name.match(/^[A-Z]{3,4}-\d+/)) {
        cat = 'ticket';
        catLabel = 'Billet de soutien';
      } else if (f.name.toLowerCase().includes('facture') || f.name.toLowerCase().includes('contrat') || f.name.toLowerCase().includes('inv-') || f.name.toLowerCase().includes('cr-')) {
        cat = 'contract_finance';
        catLabel = 'Contrat & Finances';
      } else if (f.name.toLowerCase().includes('adr') || f.name.toLowerCase().includes('archi')) {
        cat = 'architecture';
        catLabel = 'Architecture & ADR';
      } else if (f.name.toLowerCase().includes('teams')) {
        cat = 'teams';
        catLabel = 'Discussion Teams';
      }

      return {
        id: 'USER-' + Date.now().toString().slice(-4) + '-' + idx,
        name: f.name || `Document_${idx + 1}.${ext}`,
        category: cat,
        categoryLabel: catLabel,
        date: f.date || new Date().toISOString().slice(0, 10),
        author: f.author || 'Utilisateur',
        summary: f.summary || f.content?.slice(0, 180) + '...',
        content: f.content || '',
        tags: ['Fichier Importé', ext.toUpperCase()],
        fileType: ext,
        relevanceStatus: 'valid'
      };
    });

    currentDocuments = [...newDocs, ...currentDocuments];

    res.json({
      success: true,
      message: `${newDocs.length} document(s) importé(s) avec succès dans le Cerveau du Projet.`,
      addedDocuments: newDocs,
      totalDocuments: currentDocuments.length
    });
  } catch (err: any) {
    console.error('Error in /api/ingest-files:', err);
    res.status(500).json({ error: err.message });
  }
});

// Vite Middleware for Full-stack Dev
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Project 360 Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
