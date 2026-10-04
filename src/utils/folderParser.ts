import { ProjectDocument } from '../types/project';
import * as XLSX from 'xlsx';

/**
 * Decodes RFC 2047 MIME encoded words (e.g. =?UTF-8?B?...?= or =?UTF-8?Q?...?= or =?ISO-8859-1?Q?...?=)
 */
export function decodeMimeHeader(headerStr: string): string {
  if (!headerStr) return '';

  // First, unfold multi-line headers (continuation lines starting with space or tab)
  let clean = headerStr.replace(/\r?\n[ \t]+/g, ' ');

  // RFC 2047: Remove whitespace between adjacent encoded-words
  clean = clean.replace(/(\=\?[^?]+\?[BQbq]\?[^?]+\?\=)\s+(?=\=\?[^?]+\?[BQbq]\?[^?]+\?\=)/gi, '$1');

  // Replace each encoded-word
  clean = clean.replace(/=\?([^?]+)\?([BQbq])\?([^?]+)\?=/gi, (_, charset, encoding, text) => {
    try {
      const enc = encoding.toUpperCase();
      const normCharset = charset.toLowerCase();

      if (enc === 'B') {
        // Base64 decoding
        const binaryStr = atob(text.replace(/\s/g, ''));
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const decoder = new TextDecoder(normCharset.includes('8859-1') || normCharset.includes('1252') ? 'iso-8859-1' : 'utf-8', { fatal: false });
        return decoder.decode(bytes);
      } else if (enc === 'Q') {
        // Quoted-Printable in header (underscores represent spaces)
        let qText = text.replace(/_/g, ' ');
        const bytes: number[] = [];
        let i = 0;
        while (i < qText.length) {
          if (qText[i] === '=' && i + 2 < qText.length && /[0-9A-F]{2}/i.test(qText.slice(i + 1, i + 3))) {
            bytes.push(parseInt(qText.slice(i + 1, i + 3), 16));
            i += 3;
          } else {
            bytes.push(qText.charCodeAt(i));
            i++;
          }
        }
        const decoder = new TextDecoder(normCharset.includes('8859-1') || normCharset.includes('1252') ? 'iso-8859-1' : 'utf-8', { fatal: false });
        return decoder.decode(new Uint8Array(bytes));
      }
    } catch {
      return text;
    }
    return text;
  });

  return clean.trim();
}

/**
 * Decodes Quoted-Printable body encoding with full support for UTF-8 and ISO-8859-1
 */
export function decodeQuotedPrintable(str: string, charset = 'utf-8'): string {
  try {
    // Remove soft line breaks (=\r\n or =\n)
    let decoded = str.replace(/=\r?\n/g, '');
    
    // Convert hex escapes to byte array
    const bytes: number[] = [];
    let i = 0;
    while (i < decoded.length) {
      if (decoded[i] === '=' && i + 2 < decoded.length && /[0-9A-F]{2}/i.test(decoded.slice(i + 1, i + 3))) {
        bytes.push(parseInt(decoded.slice(i + 1, i + 3), 16));
        i += 3;
      } else {
        const charCode = decoded.charCodeAt(i);
        if (charCode < 128) {
          bytes.push(charCode);
        } else {
          const utf8Bytes = new TextEncoder().encode(decoded[i]);
          for (let b = 0; b < utf8Bytes.length; b++) {
            bytes.push(utf8Bytes[b]);
          }
        }
        i++;
      }
    }

    const normCharset = charset.toLowerCase();
    const decoder = new TextDecoder(
      normCharset.includes('8859-1') || normCharset.includes('1252') ? 'iso-8859-1' : 'utf-8', 
      { fatal: false }
    );
    return decoder.decode(new Uint8Array(bytes));
  } catch {
    return str;
  }
}

/**
 * Decodes Base64 string to clean UTF-8 text
 */
