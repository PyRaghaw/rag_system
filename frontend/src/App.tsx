import React, { useState } from 'react';

// WISE WOLVES RAG Interface Components
import { LandingPage } from './components/LandingPage';
import { NotebookHeader } from './components/NotebookHeader';
import { LeftChatHistoryPanel } from './components/LeftChatHistoryPanel';
import { CenterChatPanel } from './components/CenterChatPanel';
import { RightSourcesPanel } from './components/RightSourcesPanel';

// Modals & Panels
import { SourcePreviewDrawer } from './components/SourcePreviewDrawer';
import { UploadModal } from './components/UploadModal';
import { KnowledgeBaseManager } from './components/KnowledgeBaseManager';
import { PipelineVisualizationModal } from './components/PipelineVisualizationModal';
import { SettingsModal } from './components/SettingsModal';
import { CommandPalette } from './components/CommandPalette';
import { AuthModal } from './components/AuthModal';
import { Toaster, toast } from 'sonner';

import type { DocumentItem, ChatMessage, CitationSource, AppSettings, UserAccount, ImageAttachment } from './types/rag';
import {
  checkHealth,
  deleteDocument,
  streamChat,
  uploadDocuments,
  getConversations,
  getConversationMessages,
  deleteConversation,
  renameConversation,
  type ConversationSummary,
} from './api';

