import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  ChevronDown,
  FileText,
  ExternalLink,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Maximize2,
  X,
  Download,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  FileCheck2,
  Layers,
  Plus,
  Upload,
  Clock,
  Database
} from 'lucide-react';
import type { ChatMessage, CitationSource, DocumentItem, ImageAttachment } from '../types/rag';
import { API_BASE_URL } from '../api';

interface CenterChatPanelProps {
  messages: ChatMessage[];
  selectedDocuments: DocumentItem[];
  onSendMessage: (query: string) => void;
  isSearching: boolean;
  searchProgressStep: number;
  onOpenSourcePreview: (source: CitationSource) => void;
  onOpenUpload: () => void;
  isGuest?: boolean;
  onOpenAuth?: () => void;
  activeThreadTitle?: string;
  onNewChat?: () => void;
  onToggleMobileHistory?: () => void;
  onToggleMobileSources?: () => void;
  savedThreadsCount?: number;
  totalDocumentsCount?: number;
}

const formatTimestamp = (ts?: string) => {
  if (!ts || ts === 'Invalid Date') return '';
  if (ts.includes(':') && !ts.includes('T') && !ts.includes('-') && !ts.includes('/')) {
    return ts;
  }
  try {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export const CenterChatPanel: React.FC<CenterChatPanelProps> = ({
  messages,
  selectedDocuments,
  onSendMessage,
  isSearching,
  searchProgressStep,
  onOpenSourcePreview,
  onOpenUpload,
  isGuest = false,
  onOpenAuth,
  activeThreadTitle,
  onNewChat,
  onToggleMobileHistory,
  onToggleMobileSources,
  savedThreadsCount = 0,
  totalDocumentsCount = 0,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [inputError, setInputError] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<ImageAttachment | null>(null);
  const [copiedThread, setCopiedThread] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSearching, searchProgressStep]);

  // Auto-resize textarea as user types multi-line prompts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 40), 160)}px`;
    }
  }, [inputQuery]);

  const handleSend = () => {
    if (!inputQuery.trim()) {
      setInputError(true);
      return;
    }
    setInputError(false);
    onSendMessage(inputQuery.trim());
    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExportMarkdown = () => {
    if (messages.length === 0) return;
    const transcript = messages
      .map((m) => `### ${m.sender === 'user' ? 'User' : 'Wise Wolves Assistant'}\n\n${m.text}\n`)
      .join('\n---\n\n');

    navigator.clipboard.writeText(transcript);
    setCopiedThread(true);
    setTimeout(() => setCopiedThread(false), 2000);
    setIsExportOpen(false);
  };

  const handleDownloadTranscript = () => {
    if (messages.length === 0) return;
    const transcript = messages
      .map((m) => `[${formatTimestamp(m.timestamp)}] ${m.sender.toUpperCase()}:\n${m.text}\n`)
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-[#FEFAF6] dark:bg-[#0B192C] relative min-w-0 transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. WORKSPACE SUBHEADER BAR                                                */}
      {/* ========================================================================= */}
      <div className="h-13 bg-[#F5EBE1] dark:bg-[#102C57] border-b border-[#D4B896] dark:border-[#1E3E62] px-3 sm:px-6 flex items-center justify-between flex-shrink-0 z-10 transition-colors shadow-2xs gap-2">
        {/* Left Side: Mobile History Toggle Button + Active Thread Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {onToggleMobileHistory && (
            <button
              type="button"
              onClick={onToggleMobileHistory}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#D4B896] dark:border-[#24487A] text-xs font-bold text-[#0C1E3D] dark:text-[#FEFAF6] shadow-2xs hover:bg-[#EADBC8]/40 transition-colors cursor-pointer flex-shrink-0"
              title="Open Chat History"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>History</span>
              {typeof savedThreadsCount === 'number' && savedThreadsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0C1E3D] text-[#FEFAF6] dark:bg-[#EADBC8] dark:text-[#0C1E3D] text-[10px] flex items-center justify-center font-black">
                  {savedThreadsCount}
                </span>
              )}
            </button>
          )}

          <h3 className="font-display font-black text-[#0C1E3D] dark:text-[#FEFAF6] text-xs sm:text-sm truncate max-w-[130px] xs:max-w-xs sm:max-w-md">
            {activeThreadTitle || 'Enterprise Workspace'}
          </h3>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#FEFAF6] dark:bg-[#0B192C] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A] flex-shrink-0 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden md:inline font-mono">pgvector · Hybrid Retrieval</span>
            <span className="md:hidden font-mono">pgvector</span>
          </span>
        </div>

        {/* Subheader Controls: Mobile Sources Button + New Chat + Scope Pill + Export */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 relative">
          {onToggleMobileSources && (
            <button
              type="button"
              onClick={onToggleMobileSources}
              className="xl:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#D4B896] dark:border-[#24487A] text-xs font-bold text-[#0C1E3D] dark:text-[#FEFAF6] shadow-2xs hover:bg-[#EADBC8]/40 transition-colors cursor-pointer flex-shrink-0"
              title="Open Sources & Knowledge"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sources</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#0C1E3D] text-[#FEFAF6] dark:bg-[#EADBC8] dark:text-[#0C1E3D] text-[10px] font-black">
                {selectedDocuments.length}{totalDocumentsCount > 0 ? `/${totalDocumentsCount}` : ''}
              </span>
            </button>
          )}

          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="text-xs font-bold text-[#0C1E3D] dark:text-[#FEFAF6] bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#D4B896] dark:border-[#24487A] px-2.5 py-1.5 rounded-xl hover:bg-[#EADBC8]/50 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
              title="Start a new chat thread"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          <span className="text-xs text-[#1B2D4B] dark:text-[#B8C9E0] font-bold hidden xl:inline-flex items-center gap-1 bg-[#FEFAF6] dark:bg-[#0B192C] px-2.5 py-1 rounded-lg border border-[#D4B896] dark:border-[#24487A]">
            <Layers className="w-3.5 h-3.5 text-[#0C1E3D] dark:text-[#FEFAF6]" />
            <span>{selectedDocuments.length} active source{selectedDocuments.length !== 1 ? 's' : ''}</span>
          </span>

          {/* Export Conversation Dropdown */}
          {messages.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="text-xs font-bold text-[#0C1E3D] dark:text-[#FEFAF6] bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#D4B896] dark:border-[#24487A] px-2.5 py-1.5 rounded-lg hover:bg-[#EADBC8]/40 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Export or copy conversation"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#D4B896] dark:border-[#24487A] rounded-xl shadow-xl p-1.5 z-50 text-xs font-bold space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-[#F5EBE1] dark:hover:bg-[#102C57] flex items-center gap-2 text-[#0C1E3D] dark:text-[#FEFAF6] cursor-pointer"
                  >
                    {copiedThread ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedThread ? 'Copied Markdown!' : 'Copy as Markdown'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTranscript}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-[#F5EBE1] dark:hover:bg-[#102C57] flex items-center gap-2 text-[#0C1E3D] dark:text-[#FEFAF6] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Text (.txt)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CONVERSATION SCROLL CONTAINER                                          */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 custom-scrollbar min-h-0">
        {messages.length === 0 ? (
          /* EMPTY STATE HERO */
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-6 my-auto py-8">
            <div className="w-16 h-16 rounded-2xl bg-[#0C1E3D] dark:bg-[#EADBC8] flex items-center justify-center text-[#FEFAF6] dark:text-[#0C1E3D] shadow-lg border border-[#D4B896]">
              <Sparkles className="w-8 h-8 fill-current" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0C1E3D] dark:text-[#FEFAF6] tracking-tight">
                Enterprise Knowledge Assistant
              </h2>
              <p className="text-xs sm:text-sm text-[#1B2D4B] dark:text-[#EADBC8] max-w-md mx-auto leading-relaxed font-medium">
                Ask questions, cross-reference policy frameworks, or synthesize executive summaries grounded directly in verified source documents with verifiable citations.
              </p>
              {onOpenUpload && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenUpload}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FEFAF6] dark:bg-[#0B192C] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A] text-xs font-bold hover:bg-[#EADBC8]/50 shadow-2xs transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Documents</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dynamic Starter Queries / Empty Selection Fallback */}
            {selectedDocuments.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#24487A] text-center space-y-2 max-w-md mx-auto">
                <p className="text-xs text-[#0C1E3D] dark:text-[#FEFAF6] font-bold">
                  No source documents selected
                </p>
                <p className="text-[11px] text-[#455A7A] dark:text-[#B8C9E0]">
                  Select active documents from the right panel or upload files to enable grounded verification.
                </p>
              </div>
            ) : (
              <div className="w-full pt-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#455A7A] dark:text-[#B8C9E0] block mb-3">
                  Suggested Questions ({selectedDocuments.length} Selected)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  {[
                    {
                      title: 'Document Summary',
                      desc: 'Synthesize key insights and findings from selected files',
                      query: 'Summarize the core topics and essential findings across the selected documents.',
                    },
                    {
                      title: 'Key Facts & Figures',
                      desc: 'Extract definitions, data points, and metrics',
                      query: 'What are the critical data points, metrics, and definitions detailed in these documents?',
                    },
                    {
                      title: 'Actionable Takeaways',
                      desc: 'List requirements, deadlines, and conclusions',
                      query: 'Highlight all actionable items, key conclusions, and important takeaways from these documents.',
                    },
                  ].map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSendMessage(sug.query)}
                      className="p-3.5 rounded-2xl bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#24487A] hover:border-[#0C1E3D] dark:hover:border-[#FEFAF6] hover:shadow-md transition-all cursor-pointer text-left space-y-1 group"
                    >
                      <div className="font-display font-bold text-xs text-[#0C1E3D] dark:text-[#FEFAF6] group-hover:underline">
                        {sug.title}
                      </div>
                      <p className="text-[11px] text-[#455A7A] dark:text-[#B8C9E0] leading-snug font-medium">
                        {sug.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* MESSAGE STREAM */
          <div className="space-y-6 max-w-4xl mx-auto pb-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 sm:p-5 transition-all shadow-xs ${
                      isUser
                        ? 'bg-[#0C1E3D] text-[#FEFAF6] rounded-tr-xs shadow-md'
                        : 'bg-[#F5EBE1] dark:bg-[#102C57] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#1E3E62] rounded-tl-xs'
                    }`}
                  >
                    {/* Assistant Strict Grounding Header Banner */}
                    {!isUser && (
                      <div className="flex items-center justify-between border-b border-[#D4B896]/60 dark:border-[#1E3E62] pb-2.5 mb-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Verified Grounded in Active Sources</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#455A7A] dark:text-[#B8C9E0] font-semibold">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                    )}

                    {/* Content Text */}
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.text}
                    </div>

                    {/* DETERMINISTIC CITATION CHIPS */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-3.5 mt-3 border-t border-[#D4B896]/60 dark:border-[#1E3E62] space-y-2">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#455A7A] dark:text-[#B8C9E0] flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-[#0C1E3D] dark:text-[#EADBC8]" />
                          <span>Proven Citations ({msg.sources.length}):</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((source, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => onOpenSourcePreview(source)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEFAF6] dark:bg-[#0B192C] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A] text-[11px] font-bold hover:bg-[#EADBC8]/50 dark:hover:bg-[#15386B] hover:border-[#0C1E3D] dark:hover:border-[#FEFAF6] transition-all cursor-pointer shadow-2xs"
                              title="Click to view exact raw chunk text in citation inspector"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#0C1E3D] dark:text-[#EADBC8]" />
                              <span className="max-w-[200px] truncate">{source.docName || (source as any).document || 'Source Document'}</span>
                              {source.page && (
                                <span className="px-1.5 py-0.2 rounded-md bg-[#EADBC8] dark:bg-[#102C57] text-[10px]">
                                  p.{source.page}
                                </span>
                              )}
                              <ExternalLink className="w-3 h-3 text-[#455A7A] dark:text-[#B8C9E0]" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DOCUMENT VISUAL EVIDENCE GALLERY (Only when images exist) */}
                    {!isUser && msg.images && msg.images.length > 0 && (
                      <div className="pt-3.5 mt-3 border-t border-[#D4B896]/60 dark:border-[#1E3E62] space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0C1E3D] dark:text-[#FEFAF6]">
                          <ImageIcon className="w-4 h-4 text-[#0C1E3D] dark:text-[#EADBC8]" />
                          <span>Document Visual Evidence ({msg.images.length})</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {msg.images.map((img, idx) => {
                            const imageUrl = img.url.startsWith('http') ? img.url : `${API_BASE_URL}${img.url}`;
                            return (
                              <div
                                key={img.image_id || idx}
                                onClick={() => setLightboxImage(img)}
                                className="group relative rounded-xl border border-[#D4B896] dark:border-[#24487A] bg-[#FEFAF6] dark:bg-[#0B192C] overflow-hidden cursor-pointer shadow-2xs hover:shadow-md transition-all"
                              >
                                <div className="w-full h-44 bg-[#EADBC8]/40 dark:bg-[#102C57]/40 flex items-center justify-center overflow-hidden relative">
                                  <img
                                    src={imageUrl}
                                    alt={img.caption || `Extracted document image from page ${img.page}`}
                                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="p-2 rounded-full bg-[#0C1E3D]/85 text-[#FEFAF6] backdrop-blur-xs">
                                      <Maximize2 className="w-4 h-4" />
                                    </span>
                                  </div>
                                </div>
                                <div className="p-2.5 border-t border-[#D4B896]/50 dark:border-[#24487A] space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-[#0C1E3D] dark:text-[#FEFAF6] truncate max-w-[140px]">
                                      {img.document}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded-md bg-[#EADBC8] dark:bg-[#102C57] font-bold text-[10px] text-[#0C1E3D] dark:text-[#FEFAF6]">
                                      Page {img.page || 1}
                                    </span>
                                  </div>
                                  {img.section && (
                                    <p className="text-[10px] text-[#455A7A] dark:text-[#B8C9E0] truncate font-medium">
                                      {img.section}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp for user messages */}
                  {isUser && (
                    <span className="text-[10px] font-mono text-[#455A7A] dark:text-[#B8C9E0] px-1 font-semibold">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  )}
                </div>
              );
            })}

            {/* REAL-TIME SEARCHING & REASONING STEP INDICATOR */}
            {isSearching && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#1E3E62] max-w-md shadow-xs animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-xl bg-[#0C1E3D] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#0C1E3D] flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#0C1E3D] dark:text-[#FEFAF6]">
                    LangGraph Workflow Active
                  </div>
                  <div className="text-[11px] text-[#455A7A] dark:text-[#B8C9E0] font-medium truncate">
                    {searchProgressStep === 0 && 'Validating query syntax and grounding parameters...'}
                    {searchProgressStep === 1 && 'Querying pgvector HNSW index across scoped documents...'}
                    {searchProgressStep === 2 && 'Evaluating hard relevance gate and threshold cutoff...'}
                    {searchProgressStep >= 3 && 'Synthesizing verified grounded response with citations...'}
                  </div>
                  <div className="w-full bg-[#EADBC8] dark:bg-[#0B192C] h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-[#0C1E3D] dark:bg-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (searchProgressStep + 1) * 25)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. ERGONOMIC COMPOSER AT BOTTOM (Auto-expanding Textarea + 42px Button)   */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 border-t border-[#D4B896] dark:border-[#1E3E62] bg-[#F5EBE1] dark:bg-[#102C57] flex-shrink-0 z-20 transition-colors duration-200">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          {/* Guest Mode History Reminder Banner */}
          {isGuest && (
            <div className="flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 animate-in fade-in duration-200">
              <span className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>Guest Mode: Questions & answers are temporary and will not be saved across browser sessions.</span>
              </span>
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="font-extrabold underline text-amber-900 dark:text-amber-100 hover:opacity-80 cursor-pointer ml-2 flex-shrink-0"
                >
                  Create Account to Save
                </button>
              )}
            </div>
          )}

          {/* Upgraded Composer Box with Textarea */}
          <div
            className={`flex items-end justify-between bg-[#FEFAF6] dark:bg-[#0B192C] border rounded-2xl px-4 py-2.5 shadow-sm transition-all ${
              inputError
                ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-950'
                : 'border-[#D4B896] dark:border-[#24487A] focus-within:border-[#0C1E3D] dark:focus-within:border-[#FEFAF6] focus-within:ring-2 focus-within:ring-[#0C1E3D]/10 dark:focus-within:ring-[#FEFAF6]/10'
            }`}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question grounded in your documents (Shift + Enter for new line)..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#0C1E3D] dark:text-[#FEFAF6] placeholder-[#455A7A]/70 dark:placeholder-[#B8C9E0]/60 focus:outline-none pr-3 resize-none font-medium leading-relaxed custom-scrollbar max-h-36 py-1"
            />

            {/* Scope Tag & 42px Touch-Friendly Send Button */}
            <div className="flex items-center gap-2.5 flex-shrink-0 pb-0.5">
              <span className="text-[11px] font-extrabold text-[#0C1E3D] dark:text-[#FEFAF6] bg-[#F5EBE1] dark:bg-[#102C57] px-2.5 py-1 rounded-lg border border-[#D4B896] dark:border-[#24487A] hidden sm:inline-block">
                {selectedDocuments.length} active
              </span>

              <button
                type="button"
                onClick={handleSend}
                disabled={isSearching || !inputQuery.trim()}
                className="w-10.5 h-10.5 bg-[#0C1E3D] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#0C1E3D] hover:opacity-95 disabled:opacity-40 rounded-xl flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer border border-[#0C1E3D] dark:border-[#D4B896] flex-shrink-0"
                title="Send query (Enter)"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>

          {inputError && (
            <p className="text-xs text-red-600 font-bold px-2 animate-in fade-in duration-150">
              Please enter a query to search.
            </p>
          )}

          <div className="flex items-center justify-between px-2 text-[10px] sm:text-[11px] text-[#455A7A] dark:text-[#B8C9E0] font-bold gap-2">
            <span className="truncate">Enterprise Knowledge Assistant</span>
            <span className="hidden sm:inline">Press Enter ↵ to send · Shift+Enter for newline</span>
            <span className="hidden xs:inline truncate">Strict Provenance</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LIGHTBOX MODAL FOR HIGH-RES VISUAL INSPECTION                          */}
      {/* ========================================================================= */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#D4B896] dark:border-[#24487A] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#F5EBE1] dark:bg-[#102C57] border-b border-[#D4B896] dark:border-[#24487A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0C1E3D] dark:text-[#EADBC8]" />
                <span className="font-extrabold text-sm text-[#0C1E3D] dark:text-[#FEFAF6]">
                  {lightboxImage.document} · Page {lightboxImage.page || 1}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage.url.startsWith('http') ? lightboxImage.url : `${API_BASE_URL}${lightboxImage.url}`}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-[#0C1E3D] dark:text-[#FEFAF6] hover:bg-[#D4B896]/40 rounded-lg transition-colors cursor-pointer"
                  title="Open / Download Image"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 text-[#0C1E3D] dark:text-[#FEFAF6] hover:bg-[#D4B896]/40 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 flex items-center justify-center bg-black/5 dark:bg-black/30 overflow-auto min-h-[300px] max-h-[70vh]">
              <img
                src={lightboxImage.url.startsWith('http') ? lightboxImage.url : `${API_BASE_URL}${lightboxImage.url}`}
                alt={lightboxImage.caption || 'Extracted document image'}
                className="max-h-[68vh] max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
            {lightboxImage.caption && (
              <div className="p-3 bg-[#F5EBE1]/80 dark:bg-[#102C57]/80 border-t border-[#D4B896] dark:border-[#24487A] text-xs text-[#0C1E3D] dark:text-[#FEFAF6] font-medium italic">
                {lightboxImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