export function decodeBase64ToText(base64Str: string, charset = 'utf-8'): string {
  try {
    const cleanB64 = base64Str.replace(/[^A-Za-z0-9+/=]/g, '');
    if (!cleanB64) return '';
    const binaryStr = atob(cleanB64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const normCharset = charset.toLowerCase();
    const decoder = new TextDecoder(
      normCharset.includes('8859-1') || normCharset.includes('1252') ? 'iso-8859-1' : 'utf-8', 
      { fatal: false }
    );
    return decoder.decode(bytes);
  } catch {
    return base64Str;
  }
}

/**
 * Strips HTML tags and styles, producing clean readable text/markdown
 */
export function stripHtmlToText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<td[^>]*>/gi, ' | ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&eacute;/gi, "é")
    .replace(/&egrave;/gi, "è")
    .replace(/&agrave;/gi, "à")
    .replace(/&ecirc;/gi, "ê")
    .replace(/&ccedil;/gi, "ç")
    .replace(/&icirc;/gi, "î")
    .replace(/&ocirc;/gi, "ô")
    .replace(/&ucirc;/gi, "û")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+\n/g, '\n\n')
    .trim();
}

/**
 * Extract MIME parts recursively
 */
interface MimePart {
  contentType: string;
  charset: string;
  transferEncoding: string;
  filename?: string;
  isAttachment: boolean;
  content: string;
}

function extractAllMimeParts(body: string, rootBoundary?: string): MimePart[] {
  const parts: MimePart[] = [];

  if (!rootBoundary) {
    return parts;
  }

  const boundaryRegex = new RegExp(`--${rootBoundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:--)?`, 'g');
  const rawParts = body.split(boundaryRegex);

  for (const rawPart of rawParts) {
    const trimmed = rawPart.trim();
    if (!trimmed || trimmed === '--') continue;

    const splitIdx = trimmed.indexOf('\n\n') !== -1 ? trimmed.indexOf('\n\n') : trimmed.indexOf('\r\n\r\n');
    if (splitIdx === -1) continue;

    const partHeaders = trimmed.slice(0, splitIdx);
    const partBody = trimmed.slice(splitIdx).trim();

    const ctMatch = partHeaders.match(/Content-Type:\s*([^;\r\n]+)/i);
    const ct = ctMatch ? ctMatch[1].trim().toLowerCase() : 'text/plain';

    const charsetMatch = partHeaders.match(/charset=["']?([^"';\r\n]+)["']?/i);
    const charset = charsetMatch ? charsetMatch[1].trim().toLowerCase() : 'utf-8';

    const cteMatch = partHeaders.match(/Content-Transfer-Encoding:\s*([^;\r\n]+)/i);
    const cte = cteMatch ? cteMatch[1].trim().toLowerCase() : '';

    const fnMatch = partHeaders.match(/(?:filename|name)=["']?([^"';\r\n]+)["']?/i);
    const filename = fnMatch ? decodeMimeHeader(fnMatch[1].trim()) : undefined;

    const isAttachment = /attachment/i.test(partHeaders) || 
      ct.includes('application/') || 
      ct.includes('image/') || 
      ct.includes('audio/') || 
      ct.includes('video/');

    // Check for nested multipart
    const subBoundaryMatch = partHeaders.match(/boundary=["']?([^"';\r\n]+)["']?/i);
    if (subBoundaryMatch && subBoundaryMatch[1]) {
      const subParts = extractAllMimeParts(partBody, subBoundaryMatch[1].trim());
      parts.push(...subParts);
    } else {
      parts.push({
        contentType: ct,
        charset,
        transferEncoding: cte,
        filename,
        isAttachment,
        content: partBody
      });
    }
  }

  return parts;
}

/**
 * Comprehensive Parser for .eml files extracting Headers (From, To, Date, Subject, CC) and Clean Body
 */
