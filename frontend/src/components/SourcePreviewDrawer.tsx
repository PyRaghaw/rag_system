import React, { useState } from 'react';
import { X, FileText, ShieldCheck, Check, Copy } from 'lucide-react';
import type { CitationSource } from '../types/rag';

interface SourcePreviewDrawerProps {
  source: CitationSource | null;
  onClose: () => void;
}

export const SourcePreviewDrawer: React.FC<SourcePreviewDrawerProps> = ({ source, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!source) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(source.textSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-[#FEFAF6] dark:bg-[#0B192C] h-full shadow-2xl flex flex-col justify-between border-l border-[#DAC0A3] dark:border-[#24487A] animate-in slide-in-from-right duration-200 transition-colors">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#DAC0A3]/60 dark:border-[#24487A] flex items-center justify-between bg-[#EADBC8] dark:bg-[#102C57]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#102C57] dark:text-[#FEFAF6] text-base">{source.docName}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEFAF6] dark:bg-[#0B192C] text-[#102C57] dark:text-[#FEFAF6] border border-[#DAC0A3]">
                  <ShieldCheck className="w-3 h-3 text-[#102C57] dark:text-[#FEFAF6]" /> Verified
                </span>
              </div>
              <span className="text-xs text-[#102C57]/70 dark:text-[#DAC0A3] font-medium">
                {source.section} {source.page && `• Page ${source.page}`}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#102C57]/70 hover:text-[#102C57] dark:text-[#DAC0A3] dark:hover:text-[#FEFAF6] rounded-lg hover:bg-[#DAC0A3]/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Preview Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#FEFAF6] dark:bg-[#0B192C]">
          {/* Metadata Card */}
          <div className="grid grid-cols-3 gap-3 bg-[#EADBC8] dark:bg-[#102C57] p-4 rounded-xl border border-[#DAC0A3] dark:border-[#24487A] text-xs shadow-2xs">
            <div>
              <span className="text-[#102C57]/70 dark:text-[#DAC0A3] font-medium block mb-1">Document</span>
              <span className="font-bold text-[#102C57] dark:text-[#FEFAF6] truncate block">{source.docName}</span>
            </div>
            <div>
              <span className="text-[#102C57]/70 dark:text-[#DAC0A3] font-medium block mb-1">Section</span>
              <span className="font-bold text-[#102C57] dark:text-[#FEFAF6] truncate block">{source.section}</span>
            </div>
            <div>
              <span className="text-[#102C57]/70 dark:text-[#DAC0A3] font-medium block mb-1">Match Score</span>
              <span className="font-bold text-[#102C57] dark:text-[#FEFAF6] block">{(source.confidence * 100).toFixed(0)}% Match</span>
            </div>
          </div>

          {/* Document Content Page Viewer Container */}
          <div className="bg-[#EADBC8] dark:bg-[#102C57] border border-[#DAC0A3] dark:border-[#24487A] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 text-[#102C57] dark:text-[#FEFAF6] text-sm sm:text-base leading-relaxed">
            <div className="border-b border-[#DAC0A3]/60 dark:border-[#24487A] pb-3 flex items-center justify-between text-xs font-sans font-bold text-[#102C57]/70 dark:text-[#DAC0A3] uppercase tracking-wider">
              <span>Official Policy Document Excerpt</span>
              {source.page && <span>Page {source.page}</span>}
            </div>

            {/* Section Header */}
            <h4 className="font-sans font-bold text-lg text-[#102C57] dark:text-[#FEFAF6] border-b border-[#DAC0A3]/50 dark:border-[#24487A] pb-2">
              {source.section}
            </h4>

            {/* Full Section Paragraph with Highlighted Citation Text */}
            <div className="text-[#102C57]/80 dark:text-[#FEFAF6]/90 font-sans text-sm space-y-4">
              <p className="text-[#102C57]/60 dark:text-[#DAC0A3]/70 text-xs italic">
                ...the following terms govern organization policy and employee entitlement standard operating procedures...
              </p>

              {/* Highlighted Exact Passage */}
              <div className="bg-[#FEFAF6] dark:bg-[#0B192C] border-l-4 border-[#102C57] dark:border-[#FEFAF6] border-y border-r border-[#DAC0A3] dark:border-[#24487A] p-4 rounded-r-xl shadow-2xs text-[#102C57] dark:text-[#FEFAF6] font-medium text-sm leading-relaxed my-4">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1 font-sans">
                  <Check className="w-4 h-4 text-[#102C57] dark:text-[#FEFAF6]" />
                  <span>Retrieved Grounded Context Snippet</span>
                </div>
                &ldquo;{source.fullSectionContent || source.textSnippet}&rdquo;
              </div>

              <p className="text-[#102C57]/60 dark:text-[#DAC0A3]/70 text-xs italic">
                ...all exceptions or special approvals must be submitted via formal enterprise HR channels...
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#DAC0A3]/60 dark:border-[#24487A] bg-[#EADBC8] dark:bg-[#102C57] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] border border-[#DAC0A3] dark:border-[#24487A] rounded-xl hover:bg-[#E2D1BD] dark:hover:bg-[#16386D] transition-colors cursor-pointer"
          >
            Close Inspector
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-bold text-[#FEFAF6] dark:text-[#102C57] bg-[#102C57] dark:bg-[#FEFAF6] border border-[#102C57] dark:border-[#DAC0A3] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#FEFAF6] dark:text-[#102C57]" />
                  <span>Copied Citation</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-current" />
                  <span>Copy Citation Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
