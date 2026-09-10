import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  Check
} from 'lucide-react';
import type { DocumentItem } from '../types/rag';
import { uploadDocuments } from '../api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (doc: DocumentItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onAddDocument,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [uploadedDocName, setUploadedDocName] = useState('');

  if (!isOpen) return null;

  const handleUpload = async (file: File) => {
    setUploadedDocName(file.name);
    setIsProcessing(true);
    setPipelineStep(1); // Upload

    try {
      // Step 2: Extraction
      setTimeout(() => setPipelineStep(2), 600);
      // Step 3: Chunking
      setTimeout(() => setPipelineStep(3), 1200);
      // Step 4: Embedding
      setTimeout(() => setPipelineStep(4), 1800);

      // Attempt Real Backend Upload
      const res = await uploadDocuments([file]);
      setPipelineStep(5); // Indexed
      setIsProcessing(false);

      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        chunksCount: (res && res[0]?.chunks_ingested) || 0,
        status: 'ready',
        uploadDate: new Date().toISOString().split('T')[0],
        category: '',
        selected: true,
      };

      onAddDocument(newDoc);
    } catch {
      setIsProcessing(false);
      setPipelineStep(0);
      setUploadedDocName('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const pipelineSteps = [
    { label: 'Upload File', desc: 'Secure TLS Transfer' },
    { label: 'Text Extraction', desc: 'OCR & Layout Parser' },
    { label: 'Chunking', desc: '512 Token Overlap' },
    { label: 'Embedding', desc: 'Vector Generation' },
    { label: 'Vector Indexing', desc: 'HNSW Index Insert' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] dark:border-[#1E3E62] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden font-sans transition-colors duration-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#DAC0A3] dark:border-[#1E3E62] flex items-center justify-between bg-[#EADBC8] dark:bg-[#102C57]">
          <div>
            <h3 className="font-display font-bold text-[#102C57] dark:text-[#FEFAF6] text-base sm:text-lg leading-tight">
              Ingest Documents to Vector Store
            </h3>
            <p className="text-xs text-[#102C57]/70 dark:text-[#DAC0A3] font-medium">
              Files are automatically parsed, chunked, and embedded into pgvector.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#102C57]/70 hover:text-[#102C57] dark:text-[#DAC0A3] dark:hover:text-[#FEFAF6] rounded-lg hover:bg-[#DAC0A3]/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[#DAC0A3] hover:border-[#102C57] dark:border-[#1E3E62] dark:hover:border-[#DAC0A3] bg-[#EADBC8]/40 dark:bg-[#102C57]/40 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer group"
          >
            <input
              type="file"
              accept=".pdf,.docx,.doc,.pptx,.ppt,.csv,.xlsx,.xls,.txt,.md,.json"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload-input"
            />
            <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-[#102C57] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#102C57] flex items-center justify-center transition-all shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#102C57] dark:text-[#FEFAF6] text-sm block">
                  Drag & Drop enterprise files here
                </span>
                <span className="text-xs text-[#102C57] dark:text-[#DAC0A3] font-semibold underline">
                  or browse from your system
                </span>
              </div>
              <span className="text-[11px] text-[#102C57]/70 dark:text-[#DAC0A3] font-medium pt-1">
                Supported formats: PDF • PPTX • DOCX • CSV • Excel • Markdown • TXT • JSON (Visual Assets Extracted)
              </span>
            </label>
          </div>



          {/* Live Ingestion Pipeline Visualization */}
          {(isProcessing || pipelineStep === 5) && (
            <div className="bg-[#EADBC8]/50 dark:bg-[#102C57]/50 border border-[#DAC0A3] dark:border-[#1E3E62] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#DAC0A3]/60 dark:border-[#1E3E62] pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#102C57] dark:text-[#FEFAF6]" />
                  <span className="font-bold text-[#102C57] dark:text-[#FEFAF6] text-xs truncate max-w-xs">
                    {uploadedDocName}
                  </span>
                </div>
                {pipelineStep === 5 ? (
                  <span className="text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-[#102C57] dark:text-[#FEFAF6]" /> Ready for RAG
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-[#102C57] dark:text-[#FEFAF6] flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Ingesting...
                  </span>
                )}
              </div>

              {/* Steps Progress */}
              <div className="space-y-3">
                {pipelineSteps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isDone = pipelineStep > stepNum || pipelineStep === 5;
                  const isCurrent = pipelineStep === stepNum && pipelineStep !== 5;

                  return (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${
                            isDone
                              ? 'bg-[#102C57] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#102C57]'
                              : isCurrent
                              ? 'bg-[#DAC0A3] text-[#102C57] animate-pulse'
                              : 'bg-[#FEFAF6] dark:bg-[#0B192C] text-[#102C57]/50 dark:text-[#DAC0A3]/60 border border-[#DAC0A3] dark:border-[#1E3E62]'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
                        </div>
                        <div>
                          <span
                            className={`font-semibold block ${
                              isDone || isCurrent ? 'text-[#102C57] dark:text-[#FEFAF6]' : 'text-[#102C57]/50 dark:text-[#DAC0A3]/60'
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="text-[10px] text-[#102C57]/70 dark:text-[#DAC0A3]">{step.desc}</span>
                        </div>
                      </div>

                      {isDone ? (
                        <span className="text-[11px] font-bold text-[#102C57] dark:text-[#FEFAF6]">Complete</span>
                      ) : isCurrent ? (
                        <span className="text-[11px] font-bold text-[#102C57] dark:text-[#FEFAF6] animate-pulse">Running...</span>
                      ) : (
                        <span className="text-[11px] text-[#102C57]/50 dark:text-[#DAC0A3]/60">Waiting</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DAC0A3] dark:border-[#1E3E62] bg-[#EADBC8] dark:bg-[#102C57] flex items-center justify-between">
          <span className="text-xs text-[#102C57]/70 dark:text-[#DAC0A3] font-medium">
            RAG Vector Index Pipeline (512 tokens / chunk)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#102C57] hover:bg-[#1E3E62] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] border border-[#102C57] dark:border-[#DAC0A3] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {pipelineStep === 5 ? 'Done' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
