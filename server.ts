import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_NOVA_ANALYSIS, SAMPLE_DOCUMENTS_NOVA, SAMPLE_DOCUMENTS_ORION } from './src/data/sampleProjects.js';
import { ProjectAnalysis, ProjectDocument } from './src/types/project.js';
import { synthesizeDatasetLocally } from './src/utils/datasetSynthesizer.js';
import { normalizeAnalysis } from './src/utils/normalizeAnalysis.js';
import { processFileIntoDocument, parseEmlContent } from './src/utils/folderParser.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// LLM Mode: 'gemini' | 'ollama' | 'local'
const forceLocalLLM = process.env.USE_LOCAL_LLM === 'true' || process.env.LLM_PROVIDER === 'ollama' || process.env.LLM_PROVIDER === 'local';
const rawApiKey = process.env.GEMINI_API_KEY || '';
const apiKey = forceLocalLLM ? '' : rawApiKey;

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Standard fast & accurate model for structured JSON synthesis and RAG
const GEMINI_MODEL = 'gemini-2.5-flash';

// Local LLM Configuration (Ollama, LM Studio, etc.)
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

/**
 * Calls local LLM via Ollama or OpenAI-compatible local server
 */
async function callLocalLLM(prompt: string, systemPrompt?: string, jsonMode = false): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    // 1. Try Ollama native endpoint (/api/generate)
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: prompt,
          system: systemPrompt,
          format: jsonMode ? 'json' : undefined,
          stream: false,
        }),
        signal: controller.signal
      });

      if (res.ok) {
        clearTimeout(timeout);
        const data: any = await res.json();
        if (data.response) return data.response.trim();
      }
    } catch (ollamaErr) {
      // Ignore and try OpenAI compatible endpoint
    }

    // 2. Try OpenAI-compatible chat endpoint (LM Studio / Ollama / LocalAI on /v1/chat/completions)
    try {
      const v1Host = OLLAMA_HOST.endsWith('/v1') ? OLLAMA_HOST : `${OLLAMA_HOST}/v1`;
      const resV1 = await fetch(`${v1Host}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
        }),
        signal: controller.signal
      });

      if (resV1.ok) {
        clearTimeout(timeout);
        const data: any = await resV1.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return content.trim();
      }
    } catch (v1Err) {
      // Ignore
    }

    clearTimeout(timeout);
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Fallback keyword search for local document citations
 */
function localKeywordSearch(query: string, docs: ProjectDocument[]) {
  const queryTerms = query.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
  let bestDoc = docs[0];
  const bestMatches: { docName: string; quote: string; relevance: string }[] = [];
  let bestScore = -1;

  docs.forEach(doc => {
    let score = 0;
    const text = (doc.content || '').toLowerCase();
    const docName = (doc.name || '').toLowerCase();
    const docAuthor = (doc.author || '').toLowerCase();
    const docSummary = (doc.summary || '').toLowerCase();

    queryTerms.forEach((term: string) => {
      if (text.includes(term)) score += 2;
      if (docName.includes(term)) score += 4;
      if (docAuthor.includes(term)) score += 5;
      if (docSummary.includes(term)) score += 3;
    });

    if (score > bestScore) {
      bestScore = score;
      bestDoc = doc;
    }

    const lines = (doc.content || '').split(/\r?\n/);
    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('---') || cleanLine.startsWith('===')) continue;
      if (queryTerms.some((t: string) => cleanLine.toLowerCase().includes(t)) && cleanLine.length > 15) {
        if (bestMatches.length < 5 && !bestMatches.some(m => m.quote === cleanLine)) {
          bestMatches.push({
            docName: doc.name,
            quote: cleanLine.slice(0, 260),
            relevance: `Extrait pertinent (${doc.categoryLabel}) - ${doc.name} (${doc.date})`
          });
        }
      }
    }
  });

  if (bestMatches.length === 0 && bestDoc) {
    bestMatches.push({
      docName: bestDoc.name,
      quote: bestDoc.summary || bestDoc.content.slice(0, 200),
      relevance: 'Pièce documentaire indexée dans la mémoire opérationnelle'
    });
  }

  return { bestDoc, bestMatches };
}

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

// Shared JSON schema for ProjectAnalysis
const PROJECT_ANALYSIS_SCHEMA = {
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
          id: { type: Type.STRING },
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
        required: ['id', 'title', 'date', 'owner', 'rationale', 'impact', 'status', 'sourceDocName', 'evidenceQuote']
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
      required: ['contractTotal', 'invoicedTotal', 'paidTotal', 'disputedAmount', 'notes']
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
    'projectName', 'status', 'statusLabel', 'healthScore',
    'executiveSummary', 'milestones', 'decisions', 'risks', 'actions',
    'contradictions', 'financials', 'topics', 'keyStakeholders'
  ]
};

// 3.5. POST /api/upload-dataset - Upload user folder documents and run RAG synthesis
app.post('/api/upload-dataset', async (req: Request, res: Response) => {
  try {
    const { documents, folderName } = req.body;
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: 'No documents provided' });
    }

    currentDocuments = documents;

    // Generate local factual synthesis from documents as rock-solid baseline
    const localSynthesis = synthesizeDatasetLocally(currentDocuments, folderName);
    currentAnalysis = normalizeAnalysis(localSynthesis, folderName || 'Projet Importé');

    // If local LLM mode or no API key, return local synthesis directly
    if (!apiKey) {
      return res.json({
        success: true,
        project: currentAnalysis,
        documents: currentDocuments,
      });
    }

    // Call Gemini to synthesize with structured schema
    const docsText = currentDocuments.map(d => `--- PIÈCE [${d.name}] (${d.categoryLabel} - Date: ${d.date} - Auteur: ${d.author || 'N/A'}) ---
Résumé : ${d.summary}
Contenu :
${d.content.slice(0, 3000)}`).join('\n\n');

    const prompt = `Tu es l'analyste principal du système 'Projet 360 - Le Cerveau du Projet'.
L'utilisateur vient d'importer son dossier de projet contenant ${currentDocuments.length} pièces documentaires réelles :
${docsText}

MISSION CRITIQUE :
Toutes tes extractions, citations, décisions, contradictions, risques et jalons doivent provenir EXCLUSIVEMENT et STRICTEMENT de ces documents réels ci-dessus. Ne crée aucune fausse information.`;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: PROJECT_ANALYSIS_SCHEMA
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed && typeof parsed === 'object') {
        const mergedDecisions = (Array.isArray(parsed.decisions) && parsed.decisions.length > 0) ? parsed.decisions : localSynthesis.decisions;
        const mergedMilestones = (Array.isArray(parsed.milestones) && parsed.milestones.length > 0) ? parsed.milestones : localSynthesis.milestones;
        const mergedRisks = (Array.isArray(parsed.risks) && parsed.risks.length > 0) ? parsed.risks : localSynthesis.risks;
        const mergedActions = (Array.isArray(parsed.actions) && parsed.actions.length > 0) ? parsed.actions : localSynthesis.actions;
        const mergedContradictions = (Array.isArray(parsed.contradictions) && parsed.contradictions.length > 0) ? parsed.contradictions : localSynthesis.contradictions;
        const mergedStakeholders = (Array.isArray(parsed.keyStakeholders) && parsed.keyStakeholders.length > 0) ? parsed.keyStakeholders : localSynthesis.keyStakeholders;
        const mergedTopics = (Array.isArray(parsed.topics) && parsed.topics.length > 0) ? parsed.topics : localSynthesis.topics;

        currentAnalysis = normalizeAnalysis({
          ...localSynthesis,
          ...parsed,
          decisions: mergedDecisions,
          milestones: mergedMilestones,
          risks: mergedRisks,
          actions: mergedActions,
          contradictions: mergedContradictions,
          keyStakeholders: mergedStakeholders,
          topics: mergedTopics,
          projectName: folderName || parsed.projectName || localSynthesis.projectName || 'Projet Importé',
          lastUpdated: new Date().toLocaleDateString('fr-CA') + ' ' + new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
        }, folderName || 'Projet Importé');
      }
    } catch (aiErr: any) {
      console.warn('Gemini synthesis quota or error, using local synthesis baseline:', aiErr?.message || aiErr);
      currentAnalysis = normalizeAnalysis(localSynthesis, folderName || 'Projet Importé');
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
    const localSynthesis = synthesizeDatasetLocally(docsToAnalyze, currentAnalysis.projectName);
    
    // If local LLM mode or no API key, return local synthesis
    if (!apiKey) {
      currentAnalysis = normalizeAnalysis(localSynthesis, currentAnalysis.projectName);
      return res.json({
        success: true,
        analysis: currentAnalysis,
        warning: 'Synthèse locale exécutée.'
      });
    }

    const docsText = docsToAnalyze.map(d => `--- DOCUMENT [${d.name}] (${d.categoryLabel} - Date: ${d.date} - Auteur: ${d.author || 'N/A'}) ---
Résumé : ${d.summary}
Contenu :
${d.content.slice(0, 3000)}`).join('\n\n');

    const prompt = `Tu es l'analyste principal et moteur RAG du système 'Projet 360 - Le Cerveau du Projet'.
Ta mission est d'analyser l'ensemble des documents d'un projet pour construire une mémoire opérationnelle fiable et structurée.

Voici la documentation complète du projet :
${docsText}`;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: PROJECT_ANALYSIS_SCHEMA
        }
      });

      const parsed = JSON.parse(response.text || '{}') as ProjectAnalysis;
      const mergedDecisions = (Array.isArray(parsed.decisions) && parsed.decisions.length > 0) ? parsed.decisions : localSynthesis.decisions;
      const mergedMilestones = (Array.isArray(parsed.milestones) && parsed.milestones.length > 0) ? parsed.milestones : localSynthesis.milestones;
      const mergedRisks = (Array.isArray(parsed.risks) && parsed.risks.length > 0) ? parsed.risks : localSynthesis.risks;
      const mergedActions = (Array.isArray(parsed.actions) && parsed.actions.length > 0) ? parsed.actions : localSynthesis.actions;
      const mergedContradictions = (Array.isArray(parsed.contradictions) && parsed.contradictions.length > 0) ? parsed.contradictions : localSynthesis.contradictions;
      const mergedStakeholders = (Array.isArray(parsed.keyStakeholders) && parsed.keyStakeholders.length > 0) ? parsed.keyStakeholders : localSynthesis.keyStakeholders;
      const mergedTopics = (Array.isArray(parsed.topics) && parsed.topics.length > 0) ? parsed.topics : localSynthesis.topics;

      currentAnalysis = normalizeAnalysis({
        ...localSynthesis,
        ...parsed,
        decisions: mergedDecisions,
        milestones: mergedMilestones,
        risks: mergedRisks,
        actions: mergedActions,
        contradictions: mergedContradictions,
        keyStakeholders: mergedStakeholders,
        topics: mergedTopics,
        lastUpdated: new Date().toLocaleDateString('fr-CA') + ' ' + new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
      }, currentAnalysis.projectName);
    } catch (aiErr: any) {
      console.warn('AI analysis quota/error, keeping local synthesis baseline:', aiErr?.message || aiErr);
      currentAnalysis = normalizeAnalysis(localSynthesis, currentAnalysis.projectName);
    }

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

    // Function to handle local RAG response via Ollama or smart keyword citation
    const handleLocalRagResponse = async () => {
      const { bestDoc, bestMatches } = localKeywordSearch(question, currentDocuments);

      // Try local Ollama / LM Studio if running
      const ollamaContext = currentDocuments.slice(0, 15).map(d => `[DOC: ${d.name} (${d.date} - ${d.author || 'N/A'})]\n${d.content.slice(0, 1500)}`).join('\n\n');
      const ollamaPrompt = `Tu es le Cerveau Opérationnel du projet. Réponds à la question de l'utilisateur strictement d'après les documents ci-dessous en citant le document source et en fournissant des puces claires.

Documents du projet :
${ollamaContext}

Question : "${question}"`;

      const ollamaReply = await callLocalLLM(ollamaPrompt);
      if (ollamaReply && ollamaReply.trim().length > 20) {
        return {
          answer: ollamaReply,
          citations: bestMatches.slice(0, 3),
          suggestedFollowUps: [
            "Quelles sont les décisions actées ?",
            "Quelles contradictions sont identifiées ?",
            "Quels sont les jalons de livraison ?"
          ]
        };
      }

      // Keyword RAG fallback if Ollama server is not running
      return {
        answer: `D'après l'analyse locale de vos ${currentDocuments.length} pièces documentaires :\n\n- **Document source identifié :** ${bestDoc.name} (${bestDoc.date})\n- **Élément factuel relevé :** "${bestMatches[0]?.quote || bestDoc.summary}"\n\n*(Réponse générée par le moteur RAG local. Pour activer l'inférence générative locale complète, lancez Ollama avec \`ollama run ${OLLAMA_MODEL}\`).*`,
        citations: bestMatches,
        suggestedFollowUps: [
          "Quelles sont les décisions actées ?",
          "Quelles contradictions sont identifiées ?",
          "Quels sont les jalons de livraison ?"
        ]
      };
    };

    // If local LLM mode requested or no Gemini key, use local RAG directly
    if (!apiKey) {
      const localResult = await handleLocalRagResponse();
      return res.json(localResult);
    }

    // Build context for Gemini with explicit email header emphasis
    const contextDocs = currentDocuments.map(d => {
      const isEmail = d.category === 'email' || d.fileType?.toLowerCase() === 'eml';
      const typeHeader = isEmail ? `COURRIEL (.EML) - De: ${d.author || 'Inconnu'}` : `${d.categoryLabel} (${d.fileType})`;
      return `[DOCUMENT: ${d.name} | Type: ${typeHeader} | Date: ${d.date} | Auteur/Expéditeur: ${d.author || 'N/A'}]
Résumé: ${d.summary}
Contenu:
${d.content.slice(0, 3500)}`;
    }).join('\n\n');

    const systemPrompt = `Tu es le "Cerveau du Projet" - un assistant RAG expert en mémoire opérationnelle et analyse documentaire de projet.
Ton rôle est de répondre avec une précision absolue aux questions en t'appuyant STRICTEMENT sur l'ensemble des documents fournis, y compris les courriels (.eml), comptes-rendus de réunions, décisions d'architecture (ADR), tickets JIRA, et contrats.

Règles fondamentales :
1. COURRIELS & ÉCHANGES : Lorsqu'une question porte sur un courriel, un échange d'e-mails ou une personne (ex: 'Que dit l'email de...', 'Qu'a convenu Tristan...', 'Quel est le message de...'), identifie immédiatement le fichier .eml correspondant, cite son expéditeur (De:), son destinataire (À:), sa date et son objet.
2. HISTORIQUE vs VALIDE : Fais toujours la distinction entre une information HISTORIQUE (périmée ou obsolète) et une information ACTUELLEMENT VALIDE.
3. CONTRADICTIONS : Identifie explicitement les contradictions lorsqu'il y en a et explique pourquoi une version prime sur une autre.
4. CITATIONS PRÉCISES : Justifie TOUTES tes affirmations en citant le nom exact du ou des documents sources (ex: [E01_Lancement.eml] ou [ADR-007.md]) et en fournissant une citation exacte entre guillemets.
5. AUCUNE FABRICATION : Si l'information est absente ou incertaine dans les documents, dis-le clairement sans inventer.
6. FORMAT & STRUCTURE : Sois direct, structuré et professionnel avec des listes à puces claires et titres lisibles.

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

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
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
    } catch (cloudErr: any) {
      console.warn('Gemini API call hit quota/error (falling back to local RAG/Ollama):', cloudErr?.message || cloudErr);
      // Automatic graceful fallback to local Ollama / local RAG
      const localFallback = await handleLocalRagResponse();
      res.json(localFallback);
    }
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

    const localImpactFallback = {
      eventId: newDocId,
      eventDescription: description || content,
      timestamp: new Date().toISOString(),
      whatChanged: title || "Nouvel événement enregistré dans le référentiel documentaire.",
      affectedElements: [
        {
          element: "Gouvernance & Jalons",
          previousState: currentAnalysis.statusLabel,
          newState: "Révision requise suite au nouvel événement",
          reason: `Document reçu : ${newDoc.name}`
        }
      ],
      recommendedActions: [
        {
          action: `Évaluer l'impact opérationnel de : ${title || newDoc.name}`,
          priority: "urgent",
          assignee: author || "Chef de projet"
        }
      ],
      updatedProjectStatus: "at_risk"
    };

    if (!apiKey) {
      return res.json({
        success: true,
        newDocument: newDoc,
        impactAnalysis: localImpactFallback,
        updatedProject: currentAnalysis
      });
    }

    const prompt = `Un nouvel événement vient de survenir dans le projet !
Voici l'événement ou le document reçu :
Titre : ${title || 'Non spécifié'}
Auteur : ${author}
Contenu :
"${content || description}"

Voici l'état actuel de la mémoire du projet avant cet événement :
- Projet : ${currentAnalysis.projectName}
- Statut actuel : ${currentAnalysis.statusLabel}
- Décisions clés : ${currentAnalysis.decisions.map(d => d.title).join('; ')}
- Risques majeurs : ${currentAnalysis.risks.map(r => r.title).join('; ')}
- Éléments financiers : ${JSON.stringify(currentAnalysis.financials)}

Tu dois répondre formellement aux 3 questions imposées par le Défi 360 :
1. Qu'est-ce qui vient de changer ? (Synthèse claire du changement)
2. Quelles informations précédentes sont maintenant affectées ? (Quels jalons, contrats, décisions ou engagements antérieurs sont invalidés, retardés ou impactés)
3. Quelles actions devraient être prises immédiatement ? (Recommandations concrètes avec priorité et responsable)

Fournis également l'impact sur le statut global du projet ('on_track', 'at_risk', 'delayed') et une mise à jour des éléments clés.`;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
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
      
      if (impact.updatedProjectStatus) {
        currentAnalysis.status = impact.updatedProjectStatus as any;
        currentAnalysis.statusLabel = impact.updatedProjectStatus === 'delayed' ? 'En retard critique' : impact.updatedProjectStatus === 'at_risk' ? 'Sous tension / Actions requises' : 'En bonne voie';
      }

      if (impact.recommendedActions && impact.recommendedActions.length > 0) {
        const newActions = impact.recommendedActions.map((a: any, idx: number) => ({
          id: `ACT-EVT-${Date.now().toString().slice(-3)}-${idx}`,
          title: a.action,
          assignee: a.assignee || author || 'Chef de projet',
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
    } catch (aiErr) {
      console.warn('Gemini quota/error on new event, using local fallback:', aiErr);
      res.json({
        success: true,
        newDocument: newDoc,
        impactAnalysis: localImpactFallback,
        updatedProject: currentAnalysis
      });
    }
  } catch (err: any) {
    console.error('Error in /api/new-event:', err);
    res.status(500).json({ error: err.message || 'Erreur lors du traitement de l\'événement' });
  }
});