export function parseEmlContent(rawEml: string): {
  author: string;
  recipient: string;
  date: string;
  subject: string;
  cleanBody: string;
  formattedContent: string;
  attachments: string[];
} {
  if (!rawEml) {
    return {
      author: 'Expéditeur Inconnu',
      recipient: '',
      date: new Date().toISOString().split('T')[0],
      subject: 'Courriel sans contenu',
      cleanBody: '',
      formattedContent: '',
      attachments: []
    };
  }

  // Normalize line endings
  const normalized = rawEml.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split headers and body at the first double newline
  const headerBodySplit = normalized.indexOf('\n\n');
  const rawHeaders = headerBodySplit !== -1 ? normalized.slice(0, headerBodySplit) : normalized;
  const rawBody = headerBodySplit !== -1 ? normalized.slice(headerBodySplit + 2) : '';

  // Unfold headers (multi-line RFC 2822 headers)
  const unfoldedHeaders = rawHeaders.replace(/\n[ \t]+/g, ' ');

  // Extract Header fields
  let from = '';
  let to = '';
  let cc = '';
  let dateStr = '';
  let subject = '';
  let contentType = '';
  let contentTransferEncoding = '';
  let mainCharset = 'utf-8';

  unfoldedHeaders.split('\n').forEach(line => {
    const fromMatch = line.match(/^(?:From|De|Expediteur|Expéditeur|Sender):\s*(.+)$/i);
    if (fromMatch && !from) from = cleanHeaderValue(decodeMimeHeader(fromMatch[1]));

    const toMatch = line.match(/^(?:To|À|Destinataire|Recipient):\s*(.+)$/i);
    if (toMatch && !to) to = cleanHeaderValue(decodeMimeHeader(toMatch[1]));

    const ccMatch = line.match(/^(?:Cc|Copie):\s*(.+)$/i);
    if (ccMatch && !cc) cc = cleanHeaderValue(decodeMimeHeader(ccMatch[1]));

    const dateMatch = line.match(/^(?:Date|Envoyé|Sent):\s*(.+)$/i);
    if (dateMatch && !dateStr) dateStr = decodeMimeHeader(dateMatch[1]).trim();

    const subjMatch = line.match(/^(?:Subject|Objet|Sujet|Title):\s*(.+)$/i);
    if (subjMatch && !subject) subject = decodeMimeHeader(subjMatch[1]).trim();

    const ctMatch = line.match(/^Content-Type:\s*(.+)$/i);
    if (ctMatch && !contentType) {
      contentType = ctMatch[1].trim();
      const csMatch = ctMatch[1].match(/charset=["']?([^"';\s]+)["']?/i);
      if (csMatch) mainCharset = csMatch[1].toLowerCase();
    }

    const cteMatch = line.match(/^Content-Transfer-Encoding:\s*(.+)$/i);
    if (cteMatch && !contentTransferEncoding) contentTransferEncoding = cteMatch[1].trim().toLowerCase();
  });

  // Extract clean date
  const parsedDate = tryParseDate(dateStr) || new Date().toISOString().split('T')[0];

  // Parse Body (Handle Multipart, Base64, Quoted-Printable, and HTML)
  let extractedBody = '';
  const attachments: string[] = [];

  // Check for multipart boundary
  const boundaryMatch = contentType.match(/boundary=["']?([^"';\r\n]+)["']?/i) || unfoldedHeaders.match(/boundary=["']?([^"';\r\n]+)["']?/i);

  if (boundaryMatch && boundaryMatch[1]) {
    const boundary = boundaryMatch[1].trim();
    const parts = extractAllMimeParts(rawBody, boundary);

    let plainTextPart = '';
    let htmlTextPart = '';

    for (const part of parts) {
      if (part.isAttachment) {
        if (part.filename) {
          attachments.push(part.filename);
        }
        continue;
      }

      let decoded = part.content;
      if (part.transferEncoding.includes('base64')) {
        decoded = decodeBase64ToText(part.content, part.charset || mainCharset);
      } else if (part.transferEncoding.includes('quoted-printable') || part.content.includes('=3D') || part.content.includes('=20')) {
        decoded = decodeQuotedPrintable(part.content, part.charset || mainCharset);
      }

      if (part.contentType.includes('text/plain') && decoded.trim()) {
        if (!plainTextPart) plainTextPart = decoded.trim();
        else plainTextPart += '\n\n' + decoded.trim();
      } else if (part.contentType.includes('text/html') && decoded.trim()) {
        const stripped = stripHtmlToText(decoded);
        if (stripped) {
          if (!htmlTextPart) htmlTextPart = stripped;
          else htmlTextPart += '\n\n' + stripped;
        }
      }
    }

    extractedBody = plainTextPart || htmlTextPart || '';
  }

  // If no multipart found or extraction was empty, decode single part
  if (!extractedBody) {
    let singleBody = rawBody;

    if (contentTransferEncoding.includes('base64')) {
      singleBody = decodeBase64ToText(rawBody, mainCharset);
    } else if (contentTransferEncoding.includes('quoted-printable') || rawBody.includes('=3D') || rawBody.includes('=20')) {
      singleBody = decodeQuotedPrintable(rawBody, mainCharset);
    }

    if (contentType.includes('text/html') || /<html|<body|<div|<p>/i.test(singleBody)) {
      singleBody = stripHtmlToText(singleBody);
    }

    extractedBody = singleBody.trim();
  }

  // Remove any remaining raw Base64 blocks that might have leaked from inline images or attachments
  extractedBody = extractedBody.replace(/[A-Za-z0-9+/=]{120,}/g, '[Contenu binaire ou pièce jointe omis]').trim();

  // Construct structured text representation for AI indexing and display
  const headerLines: string[] = [];
  if (from) headerLines.push(`De : ${from}`);
  if (to) headerLines.push(`À : ${to}`);
  if (cc) headerLines.push(`Cc : ${cc}`);
  if (dateStr) headerLines.push(`Date : ${dateStr} (${parsedDate})`);
  if (subject) headerLines.push(`Objet : ${subject}`);
  if (attachments.length > 0) headerLines.push(`Pièces jointes : ${attachments.join(', ')}`);

  const formattedContent = headerLines.length > 0
    ? `--- COURRIEL DU PROJET ---\n${headerLines.join('\n')}\n--------------------------\n\n${extractedBody}`
    : extractedBody;

  return {
    author: from || 'Équipe Projet',
    recipient: to || '',
    date: parsedDate,
    subject: subject || 'Courriel sans objet',
    cleanBody: extractedBody,
    formattedContent,
    attachments
  };
}

