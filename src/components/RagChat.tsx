import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  FileText, 
  ExternalLink, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  Bot, 
  User, 
  Quote,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { ChatMessage, ProjectDocument } from '../types/project';

interface RagChatProps {
  documents: ProjectDocument[];
  onSelectDocument: (doc: ProjectDocument) => void;
  initialQuery?: string;
}

export const RagChat: React.FC<RagChatProps> = ({
  documents,
  onSelectDocument,
  initialQuery
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Mémoire opérationnelle indexée sur 35+ documents (courriels, comptes-rendus, contrats, JIRA). Posez vos questions sur les dates, décisions, risques ou contradictions.`,
      timestamp: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
      citations: [
        {
          docName: 'Plan_Projet_NOVA_v3_12sept.xlsx',
          quote: 'Mise en Production Officielle (Go-Live) : 28 Novembre 2026',
          relevance: 'Jalon officiel consolidé'
        }
      ],
      suggestedFollowUps: [
        "Quelle est la date de livraison actuellement prévue et pourquoi ?",
        "Quelles décisions ont été prises concernant le fournisseur ?",
        "Existe-t-il des informations contradictoires ?"
      ]
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleChallengeQuestions = [
    "Quelle est la date de livraison actuellement prévue et pourquoi ?",
    "Quelles décisions ont été prises concernant le fournisseur ?",
    "Quels engagements ne sont toujours pas complétés ?",
    "Existe-t-il des informations contradictoires ?",
    "Quels sont les trois principaux risques du projet aujourd'hui ?",
    "Pourquoi la décision de repousser la synchro mobile a-t-elle été prise ?",
    "Si je devais reprendre le projet demain matin, que devrais-je savoir ?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialQuery) {
      handleSendQuestion(initialQuery);
    }
  }, [initialQuery]);

  const handleSendQuestion = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: queryText.trim(),
      timestamp: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText.trim(),
          history: messages.slice(-4)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réponse IA');
      }

      const assistantMsg: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || [],
        suggestedFollowUps: data.suggestedFollowUps || []
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'assistant-err-' + Date.now(),
        role: 'assistant',
        content: `Désolé, une erreur est survenue lors de la consultation de la mémoire : ${err.message}. Veuillez réessayer.`,
        timestamp: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const findDocumentByName = (docName: string) => {
    return documents.find(d => 
      d.name.toLowerCase().includes(docName.toLowerCase()) || 
      docName.toLowerCase().includes(d.name.toLowerCase())
    );
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Sleek Minimalist Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Assistant RAG
            </h2>
            <p className="text-xs text-slate-500">Interrogation naturelle avec preuves et citations</p>
          </div>
        </div>

        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Effacer</span>
        </button>
      </div>

      {/* Suggested Questions Grid */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Questions d'arbitrage suggérées :
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleChallengeQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuestion(q)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 shadow-xs transition-all text-left"
            >
              « {q} »
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[580px] overflow-hidden">
        
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm ${
                    isUser ? 'bg-slate-800' : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-3 min-w-0">
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/10 font-medium'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans space-y-2">
                      {msg.content}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 dark:border-white/10 text-[10px] opacity-70">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:opacity-100 flex items-center gap-1"
                        title="Copier la réponse"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Citations & Evidence (Only for Assistant) */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <Quote className="w-3 h-3 text-blue-500" />
                        <span>Sources &amp; Preuves Justificatives ({msg.citations.length}) :</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.citations.map((cite, cIdx) => {
                          const matchingDoc = findDocumentByName(cite.docName);

                          return (
                            <div
                              key={cIdx}
                              className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-blue-900 dark:text-blue-300 truncate max-w-[200px]">
                                  📄 {cite.docName}
                                </span>
                                {matchingDoc && (
                                  <button
                                    onClick={() => onSelectDocument(matchingDoc)}
                                    className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                                  >
                                    <span>Consulter</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-700 dark:text-slate-300 italic font-mono bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                "{cite.quote}"
                              </p>

                              <p className="text-[10px] text-blue-800 dark:text-blue-400">
                                <strong>Pertinence :</strong> {cite.relevance}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Chips */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedFollowUps.map((fu, fuIdx) => (
                        <button
                          key={fuIdx}
                          onClick={() => handleSendQuestion(fu)}
                          disabled={isLoading}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/50 text-slate-600 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          ↳ {fu}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold text-xs animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 rounded-tl-none border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Recherche et croisement des documents en cours...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez n'importe quelle question sur le projet NOVA..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all shrink-0"
            >
              <span>Envoyer</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
