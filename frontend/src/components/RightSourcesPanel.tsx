import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Search,
  CheckSquare,
  Square,
  Trash2,
  Sliders,
  ShieldCheck,
  Zap,
  FolderOpen,
  X
} from 'lucide-react';
import type { DocumentItem } from '../types/rag';

interface RightSourcesPanelProps {
  documents: DocumentItem[];
  selectedDocuments: DocumentItem[];
  onToggleSelectDoc: (id: string) => void;
  onToggleSelectAll: (selectAll: boolean) => void;
  onOpenUpload: () => void;
  onOpenKnowledgeManager: () => void;
  onOpenSettings: () => void;
  onDeleteDocument: (id: string) => void;
  autoSelectMode?: boolean;
  onToggleAutoSelectMode?: (enabled: boolean) => void;
  onSelectMatchingDocs?: (docIds: string[]) => void;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export const RightSourcesPanel: React.FC<RightSourcesPanelProps> = ({
  documents,
  selectedDocuments,
  onToggleSelectDoc,
  onToggleSelectAll,
  onOpenUpload,
  onOpenKnowledgeManager,
  onOpenSettings,
  onDeleteDocument,
  autoSelectMode = false,
  onToggleAutoSelectMode,
  onSelectMatchingDocs,
  isMobileDrawer = false,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');

  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunksCount, 0);
  const selectedChunks = selectedDocuments.reduce((sum, doc) => sum + doc.chunksCount, 0);

  // Dynamically extract unique categories/topics from ingested documents
  const availableTopics = React.useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => {
      if (d.category) set.add(d.category);
      if (d.topics) d.topics.forEach((t) => set.add(t));
    });
    return ['All Topics', ...Array.from(set)];
  }, [documents]);

  // Filter documents by search term AND selected topic
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.topics && doc.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesTopic =
      selectedTopic === 'All Topics' ||
      doc.category === selectedTopic ||
      (doc.topics && doc.topics.some((t) => t === selectedTopic));

    return matchesSearch && matchesTopic;
  });

  // Auto-Select matching documents if Auto-Select mode is ON
  useEffect(() => {
    if (autoSelectMode && onSelectMatchingDocs && (searchTerm || selectedTopic !== 'All Topics')) {
      const matchingIds = filteredDocs.map((d) => d.id);
      onSelectMatchingDocs(matchingIds);
    }
  }, [searchTerm, selectedTopic, autoSelectMode]);

  const selectedCount = documents.filter((d) => d.selected).length;
  const allSelected = documents.length > 0 && selectedCount === documents.length;

  return (
    <aside
      className={`${
        isMobileDrawer
          ? 'w-full h-full'
          : 'w-80 lg:w-92 border-l border-[#D4B896] dark:border-[#1E3E62] h-full flex-shrink-0 shadow-sm'
      } bg-[#F5EBE1] dark:bg-[#102C57] flex flex-col justify-between select-none p-3.5 sm:p-4 gap-3 transition-colors duration-200`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & METRIC STRIP                                              */}
      {/* ========================================================================= */}
      <div className="space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between border-b border-[#D4B896]/70 dark:border-[#1E3E62] pb-2.5">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0C1E3D] dark:text-[#FEFAF6]" />
            <h3 className="font-display font-black text-[#0C1E3D] dark:text-[#FEFAF6] text-sm sm:text-base">
              Sources & Knowledge
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 text-[#455A7A] hover:text-[#0C1E3D] dark:text-[#B8C9E0] dark:hover:text-[#FEFAF6] rounded-lg hover:bg-[#D4B896]/30 transition-colors cursor-pointer"
              title="Vector Settings & Model Sliders"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenKnowledgeManager}
              className="text-xs font-bold text-[#0C1E3D] dark:text-[#FEFAF6] hover:underline cursor-pointer"
            >
              Manage Index
            </button>
            {isMobileDrawer && onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded-lg hover:bg-[#EADBC8]/60 dark:hover:bg-[#15386B] text-[#0C1E3D] dark:text-[#FEFAF6] transition-colors cursor-pointer ml-1"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3-Stat Metric Strip */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#FEFAF6] dark:bg-[#0B192C] p-2 rounded-xl border border-[#D4B896]/70 dark:border-[#24487A] shadow-2xs">
            <div className="text-[10px] uppercase tracking-wider text-[#455A7A] dark:text-[#B8C9E0] font-extrabold">
              Files
            </div>
            <div className="font-display font-black text-sm text-[#0C1E3D] dark:text-[#FEFAF6]">
              {documents.length}
            </div>
          </div>
          <div className="bg-[#FEFAF6] dark:bg-[#0B192C] p-2 rounded-xl border border-[#D4B896]/70 dark:border-[#24487A] shadow-2xs">
            <div className="text-[10px] uppercase tracking-wider text-[#455A7A] dark:text-[#B8C9E0] font-extrabold">
              Chunks
            </div>
            <div className="font-display font-black text-sm text-[#0C1E3D] dark:text-[#FEFAF6]">
              {totalChunks}
            </div>
          </div>
          <div className="bg-[#FEFAF6] dark:bg-[#0B192C] p-2 rounded-xl border border-[#D4B896]/70 dark:border-[#24487A] shadow-2xs flex flex-col justify-center items-center">
            <div className="text-[10px] uppercase tracking-wider text-[#455A7A] dark:text-[#B8C9E0] font-extrabold">
              Vector DB
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button: Upload Document */}
        <button
          type="button"
          onClick={onOpenUpload}
          className="w-full bg-[#0C1E3D] hover:bg-[#15386B] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#0C1E3D] font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] text-xs sm:text-sm cursor-pointer border border-[#0C1E3D] dark:border-[#D4B896]"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>

        {/* Scope Selection Controls Bar */}
        <div className="flex items-center justify-between gap-2 py-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0C1E3D] dark:text-[#FEFAF6] min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="truncate">Scope</span>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-[#FEFAF6] dark:bg-[#0B192C] rounded-md border border-[#D4B896] dark:border-[#24487A] flex-shrink-0">
              {selectedCount}/{documents.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onToggleAutoSelectMode && (
              <button
                type="button"
                onClick={() => onToggleAutoSelectMode(!autoSelectMode)}
                className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                  autoSelectMode
                    ? 'bg-[#0C1E3D] text-[#FEFAF6] border-[#0C1E3D] shadow-xs'
                    : 'bg-[#FEFAF6] dark:bg-[#0B192C] text-[#0C1E3D] dark:text-[#FEFAF6] border-[#D4B896] dark:border-[#24487A] hover:bg-[#EADBC8]/40'
                }`}
                title="Automatically scope retrieval to search query matches"
              >
                <Zap className="w-3 h-3 text-emerald-500" />
                <span>Auto</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onToggleSelectAll(!allSelected)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#FEFAF6] dark:bg-[#0B192C] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A] hover:bg-[#EADBC8]/40 transition-colors cursor-pointer"
            >
              {allSelected ? 'None' : 'All'}
            </button>
          </div>
        </div>

        {/* Search & Topic Filter */}
        <div className="space-y-2 pt-0.5">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#455A7A] dark:text-[#B8C9E0] absolute left-3 pointer-events-none z-10" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search source files..."
              className="w-full bg-[#FEFAF6] dark:bg-[#0B192C] text-xs text-[#0C1E3D] dark:text-[#FEFAF6] placeholder-[#455A7A] dark:placeholder-[#B8C9E0]/70 pl-9 pr-3 py-2 rounded-xl border border-[#D4B896] dark:border-[#24487A] focus:outline-none focus:border-[#0C1E3D] dark:focus:border-[#FEFAF6] font-medium transition-all"
            />
          </div>

          {availableTopics.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-[10px] font-bold">
              {availableTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                    selectedTopic === topic
                      ? 'bg-[#0C1E3D] text-[#FEFAF6] dark:bg-[#EADBC8] dark:text-[#0C1E3D] shadow-2xs'
                      : 'bg-[#FEFAF6] dark:bg-[#0B192C] text-[#455A7A] dark:text-[#B8C9E0] border border-[#D4B896] dark:border-[#24487A] hover:bg-[#EADBC8]/40'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DOCUMENT CARDS LIST (Custom Scrollbar)                                 */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0">
        {filteredDocs.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#D4B896] dark:border-[#24487A] rounded-2xl">
            <FolderOpen className="w-8 h-8 text-[#D4B896] dark:text-[#24487A] mb-2" />
            <p className="text-xs font-bold text-[#0C1E3D] dark:text-[#FEFAF6]">
              No documents matched
            </p>
            <p className="text-[11px] text-[#455A7A] dark:text-[#B8C9E0] mt-1">
              Try adjusting your search terms or upload new files.
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isSelected = doc.selected;
            return (
              <div
                key={doc.id}
                className={`group rounded-2xl p-3 border transition-all ${
                  isSelected
                    ? 'bg-[#FEFAF6] dark:bg-[#0B192C] border-[#0C1E3D] dark:border-[#FEFAF6] shadow-xs'
                    : 'bg-[#FEFAF6]/70 dark:bg-[#0B192C]/60 border-[#D4B896]/70 dark:border-[#24487A] opacity-80 hover:opacity-100 hover:border-[#D4B896]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Selection Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleSelectDoc(doc.id)}
                    className="mt-0.5 text-[#0C1E3D] dark:text-[#FEFAF6] hover:scale-110 transition-transform cursor-pointer flex-shrink-0"
                    title={isSelected ? 'Deselect document' : 'Select document'}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4.5 h-4.5 text-[#0C1E3D] dark:text-[#EADBC8]" />
                    ) : (
                      <Square className="w-4.5 h-4.5 text-[#455A7A] dark:text-[#B8C9E0]" />
                    )}
                  </button>

                  {/* Document Details with Full Name Tooltip */}
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onToggleSelectDoc(doc.id)}>
                    <div
                      className="font-bold text-xs text-[#0C1E3D] dark:text-[#FEFAF6] truncate"
                      title={doc.name}
                    >
                      {doc.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-[#455A7A] dark:text-[#B8C9E0] font-semibold">
                      <span>{doc.chunksCount} chunk{doc.chunksCount !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{selectedChunks} chunks active</span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDocument(doc.id);
                    }}
                    className="p-1 text-red-500/70 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer flex-shrink-0"
                    title="Delete document and purge vectors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. FOOTER ACTIVE SCOPE SUMMARY                                            */}
      {/* ========================================================================= */}
      <div className="pt-2 border-t border-[#D4B896]/70 dark:border-[#1E3E62] flex-shrink-0">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#455A7A] dark:text-[#B8C9E0]">
          <span>Active in prompt:</span>
          <span className="text-[#0C1E3D] dark:text-[#FEFAF6] font-mono">
            {selectedChunks} chunks
          </span>
        </div>
        <p className="text-[10px] text-[#455A7A] dark:text-[#B8C9E0] mt-0.5 leading-snug">
          Strict Grounding: Only checked files are queried. Unchecked files are isolated.
        </p>
      </div>
    </aside>
  );
};