// 7. POST /api/generate-briefing - Executive briefing generation
app.post('/api/generate-briefing', async (req: Request, res: Response) => {
  try {
    const { targetAudience = 'direction_generale' } = req.body;

    const localBriefingFallback = {
      title: `Briefing Exécutif - ${currentAnalysis.projectName}`,
      date: new Date().toLocaleDateString('fr-CA'),
      audience: targetAudience,
      executiveSummary: currentAnalysis.executiveSummary,
      keyMilestones: currentAnalysis.milestones,
      criticalDecisions: currentAnalysis.decisions,
      risksAndMitigations: currentAnalysis.risks,
      financialStatus: currentAnalysis.financials,
      immediateNextSteps: currentAnalysis.actions.slice(0, 3)
    };

    if (!apiKey) {
      return res.json(localBriefingFallback);
    }

    const prompt = `Génère un dossier de briefing exécutif de haut niveau pour la ${targetAudience === 'direction_generale' ? 'Direction Générale et le Comité de Direction' : 'Direction de Projet et Sponsors'}.
Base-toi sur la mémoire opérationnelle du projet ci-dessous :
${JSON.stringify(currentAnalysis, null, 2)}

Documents indexés :
${currentDocuments.map(d => `- ${d.name} (${d.categoryLabel}, ${d.date}): ${d.summary}`).join('\n')}

Produis un compte-rendu synthétique, orienté décision et gouvernance.`;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: "Tu es un directeur de programme et conseiller exécutif chevronné.",
        }
      });

      res.json({
        title: `Briefing Stratégique Exécutif - ${currentAnalysis.projectName}`,
        date: new Date().toLocaleDateString('fr-CA'),
        content: response.text,
        rawAnalysis: currentAnalysis
      });
    } catch (aiErr) {
      console.warn('Briefing AI quota/error, returning structured local briefing:', aiErr);
      res.json(localBriefingFallback);
    }
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
        fullSourceExcerpt: sourceDoc ? sourceDoc.content.slice(0, 1000) : (d.evidenceQuote || 'Document source non indexé'),
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
        name: currentAnalysis.projectName,
        budget: currentAnalysis.financials.contractTotal || "380 000 $ CAD",
        status: currentAnalysis.statusLabel,
        deliveryDate: currentAnalysis.milestones[currentAnalysis.milestones.length - 1]?.date || "Consolidé",
        keyChallenges: currentAnalysis.risks.map(r => r.title).slice(0, 3).join(', ') || "Suivi des jalons et conformité",
        technology: "Architecture modulaire cloud",
        governance: "Pilotage continu"
      },
      projectB: {
        name: "Projet ORION (Modernisation Logistique)",
        budget: "520 000 $ CAD",
        status: "Clôturé avec succès",
        deliveryDate: "Février 2026 (Respecté)",
        keyChallenges: "Tests de charge sous 5 000 capteurs IoT, standardisation bons de commande fournisseurs",
        technology: "Microservices Go + Kafka + TimescaleDB",
        governance: "Équipe stable dédiée avec chef de projet senior"
      },
      keyTakeaways: [
        "L'anticipation des tests de performance en amont évite les blocages tardifs rencontrés en fin de parcours.",
        "Le cadrage contractuel des avenants impose une validation formelle préalable pour prévenir les litiges de facturation.",
        "La gouvernance agile permet de réaligner officiellement les jalons sans dépasser le budget global initial."
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
    const rawList = req.body.documents || req.body.files;
    if (!rawList || !Array.isArray(rawList) || rawList.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier fourni pour l\'ingestion.' });
    }

    const newDocs: ProjectDocument[] = rawList.map((f: any, idx: number) => {
      if (f.id && f.category && f.formattedContent) {
        return f as ProjectDocument;
      }
      return processFileIntoDocument(
        { name: f.name || `Document_${idx + 1}.txt`, lastModified: f.lastModified || Date.now() },
        f.content || '',
        idx + 1
      );
    });

    currentDocuments = [...newDocs, ...currentDocuments];
    const updatedSynthesis = synthesizeDatasetLocally(currentDocuments, currentAnalysis.projectName);
    currentAnalysis = normalizeAnalysis({ ...currentAnalysis, ...updatedSynthesis }, currentAnalysis.projectName);

    res.json({
      success: true,
      message: `${newDocs.length} document(s) importé(s) avec succès dans le Cerveau du Projet.`,
      addedDocuments: newDocs,
      totalDocuments: currentDocuments.length,
      updatedProject: currentAnalysis
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
