import React, { useState } from 'react';
import { X, Sliders, Save, ShieldCheck, Sparkles, Zap, Code2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { AppSettings } from '../types/rag';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [showDevControls, setShowDevControls] = useState(false);

  if (!isOpen) return null;

  // Determine active profile preset based on threshold and chunks
  const isStrict = settings.similarityThreshold >= 0.74 && settings.retrievedChunks <= 4 && settings.groundingMode === 'Documents Only';
  const isFast = settings.similarityThreshold <= 0.66 && settings.retrievedChunks <= 3;
  const isBalanced = !isStrict && !isFast && Math.abs(settings.similarityThreshold - 0.70) <= 0.04;
  const isCustom = !isStrict && !isFast && !isBalanced;

  const applyPreset = (preset: 'strict' | 'balanced' | 'fast') => {
    if (preset === 'strict') {
      onUpdateSettings({
        ...settings,
        similarityThreshold: 0.75,
        retrievedChunks: 4,
        groundingMode: 'Documents Only',
      });
    } else if (preset === 'balanced') {
      onUpdateSettings({
        ...settings,
        similarityThreshold: 0.70,
        retrievedChunks: 6,
        groundingMode: 'Hybrid',
      });
    } else if (preset === 'fast') {
      onUpdateSettings({
        ...settings,
        similarityThreshold: 0.65,
        retrievedChunks: 3,
        groundingMode: 'Hybrid',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] dark:border-[#24487A] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden font-sans transition-colors duration-200 animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#DAC0A3]/60 dark:border-[#24487A] flex items-center justify-between bg-[#EADBC8] dark:bg-[#102C57]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#102C57] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#102C57] flex items-center justify-center font-bold shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-[#102C57] dark:text-[#FEFAF6] text-base sm:text-lg leading-tight">
                  RAG Intelligence & Governance
                </h3>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#102C57]/10 dark:bg-[#FEFAF6]/10 text-[#102C57] dark:text-[#FEFAF6] border border-[#DAC0A3]/60">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-[#102C57]/70 dark:text-[#DAC0A3] font-medium mt-0.5">
                Calibrated AI reasoning, confidence profiles & vector retrieval bounds
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#102C57]/70 hover:text-[#102C57] dark:text-[#DAC0A3] dark:hover:text-[#FEFAF6] rounded-lg hover:bg-[#DAC0A3]/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5 text-xs text-[#102C57] dark:text-[#FEFAF6] max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* AI Foundation Model */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#102C57] dark:text-[#FEFAF6] block text-xs tracking-wide">
              Active LLM Inference Engine
            </label>
            <select
              value={settings.aiModel}
              onChange={(e) => onUpdateSettings({ ...settings, aiModel: e.target.value })}
              className="w-full bg-[#EADBC8] dark:bg-[#102C57] border border-[#DAC0A3] dark:border-[#24487A] rounded-xl p-3 font-semibold text-[#102C57] dark:text-[#FEFAF6] focus:outline-none focus:ring-1 focus:ring-[#102C57] dark:focus:ring-[#FEFAF6] cursor-pointer"
            >
              <option value="gpt-4o">GPT-4o (Enterprise High Precision & Grounding)</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Deep Document Synthesis)</option>
              <option value="gemini-1-5-pro">Gemini 1.5 Pro (Multimodal Vector Architecture)</option>
            </select>
          </div>

          {/* User Intuition Section: High-Level Preset Profiles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-[#102C57] dark:text-[#FEFAF6] block text-xs tracking-wide">
                  Retrieval & Verification Profile
                </label>
                <p className="text-[11px] text-[#102C57]/70 dark:text-[#DAC0A3]">
                  Curated presets tailored for different enterprise operational workflows
                </p>
              </div>
              {isCustom && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EADBC8] dark:bg-[#102C57] text-[#102C57] dark:text-[#DAC0A3] border border-[#DAC0A3]">
                  Custom Calibrated
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Preset 1: Strict Compliance */}
              <button
                type="button"
                onClick={() => applyPreset('strict')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  isStrict
                    ? 'bg-[#102C57] text-[#FEFAF6] border-[#102C57] dark:bg-[#EADBC8] dark:text-[#102C57] dark:border-[#EADBC8] shadow-md'
                    : 'bg-[#EADBC8] dark:bg-[#102C57] border-[#DAC0A3] dark:border-[#24487A] text-[#102C57] dark:text-[#FEFAF6] hover:border-[#102C57] dark:hover:border-[#FEFAF6]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <ShieldCheck className={`w-4 h-4 ${isStrict ? 'text-[#EADBC8] dark:text-[#102C57]' : 'text-[#102C57] dark:text-[#DAC0A3]'}`} />
                    {isStrict && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="font-bold text-xs mt-2">Strict Audit</div>
                  <div className={`text-[10px] mt-1 line-clamp-2 ${isStrict ? 'text-[#FEFAF6]/80 dark:text-[#102C57]/80' : 'text-[#102C57]/70 dark:text-[#DAC0A3]'}`}>
                    Zero-hallucination. Legal & compliance citation lock.
                  </div>
                </div>
                <div className={`text-[9px] font-mono mt-2 pt-1.5 border-t ${isStrict ? 'border-white/20 dark:border-black/20' : 'border-[#DAC0A3]/50'}`}>
                  Cosine: 0.75 | Top-4
                </div>
              </button>

              {/* Preset 2: Balanced Research (Recommended) */}
              <button
                type="button"
                onClick={() => applyPreset('balanced')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  isBalanced
                    ? 'bg-[#102C57] text-[#FEFAF6] border-[#102C57] dark:bg-[#EADBC8] dark:text-[#102C57] dark:border-[#EADBC8] shadow-md'
                    : 'bg-[#EADBC8] dark:bg-[#102C57] border-[#DAC0A3] dark:border-[#24487A] text-[#102C57] dark:text-[#FEFAF6] hover:border-[#102C57] dark:hover:border-[#FEFAF6]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Sparkles className={`w-4 h-4 ${isBalanced ? 'text-[#EADBC8] dark:text-[#102C57]' : 'text-[#102C57] dark:text-[#DAC0A3]'}`} />
                    {isBalanced && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="font-bold text-xs mt-2">Deep Analysis</div>
                  <div className={`text-[10px] mt-1 line-clamp-2 ${isBalanced ? 'text-[#FEFAF6]/80 dark:text-[#102C57]/80' : 'text-[#102C57]/70 dark:text-[#DAC0A3]'}`}>
                    Optimal synthesis across complex cross-document queries.
                  </div>
                </div>
                <div className={`text-[9px] font-mono mt-2 pt-1.5 border-t ${isBalanced ? 'border-white/20 dark:border-black/20' : 'border-[#DAC0A3]/50'}`}>
                  Cosine: 0.70 | Top-6
                </div>
              </button>

              {/* Preset 3: Fast Brief */}
              <button
                type="button"
                onClick={() => applyPreset('fast')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  isFast
                    ? 'bg-[#102C57] text-[#FEFAF6] border-[#102C57] dark:bg-[#EADBC8] dark:text-[#102C57] dark:border-[#EADBC8] shadow-md'
                    : 'bg-[#EADBC8] dark:bg-[#102C57] border-[#DAC0A3] dark:border-[#24487A] text-[#102C57] dark:text-[#FEFAF6] hover:border-[#102C57] dark:hover:border-[#FEFAF6]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Zap className={`w-4 h-4 ${isFast ? 'text-[#FEFAF6] dark:text-[#102C57]' : 'text-[#102C57] dark:text-[#DAC0A3]'}`} />
                    {isFast && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="font-bold text-xs mt-2">Fast Brief</div>
                  <div className={`text-[10px] mt-1 line-clamp-2 ${isFast ? 'text-[#FEFAF6]/80 dark:text-[#102C57]/80' : 'text-[#102C57]/70 dark:text-[#DAC0A3]'}`}>
                    High-speed executive highlights and succinct facts.
                  </div>
                </div>
                <div className={`text-[9px] font-mono mt-2 pt-1.5 border-t ${isFast ? 'border-white/20 dark:border-black/20' : 'border-[#DAC0A3]/50'}`}>
                  Cosine: 0.65 | Top-3
                </div>
              </button>
            </div>
          </div>

          {/* Grounding Mode Enforcement */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#102C57] dark:text-[#FEFAF6] block text-xs">
              Context Grounding Boundary
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, groundingMode: 'Documents Only' })}
                className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  settings.groundingMode === 'Documents Only'
                    ? 'bg-[#EADBC8] dark:bg-[#102C57] border-[#102C57] dark:border-[#FEFAF6] text-[#102C57] dark:text-[#FEFAF6] shadow-sm ring-1 ring-[#102C57] dark:ring-[#FEFAF6]'
                    : 'bg-[#FEFAF6] dark:bg-[#0B192C] border-[#DAC0A3] dark:border-[#24487A] text-[#102C57]/80 dark:text-[#DAC0A3]'
                }`}
              >
                <div className="font-bold">Strict Documents Only</div>
                <div className="text-[10px] text-[#102C57]/70 dark:text-[#DAC0A3] font-normal">
                  Purges external knowledge; strictly cites verified pages
                </div>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, groundingMode: 'Hybrid' })}
                className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  settings.groundingMode === 'Hybrid'
                    ? 'bg-[#EADBC8] dark:bg-[#102C57] border-[#102C57] dark:border-[#FEFAF6] text-[#102C57] dark:text-[#FEFAF6] shadow-sm ring-1 ring-[#102C57] dark:ring-[#FEFAF6]'
                    : 'bg-[#FEFAF6] dark:bg-[#0B192C] border-[#DAC0A3] dark:border-[#24487A] text-[#102C57]/80 dark:text-[#DAC0A3]'
                }`}
              >
                <div className="font-bold">Hybrid Contextual</div>
                <div className="text-[10px] text-[#102C57]/70 dark:text-[#DAC0A3] font-normal">
                  Combines verified sources with general reasoning & explanations
                </div>
              </button>
            </div>
          </div>

          {/* Collapsible Developer / Admin Mathematical Fine-Tuning Drawer */}
          <div className="border border-[#DAC0A3] dark:border-[#24487A] rounded-xl overflow-hidden bg-[#EADBC8]/60 dark:bg-[#102C57]">
            <button
              type="button"
              onClick={() => setShowDevControls(!showDevControls)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#DAC0A3]/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#102C57] dark:text-[#DAC0A3]" />
                <span className="font-bold text-xs text-[#102C57] dark:text-[#FEFAF6]">
                  Developer & Admin Calibration (Raw Math Parameters)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#102C57]/70 dark:text-[#DAC0A3] font-semibold">
                <span>{showDevControls ? 'Hide Sliders' : 'Inspect Sliders'}</span>
                {showDevControls ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showDevControls && (
              <div className="p-4 pt-2 space-y-4 border-t border-[#DAC0A3]/50 dark:border-[#24487A] bg-[#FEFAF6]/80 dark:bg-[#0B192C]/70">
                <p className="text-[11px] text-[#102C57]/80 dark:text-[#DAC0A3] leading-relaxed font-medium">
                  Notice: Regular end users are shielded from these mathematical parameters to prevent hallucination or false refusals. Evaluators and AI engineers can tune them directly below:
                </p>

                {/* Similarity Threshold Slider */}
                <div className="space-y-2 bg-[#EADBC8] dark:bg-[#102C57] p-3.5 rounded-xl border border-[#DAC0A3] dark:border-[#24487A]">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#102C57] dark:text-[#FEFAF6]">
                      Cosine Similarity Cutoff Barrier (Threshold)
                    </label>
                    <span className="font-bold text-[#102C57] dark:text-[#FEFAF6] bg-[#FEFAF6] dark:bg-[#0B192C] px-2.5 py-0.5 rounded-md font-mono border border-[#DAC0A3]">
                      {settings.similarityThreshold.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={0.95}
                    step={0.01}
                    value={settings.similarityThreshold}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, similarityThreshold: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#102C57] dark:accent-[#FEFAF6] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#102C57]/60 dark:text-[#DAC0A3]">
                    <span>0.50 (Permissive)</span>
                    <span className="font-bold">0.72 (Balanced Default)</span>
                    <span>0.95 (Ultra-Strict)</span>
                  </div>
                </div>

                {/* Retrieved Chunks Slider */}
                <div className="space-y-2 bg-[#EADBC8] dark:bg-[#102C57] p-3.5 rounded-xl border border-[#DAC0A3] dark:border-[#24487A]">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#102C57] dark:text-[#FEFAF6]">
                      Retrieved Context Window (Top-K Chunks)
                    </label>
                    <span className="font-bold text-[#102C57] dark:text-[#FEFAF6] bg-[#FEFAF6] dark:bg-[#0B192C] px-2.5 py-0.5 rounded-md font-mono border border-[#DAC0A3]">
                      {settings.retrievedChunks} chunks
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={settings.retrievedChunks}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, retrievedChunks: parseInt(e.target.value) })
                    }
                    className="w-full accent-[#102C57] dark:accent-[#FEFAF6] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#102C57]/60 dark:text-[#DAC0A3]">
                    <span>1 Chunk</span>
                    <span className="font-bold">5 Chunks</span>
                    <span>15 Chunks</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#EADBC8] dark:bg-[#102C57] border-t border-[#DAC0A3]/60 dark:border-[#24487A] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] dark:border-[#24487A] text-[#102C57] dark:text-[#FEFAF6] text-xs font-bold rounded-xl hover:bg-[#EADBC8] dark:hover:bg-[#16386D] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-all cursor-pointer border border-[#102C57] dark:border-[#DAC0A3]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