/**
 * Reads a File object as Data URL (Base64)
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Impossible de lire le fichier ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts and formats worksheets from an Excel workbook (.xlsx, .xls, .xlsm, .csv)
 */
export function parseExcelArrayBuffer(arrayBuffer: ArrayBuffer, fileName: string, index = 1): ProjectDocument {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetNames = workbook.SheetNames || [];
    const sections: string[] = [];
    let totalRows = 0;
    let hasFinancialKeywords = false;
    let hasTicketKeywords = false;
    let hasMilestoneKeywords = false;

    for (const sheetName of sheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      if (rows.length === 0) continue;

      totalRows += rows.length;
      const headerRow = rows[0] || [];
      const headerStr = headerRow.map((c: any) => String(c).trim()).join(' | ');

      if (/budget|facture|cout|finance|devis|montant|prix|taux|total|depense|invoice|amount|cost|\$|€|cad/i.test(headerStr)) {
        hasFinancialKeywords = true;
      }
      if (/jira|ticket|bug|incident|severit|priorit|status|issue/i.test(headerStr)) {
        hasTicketKeywords = true;
      }
      if (/jalon|milestone|gantt|planning|echeance|deadline|date|livrable/i.test(headerStr)) {
        hasMilestoneKeywords = true;
      }

      // Format clean Markdown table (first 80 rows for clean display)
      const displayRows = rows.slice(0, 80);
      const tableMdLines: string[] = [];

      const formattedHeaders = headerRow.map((h: any) => String(h || '-').replace(/\|/g, '/'));
      tableMdLines.push(`| ${formattedHeaders.join(' | ')} |`);
      tableMdLines.push(`| ${formattedHeaders.map(() => '---').join(' | ')} |`);

      for (let r = 1; r < displayRows.length; r++) {
        const row = displayRows[r];
        if (!row || row.every((cell: any) => cell === '' || cell === null || cell === undefined)) continue;
        const formattedCells = headerRow.map((_: any, colIdx: number) => {
          const val = row[colIdx];
          if (val === null || val === undefined || val === '') return '-';
          return String(val).replace(/\|/g, '/').replace(/\r?\n/g, ' ');
        });
        tableMdLines.push(`| ${formattedCells.join(' | ')} |`);
      }

      if (rows.length > 80) {
        tableMdLines.push(`\n*(... et ${rows.length - 80} lignes supplémentaires archivées dans le classeur)*`);
      }

      sections.push(`### 📊 Feuille : "${sheetName}" (${rows.length} lignes, ${headerRow.length} colonnes)\n\n${tableMdLines.join('\n')}`);
    }

    const lowerName = fileName.toLowerCase();
    let category: ProjectDocument['category'] = 'project_doc';
    let categoryLabel = 'Document Projet (Tableur)';

    if (hasFinancialKeywords || lowerName.includes('budget') || lowerName.includes('finance') || lowerName.includes('facture') || lowerName.includes('devis') || lowerName.includes('cout') || lowerName.includes('invoice') || lowerName.includes('depense')) {
      category = 'contract_finance';
      categoryLabel = 'Contrats & Finances (Excel)';
    } else if (hasTicketKeywords || lowerName.includes('ticket') || lowerName.includes('bug') || lowerName.includes('incident') || lowerName.includes('jira')) {
      category = 'ticket';
      categoryLabel = 'Tickets & Incidents (Tableur)';
    } else if (hasMilestoneKeywords || lowerName.includes('planning') || lowerName.includes('jalon') || lowerName.includes('gantt') || lowerName.includes('suivi')) {
      category = 'project_doc';
      categoryLabel = 'Planning & Jalons (Excel)';
    }

    const summary = `Tableur Excel numérisé (${sheetNames.length} feuille(s) : ${sheetNames.join(', ')} - ${totalRows} lignes extraites). Structure matricielle intégrée.`;
    const content = `# TABLEUR EXCEL : ${fileName}
- Nombre de feuilles : ${sheetNames.length} (${sheetNames.join(', ')})
- Lignes totales analysées : ${totalRows}
- Format : Classeur Microsoft Excel (.${fileName.split('.').pop() || 'xlsx'})
- Date de numérisation : ${new Date().toISOString().split('T')[0]}

---

${sections.join('\n\n---\n\n')}`;

    const ext = fileName.split('.').pop()?.toUpperCase() || 'XLSX';

    return {
      id: `doc-${index}-${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: fileName,
      category,
      categoryLabel,
      date: new Date().toISOString().split('T')[0],
      author: 'Contrôleur de Gestion / Tableur',
      summary,
      content,
      tags: [categoryLabel, ext, `${sheetNames.length} feuilles`],
      fileType: ext,
      relevanceStatus: 'valid'
    };
  } catch (err: any) {
    console.error(`Error parsing Excel in browser for ${fileName}:`, err);
    return processFileIntoDocument({ name: fileName }, `[Erreur de lecture du tableur Excel ${fileName} : ${err.message}]`, index);
  }
}

/**
 * Sends a file to the backend scanner for OCR, PDF extraction, or AI enrichment
 */
async function scanFileWithServer(file: File, base64Data: string, index = 1): Promise<ProjectDocument | null> {
  try {
    const res = await fetch('/api/scan-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: {
          name: file.name,
          base64: base64Data,
          mimeType: file.type || undefined,
          lastModified: file.lastModified
        }
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.document) {
        return data.document as ProjectDocument;
      }
    }
  } catch (e) {
    console.warn(`Server scanning not reachable for ${file.name}, using local processing:`, e);
  }
  return null;
}

/**
 * Parses files read from an uploaded folder or file input.
 * Supports PDF, Excel (.xlsx, .xls), Images (.png, .jpg), Emails (.eml), and Text.
 */
export async function parseUploadedFiles(
  fileList: File[] | FileList,
  onProgress?: (message: string, current: number, total: number) => void
): Promise<ProjectDocument[]> {
  const files = Array.from(fileList);
  const parsedDocs: ProjectDocument[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Ignore hidden files and system trash
    if (file.name.startsWith('.') || file.name === 'Thumbs.db' || file.name === 'desktop.ini') {
      continue;
    }

    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    try {
      // 1. Excel Spreadsheets (.xlsx, .xls, .xlsm, .csv)
      if (ext === 'xlsx' || ext === 'xls' || ext === 'xlsm') {
        onProgress?.(`Extraction des feuilles Excel : ${fileName}...`, i + 1, files.length);
        const arrayBuf = await file.arrayBuffer();
        const localDoc = parseExcelArrayBuffer(arrayBuf, fileName, i + 1);

        // Optionally send to server for deeper multimodal analysis
        try {
          const dataUrl = await readFileAsDataURL(file);
          const serverDoc = await scanFileWithServer(file, dataUrl, i + 1);
          if (serverDoc && serverDoc.content) {
            parsedDocs.push(serverDoc);
            continue;
          }
        } catch {}

        parsedDocs.push(localDoc);
        continue;
      }

      // 2. PDF Documents (.pdf)
      if (ext === 'pdf') {
        onProgress?.(`Numérisation du document PDF : ${fileName}...`, i + 1, files.length);
        const dataUrl = await readFileAsDataURL(file);
        const serverDoc = await scanFileWithServer(file, dataUrl, i + 1);

        if (serverDoc) {
          parsedDocs.push(serverDoc);
          continue;
        }

        // Fallback if server is not available
        parsedDocs.push({
          id: `doc-${i + 1}-${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: fileName,
          category: 'project_doc',
          categoryLabel: 'Document Projet (PDF)',
          date: new Date(file.lastModified || Date.now()).toISOString().split('T')[0],
          author: 'Équipe Projet',
          summary: `Document PDF indexé : ${fileName} (${(file.size / 1024).toFixed(1)} Ko).`,
          content: `# DOCUMENT PDF : ${fileName}\n- Taille : ${(file.size / 1024).toFixed(1)} Ko\n- Date : ${new Date(file.lastModified || Date.now()).toISOString().split('T')[0]}\n\n*(Document PDF indexé dans la base documentaire du projet).*`,
          tags: ['PDF', 'Document'],
          fileType: 'PDF',
          relevanceStatus: 'valid',
          fileSize: file.size
        });
        continue;
      }

      // 3. Images & Screenshots (.png, .jpg, .jpeg, .webp)
      if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) {
        onProgress?.(`Analyse visuelle et OCR : ${fileName}...`, i + 1, files.length);
        const dataUrl = await readFileAsDataURL(file);
        const serverDoc = await scanFileWithServer(file, dataUrl, i + 1);

        if (serverDoc) {
          parsedDocs.push(serverDoc);
          continue;
        }

        // Local fallback with previewUrl
        const imageType = ext.toUpperCase();
        parsedDocs.push({
          id: `doc-${i + 1}-${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: fileName,
          category: 'architecture',
          categoryLabel: 'Schéma & Image Projet',
          date: new Date(file.lastModified || Date.now()).toISOString().split('T')[0],
          author: 'Équipe Projet',
          summary: `Image / Schéma de projet indexé : ${fileName}. Aperçu visuel sauvegardé dans la mémoire opérationnelle.`,
          content: `# VISUEL PROJET : ${fileName}\n- Format : Image ${imageType} (${(file.size / 1024).toFixed(1)} Ko)\n- Statut : Enregistré dans la base documentaire.\n- Aperçu : Accessible dans le visualiseur de documents.`,
          tags: ['Image', imageType, 'Schéma'],
          fileType: imageType,
          relevanceStatus: 'valid',
          previewUrl: dataUrl,
          fileSize: file.size
        });
        continue;
      }

      // 4. Text / EML / Markdown / CSV / JSON files
      onProgress?.(`Lecture du document : ${fileName}...`, i + 1, files.length);
      const textContent = await readFileContent(file);
      const doc = processFileIntoDocument(file, textContent, i + 1);
      parsedDocs.push(doc);

    } catch (err) {
      console.warn(`Could not read file ${fileName}:`, err);
    }
  }

  // Sort documents chronologically by date
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
        resolve(content);
      } else if (content instanceof ArrayBuffer) {
        const uint8Array = new Uint8Array(content);
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const decoded = decoder.decode(uint8Array);
        const cleaned = decoded.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ').slice(0, 200000);
        resolve(cleaned);
      } else {
        resolve(`[Fichier ${file.name} - ${file.size} octets]`);
      }
    };

    reader.onerror = () => {
      resolve(`[Contenu du document ${file.name}]`);
    };

    reader.readAsText(file);
  });
}

