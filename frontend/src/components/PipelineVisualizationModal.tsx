import React, { useState } from 'react';
import {
  X,
  Database,
  Cpu,
  FileText,
  ShieldCheck,
  Search,
  Brain,
  CheckCircle2,
  GitBranch,
  Sparkles,
  ArrowRight,
  Clock,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface PipelineVisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PipelineStep {
  id: string;
  title: string;
  category: 'INGEST' | 'RETRIEVAL' | 'VALIDATION' | 'GENERATION';
  desc: string;
  latency: string;
  icon: React.ElementType;
  details: {
    engine: string;
    params: string[];
    guarantee: string;
  };
}

export const PipelineVisualizationModal: React.FC<PipelineVisualizationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'stateGraph'>('pipeline');
  const [selectedStepId, setSelectedStepId] = useState<string>('step-3');

  if (!isOpen) return null;

  const steps: PipelineStep[] = [
    {
      id: 'step-1',
      title: '1. Query Intent & Guardrail Router',
      category: 'VALIDATION',
      desc: 'Sanitizes natural language query, validates prompt injections, and classifies intent into factual lookup or conversational query.',
      latency: '24ms',
      icon: Search,
      details: {
        engine: 'LangGraph Intent Classifier',
        params: ['intent_type: informational', 'prompt_injection_check: PASS', 'scope: scoped_docs'],
        guarantee: 'Rejects prompt injections and out-of-domain conversational queries.',
      },
    },
    {
      id: 'step-2',
      title: '2. Dense Vector Embedding Generation',
      category: 'INGEST',
      desc: 'Transforms raw user question into 768-dimensional normalized vector embeddings using cosine vector space.',
      latency: '45ms',
      icon: Cpu,
      details: {
        engine: 'Dense Normalized Embeddings (768d)',
        params: ['dimensions: 768', 'normalization: L2 unit norm', 'metric: cosine distance'],
        guarantee: 'Fast vectorization with semantic granularity.',
      },
    },
    {
      id: 'step-3',
      title: '3. pgvector Cosine Nearest Neighbor Retrieval',
      category: 'RETRIEVAL',
      desc: 'Executes approximate nearest neighbor scan across all indexed document chunks filtered by selected source IDs.',
      latency: '22ms',
      icon: Database,
      details: {
        engine: 'PostgreSQL 16 + pgvector',
        params: ['distance = cosine (vector_cosine_ops)', 'top_k = 5', 'hybrid_keyword = true'],
        guarantee: 'Filters search space strictly to user-checked documents.',
      },
    },
    {
      id: 'step-4',
      title: '4. Context Relevance & Hard Relevance Gate',
      category: 'RETRIEVAL',
      desc: 'Evaluates candidate chunks against user query, pruning passages below similarity threshold unless explicitly scoped.',
      latency: '15ms',
      icon: FileText,
      details: {
        engine: 'Hard Relevance Gatekeeper',
        params: ['threshold = 0.35', 'max_chunks_admitted = 5', 'scope_override = true'],
        guarantee: 'Eliminates weak matches to prevent erroneous contextual drift.',
      },
    },
    {
      id: 'step-5',
      title: '5. Grounded LLM Context Synthesis',
      category: 'GENERATION',
      desc: 'Feeds strictly bounded contextual chunks to the reasoning model with zero external memory allowance (Zero Hallucination Directive).',
      latency: '310ms',
      icon: Brain,
      details: {
        engine: 'OpenRouter Llama-3.3-70B / Rephraser',
        params: ['temperature = 0.0', 'top_p = 1.0', 'citation_format = JSON_ANCHOR'],
        guarantee: 'Returns deterministic refusal if information is absent from context.',
      },
    },
    {
      id: 'step-6',
      title: '6. Citation Anchoring & Streaming Output',
      category: 'VALIDATION',
      desc: 'Extracts exact page numbers, section headers, and snippet offsets, verifying attributions before streaming tokens over SSE.',
      latency: '18ms',
      icon: ShieldCheck,
      details: {
        engine: 'Fact Attribution & Source Anchoring Engine',
        params: ['protocol: Server-Sent Events (SSE)', 'confidence_scoring: active', 'snippet_highlighting: true'],
        guarantee: 'Every statement is backed by verifiable document citations.',
      },
    },
  ];

  const selectedStep = steps.find((s) => s.id === selectedStepId) || steps[2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] dark:border-[#24487A] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden font-sans transition-colors duration-200 animate-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-[#DAC0A3]/60 dark:border-[#24487A] flex items-center justify-between bg-[#EADBC8] dark:bg-[#102C57] flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#102C57] dark:bg-[#FEFAF6] flex items-center justify-center text-[#FEFAF6] dark:text-[#102C57] shadow-sm">
              <GitBranch className="w-5 h-5 text-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-[#102C57] dark:text-[#FEFAF6] text-base sm:text-lg leading-tight">
                  LangGraph RAG Execution Architecture
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-[#102C57] dark:text-[#FEFAF6] bg-[#FEFAF6] dark:bg-[#0B192C] px-2 py-0.5 rounded-full border border-[#DAC0A3]">
                  <CheckCircle2 className="w-3 h-3 text-current" /> Live
                </span>
              </div>
              <p className="text-xs text-[#102C57]/70 dark:text-[#DAC0A3] font-medium">
                Deterministic 6-stage workflow ensuring zero-hallucination grounded responses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center bg-[#FEFAF6] dark:bg-[#0B192C] p-1 rounded-xl text-xs font-bold border border-[#DAC0A3] dark:border-[#24487A]">
              <button
                type="button"
                onClick={() => setActiveTab('pipeline')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'pipeline'
                    ? 'bg-[#102C57] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#102C57] shadow-xs'
                    : 'text-[#102C57]/70 dark:text-[#DAC0A3] hover:text-[#102C57] dark:hover:text-[#FEFAF6]'
                }`}
              >
                Pipeline View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('stateGraph')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'stateGraph'
                    ? 'bg-[#102C57] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#102C57] shadow-xs'
                    : 'text-[#102C57]/70 dark:text-[#DAC0A3] hover:text-[#102C57] dark:hover:text-[#FEFAF6]'
                }`}
              >
                State Graph
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#102C57]/70 hover:text-[#102C57] dark:text-[#DAC0A3] dark:hover:text-[#FEFAF6] rounded-lg hover:bg-[#DAC0A3]/30 transition-colors cursor-pointer ml-2"
              title="Close Architecture View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar bg-[#FEFAF6] dark:bg-[#0B192C] space-y-6">
          {activeTab === 'pipeline' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: 6-Step Interactive Vertical Pipeline */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#102C57]/70 dark:text-[#DAC0A3]">
                    Execution Stages
                  </span>
                  <span className="text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Avg Latency: ~547ms
                  </span>
                </div>

                {steps.map((step) => {
                  const Icon = step.icon;
                  const isSelected = step.id === selectedStepId;
                  return (
                    <div
                      key={step.id}
                      onClick={() => setSelectedStepId(step.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-[#EADBC8] dark:bg-[#102C57] border-[#102C57] dark:border-[#FEFAF6] shadow-sm ring-1 ring-[#102C57] dark:ring-[#FEFAF6]'
                          : 'bg-[#EADBC8]/60 dark:bg-[#102C57]/60 border-[#DAC0A3] dark:border-[#24487A] hover:border-[#102C57] dark:hover:border-[#FEFAF6]'
                      }`}
                    >
                      {/* Step Icon */}
                      <div
                        className="w-10 h-10 rounded-xl bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] flex items-center justify-center flex-shrink-0 font-bold"
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Step Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-[#102C57] dark:text-[#FEFAF6] text-xs sm:text-sm truncate">
                            {step.title}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FEFAF6] dark:bg-[#0B192C] text-[#102C57] dark:text-[#FEFAF6] font-semibold flex-shrink-0 border border-[#DAC0A3]">
                            {step.latency}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#102C57]/70 dark:text-[#DAC0A3] line-clamp-1 mt-0.5 font-medium">
                          {step.desc}
                        </p>
                      </div>

                      {/* Selection Chevron */}
                      <ChevronRight
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${
                          isSelected ? 'text-[#102C57] dark:text-[#FEFAF6] translate-x-0.5' : 'text-[#102C57]/30 dark:text-[#DAC0A3]/30'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Node Inspector Card */}
              <div className="lg:col-span-5 bg-[#EADBC8] dark:bg-[#102C57] border border-[#DAC0A3] dark:border-[#24487A] rounded-2xl p-5 shadow-xs space-y-4 sticky top-0">
                <div className="flex items-center gap-2 pb-3 border-b border-[#DAC0A3]/50 dark:border-[#24487A]">
                  <SlidersHorizontal className="w-4 h-4 text-[#102C57] dark:text-[#FEFAF6]" />
                  <h4 className="font-bold text-[#102C57] dark:text-[#FEFAF6] text-sm">
                    Node Configuration & Guardrails
                  </h4>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#102C57]/70 dark:text-[#DAC0A3] uppercase tracking-wider block mb-1">
                    Stage Engine
                  </span>
                  <p className="text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] font-mono bg-[#FEFAF6] dark:bg-[#0B192C] p-2.5 rounded-xl border border-[#DAC0A3] dark:border-[#24487A]">
                    {selectedStep.details.engine}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#102C57]/70 dark:text-[#DAC0A3] uppercase tracking-wider block mb-1.5">
                    Active Hyperparameters
                  </span>
                  <div className="space-y-1.5">
                    {selectedStep.details.params.map((param, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs font-mono text-[#102C57] dark:text-[#FEFAF6] bg-[#FEFAF6] dark:bg-[#0B192C] px-2.5 py-1.5 rounded-lg border border-[#DAC0A3]/70 dark:border-[#24487A]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#102C57] dark:bg-[#FEFAF6]"></span>
                        <span>{param}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#102C57] dark:text-[#FEFAF6] uppercase tracking-wider block mb-1">
                    Enterprise Guarantee
                  </span>
                  <div className="p-3 rounded-xl bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] dark:border-[#24487A] text-xs text-[#102C57] dark:text-[#FEFAF6] leading-relaxed font-medium">
                    {selectedStep.details.guarantee}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#DAC0A3]/50 dark:border-[#24487A] flex items-center justify-between text-[11px] text-[#102C57]/70 dark:text-[#DAC0A3] font-mono">
                  <span>Target Node: {selectedStep.id}</span>
                  <span className="font-bold">100% Deterministic</span>
                </div>
              </div>
            </div>
          ) : (
            /* STATE GRAPH DIAGRAM VIEW */
            <div className="bg-[#EADBC8] dark:bg-[#102C57] border border-[#DAC0A3] dark:border-[#24487A] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#102C57] dark:text-[#FEFAF6] text-sm">
                    LangGraph State Transition Machine
                  </h4>
                  <p className="text-xs text-[#102C57]/70 dark:text-[#DAC0A3]">
                    Cyclic graph representation showing fallback routing when context is insufficient.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEFAF6] dark:bg-[#0B192C] text-[#102C57] dark:text-[#FEFAF6] border border-[#DAC0A3] dark:border-[#24487A]">
                  StateGraph&lt;RAGState&gt;
                </span>
              </div>

              {/* Visual Flow diagram boxes */}
              <div className="flex flex-col md:flex-row items-stretch justify-between gap-3 pt-2">
                <div className="flex-1 p-4 rounded-xl border border-[#DAC0A3] bg-[#FEFAF6] dark:bg-[#0B192C] text-center">
                  <span className="text-[10px] font-bold text-[#102C57]/70 dark:text-[#DAC0A3] uppercase">START</span>
                  <h5 className="font-bold text-xs text-[#102C57] dark:text-[#FEFAF6] mt-1">user_query</h5>
                  <p className="text-[10px] text-[#102C57]/70 dark:text-[#DAC0A3] mt-1">Input ingestion & intent parse</p>
                </div>

                <div className="hidden md:flex items-center justify-center text-[#102C57]/40 dark:text-[#DAC0A3]/40">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className="flex-1 p-4 rounded-xl border border-[#DAC0A3] bg-[#FEFAF6] dark:bg-[#0B192C] text-center">
                  <span className="text-[10px] font-bold text-[#102C57]/70 dark:text-[#DAC0A3] uppercase">RETRIEVAL</span>
                  <h5 className="font-bold text-xs text-[#102C57] dark:text-[#FEFAF6] mt-1">vector_retrieve</h5>
                  <p className="text-[10px] text-[#102C57]/70 dark:text-[#DAC0A3] mt-1">HNSW ANN search in pgvector</p>
                </div>

                <div className="hidden md:flex items-center justify-center text-[#102C57]/40 dark:text-[#DAC0A3]/40">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className="flex-1 p-4 rounded-xl border border-[#DAC0A3] bg-[#FEFAF6] dark:bg-[#0B192C] text-center">
                  <span className="text-[10px] font-bold text-[#102C57]/70 dark:text-[#DAC0A3] uppercase">GATEWAY</span>
                  <h5 className="font-bold text-xs text-[#102C57] dark:text-[#FEFAF6] mt-1">grade_relevance</h5>
                  <p className="text-[10px] text-[#102C57]/70 dark:text-[#DAC0A3] mt-1">Threshold similarity &gt;= 0.72</p>
                </div>

                <div className="hidden md:flex items-center justify-center text-[#102C57]/40 dark:text-[#DAC0A3]/40">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className="flex-1 p-4 rounded-xl border border-[#DAC0A3] bg-[#FEFAF6] dark:bg-[#0B192C] text-center">
                  <span className="text-[10px] font-bold text-[#102C57]/70 dark:text-[#DAC0A3] uppercase">SYNTHESIS</span>
                  <h5 className="font-bold text-xs text-[#102C57] dark:text-[#FEFAF6] mt-1">generate_grounded</h5>
                  <p className="text-[10px] text-[#102C57]/70 dark:text-[#DAC0A3] mt-1">Bounded reasoning with citations</p>
                </div>
              </div>

              {/* Conditional Branching Note */}
              <div className="p-4 rounded-xl bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] dark:border-[#24487A] text-xs space-y-2">
                <span className="font-bold text-[#102C57] dark:text-[#FEFAF6] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-current" />
                  Fallback Routing Policy
                </span>
                <p className="text-[#102C57]/80 dark:text-[#DAC0A3] leading-relaxed text-xs">
                  If <code className="font-mono font-bold text-[#102C57] dark:text-[#FEFAF6]">grade_relevance</code> finds no chunks exceeding the similarity threshold of 0.72, LangGraph immediately branches to the deterministic refusal state (&ldquo;I couldn&rsquo;t find this information in the available documents&rdquo;). This guarantees that the system never fabricates speculative answers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 sm:p-5 border-t border-[#DAC0A3]/60 dark:border-[#24487A] bg-[#EADBC8] dark:bg-[#102C57] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#102C57] dark:text-[#FEFAF6]">
            <ShieldCheck className="w-4 h-4 text-current" />
            <span className="font-bold">Zero-Hallucination Grounding Rule: Enforced</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#102C57] dark:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] border border-[#102C57] dark:border-[#DAC0A3] rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            Close Architecture
          </button>
        </div>

      </div>
    </div>
  );
};