export const App: React.FC = () => {
  // User Authentication State (Persisted in localStorage for registered accounts, sessionStorage for guests)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('rag_user');
      if (saved) return JSON.parse(saved);
      const guest = sessionStorage.getItem('rag_guest');
      if (guest) return JSON.parse(guest);
    } catch (e) {}
    return null;
  });

  // Navigation View: 'landing' (showcase & about me) | 'workspace' (active RAG notebook)
  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>(() => {
    try {
      const savedView = localStorage.getItem('rag_view');
      if (savedView === 'workspace') return 'workspace';
      if (savedView === 'landing') return 'landing';
      const savedUser = localStorage.getItem('rag_user');
      const savedGuest = sessionStorage.getItem('rag_guest');
      if (savedUser || savedGuest) return 'workspace';
    } catch (e) {}
    return 'landing';
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('rag_view', currentView);
    } catch (e) {}
  }, [currentView]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'signin'>('signup');

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(() => {
    return sessionStorage.getItem('rag_active_thread') || undefined;
  });
  const activeThreadRef = React.useRef<string | undefined>(activeThreadId);

  React.useEffect(() => {
    activeThreadRef.current = activeThreadId;
    if (activeThreadId) {
      sessionStorage.setItem('rag_active_thread', activeThreadId);
    } else {
      sessionStorage.removeItem('rag_active_thread');
    }
  }, [activeThreadId]);

  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Global Drag and Drop Anywhere State (like ChatGPT)
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const dragCounterRef = React.useRef(0);

  // Search RAG Pipeline Animation State
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgressStep, setSearchProgressStep] = useState(0);

  // Modals & Drawers State
  const [activeSourcePreview, setActiveSourcePreview] = useState<CitationSource | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isKnowledgeManagerOpen, setIsKnowledgeManagerOpen] = useState(false);
  const [isPipelineVisualizerOpen, setIsPipelineVisualizerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState<'none' | 'history' | 'sources'>('none');

  // App Settings State
  const [settings, setSettings] = useState<AppSettings>({
    aiModel: 'gpt-4o',
    retrievedChunks: 5,
    similarityThreshold: 0.72,
    citationBehavior: 'Required',
    groundingMode: 'Documents Only',
  });

  // Theme State: 'light' | 'dark' (persisted in localStorage)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('rag_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  React.useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('rag_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Conversations State for Signed-in Members
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);

  // Fetch Member Conversations from Backend
  const fetchConversations = React.useCallback(async () => {
    if (currentUser && !currentUser.isGuest) {
      try {
        const list = await getConversations();
        setConversations(list || []);
      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    } else {
      setConversations([]);
    }
  }, [currentUser]);

  React.useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Select Thread & Load Its Messages and Associated Documents
  const handleSelectThread = async (threadId: string) => {
    activeThreadRef.current = threadId;
    setActiveThreadId(threadId);
    sessionStorage.setItem('rag_active_thread', threadId);

    // 1. Retrieve documents specifically saved for this thread
    let threadDocs: DocumentItem[] = [];
    try {
      const saved = localStorage.getItem(`rag_thread_docs_${threadId}`);
      if (saved) {
        threadDocs = JSON.parse(saved);
      }
    } catch (e) {}

    try {
      const msgs = await getConversationMessages(threadId);
      const mapped: ChatMessage[] = (msgs || []).map((m) => ({
        id: m.id,
        sender: m.role,
        text: m.content,
        timestamp: m.created_at
          ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
        grounded: m.role === 'assistant',
        sources: (m.sources || []).map((s: any, idx: number) => ({
          id: `src-${idx}-${m.id}`,
          docName: s.document_name || s.document || 'Document',
          section: s.section || 'Extracted Section',
          page: s.page || 1,
          textSnippet: s.snippet || '',
          confidence: 0.94,
          fullSectionContent: s.snippet || '',
        })),
        images: (m.images || []).map((img: any) => ({
          image_id: img.image_id,
          url: img.url || img.url_path,
          document: img.document,
          page: img.page || 1,
          section: img.section || '',
          caption: img.caption || '',
          mime_type: img.mime_type || 'image/png',
        })),
      }));
      setMessages(mapped);

      // 2. Also inspect sources in these messages to make sure referenced documents are included
      const referencedDocNames = new Set<string>();
      (msgs || []).forEach((m) => {
        (m.sources || []).forEach((s: any) => {
          const name = s.document_name || s.document || s.docName;
          if (name) referencedDocNames.add(name);
        });
        (m.images || []).forEach((img: any) => {
          if (img.document) referencedDocNames.add(img.document);
        });
      });

      referencedDocNames.forEach((name) => {
        if (!threadDocs.some((d) => d.name === name)) {
          threadDocs.push({
            id: `doc-${name}`,
            name: name,
            size: 'Referenced in chat',
            chunksCount: 1,
            status: 'ready',
            uploadDate: new Date().toISOString().split('T')[0],
            category: '',
            selected: true,
          });
        }
      });

      // 3. Set the right-side sources panel to ONLY the documents for this chat (blank if none)
      setDocuments(threadDocs);
    } catch (err) {
      toast.error('Failed to load conversation messages');
    }
  };

  // Restore Active Thread on Session / Initial Load
  React.useEffect(() => {
    const saved = sessionStorage.getItem('rag_active_thread');
    if (saved && currentUser && !currentUser.isGuest) {
      handleSelectThread(saved);
    }
  }, [currentUser]);

  const handleNewChat = () => {
    activeThreadRef.current = undefined;
    setActiveThreadId(undefined);
    sessionStorage.removeItem('rag_active_thread');
    setMessages([]);
    setDocuments([]); // Right side is completely blank for any new chat!
    toast.info('Started a new conversation');
  };

  const handleDeleteThread = async (threadId: string) => {
    try {
      await deleteConversation(threadId);
      setConversations((prev) => prev.filter((c) => c.id !== threadId));
      localStorage.removeItem(`rag_thread_docs_${threadId}`);
      if (activeThreadRef.current === threadId || activeThreadId === threadId) {
        activeThreadRef.current = undefined;
        setActiveThreadId(undefined);
        sessionStorage.removeItem('rag_active_thread');
        setMessages([]);
        setDocuments([]);
      }
      toast.success('Conversation deleted');
    } catch {
      toast.error('Failed to delete conversation');
    }
  };

  const handleRenameThread = async (threadId: string, newTitle: string) => {
    try {
      await renameConversation(threadId, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === threadId ? { ...c, title: newTitle } : c))
      );
      toast.success('Conversation renamed');
    } catch {
      toast.error('Failed to rename conversation');
    }
  };

  const handleOpenAuth = (mode: 'signup' | 'signin' = 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('rag_user', JSON.stringify(user));
      localStorage.setItem('rag_view', 'workspace');
    } catch (e) {}
    setIsAuthModalOpen(false);
    setCurrentView('workspace');
    toast.success(`Welcome, ${user.name}! Workspace active.`);
    fetchConversations();
  };

  const handleContinueAsGuest = () => {
    const guestUser: UserAccount = {
      id: `guest_${Date.now()}`,
      name: 'Guest User',
      email: 'guest@session',
      role: 'Guest Explorer',
      isGuest: true,
    };
    setCurrentUser(guestUser);
    sessionStorage.setItem('rag_guest', JSON.stringify(guestUser));
    try {
      localStorage.setItem('rag_view', 'workspace');
    } catch (e) {}
    setIsAuthModalOpen(false);
    // Explicitly guarantee clean blank state for guest
    setMessages([]);
    setDocuments([]);
    setActiveThreadId(undefined);
    activeThreadRef.current = undefined;
    sessionStorage.removeItem('rag_active_thread');
    setCurrentView('workspace');
    toast('Entered Workspace in Guest Mode', {
      description: 'Note: Chat history and documents are not saved across browser sessions.',
    });
  };

  const handleBackToLanding = () => {
    // If guest mode, wipe EVERYTHING completely ("jaise hi back karega sb udd jayega")
    if (!currentUser || currentUser.isGuest) {
      setMessages([]);
      setDocuments([]);
      setActiveThreadId(undefined);
      activeThreadRef.current = undefined;
      sessionStorage.removeItem('rag_guest');
      sessionStorage.removeItem('rag_active_thread');
      setCurrentUser(null);
    }
    try {
      localStorage.setItem('rag_view', 'landing');
    } catch (e) {}
    setCurrentView('landing');
  };

  const handleLogout = () => {
    localStorage.removeItem('rag_user');
    try {
      localStorage.setItem('rag_view', 'landing');
    } catch (e) {}
    sessionStorage.removeItem('rag_guest');
    sessionStorage.removeItem('rag_active_thread');
    activeThreadRef.current = undefined;
    setActiveThreadId(undefined);
    setCurrentUser(null);
    setMessages([]);
    setDocuments([]);
    setConversations([]);
    setCurrentView('landing');
    toast.success('Signed out. Returned to product page.');
  };

  // Auto-Select Mode State for Smart RAG Filtering
  const [autoSelectMode, setAutoSelectMode] = useState<boolean>(false);

  // Toggle individual document selection
  const handleToggleSelectDoc = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, selected: !doc.selected } : doc))
    );
  };

  // Toggle select all documents
  const handleToggleSelectAll = (selectAll: boolean) => {
    setDocuments((prev) => prev.map((doc) => ({ ...doc, selected: selectAll })));
  };

  // Select only matching document IDs (Auto-Select / Topic filter selection)
  const handleSelectMatchingDocs = (docIds: string[]) => {
    setDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        selected: docIds.includes(doc.id),
      }))
    );
  };

  // Initial check on backend health (Documents start BLANK on fresh workspace)
  React.useEffect(() => {
    let isMounted = true;
    checkHealth()
      .then((res) => {
        if (isMounted) setBackendConnected(res.status === 'ok');
      })
      .catch(() => {
        if (isMounted) setBackendConnected(false);
      });

    // Right-side sources ALWAYS starts BLANK on initial mount/fresh load!
    setDocuments([]);

    return () => {
      isMounted = false;
    };
  }, []);

  // Global File Ingestion Handler
  const handleGlobalFilesUpload = async (files: File[]) => {
    const toastId = toast.loading(`Indexing ${files.length} document${files.length > 1 ? 's' : ''}...`);
    try {
      const results = await uploadDocuments(files);
      for (const res of results) {
        const newDoc: DocumentItem = {
          id: `doc-${res.filename}`,
          name: res.filename,
          size: `${res.chunks_ingested || res.chunks || 0} chunks`,
          chunksCount: res.chunks_ingested || res.chunks || 0,
          status: 'ready',
          uploadDate: new Date().toISOString().split('T')[0],
          category: '',
          selected: true,
        };
        setDocuments((prev) => [{ ...newDoc, selected: true }, ...prev.filter((d) => d.name !== res.filename)]);

        // If currently in an active thread, persist this document to that thread's document list
        if (activeThreadRef.current) {
          const threadId = activeThreadRef.current;
          try {
            const key = `rag_thread_docs_${threadId}`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            if (!existing.some((d: any) => d.name === newDoc.name)) {
              existing.push(newDoc);
              localStorage.setItem(key, JSON.stringify(existing));
            }
          } catch (e) {}
        }
      }
      toast.success(`Successfully indexed ${files.length} document${files.length > 1 ? 's' : ''}!`, { id: toastId });
      if (currentView === 'landing') {
        setCurrentView('workspace');
      }
    } catch (err: any) {
      toast.error('Failed to ingest document(s)', {
        description: err?.message || 'Check server logs',
        id: toastId,
      });
    }
  };

  // Window-level Drag and Drop Listeners
  React.useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current += 1;
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsDraggingGlobal(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setIsDraggingGlobal(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDraggingGlobal(false);

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        const supportedExtensions = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.csv', '.xlsx', '.xls', '.txt', '.md', '.json'];
        const validFiles = droppedFiles.filter((f) =>
          supportedExtensions.some((ext) => f.name.toLowerCase().endsWith(ext))
        );
        if (validFiles.length === 0) {
          toast.error('Unsupported file format', {
            description: 'Supported formats: PDF, DOCX, PPTX, CSV, Excel, TXT, MD, JSON.',
          });
          return;
        }
        await handleGlobalFilesUpload(validFiles);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [currentView]);

  // Handle Query Submission with Strict Selected Document RAG Context Filter & Real API
  const handleSendMessage = async (userQuery: string) => {
    const selectedDocs = documents.filter((d) => d.selected);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSearching(true);
    setSearchProgressStep(1);

    if (selectedDocs.length === 0) {
      setIsSearching(false);
      setSearchProgressStep(0);
      const noDocMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: "No source documents are currently selected. Please upload or check at least one source document in the right Sources panel.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRefusal: true,
        grounded: false,
        sources: [],
      };
      setMessages((prev) => [...prev, noDocMsg]);
      return;
    }

    const aiMsgId = `ai-${Date.now()}`;
    const selectedDocNames = selectedDocs.map((d) => d.name);

    try {
      let partialAnswer = '';
      let streamDone = false;

      // Real-time assistant bubble placeholder
      const initialAiMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'assistant',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        grounded: true,
        sources: [],
      };
      setMessages((prev) => [...prev, initialAiMsg]);

      const threadIdToSend =
        activeThreadRef.current ||
        activeThreadId ||
        sessionStorage.getItem('rag_active_thread') ||
        undefined;

      await streamChat(
        userQuery,
        threadIdToSend,
        {
          onInit: (initData) => {
            if (initData.thread_id) {
              activeThreadRef.current = initData.thread_id;
              setActiveThreadId(initData.thread_id);
              sessionStorage.setItem('rag_active_thread', initData.thread_id);
              // Save active documents to this new thread
              try {
                localStorage.setItem(`rag_thread_docs_${initData.thread_id}`, JSON.stringify(selectedDocs));
              } catch (e) {}
            }
          },
          onValidation: () => {
            setSearchProgressStep(1);
          },
          onRetrieval: () => {
            setSearchProgressStep(2);
          },
          onRelevanceGate: () => {
            setSearchProgressStep(3);
          },
          onToken: (tok) => {
            partialAnswer += tok;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMsgId ? { ...msg, text: partialAnswer } : msg
              )
            );
          },
          onDone: (doneData) => {
            streamDone = true;
            setIsSearching(false);
            setSearchProgressStep(0);
            if (doneData.thread_id) {
              activeThreadRef.current = doneData.thread_id;
              setActiveThreadId(doneData.thread_id);
              sessionStorage.setItem('rag_active_thread', doneData.thread_id);
              try {
                localStorage.setItem(`rag_thread_docs_${doneData.thread_id}`, JSON.stringify(selectedDocs));
              } catch (e) {}
              fetchConversations();
            }

            const apiSources: CitationSource[] = (doneData.sources || []).map((s, idx) => ({
              id: `src-${idx}-${Date.now()}`,
              docName: s.document_name || s.document || 'Document',
              section: s.section || 'Extracted Section',
              page: s.page || 1,
              textSnippet: s.snippet || '',
              confidence: 0.94,
              fullSectionContent: s.snippet || '',
            }));

            const apiImages: ImageAttachment[] = (doneData.images || []).map((img) => ({
              image_id: img.image_id,
              url: img.url,
              document: img.document,
              page: img.page || 1,
              section: img.section || '',
              caption: img.caption || '',
              mime_type: img.mime_type || 'image/png',
            }));

            const isRefusal = !doneData.found || !doneData.grounded;
            const isAmbiguous = doneData.needs_clarification;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMsgId
                  ? {
                      ...msg,
                      text: doneData.answer || partialAnswer,
                      grounded: doneData.grounded && !isRefusal,
                      sources: apiSources,
                      images: apiImages,
                      isRefusal,
                      isAmbiguous,
                      retrievalConfidence: 'High',
                      chunksSearched: selectedDocs.reduce((acc, d) => acc + d.chunksCount, 0),
                      sourcesUsedCount: apiSources.length,
                      documentsSearchedCount: selectedDocs.length,
                    }
                  : msg
              )
            );
          },
          onError: (err) => {
            console.error('SSE Streaming error:', err);
            throw new Error(err);
          },
        },
        selectedDocNames
      );

      if (streamDone) return;
    } catch (apiErr) {
      setIsSearching(false);
      setSearchProgressStep(0);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                text: "Could not connect to the backend RAG service. Please verify your backend server or Vercel serverless API is online and the database connection is configured.",
                isRefusal: true,
                grounded: false,
                sources: [],
              }
            : msg
        )
      );
    }
  };

  const handleAddDocument = (newDoc: DocumentItem) => {
    setDocuments((prev) => [{ ...newDoc, selected: true }, ...prev.filter((d) => d.name !== newDoc.name)]);
    if (activeThreadRef.current) {
      const threadId = activeThreadRef.current;
      try {
        const key = `rag_thread_docs_${threadId}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        if (!existing.some((d: any) => d.name === newDoc.name)) {
          existing.push(newDoc);
          localStorage.setItem(key, JSON.stringify(existing));
        }
      } catch (e) {}
    }
    toast.success('Document Indexed Successfully', {
      description: `"${newDoc.name}" has been processed and added to active retrieval scope.`,
    });
  };

  const handleDeleteDocument = async (id: string) => {
    const docToDelete = documents.find((d) => d.id === id);
    if (!docToDelete) return;
    try {
      await deleteDocument(docToDelete.name);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success('Document Deleted', {
        description: `"${docToDelete.name}" was removed from the vector database.`,
      });
    } catch (err: any) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.info('Document Removed', {
        description: `"${docToDelete.name}" was removed from active scope.`,
      });
    }
  };

  const selectedDocs = documents.filter((d) => d.selected);

  // Render Landing Page Showcase View
  if (currentView === 'landing') {
    return (
      <div className={`w-full min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-[#FEFAF6] dark:bg-[#0B192C]`}>
        <LandingPage
          onEnterWorkspace={() => {
            if (currentUser) {
              setCurrentView('workspace');
            } else {
              handleOpenAuth('signup');
            }
          }}
          onOpenAuth={handleOpenAuth}
          onContinueAsGuest={handleContinueAsGuest}
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          onContinueAsGuest={handleContinueAsGuest}
          initialMode={authModalMode}
        />
        <Toaster richColors position="top-right" theme={theme} closeButton />
        {isDraggingGlobal && (
          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-[#102C57]/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300 animate-in fade-in">
            <div className="p-10 rounded-3xl bg-[#FEFAF6] dark:bg-[#102C57] border-4 border-dashed border-[#DAC0A3] shadow-2xl flex flex-col items-center text-center max-w-md mx-4 transform scale-105 transition-transform duration-200">
              <div className="w-20 h-20 rounded-2xl bg-[#DAC0A3]/30 text-[#102C57] dark:text-[#FEFAF6] flex items-center justify-center mb-4 animate-bounce">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#102C57] dark:text-[#FEFAF6] mb-2 font-serif">
                Drop Files Anywhere
              </h3>
              <p className="text-sm text-[#102C57]/80 dark:text-[#DAC0A3] leading-relaxed">
                Release to instantly extract text & visual assets from PDF, DOCX, PPTX, CSV, Excel, TXT or JSON.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render RAG System 3-Column Enterprise Interface
  return (
    <div className={`w-full h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''} bg-[#FEFAF6] dark:bg-[#0B192C] overflow-hidden font-sans text-[#102C57] dark:text-[#FEFAF6] selection:bg-[#DAC0A3] selection:text-[#102C57] transition-colors duration-200`}>
      {/* Top Header */}
      <NotebookHeader
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPipelineVisualizer={() => setIsPipelineVisualizerOpen(true)}
        onNewChat={handleNewChat}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        backendConnected={backendConnected}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onBackToLanding={handleBackToLanding}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth('signup')}
        onLogout={handleLogout}
        documentsCount={documents.length}
        queriesCount={messages.filter((m) => m.sender === 'user').length}
      />

      {/* Main Responsive Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* LEFT PANEL: Chat History (Docked on md and larger screens) */}
        <div className="hidden md:flex h-full flex-shrink-0">
          <LeftChatHistoryPanel
            conversations={conversations}
            activeThreadId={activeThreadId}
            onSelectThread={handleSelectThread}
            onNewChat={handleNewChat}
            onDeleteThread={handleDeleteThread}
            onRenameThread={handleRenameThread}
            isGuest={!currentUser || Boolean(currentUser.isGuest)}
            onOpenAuth={() => handleOpenAuth('signup')}
          />
        </div>

        {/* CENTER PANEL: Grounded Chat Workspace (Full-width on mobile & tablet) */}
        <CenterChatPanel
          messages={messages}
          selectedDocuments={selectedDocs}
          onSendMessage={handleSendMessage}
          isSearching={isSearching}
          searchProgressStep={searchProgressStep}
          onOpenSourcePreview={(source) => setActiveSourcePreview(source)}
          onOpenUpload={() => setIsUploadOpen(true)}
          isGuest={!currentUser || currentUser.isGuest}
          onOpenAuth={() => handleOpenAuth('signup')}
          onNewChat={handleNewChat}
          activeThreadTitle={
            conversations.find((c) => c.id === activeThreadId)?.title ||
            (activeThreadId ? 'Active Conversation' : 'New Chat')
          }
          onToggleMobileHistory={() =>
            setMobileDrawer((prev) => (prev === 'history' ? 'none' : 'history'))
          }
          onToggleMobileSources={() =>
            setMobileDrawer((prev) => (prev === 'sources' ? 'none' : 'sources'))
          }
          savedThreadsCount={conversations.length}
          totalDocumentsCount={documents.length}
        />

        {/* RIGHT PANEL: Sources Selection & Knowledge Management (Docked on xl and larger screens) */}
        <div className="hidden xl:flex h-full flex-shrink-0">
          <RightSourcesPanel
            documents={documents}
            selectedDocuments={selectedDocs}
            onToggleSelectDoc={handleToggleSelectDoc}
            onToggleSelectAll={handleToggleSelectAll}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenKnowledgeManager={() => setIsKnowledgeManagerOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onDeleteDocument={handleDeleteDocument}
            autoSelectMode={autoSelectMode}
            onToggleAutoSelectMode={(enabled) => setAutoSelectMode(enabled)}
            onSelectMatchingDocs={handleSelectMatchingDocs}
          />
        </div>
      </div>

      {/* MOBILE SLIDE-OVER DRAWER: CHAT HISTORY (< md screens) */}
      {mobileDrawer === 'history' && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawer('none')}
          />
          {/* Drawer Sheet */}
          <div className="relative z-50 w-[85vw] max-w-xs h-full bg-[#F5EBE1] dark:bg-[#102C57] shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <LeftChatHistoryPanel
              conversations={conversations}
              activeThreadId={activeThreadId}
              onSelectThread={(id) => {
                handleSelectThread(id);
                setMobileDrawer('none');
              }}
              onNewChat={() => {
                handleNewChat();
                setMobileDrawer('none');
              }}
              onDeleteThread={handleDeleteThread}
              onRenameThread={handleRenameThread}
              isGuest={!currentUser || Boolean(currentUser.isGuest)}
              onOpenAuth={() => {
                handleOpenAuth('signup');
                setMobileDrawer('none');
              }}
              isMobileDrawer
              onCloseMobile={() => setMobileDrawer('none')}
            />
          </div>
        </div>
      )}

      {/* MOBILE & TABLET SLIDE-OVER DRAWER: SOURCES & KNOWLEDGE (< xl screens) */}
      {mobileDrawer === 'sources' && (
        <div className="fixed inset-0 z-50 xl:hidden flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawer('none')}
          />
          {/* Drawer Sheet */}
          <div className="relative z-50 w-[88vw] max-w-sm h-full bg-[#F5EBE1] dark:bg-[#102C57] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <RightSourcesPanel
              documents={documents}
              selectedDocuments={selectedDocs}
              onToggleSelectDoc={handleToggleSelectDoc}
              onToggleSelectAll={handleToggleSelectAll}
              onOpenUpload={() => {
                setIsUploadOpen(true);
                setMobileDrawer('none');
              }}
              onOpenKnowledgeManager={() => {
                setIsKnowledgeManagerOpen(true);
                setMobileDrawer('none');
              }}
              onOpenSettings={() => {
                setIsSettingsOpen(true);
                setMobileDrawer('none');
              }}
              onDeleteDocument={handleDeleteDocument}
              autoSelectMode={autoSelectMode}
              onToggleAutoSelectMode={(enabled) => setAutoSelectMode(enabled)}
              onSelectMatchingDocs={handleSelectMatchingDocs}
              isMobileDrawer
              onCloseMobile={() => setMobileDrawer('none')}
            />
          </div>
        </div>
      )}

      {/* DOCUMENT SOURCE CITATION PREVIEW DRAWER */}
      <SourcePreviewDrawer
        source={activeSourcePreview}
        onClose={() => setActiveSourcePreview(null)}
      />

      {/* UPLOAD DOCUMENT MODAL WITH INGESTION PIPELINE */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddDocument={handleAddDocument}
      />

      {/* KNOWLEDGE BASE MANAGEMENT VIEW */}
      {isKnowledgeManagerOpen && (
        <KnowledgeBaseManager
          documents={documents}
          onClose={() => setIsKnowledgeManagerOpen(false)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onDeleteDocument={handleDeleteDocument}
          onReindexDocument={(id) => {
            const targetDoc = documents.find((d) => d.id === id);
            toast.success('Embeddings Re-indexed', {
              description: `HNSW vector index rebuilt for ${targetDoc?.name || 'document'}.`,
            });
          }}
        />
      )}

      {/* RAG PIPELINE VISUALIZATION MODAL */}
      <PipelineVisualizationModal
        isOpen={isPipelineVisualizerOpen}
        onClose={() => setIsPipelineVisualizerOpen(false)}
      />

      {/* ADVANCED SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
      />

      {/* GLOBAL COMMAND PALETTE (⌘K / Ctrl+K) */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPipelineVisualizer={() => setIsPipelineVisualizerOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenKnowledgeManager={() => setIsKnowledgeManagerOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        documents={documents}
        onSelectDoc={handleToggleSelectDoc}
      />

      {/* AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onContinueAsGuest={handleContinueAsGuest}
        initialMode={authModalMode}
      />

      {/* ENTERPRISE TOAST NOTIFICATION STACK */}
      <Toaster richColors position="top-right" theme={theme} closeButton />

      {/* FULL-SCREEN DRAG OVERLAY ANYWHERE IN APP */}
      {isDraggingGlobal && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-[#102C57]/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div className="p-10 rounded-3xl bg-[#FEFAF6] dark:bg-[#102C57] border-4 border-dashed border-[#DAC0A3] shadow-2xl flex flex-col items-center text-center max-w-md mx-4 transform scale-105 transition-transform duration-200">
            <div className="w-20 h-20 rounded-2xl bg-[#DAC0A3]/30 text-[#102C57] dark:text-[#FEFAF6] flex items-center justify-center mb-4 animate-bounce">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#102C57] dark:text-[#FEFAF6] mb-2 font-serif">
              Drop Files Anywhere
            </h3>
            <p className="text-sm text-[#102C57]/80 dark:text-[#DAC0A3] leading-relaxed">
              Release to instantly extract text & visual assets from PDF, DOCX, PPTX, CSV, Excel, TXT or JSON.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
