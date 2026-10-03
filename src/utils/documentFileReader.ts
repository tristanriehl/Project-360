import * as XLSX from 'xlsx';

/**
 * Extracts plain text and tables from Excel files (.xlsx, .xls, .csv, .tsv)
 */
export async function readExcelFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetTexts: string[] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      // Convert sheet to clean CSV / matrix representation
      const csvContent = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
      if (csvContent && csvContent.trim()) {
        const formattedRows = csvContent
          .split('\n')
          .map(r => r.trim())
          .filter(Boolean)
          .join('\n');

        sheetTexts.push(`--- CLASSIEUR EXCEL / FEUILLE : [${sheetName}] ---\n${formattedRows}`);
      }
    }

    if (sheetTexts.length > 0) {
      return sheetTexts.join('\n\n');
    }
    return `[Fichier Excel ${file.name} - Aucun contenu textuel extrait]`;
  } catch (err: any) {
    console.warn(`Excel reading error for ${file.name}:`, err);
    return `[Erreur lors du décodage du fichier Excel ${file.name}: ${err?.message || 'Format non pris en charge'}]`;
  }
}

/**
 * Extracts text from PDF files (.pdf) page by page with worker and raw stream fallbacks
 */
export async function readPdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Dynamic import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configure worker
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    }

    try {
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array, useSystemFonts: true });
      const pdf = await loadingTask.promise;
      const pageTexts: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageItems = textContent.items.map((item: any) => item.str || '').filter(Boolean);
        const pageString = pageItems.join(' ');

        if (pageString.trim()) {
          pageTexts.push(`--- PAGE PDF ${pageNum}/${pdf.numPages} ---\n${pageString.trim()}`);
        }
      }

      if (pageTexts.length > 0) {
        return pageTexts.join('\n\n');
      }
    } catch (workerErr) {
      console.warn(`PDFjs worker notice for ${file.name}, using stream extractor fallback:`, workerErr);
    }

    // Direct stream fallback for PDF text extraction without worker
    return extractPdfRawTextFallback(uint8Array, file.name);
  } catch (err: any) {
    console.warn(`PDF reading error for ${file.name}:`, err);
    return `[Document PDF ${file.name} - ${file.size} octets]`;
  }
}

/**
 * Fallback stream parser to extract readable text blocks from raw PDF byte streams
 */
function extractPdfRawTextFallback(bytes: Uint8Array, fileName: string): string {
  try {
    const decoder = new TextDecoder('latin1', { fatal: false });
    const rawStr = decoder.decode(bytes);

    // Search for parenthesis enclosed text strings inside BT / ET PDF operators
    const textMatches = rawStr.match(/\(([^()]+)\)\s*T[jJ]/g) || rawStr.match(/\(([^()]{3,})\)/g) || [];
    const extractedLines: string[] = [];

    for (const match of textMatches) {
      const cleaned = match
        .replace(/^\(/, '')
        .replace(/\)\s*T[jJ]$/, '')
        .replace(/\)$/, '')
        .replace(/\\([()\\])/g, '$1')
        .trim();

      if (cleaned.length > 2 && !/^\d{1,4}$/.test(cleaned) && !/^\/[A-Z0-9]+$/i.test(cleaned)) {
        if (!extractedLines.includes(cleaned)) {
          extractedLines.push(cleaned);
        }
      }
    }

    if (extractedLines.length > 0) {
      return `--- TEXTE EXTRAIT DU PDF [${fileName}] ---\n${extractedLines.join('\n')}`;
    }
  } catch {}

  return `[Fichier PDF ${fileName} (${bytes.length} octets) - Indexé dans le Cerveau du Projet]`;
}
