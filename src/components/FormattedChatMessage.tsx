import React from 'react';
import { FileText, ExternalLink, CheckCircle2, AlertCircle, Sparkles, Copy, Check } from 'lucide-react';
import { ProjectDocument } from '../types/project';

interface FormattedChatMessageProps {
  content: string;
  documents?: ProjectDocument[];
  onSelectDocument?: (doc: ProjectDocument) => void;
  isUser?: boolean;
}

export const FormattedChatMessage: React.FC<FormattedChatMessageProps> = ({
  content,
  documents = [],
  onSelectDocument,
  isUser = false
}) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap font-medium">{content}</div>;
  }

  // Parse lines into rich blocks
  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';
  let inList = false;
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' = 'ul';

  const flushList = () => {
    if (inList && listItems.length > 0) {
      const currentListType = listType;
      const currentItems = [...listItems];
      elements.push(
        <div key={`list-${elements.length}`} className="my-2.5 space-y-1.5 pl-1">
          {currentItems.map((itemText, i) => (
            <div key={i} className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="shrink-0 mt-1">
                {currentListType === 'ol' ? (
                  <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center font-mono">
                    {i + 1}
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                )}
              </span>
              <div className="flex-1 text-slate-800 dark:text-slate-100">
                {renderInlineFormatting(itemText, documents, onSelectDocument)}
              </div>
            </div>
          ))}
        </div>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushCodeBlock = () => {
    if (inCodeBlock) {
      const codeText = codeBlockContent.join('\n');
      elements.push(
        <CodeBlockViewer
          key={`code-${elements.length}`}
          code={codeText}
          lang={codeBlockLang}
        />
      );
      codeBlockContent = [];
      inCodeBlock = false;
      codeBlockLang = '';
    }
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmed = line.trim();

    // Check code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        inCodeBlock = true;
        codeBlockLang = trimmed.replace('```', '').trim();
        codeBlockContent = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Check empty lines
    if (!trimmed) {
      flushList();
      elements.push(<div key={`spacer-${idx}`} className="h-2" />);
      continue;
    }

    // Check Headings (###, ##, #)
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${idx}`} className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mt-3.5 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-full" />
          {renderInlineFormatting(trimmed.replace('### ', ''), documents, onSelectDocument)}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h2-${idx}`} className="text-sm font-black text-slate-900 dark:text-white mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-700/80">
          {renderInlineFormatting(trimmed.replace('## ', ''), documents, onSelectDocument)}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h1-${idx}`} className="text-base font-black text-slate-900 dark:text-white mt-4 mb-2">
          {renderInlineFormatting(trimmed.replace('# ', ''), documents, onSelectDocument)}
        </h2>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <div key={`quote-${idx}`} className="my-2 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-500 text-slate-700 dark:text-slate-200 text-xs italic font-serif leading-relaxed">
          {renderInlineFormatting(trimmed.replace(/^>\s*/, ''), documents, onSelectDocument)}
        </div>
      );
      continue;
    }

    // Bullet List (- or * or •)
    if (/^[-*•]\s+/.test(trimmed)) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
      continue;
    }

    // Numbered List (1. or 2.)
    if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
      }
      listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
      continue;
    }

    // Standard paragraph
    flushList();
    elements.push(
      <p key={`p-${idx}`} className="text-xs leading-relaxed text-slate-800 dark:text-slate-100 my-1">
        {renderInlineFormatting(line, documents, onSelectDocument)}
      </p>
    );
  }

  flushList();
  flushCodeBlock();

  return <div className="space-y-1 text-xs">{elements}</div>;
};

/**
 * Custom inline parser for bold, italics, inline code, status tags, and clickable document references
 */
function renderInlineFormatting(
  text: string,
  documents: ProjectDocument[] = [],
  onSelectDocument?: (doc: ProjectDocument) => void
): React.ReactNode {
  if (!text) return null;

  // Split on inline markdown patterns: **bold**, `code`, [docName]
  const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]|\b(?:VALIDE|PÉRIMÉ|ACTÉ|HIGH|CRITIQUE|URGENT|FAIBLE|APPROUVÉ|CONTESTATÉ)\b)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold text **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-white">
          {renderInlineFormatting(boldText, documents, onSelectDocument)}
        </strong>
      );
    }

    // Inline code `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const code = part.slice(1, -1);
      return (
        <code key={index} className="px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700/80 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-semibold">
          {code}
        </code>
      );
    }

    // Bracketed reference [docName] or [DOC: name]
    if (part.startsWith('[') && part.endsWith(']') && part.length >= 3) {
      const refText = part.slice(1, -1).replace(/^DOC:\s*/i, '').trim();
      const matchedDoc = documents.find(d => 
        d.name.toLowerCase().includes(refText.toLowerCase()) || 
        refText.toLowerCase().includes(d.name.toLowerCase()) ||
        d.id.toLowerCase() === refText.toLowerCase()
      );

      if (matchedDoc && onSelectDocument) {
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelectDocument(matchedDoc)}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold text-[11px] border border-blue-300 dark:border-blue-800 transition-colors mx-0.5 cursor-pointer align-baseline"
            title={`Ouvrir la pièce : ${matchedDoc.name}`}
          >
            <FileText className="w-3 h-3 shrink-0" />
            <span className="underline">{refText}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
          </button>
        );
      }

      return (
        <span key={index} className="inline-block px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-200 font-semibold text-[11px] mx-0.5">
          {refText}
        </span>
      );
    }

    // Highlighted Status Badges
    if (/^(?:VALIDE|APPROUVÉ|ACTÉ)$/i.test(part)) {
      return (
        <span key={index} className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-2.5 h-2.5" /> {part}
        </span>
      );
    }

    if (/^(?:PÉRIMÉ|CONTESTÉ|CRITIQUE|HIGH|URGENT)$/i.test(part)) {
      return (
        <span key={index} className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          <AlertCircle className="w-2.5 h-2.5" /> {part}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function CodeBlockViewer({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl bg-slate-950 text-slate-100 overflow-hidden border border-slate-800 shadow-md">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400">
        <span className="font-mono font-semibold uppercase">{lang || 'Code / Données'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copié' : 'Copier'}</span>
        </button>
      </div>
      <pre className="p-3 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap select-text">
        {code}
      </pre>
    </div>
  );
}
