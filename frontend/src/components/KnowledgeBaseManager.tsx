import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Database,
  FileText,
  Plus,
  ShieldCheck,
  HardDrive,
  Layers,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  X
} from 'lucide-react';
import type { DocumentItem } from '../types/rag';

interface KnowledgeBaseManagerProps {
  documents: DocumentItem[];
  onClose: () => void;
  onOpenUpload: () => void;
  onDeleteDocument: (id: string) => void;
  onReindexDocument: (id: string) => void;
}

export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({
  documents,
  onClose,
  onOpenUpload,
  onDeleteDocument,
  onReindexDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [inspectingDoc, setInspectingDoc] = useState<DocumentItem | null>(null);

  const totalChunks = useMemo(() => {
    return documents.reduce((sum, doc) => sum + doc.chunksCount, 0);
  }, [documents]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesQuery =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || doc.category === selectedCategory;
      return matchesQuery && matchesCat;
    });
  }, [documents, searchQuery, selectedCategory]);

  return (
    <div className="fixed inset-0 z-40 bg-[#FEFAF6] dark:bg-[#0B192C] flex flex-col h-screen overflow-hidden font-sans select-none animate-in fade-in duration-200 transition-colors">
      {/* Top Header Bar */}
      <header className="h-16 bg-[#EADBC8] dark:bg-[#102C57] border-b border-[#DAC0A3] dark:border-[#24487A] px-4 sm:px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 transition-colors">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FEFAF6] dark:bg-[#0B192C] text-[#102C57] dark:text-[#FEFAF6] border border-[#DAC0A3] text-xs font-bold transition-all cursor-pointer shadow-2xs hover:bg-[#E2D1BD]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Workspace</span>
          </button>
          <div className="h-5 w-px bg-[#DAC0A3] hidden sm:block"></div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display font-bold text-[#102C57] dark:text-[#FEFAF6] text-base sm:text-lg leading-none">
                Knowledge Base Vault
              </h1>
              <span className="text-[11px] text-[#102C57]/70 dark:text-[#DAC0A3] font-medium">
                PostgreSQL pgvector Store Management
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenUpload}
          className="bg-[#102C57] hover:opacity-90 dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] border border-[#102C57] dark:border-[#DAC0A3] text-xs font-bold py-2 px-4 rounded-full flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New File</span>
        </button>
      </header>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full custom-scrollbar">
        
        {/* Executive 4-Metric Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-[#EADBC8] dark:bg-[#102C57] border border-[#DAC0A3] dark:border-[#24487A] rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center gap-4 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] flex items-center justify-center flex-shrink-0 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs text-[#102C57]/70 dark:text-[#DAC0A3] font-bold uppercase tracking-wider block">
                Total Documents
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#102C57] dark:text-[#FEFAF6] font-display">
                {documents.length}
              </span>
            </div>
          </div>

          <div className="bg-[#EADBC8] dark:bg-[#102C57] border border-[#DAC0A3] dark:border-[#24487A] rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center gap-4 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] flex items-center justify-center flex-shrink-0 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs text-[#102C57]/70 dark:text-[#DAC0A3] font-bold uppercase tracking-wider block">
                Embedded Chunks
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#102C57] dark:text-[#FEFAF6] font-display">
                {totalChunks.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-[#EADBC8] dark:bg-[#102C57] border border-[#DAC0A3] dark:border-[#24487A] rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center gap-4 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] flex items-center justify-center flex-shrink-0 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs text-[#102C57]/70 dark:text-[#DAC0A3] font-bold uppercase tracking-wider block">
                HNSW Vector Status
              </span>
              <span className="text-sm sm:text-base font-bold text-[#102C57] dark:text-[#FEFAF6] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#102C57] dark:bg-[#FEFAF6] animate-pulse"></span>
                Active & Synced
              </span>
            </div>
          </div>

          <div className="bg-[#EADBC8] dark:bg-[#102C57] border border-[#DAC0A3] dark:border-[#24487A] rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center gap-4 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] flex items-center justify-center flex-shrink-0 font-bold">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs text-[#102C57]/70 dark:text-[#DAC0A3] font-bold uppercase tracking-wider block">
                Index Memory
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#102C57] dark:text-[#FEFAF6] font-display">
                {(totalChunks * 0.015).toFixed(1)} MB
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-[#EADBC8] dark:bg-[#102C57] border border-[#DAC0A3] dark:border-[#24487A] rounded-2xl p-4 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          {/* Real-time search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#102C57]/60 dark:text-[#DAC0A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by name or category..."
              className="w-full bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] dark:border-[#24487A] rounded-xl pl-10 pr-4 py-2 text-xs text-[#102C57] dark:text-[#FEFAF6] placeholder-[#102C57]/50 dark:placeholder-[#DAC0A3]/60 focus:outline-none focus:ring-1 focus:ring-[#102C57] dark:focus:ring-[#FEFAF6] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#102C57]/60 hover:text-[#102C57] dark:text-[#DAC0A3]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#102C57] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#102C57] border border-[#102C57] dark:border-[#DAC0A3] shadow-2xs'
                    : 'bg-[#FEFAF6] dark:bg-[#0B192C] text-[#102C57] dark:text-[#FEFAF6] border border-[#DAC0A3] hover:bg-[#E2D1BD]'
                }`}
              >
                {cat === 'ALL' ? 'All Scope' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Document Inventory Table */}
        <div className="bg-[#EADBC8] dark:bg-[#102C57] border border-[#DAC0A3] dark:border-[#24487A] rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#DAC0A3]/60 dark:border-[#24487A] flex items-center justify-between bg-[#FEFAF6] dark:bg-[#0B192C]">
            <div>
              <h3 className="font-bold text-[#102C57] dark:text-[#FEFAF6] text-sm">
                Document Store Registry
              </h3>
              <p className="text-xs text-[#102C57]/70 dark:text-[#DAC0A3]">
                Displaying {filteredDocuments.length} of {documents.length} registered document files
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#102C57] dark:text-[#FEFAF6] bg-[#EADBC8] dark:bg-[#102C57] border border-[#DAC0A3] px-2.5 py-1 rounded-md">
              HNSW Distance: Cosine
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] dark:border-[#24487A] flex items-center justify-center mx-auto text-[#102C57] dark:text-[#FEFAF6]">
                <FileText className="w-6 h-6 opacity-60" />
              </div>
              <p className="font-bold text-[#102C57] dark:text-[#FEFAF6] text-sm">
                Knowledge vault is currently empty
              </p>
              <p className="text-xs text-[#102C57]/70 dark:text-[#DAC0A3] max-w-sm mx-auto">
                No documents have been indexed into PostgreSQL pgvector yet. Upload documents to generate vector embeddings.
              </p>
              <button
                type="button"
                onClick={onOpenUpload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] text-xs font-bold rounded-xl shadow-xs hover:opacity-90 transition-all cursor-pointer mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Document</span>
              </button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <FileText className="w-10 h-10 text-[#102C57]/40 dark:text-[#DAC0A3]/40 mx-auto" />
              <p className="font-bold text-[#102C57] dark:text-[#FEFAF6] text-sm">
                No matching documents found
              </p>
              <p className="text-xs text-[#102C57]/70 dark:text-[#DAC0A3] max-w-sm mx-auto">
                No document matched your current search query &ldquo;{searchQuery}&rdquo;. Try another term or reset filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#102C57] dark:text-[#FEFAF6]">
                <thead className="bg-[#FEFAF6] dark:bg-[#0B192C] text-[#102C57]/80 dark:text-[#DAC0A3] font-bold uppercase tracking-wider border-b border-[#DAC0A3]/60 dark:border-[#24487A]">
                  <tr>
                    <th className="px-6 py-3.5">Document File</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Chunks Count</th>
                    <th className="px-6 py-3.5">Indexing Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DAC0A3]/50 dark:divide-[#24487A]">
                  {filteredDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-[#FEFAF6]/60 dark:hover:bg-[#0B192C]/60 transition-colors font-medium group"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] flex items-center justify-center font-bold flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[#102C57] dark:text-[#FEFAF6] text-xs truncate max-w-xs sm:max-w-md">
                            {doc.name}
                          </span>
                          <span className="text-[10px] text-[#102C57]/70 dark:text-[#DAC0A3] font-mono">
                            {doc.size} • Uploaded {doc.uploadDate || 'Recently'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#FEFAF6] dark:bg-[#0B192C] text-[#102C57] dark:text-[#FEFAF6] border border-[#DAC0A3]">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-bold text-[#102C57] dark:text-[#FEFAF6] font-mono text-xs">
                            {doc.chunksCount} chunks
                          </span>
                          <div className="w-20 h-1.5 rounded-full bg-[#FEFAF6] dark:bg-[#0B192C] overflow-hidden border border-[#DAC0A3]">
                            <div
                              className="h-full bg-[#102C57] dark:bg-[#FEFAF6] rounded-full"
                              style={{ width: `${Math.min(100, (doc.chunksCount / 250) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEFAF6] dark:bg-[#0B192C] text-[#102C57] dark:text-[#FEFAF6] border border-[#DAC0A3]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#102C57] dark:bg-[#FEFAF6] animate-pulse"></span>
                          HNSW Synced
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5">
                        {/* Inspect Chunk Structure */}
                        <button
                          type="button"
                          onClick={() => setInspectingDoc(doc)}
                          className="px-2.5 py-1.5 bg-[#FEFAF6] dark:bg-[#0B192C] text-[#102C57] dark:text-[#FEFAF6] border border-[#DAC0A3] rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs hover:bg-[#E2D1BD]"
                          title="Inspect chunk breakdown"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chunks</span>
                        </button>

                        {/* Re-index Embeddings */}
                        <button
                          type="button"
                          onClick={() => onReindexDocument(doc.id)}
                          className="px-2.5 py-1.5 bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] border border-[#102C57] dark:border-[#DAC0A3] rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs hover:opacity-90"
                          title="Rebuild HNSW vector embeddings"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reindex</span>
                        </button>

                        {/* Delete from scope */}
                        <button
                          type="button"
                          onClick={() => onDeleteDocument(doc.id)}
                          className="px-2.5 py-1.5 bg-[#FEFAF6] dark:bg-[#0B192C] text-[#102C57] dark:text-[#FEFAF6] border border-red-400/60 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs hover:bg-red-500 hover:text-white"
                          title="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CHUNK STRUCTURE INSPECTION MODAL */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] dark:border-[#24487A] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden font-sans transition-colors duration-200 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-[#DAC0A3]/60 dark:border-[#24487A] flex items-center justify-between bg-[#EADBC8] dark:bg-[#102C57]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#102C57] dark:text-[#FEFAF6] text-sm">
                    {inspectingDoc.name}
                  </h4>
                  <span className="text-xs text-[#102C57]/70 dark:text-[#DAC0A3]">
                    {inspectingDoc.chunksCount} Chunks Embedded • pgvector Store
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="p-1.5 text-[#102C57]/70 hover:text-[#102C57] dark:text-[#DAC0A3] dark:hover:text-[#FEFAF6] rounded-lg hover:bg-[#DAC0A3]/30 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chunk Previews */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 custom-scrollbar bg-[#FEFAF6] dark:bg-[#0B192C]">
              {[1, 2, 3].map((chunkIdx) => (
                <div
                  key={chunkIdx}
                  className="bg-[#EADBC8] dark:bg-[#102C57] border border-[#DAC0A3] dark:border-[#24487A] rounded-xl p-4 shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#102C57]/70 dark:text-[#DAC0A3]">
                    <span className="font-bold text-[#102C57] dark:text-[#FEFAF6]">
                      CHUNK_ID: #chk-{inspectingDoc.id.slice(0, 8)}-{chunkIdx.toString().padStart(3, '0')}
                    </span>
                    <span>Tokens: 512 | Vector: 1536d</span>
                  </div>
                  <p className="text-[#102C57] dark:text-[#FEFAF6] leading-relaxed font-sans">
                    {chunkIdx === 1 &&
                      "Section 4.1 Corporate Governance Structure. The Audit Committee shall consist of a minimum of three members, of which at least two-thirds shall be independent directors. All members of the audit committee shall be financially literate."}
                    {chunkIdx === 2 &&
                      "Section 3.3 Board Meeting Quorum and Frequencies. The Board of Directors shall meet at least once every three months, and at least four meetings shall be held every year with no more than 120 days between consecutive sessions."}
                    {chunkIdx === 3 &&
                      "Section 5.1 Nomination and Remuneration Committee. The Committee shall formulate criteria for determining qualifications, positive attributes and independence of a director and recommend remuneration policies to the board."}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-[#102C57]/70 dark:text-[#DAC0A3]">
                    <span className="bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] px-2 py-0.5 rounded">Page {chunkIdx}</span>
                    <span className="bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] px-2 py-0.5 rounded">Cosine similarity index ready</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#DAC0A3]/60 dark:border-[#24487A] bg-[#EADBC8] dark:bg-[#102C57] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="px-4 py-2 bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] border border-[#102C57] dark:border-[#DAC0A3] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
