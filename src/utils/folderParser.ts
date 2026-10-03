import { ProjectDocument } from '../types/project';

/**
 * Decodes Quoted-Printable encoding commonly found in .eml emails
 */
function decodeQuotedPrintable(str: string): string {
  try {
    // Replace soft line breaks
    let decoded = str.replace(/=\r?\n/g, '');
    // Decode hexadecimal bytes
    decoded = decoded.replace(/=([0-9A-F]{2})/gi, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return _;
      }
    });
    // Try to decode utf-8 multi-byte if needed
    try {
      return decodeURIComponent(escape(decoded));
    } catch {
      return decoded;
    }
  } catch {
    return str;
  }
}

/**
 * Parses files read from an uploaded folder or file input.
 */
export async function parseUploadedFiles(fileList: File[] | FileList): Promise<ProjectDocument[]> {
  const files = Array.from(fileList);
  const parsedDocs: ProjectDocument[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Ignore hidden files and system trash (like .DS_Store, Thumbs.db, Desktop.ini)
    if (file.name.startsWith('.') || file.name === 'Thumbs.db' || file.name === 'desktop.ini') {
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
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        // Decode quoted printable if it looks like an email or encoded file
        if (file.name.endsWith('.eml') || content.includes('=3D') || content.includes('=20') || content.includes('=C3=')) {
          resolve(decodeQuotedPrintable(content));
        } else {
          resolve(content);
        }
      } else if (content instanceof ArrayBuffer) {
        // Extract readable ASCII and UTF-8 text from array buffer
        const uint8Array = new Uint8Array(content);
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const decoded = decoder.decode(uint8Array);
        const cleaned = decoded.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ').slice(0, 100000);
        resolve(cleaned);
      } else {
        resolve(`[File ${file.name} - ${file.size} bytes]`);
      }
    };

    reader.onerror = () => {
      resolve(`[Document content of ${file.name}]`);
    };

    // Attempt text reading first
    reader.readAsText(file);
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
  let date = new Date(file.lastModified || Date.now()).toISOString().split('T')[0];
  let category: ProjectDocument['category'] = 'project_doc';
  let categoryLabel = 'Document Projet';
  let summary = '';
  let content = rawContent;

  // 1. EML Email Parsing
  if (ext === 'eml' || ext === 'msg' || lowerName.includes('mail') || lowerName.startsWith('e0') || lowerName.startsWith('e1') || lowerName.startsWith('e2')) {
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
      const subj = cleanHeaderValue(subjectMatch[1]);
      summary = `Courriel : ${subj}`;
    }
  } 
  // 2. Meeting Notes / Transcripts
  else if (lowerName.includes('cr_') || lowerName.includes('cr-') || lowerName.includes('reunion') || lowerName.includes('meeting') || lowerName.includes('copil') || lowerName.includes('pv_') || lowerName.includes('comite')) {
    category = 'meeting';
    categoryLabel = 'Compte-rendu';
    summary = `Compte-rendu de réunion : ${fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')}`;
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
    const authorLineMatch = rawContent.slice(0, 800).match(/(?:Auteur|Author|Rédacteur|Par|De)\s*[:=]\s*([^\r\n]+)/i);
    if (authorLineMatch) {
      author = cleanHeaderValue(authorLineMatch[1]);
    }
  }

  // Extract explicit date inside document text if present
  const dateInTextMatch = rawContent.slice(0, 1000).match(/(?:Date|Le)\s*[:=]\s*([0-3]?[0-9][\s/-][0-1]?[0-9][\s/-]202[4-8]|\d{4}-\d{2}-\d{2}|\d{1,2}\s+[a-zéû]+\s+202[4-8])/i);
  if (dateInTextMatch) {
    const parsedDate = tryParseDate(dateInTextMatch[1]);
    if (parsedDate) date = parsedDate;
  }

  if (!summary) {
    // Generate a clean 1-line summary from the first readable non-empty line
    const firstLine = rawContent
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 10 && !l.startsWith('From:') && !l.startsWith('De:') && !l.startsWith('Date:') && !l.startsWith('Subject:'))[0];
    
    summary = firstLine ? firstLine.slice(0, 140) : `Document ${fileName}`;
  }

  return {
    id: `doc-${index}-${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`,
    name: fileName,
    category,
    categoryLabel,
    date,
    author,
    summary,
    content,
    tags: [categoryLabel, ext.toUpperCase()],
    fileType: ext.toUpperCase(),
    relevanceStatus: 'valid'
  };
}

function cleanHeaderValue(val: string): string {
  return val
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .replace(/<[^>]+>/g, '') // remove email angles <user@domain.com>
    .trim();
}

function tryParseDate(dateStr: string): string | null {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime()) && d.getFullYear() > 2000 && d.getFullYear() < 2050) {
      return d.toISOString().split('T')[0];
    }
  } catch {}

  // Parse french dates like "15 septembre 2026"
  const frenchMonths: Record<string, string> = {
    'janvier': '01', 'fevrier': '02', 'février': '02', 'mars': '03', 'avril': '04',
    'mai': '05', 'juin': '06', 'juillet': '07', 'aout': '08', 'août': '08',
    'septembre': '09', 'octobre': '10', 'novembre': '11', 'decembre': '12', 'décembre': '12'
  };

  const match = dateStr.match(/(\d{1,2})\s+([a-zéû]+)\s+(\d{4})/i);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = frenchMonths[match[2].toLowerCase()];
    const year = match[3];
    if (month) return `${year}-${month}-${day}`;
  }

  return null;
}
