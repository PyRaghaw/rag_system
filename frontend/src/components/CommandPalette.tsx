import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import {
  Search,
  Plus,
  Settings,
  Sparkles,
  FileText,
  Sun,
  Moon,
  Upload,
  Database,
  X
} from 'lucide-react';
import type { DocumentItem } from '../types/rag';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenPipelineVisualizer: () => void;
  onOpenUpload: () => void;
  onOpenKnowledgeManager: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  documents: DocumentItem[];
  onSelectDoc: (id: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  onNewChat,
  onOpenSettings,
  onOpenPipelineVisualizer,
  onOpenUpload,
  onOpenKnowledgeManager,
  theme,
  onToggleTheme,
  documents,
  onSelectDoc,
}) => {
  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] dark:border-[#24487A] rounded-2xl shadow-2xl overflow-hidden font-sans select-none animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="w-full">
          {/* Header Search Input */}
          <div className="flex items-center px-4 border-b border-[#DAC0A3]/60 dark:border-[#24487A] bg-[#EADBC8] dark:bg-[#102C57]">
            <Search className="w-4 h-4 text-[#102C57]/70 dark:text-[#DAC0A3] mr-2 flex-shrink-0" />
            <Command.Input
              placeholder="Type a command, document name, or action..."
              className="w-full py-4 bg-transparent text-sm text-[#102C57] dark:text-[#FEFAF6] placeholder-[#102C57]/50 dark:placeholder-[#DAC0A3]/60 focus:outline-none font-medium"
              autoFocus
            />
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-lg hover:bg-[#DAC0A3]/30 text-[#102C57]/70 hover:text-[#102C57] dark:text-[#DAC0A3] dark:hover:text-[#FEFAF6] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List Results */}
          <Command.List className="max-h-80 overflow-y-auto p-2 custom-scrollbar space-y-1 bg-[#FEFAF6] dark:bg-[#0B192C]">
            <Command.Empty className="py-8 text-center text-xs text-[#102C57]/60 dark:text-[#DAC0A3]">
              No matching commands or documents found.
            </Command.Empty>

            {/* Quick Actions Group */}
            <Command.Group heading="SYSTEM ACTIONS" className="text-[11px] font-bold text-[#102C57]/70 dark:text-[#DAC0A3] px-3 py-1.5 uppercase tracking-wider">
              <Command.Item
                onSelect={() => {
                  onNewChat();
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] hover:bg-[#EADBC8] dark:hover:bg-[#102C57] cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4 text-[#102C57]/70 dark:text-[#DAC0A3]" />
                <span>Start New Chat Thread</span>
                <span className="ml-auto text-[10px] text-[#102C57]/60 dark:text-[#DAC0A3]/70 font-mono">⌘N</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onToggleTheme();
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] hover:bg-[#EADBC8] dark:hover:bg-[#102C57] cursor-pointer transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FEFAF6]" /> : <Moon className="w-4 h-4 text-[#102C57]" />}
                <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                <span className="ml-auto text-[10px] text-[#102C57]/60 dark:text-[#DAC0A3]/70 font-mono">⌘T</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onOpenPipelineVisualizer();
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] hover:bg-[#EADBC8] dark:hover:bg-[#102C57] cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#102C57] dark:text-[#FEFAF6]" />
                <span>View RAG Execution Pipeline</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onOpenUpload();
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] hover:bg-[#EADBC8] dark:hover:bg-[#102C57] cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 text-[#102C57] dark:text-[#FEFAF6]" />
                <span>Upload New Documents to Vector DB</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onOpenKnowledgeManager();
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] hover:bg-[#EADBC8] dark:hover:bg-[#102C57] cursor-pointer transition-colors"
              >
                <Database className="w-4 h-4 text-[#102C57] dark:text-[#FEFAF6]" />
                <span>Manage Knowledge Base & Embeddings</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onOpenSettings();
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] hover:bg-[#EADBC8] dark:hover:bg-[#102C57] cursor-pointer transition-colors"
              >
                <Settings className="w-4 h-4 text-[#102C57] dark:text-[#FEFAF6]" />
                <span>RAG Pipeline Configuration</span>
                <span className="ml-auto text-[10px] text-[#102C57]/60 dark:text-[#DAC0A3]/70 font-mono">⌘,</span>
              </Command.Item>
            </Command.Group>

            {/* Document Sources Group */}
            <Command.Group heading="INDEXED DOCUMENTS" className="text-[11px] font-bold text-[#102C57]/70 dark:text-[#DAC0A3] px-3 py-1.5 uppercase tracking-wider pt-2">
              {documents.map((doc) => (
                <Command.Item
                  key={doc.id}
                  onSelect={() => {
                    onSelectDoc(doc.id);
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] hover:bg-[#EADBC8] dark:hover:bg-[#102C57] cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#102C57]/70 dark:text-[#DAC0A3]" />
                  <span className="truncate">{doc.name}</span>
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-md bg-[#EADBC8] dark:bg-[#102C57] border border-[#DAC0A3] font-mono">
                    {doc.chunksCount} chunks
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer Navigation Hints */}
          <div className="p-3 bg-[#EADBC8] dark:bg-[#102C57] border-t border-[#DAC0A3]/60 dark:border-[#24487A] flex items-center justify-between text-[11px] text-[#102C57]/70 dark:text-[#DAC0A3]">
            <div className="flex items-center gap-3">
              <span>Navigate <kbd className="px-1.5 py-0.5 bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] rounded font-mono text-[10px]">↑↓</kbd></span>
              <span>Select <kbd className="px-1.5 py-0.5 bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] rounded font-mono text-[10px]">↵</kbd></span>
            </div>
            <span>Close <kbd className="px-1.5 py-0.5 bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] rounded font-mono text-[10px]">ESC</kbd></span>
          </div>
        </Command>
      </div>
    </div>
  );
};