/**
 * Transforms a raw file and text into a structured ProjectDocument
 */
export function processFileIntoDocument(file: { name: string; lastModified?: number }, rawContent: string, index = 1): ProjectDocument {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase() || 'txt';
  const lowerName = fileName.toLowerCase();

  let author = 'Équipe Projet';
  let date = new Date(file.lastModified || Date.now()).toISOString().split('T')[0];
  let category: ProjectDocument['category'] = 'project_doc';
  let categoryLabel = 'Document Projet';
  let summary = '';
  let content = rawContent;

  // 1. EML Email Parsing with Full Header & MIME Decoder
  if (
    ext === 'eml' || 
    ext === 'msg' || 
    lowerName.includes('mail') || 
    lowerName.includes('courriel') ||
    lowerName.startsWith('e0') || 
    lowerName.startsWith('e1') || 
    lowerName.startsWith('e2') ||
    rawContent.slice(0, 300).includes('From:') ||
    rawContent.slice(0, 300).includes('De:') ||
    rawContent.slice(0, 300).includes('Subject:') ||
    rawContent.slice(0, 300).includes('Objet:')
  ) {
    category = 'email';
    categoryLabel = 'Courriel';

    const parsedEml = parseEmlContent(rawContent);
    if (parsedEml.author && parsedEml.author !== 'Équipe Projet') author = parsedEml.author;
    if (parsedEml.date) date = parsedEml.date;
    summary = `Courriel : ${parsedEml.subject} (De : ${author}${parsedEml.recipient ? ` à ${parsedEml.recipient}` : ''})`;
    content = parsedEml.formattedContent;
  } 
  // 2. Meeting Notes / Transcripts
  else if (lowerName.includes('cr_') || lowerName.includes('cr-') || lowerName.includes('reunion') || lowerName.includes('meeting') || lowerName.includes('copil') || lowerName.includes('pv_') || lowerName.includes('comite') || lowerName.includes('transcript')) {
    category = 'meeting';
    categoryLabel = 'Compte-rendu Réunion';
    summary = `Compte-rendu : ${fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')}`;
  }
  // 3. Tickets / Bugs / JIRA
  else if (lowerName.includes('jira') || lowerName.includes('bug') || lowerName.includes('ticket') || lowerName.includes('perf-') || lowerName.includes('acc-') || lowerName.includes('sec-') || lowerName.includes('int-') || lowerName.includes('incident')) {
    category = 'ticket';
    categoryLabel = 'Ticket & Incident';
    summary = `Ticket d'incident : ${fileName}`;
  }
  // 4. Architecture / ADR / Specs
  else if (lowerName.includes('adr') || lowerName.includes('arch') || lowerName.includes('spec') || lowerName.includes('tech')) {
    category = 'architecture';
    categoryLabel = 'Architecture (ADR)';
    summary = `Décision d'architecture : ${fileName}`;
  }
  // 5. Contracts & Finance
  else if (lowerName.includes('facture') || lowerName.includes('contrat') || lowerName.includes('budget') || lowerName.includes('devis') || lowerName.includes('finance') || lowerName.includes('inv-') || lowerName.includes('cr-')) {
    category = 'contract_finance';
    categoryLabel = 'Contrat & Finances';
    summary = `Pièce comptable / contractuelle : ${fileName}`;
  }
  // 6. Teams / Chat
  else if (lowerName.includes('teams') || lowerName.includes('chat') || lowerName.includes('slack')) {
    category = 'teams';
    categoryLabel = 'Discussion Teams';
    summary = `Échanges de messagerie : ${fileName}`;
  }

  // Extract author if not email but mentioned in first lines
  if (author === 'Équipe Projet') {
    const authorLineMatch = rawContent.slice(0, 800).match(/(?:Auteur|Author|Rédacteur|Par|De|From)\s*[:=]\s*([^\r\n]+)/i);
    if (authorLineMatch) {
      author = cleanHeaderValue(decodeMimeHeader(authorLineMatch[1]));
    }
  }

  // Extract explicit date inside document text if present
  const dateInTextMatch = rawContent.slice(0, 1000).match(/(?:Date|Le)\s*[:=]\s*([0-3]?[0-9][\s/-][0-1]?[0-9][\s/-]202[4-9]|\d{4}-\d{2}-\d{2}|\d{1,2}\s+[a-zéûA-ZÉÛ]+\s+202[4-9])/i);
  if (dateInTextMatch) {
    const extractedDate = tryParseDate(dateInTextMatch[1]);
    if (extractedDate) date = extractedDate;
  }

  if (!summary) {
    const firstLine = content
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 10 && !l.startsWith('From:') && !l.startsWith('De:') && !l.startsWith('Date:') && !l.startsWith('Subject:') && !l.startsWith('Objet:'))[0];
    
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

export function cleanHeaderValue(val: string): string {
  if (!val) return '';
  return val
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .replace(/<[^>]+>/g, '') // remove email address brackets <user@domain.com>
    .trim();
}

export function tryParseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime()) && d.getFullYear() > 2000 && d.getFullYear() < 2050) {
      return d.toISOString().split('T')[0];
    }
  } catch {}

  // Parse french dates like "15 septembre 2026" or "02 juillet 2026 09:15"
  const frenchMonths: Record<string, string> = {
    'janvier': '01', 'fevrier': '02', 'février': '02', 'mars': '03', 'avril': '04',
    'mai': '05', 'juin': '06', 'juillet': '07', 'aout': '08', 'août': '08',
    'septembre': '09', 'octobre': '10', 'novembre': '11', 'decembre': '12', 'décembre': '12',
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
    'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  };

  const match = dateStr.match(/(\d{1,2})\s+([a-zéûA-ZÉÛ]+)\s+(\d{4})/i);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = frenchMonths[match[2].toLowerCase()];
    const year = match[3];
    if (month) return `${year}-${month}-${day}`;
  }

  // Parse slash/dash formats "14/07/2026" or "2026-07-14"
  const isoMatch = dateStr.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
  }

  const euroMatch = dateStr.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (euroMatch) {
    return `${euroMatch[3]}-${euroMatch[2].padStart(2, '0')}-${euroMatch[1].padStart(2, '0')}`;
  }

  return null;
}
