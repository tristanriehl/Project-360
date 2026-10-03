import { ProjectDocument } from '../types/project';

/**
 * Parses files read from an uploaded folder or file input.
 */
export async function parseUploadedFiles(fileList: File[] | FileList): Promise<ProjectDocument[]> {
  const files = Array.from(fileList);
  const parsedDocs: ProjectDocument[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Ignore hidden files and system trash (like .DS_Store, Thumbs.db)
    if (file.name.startsWith('.') || file.name === 'Thumbs.db') {
      continue;
    }

    try {
      const textContent = await readFileContent(file);
      const doc = processFileIntoDocument(file, textContent, i + 1);
      parsedDocs.push(doc);
    } catch (err) {
      console.warn(`Could not read file ${file.name}:`, err);
    }
  }

  // Sort documents by date if available, or by name
  parsedDocs.sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date);
    return a.name.localeCompare(b.name);
  });

  return parsedDocs;
}

/**
 * Reads text content from a File object.
 */
function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else if (content instanceof ArrayBuffer) {
        // Fallback for binary: extract printable strings
        const uint8Array = new Uint8Array(content);
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const decoded = decoder.decode(uint8Array);
        // Clean non-printable characters for readability
        const cleaned = decoded.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').slice(0, 50000);
        resolve(cleaned);
      } else {
        resolve(`[File ${file.name} - ${file.size} bytes]`);
      }
    };

    reader.onerror = (error) => reject(error);

    // Read as text for text/eml/code, or arraybuffer for potential binary docs
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['txt', 'md', 'json', 'csv', 'eml', 'log', 'xml', 'html', 'js', 'ts', 'yaml', 'yml'].includes(ext || '')) {
      reader.readAsText(file);
    } else {
      reader.readAsText(file); // Most project docs are text/eml/csv
    }
  });
}

/**
 * Transforms a raw file and text into a structured ProjectDocument
 */
function processFileIntoDocument(file: File, rawContent: string, index: number): ProjectDocument {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase() || 'txt';
  const lowerName = fileName.toLowerCase();

  let author = 'Équipe Projet';
  let date = new Date(file.lastModified).toISOString().split('T')[0];
  let category: ProjectDocument['category'] = 'project_doc';
  let categoryLabel = 'Document Projet';
  let summary = '';
  let content = rawContent;

  // 1. EML Email Parsing
  if (ext === 'eml' || lowerName.includes('mail') || lowerName.startsWith('e0') || lowerName.startsWith('e1') || lowerName.startsWith('e2')) {
    category = 'email';
    categoryLabel = 'Courriel';

    const fromMatch = rawContent.match(/^(?:From|De)\s*:\s*([^\r\n]+)/im);
    if (fromMatch) author = cleanHeaderValue(fromMatch[1]);

    const dateMatch = rawContent.match(/^(?:Date)\s*:\s*([^\r\n]+)/im);
    if (dateMatch) {
      const parsedDate = tryParseDate(dateMatch[1]);
      if (parsedDate) date = parsedDate;
    }

    const subjectMatch = rawContent.match(/^(?:Subject|Objet)\s*:\s*([^\r\n]+)/im);
    if (subjectMatch) {
      summary = `Courriel : ${cleanHeaderValue(subjectMatch[1])}`;
    }
  } 
  // 2. Meeting Notes / Transcripts
  else if (lowerName.includes('cr_') || lowerName.includes('reunion') || lowerName.includes('meeting') || lowerName.includes('copil') || lowerName.includes('pv_')) {
    category = 'meeting';
    categoryLabel = 'Compte-rendu';
    summary = `Compte-rendu de réunion : ${fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}`;
  }
  // 3. Tickets / Bugs / JIRA
  else if (lowerName.includes('jira') || lowerName.includes('bug') || lowerName.includes('ticket') || lowerName.includes('perf-') || lowerName.includes('acc-') || lowerName.includes('incident')) {
    category = 'ticket';
    categoryLabel = 'Ticket & Incident';
    summary = `Ticket d'incident ou bogue : ${fileName}`;
  }
  // 4. Architecture / ADR / Specs
  else if (lowerName.includes('adr') || lowerName.includes('arch') || lowerName.includes('spec') || lowerName.includes('tech')) {
    category = 'architecture';
    categoryLabel = 'Architecture (ADR)';
    summary = `Spécification ou décision d'architecture : ${fileName}`;
  }
  // 5. Contracts & Finance
  else if (lowerName.includes('facture') || lowerName.includes('contrat') || lowerName.includes('budget') || lowerName.includes('devis') || lowerName.includes('finance') || lowerName.includes('inv-')) {
    category = 'contract_finance';
    categoryLabel = 'Contrat & Finances';
    summary = `Pièce comptable ou contractuelle : ${fileName}`;
  }
  // 6. Teams / Chat
  else if (lowerName.includes('teams') || lowerName.includes('chat') || lowerName.includes('slack')) {
    category = 'teams';
    categoryLabel = 'Discussion Teams';
    summary = `Échanges de messagerie instantanée : ${fileName}`;
  }

  // Extract author if mentioned in first 5 lines (e.g. De: / Par: / Author:)
  if (author === 'Équipe Projet') {
    const authorLineMatch = rawContent.slice(0, 500).match(/(?:Auteur|Author|Rédacteur|Par|De)\s*[:=]\s*([^\r\n]+)/i);
    if (authorLineMatch) {
      author = cleanHeaderValue(authorLineMatch[1]);
    }
  }

  // Extract date from text if found (e.g. 2026-XX-XX or DD Month 2026)
  const isoDateMatch = rawContent.slice(0, 1000).match(/\b(202[4-8]-[0-1][0-9]-[0-3][0-9])\b/);
  if (isoDateMatch) {
    date = isoDateMatch[1];
  }

  // Fallback summary if empty
  if (!summary) {
    const firstLine = rawContent.trim().split('\n')[0]?.slice(0, 120);
    summary = firstLine || `Document : ${fileName}`;
  }

  // Tags extraction
  const tags: string[] = [categoryLabel];
  if (ext) tags.push(ext.toUpperCase());
  if (lowerName.includes('v1') || lowerName.includes('v2') || lowerName.includes('v3')) tags.push('Versionné');
  if (lowerName.includes('urgent') || lowerName.includes('critique')) tags.push('Prioritaire');

  return {
    id: `DOC-${String(index).padStart(2, '0')}`,
    name: fileName,
    category,
    categoryLabel,
    date,
    author,
    summary,
    content: rawContent || `[Fichier ${fileName} vide ou illisible]`,
    tags,
    fileType: ext,
    relevanceStatus: 'valid'
  };
}

function cleanHeaderValue(val: string): string {
  return val.replace(/<[^>]+>/g, '').replace(/["]/g, '').trim();
}

function tryParseDate(dateStr: string): string | null {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {}
  return null;
}
