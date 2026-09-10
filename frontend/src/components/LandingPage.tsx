import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Database,
  GitBranch,
  Zap,
  User,
  ChevronDown,
  FileCheck2
} from 'lucide-react';
import { ThemeSwitch } from './ThemeSwitch';
import type { UserAccount } from '../types/rag';

interface LandingPageProps {
  onEnterWorkspace: () => void;
  onOpenAuth: (mode?: 'signup' | 'signin') => void;
  onContinueAsGuest: () => void;
  currentUser: UserAccount | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterWorkspace,
  onOpenAuth,
  onContinueAsGuest,
  currentUser,
  theme,
  onToggleTheme,
}) => {
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-[#FEFAF6] dark:bg-[#0B192C] text-[#0C1E3D] dark:text-[#FEFAF6] font-sans antialiased transition-colors duration-200 selection:bg-[#E2C9A8] selection:text-[#0C1E3D] relative overflow-x-hidden">
      {/* Background Decorative Atmosphere Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-[#EADBC8]/40 dark:from-[#102C57]/25 via-transparent to-transparent pointer-events-none -z-10" />
      <div className="absolute top-64 -left-48 w-96 h-96 bg-[#D4B896]/20 dark:bg-[#1E3E62]/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 -right-48 w-96 h-96 bg-[#EADBC8]/30 dark:bg-[#102C57]/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* 1. GLOBAL STICKY GLASS HEADER                                            */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FEFAF6]/85 dark:bg-[#0B192C]/85 border-b border-[#D4B896]/70 dark:border-[#1E3E62] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0C1E3D] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#0C1E3D] flex items-center justify-center shadow-md font-display font-black text-sm tracking-wider border border-[#D4B896]">
              WW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-base sm:text-lg tracking-tight text-[#0C1E3D] dark:text-[#FEFAF6]">
                  Wise Wolves RAG
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-[#F5EBE1] dark:bg-[#102C57] text-[#0C1E3D] dark:text-[#EADBC8] border border-[#D4B896] dark:border-[#24487A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  TCS Hackathon
                </span>
              </div>
              <p className="text-[11px] text-[#455A7A] dark:text-[#B8C9E0] font-semibold hidden sm:block">
                Strict Document-Only Enterprise Intelligence
              </p>
            </div>
          </div>

          {/* Nav Links & Controls */}
          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-[#1B2D4B] dark:text-[#B8C9E0]">
              <a href="#features" className="hover:text-[#0C1E3D] dark:hover:text-[#FEFAF6] transition-colors relative py-1 group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0C1E3D] dark:bg-[#EADBC8] transition-all duration-200 group-hover:w-full" />
              </a>
              <a href="#architecture" className="hover:text-[#0C1E3D] dark:hover:text-[#FEFAF6] transition-colors relative py-1 group">
                Architecture
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0C1E3D] dark:bg-[#EADBC8] transition-all duration-200 group-hover:w-full" />
              </a>
              <a href="#creator" className="hover:text-[#0C1E3D] dark:hover:text-[#FEFAF6] transition-colors relative py-1 group">
                The Team
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0C1E3D] dark:bg-[#EADBC8] transition-all duration-200 group-hover:w-full" />
              </a>
              <a href="#faq" className="hover:text-[#0C1E3D] dark:hover:text-[#FEFAF6] transition-colors relative py-1 group">
                FAQ
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0C1E3D] dark:bg-[#EADBC8] transition-all duration-200 group-hover:w-full" />
              </a>
            </nav>

            {/* Dynamic Morphing Theme Toggle */}
            <div className="flex items-center px-2.5 py-1.5 rounded-full bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#24487A] shadow-2xs">
              <ThemeSwitch theme={theme} onToggleTheme={onToggleTheme} id="landing-theme-switch" />
            </div>

            {/* User Auth Buttons or Launch Workspace */}
            {currentUser && !currentUser.isGuest ? (
              <button
                type="button"
                onClick={onEnterWorkspace}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#0C1E3D] hover:bg-[#15386B] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#0C1E3D] font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  className="px-3 sm:px-4 py-2 rounded-xl text-[#0C1E3D] dark:text-[#FEFAF6] hover:bg-[#F5EBE1] dark:hover:bg-[#102C57] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#0C1E3D] hover:bg-[#15386B] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#0C1E3D] font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH DUAL CTAs & LIVE PRODUCT TEASER                     */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#24487A] text-xs font-bold text-[#0C1E3D] dark:text-[#EADBC8] shadow-xs animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>TCS Hackathon 2026 Special Project</span>
            <span className="text-[#D4B896] dark:text-[#24487A]">•</span>
            <span className="font-extrabold text-[#0C1E3D] dark:text-[#FEFAF6]">pgvector HNSW + LangGraph Routing</span>
          </div>

          {/* Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-[#0C1E3D] dark:text-[#FEFAF6] leading-[1.12]">
              Strict Enterprise Document Intelligence with{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Zero Hallucinations.</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[#D4B896]/50 dark:bg-[#1E3E62] -z-0 rounded-sm" />
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-[#1B2D4B] dark:text-[#EADBC8] max-w-2xl mx-auto font-medium leading-relaxed">
              Engineered for compliance, legal, and engineering teams. Powered by PostgreSQL pgvector HNSW indexing,
              stateful LangGraph routing, and 100% verifiable cryptographic citations.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col items-center gap-3.5 pt-2">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {currentUser && !currentUser.isGuest ? (
                <button
                  type="button"
                  onClick={onEnterWorkspace}
                  className="px-7 sm:px-9 py-3.5 rounded-xl bg-[#0C1E3D] hover:bg-[#15386B] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#0C1E3D] font-extrabold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-lg hover:shadow-xl cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Enter RAG Notebook Workspace</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('signup')}
                    className="px-7 sm:px-9 py-3.5 rounded-xl bg-[#0C1E3D] hover:bg-[#15386B] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#0C1E3D] font-extrabold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-lg hover:shadow-xl cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Create Free Account & Start</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={onContinueAsGuest}
                    className="px-6 sm:px-8 py-3.5 rounded-xl bg-[#F5EBE1] hover:bg-[#EADBC8] dark:bg-[#102C57] dark:hover:bg-[#15386B] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A] font-extrabold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer group shadow-xs hover:shadow-md"
                  >
                    <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Try without Account (Instant Guest Mode)</span>
                  </button>
                </>
              )}

              <a
                href="#creator"
                className="px-5 py-3.5 rounded-xl bg-transparent hover:bg-[#F5EBE1]/60 dark:hover:bg-[#102C57]/60 text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A] font-bold text-sm sm:text-base flex items-center gap-2 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Meet The Team</span>
              </a>
            </div>

            {(!currentUser || currentUser.isGuest) && (
              <p className="text-xs text-[#455A7A] dark:text-[#B8C9E0] font-semibold text-center max-w-md">
                ⚡ Guest Mode gives instant testing access without signup. Chat history is saved locally for authenticated members.
              </p>
            )}
          </div>

          {/* ========================================================================= */}
          {/* LIVE PRODUCT TEASER CARD (Simulated Grounded Verification)                */}
          {/* ========================================================================= */}
          <div className="pt-6 max-w-3xl mx-auto text-left">
            <div className="rounded-2xl bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#1E3E62] shadow-xl overflow-hidden">
              {/* Teaser Header */}
              <div className="px-4 py-3 bg-[#EADBC8]/70 dark:bg-[#0B192C]/70 border-b border-[#D4B896] dark:border-[#1E3E62] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
                  <span className="ml-2 font-mono font-bold text-[#0C1E3D] dark:text-[#FEFAF6]">
                    pgvector · Live Grounding Engine
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 font-mono font-extrabold text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Cosine Similarity: 0.942
                </span>
              </div>

              {/* Teaser Dialogue */}
              <div className="p-5 space-y-4 text-xs sm:text-sm">
                {/* User Prompt */}
                <div className="flex justify-end">
                  <div className="bg-[#0C1E3D] text-[#FEFAF6] rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-md font-medium shadow-xs">
                    What is the parental leave duration and eligibility criteria?
                  </div>
                </div>

                {/* Assistant Output */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Verified Grounded in Active Sources</span>
                  </div>

                  <p className="text-[#1B2D4B] dark:text-[#EADBC8] leading-relaxed font-medium">
                    Employees are eligible for <strong>16 weeks of fully paid parental leave</strong> following the birth or adoption of a child. To qualify, staff must have completed a minimum of <strong>12 months of continuous service</strong> with the organization.
                  </p>

                  {/* Citation Pills */}
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-[#455A7A] dark:text-[#B8C9E0]">
                      Proven Sources:
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#D4B896] dark:border-[#24487A] text-[11px] font-bold text-[#0C1E3D] dark:text-[#FEFAF6] shadow-2xs">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      Parental_Leave_Policy.pdf · Page 2 · Section: Eligibility
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE ENTERPRISE PILLARS (BENTO GRID)                                   */}
      {/* ========================================================================= */}
      <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#455A7A] dark:text-[#B8C9E0] block">
            Pillars of Reliability
          </span>
          <h2 className="font-display font-black text-2xl sm:text-4xl text-[#0C1E3D] dark:text-[#FEFAF6]">
            Architected for Strict Enterprise Rigor
          </h2>
          <p className="text-xs sm:text-sm text-[#1B2D4B] dark:text-[#EADBC8] font-medium leading-relaxed">
            Every layer from ingestion to recursive chunking and LangGraph workflow orchestration is engineered for zero data leaks and 100% verifiable citations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#1E3E62] space-y-3 hover:shadow-lg transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-[#0C1E3D] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#0C1E3D] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-[#0C1E3D] dark:text-[#FEFAF6]">
              Strict Document Isolation
            </h3>
            <p className="text-xs text-[#1B2D4B] dark:text-[#EADBC8] leading-relaxed font-medium">
              If an answer cannot be grounded in your selected vector documents, the system refuses to extrapolate. No hallucinated facts.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#1E3E62] space-y-3 hover:shadow-lg transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-[#0C1E3D] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#0C1E3D] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-[#0C1E3D] dark:text-[#FEFAF6]">
              pgvector + HNSW Indexing
            </h3>
            <p className="text-xs text-[#1B2D4B] dark:text-[#EADBC8] leading-relaxed font-medium">
              PostgreSQL native vector storage with Hierarchical Navigable Small World (HNSW) indexing for sub-10ms semantic retrieval.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#1E3E62] space-y-3 hover:shadow-lg transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-[#0C1E3D] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#0C1E3D] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-[#0C1E3D] dark:text-[#FEFAF6]">
              LangGraph State Workflows
            </h3>
            <p className="text-xs text-[#1B2D4B] dark:text-[#EADBC8] leading-relaxed font-medium">
              Cyclic conditional graph routing that passes queries through query validation, semantic retrieval, and hard relevance gates.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#1E3E62] space-y-3 hover:shadow-lg transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-[#0C1E3D] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#0C1E3D] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-[#0C1E3D] dark:text-[#FEFAF6]">
              Deterministic Citations
            </h3>
            <p className="text-xs text-[#1B2D4B] dark:text-[#EADBC8] leading-relaxed font-medium">
              Every claim features interactive citation tags that open original document excerpts with exact page and section provenance.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. 5-STEP PIPELINE FLOW DIAGRAM WITH CONNECTOR TRACK                     */}
        {/* ========================================================================= */}
        <div id="architecture" className="mt-16 p-6 sm:p-10 rounded-3xl bg-[#F5EBE1] dark:bg-[#0B192C] border border-[#D4B896] dark:border-[#1E3E62] space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4B896]/70 dark:border-[#1E3E62] pb-5">
            <div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-[#0C1E3D] dark:text-[#FEFAF6]">
                End-to-End Enterprise RAG Architecture
              </h3>
              <p className="text-xs sm:text-sm text-[#455A7A] dark:text-[#B8C9E0] font-medium mt-1">
                How enterprise documents travel from secure ingestion to mathematically verified conversational output.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-[#EADBC8] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#24487A] font-bold text-[#0C1E3D] dark:text-[#FEFAF6]">
                Deterministic State Loop
              </span>
            </div>
          </div>

          {/* 5 Connected Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
            {[
              {
                num: '01',
                title: 'Ingestion & Parse',
                desc: 'Multi-format PDF, DOCX, PPT, CSV extraction with fallback visual heading snapshotting.',
              },
              {
                num: '02',
                title: 'Recursive Chunking',
                desc: '512-token chunks with 64-token overlap to maintain contextual continuity.',
              },
              {
                num: '03',
                title: 'pgvector HNSW',
                desc: 'Dense embeddings stored in PostgreSQL with high-dimensional indexed similarity.',
              },
              {
                num: '04',
                title: 'LangGraph Routing',
                desc: 'Stateful relevance filtering, threshold evaluation, and fail-closed gate routing.',
              },
              {
                num: '05',
                title: 'Grounded Output',
                desc: 'Streaming response paired with cryptographic citation tags and visual evidence.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-[#FEFAF6] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#24487A] flex flex-col justify-between space-y-3 relative shadow-2xs hover:shadow-md transition-shadow"
              >
                <div className="font-mono text-sm font-black text-[#D4B896] dark:text-[#B8C9E0]/60">
                  {step.num}
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-[#0C1E3D] dark:text-[#FEFAF6]">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-[#455A7A] dark:text-[#B8C9E0] mt-1.5 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ABOUT THE CREATOR & ARCHITECT SHOWCASE                                 */}
      {/* ========================================================================= */}
      {/* 5. ABOUT THE CREATORS & ARCHITECTS SHOWCASE                               */}
      {/* ========================================================================= */}
      <section id="creator" className="py-16 sm:py-24 bg-[#F5EBE1]/60 dark:bg-[#102C57]/30 border-t border-[#D4B896] dark:border-[#1E3E62]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#455A7A] dark:text-[#B8C9E0] block">
              The Minds Behind Wise Wolves
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-[#0C1E3D] dark:text-[#FEFAF6]">
              Meet the Architects &amp; Developers
            </h2>
            <p className="text-xs sm:text-sm text-[#1B2D4B] dark:text-[#EADBC8] font-medium leading-relaxed">
              Engineered collaboratively — <strong>Raghaw Shukla</strong> (Backend, ML &amp; Vector Architecture) &amp; <strong>Srinjoyee Dey</strong> (Full Frontend Architecture &amp; Backend Engineering Contributor).
            </p>
          </div>

          {/* Profile Cards Showcase: 2 Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Developer 1: Raghaw Shukla (Backend & ML) */}
            <div className="bg-[#FEFAF6] dark:bg-[#0B192C] rounded-3xl border border-[#D4B896] dark:border-[#1E3E62] p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden transition-all hover:shadow-2xl">
              <div className="space-y-6">
                {/* Header: Monogram + Info */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0C1E3D] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#0C1E3D] flex items-center justify-center font-display font-black text-2xl sm:text-3xl shadow-xl border-3 border-[#D4B896] flex-shrink-0">
                    RS
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0C1E3D] dark:text-[#FEFAF6]">
                      Raghaw Shukla
                    </h3>
                    <p className="text-xs sm:text-sm text-[#455A7A] dark:text-[#B8C9E0] font-semibold">
                      AI Systems Engineer &amp; Backend / ML Architect
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#24487A] text-[11px] font-bold text-[#0C1E3D] dark:text-[#FEFAF6]">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Backend &amp; ML Lead</span>
                    </div>
                  </div>
                </div>

                {/* Story / Engineering Focus */}
                <div className="space-y-2.5">
                  <h4 className="font-display font-bold text-sm sm:text-base text-[#0C1E3D] dark:text-[#FEFAF6]">
                    Engineering Philosophy: Beyond the Chatbot Wrapper
                  </h4>
                  <p className="text-xs sm:text-sm text-[#1B2D4B] dark:text-[#EADBC8] leading-relaxed font-medium">
                    Architected <strong>Wise Wolves RAG</strong> as a strict, document-bounded intelligence engine. Engineered the asynchronous FastAPI backend, stateful LangGraph multi-node workflows, PostgreSQL pgvector HNSW indexing, OpenRouter semantic embeddings, and fail-closed relevance gates that eliminate hallucinations with mathematical certainty.
                  </p>
                </div>

                {/* Tech Stack Chips */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#455A7A] dark:text-[#B8C9E0] block">
                    Core Technical Stack &amp; Tooling:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Python & FastAPI',
                      'LangGraph Workflows',
                      'PostgreSQL & pgvector',
                      'HNSW Indexing',
                      'OpenRouter Embeddings',
                      'Hybrid BM25 + Vector',
                      'Fail-Closed Gatekeeper',
                    ].map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#F5EBE1] dark:bg-[#102C57] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A] text-[11px] font-bold shadow-2xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-[#D4B896]/40 dark:border-[#1E3E62]/60">
                <button
                  type="button"
                  onClick={onEnterWorkspace}
                  className="px-4 py-2 rounded-xl bg-[#0C1E3D] hover:bg-[#15386B] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#0C1E3D] font-extrabold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href="https://github.com/raghawshukla"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#F5EBE1] hover:bg-[#EADBC8] dark:bg-[#102C57] dark:hover:bg-[#15386B] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A] font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </a>

                <a
                  href="https://linkedin.com/in/raghaw-shukla"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#F5EBE1] hover:bg-[#EADBC8] dark:bg-[#102C57] dark:hover:bg-[#15386B] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A] font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Developer 2: Srinjoyee Dey (Frontend & UI/UX) */}
            <div className="bg-[#FEFAF6] dark:bg-[#0B192C] rounded-3xl border border-[#D4B896] dark:border-[#1E3E62] p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden transition-all hover:shadow-2xl">
              <div className="space-y-6">
                {/* Header: Monogram + Info */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0C1E3D] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#0C1E3D] flex items-center justify-center font-display font-black text-2xl sm:text-3xl shadow-xl border-3 border-[#D4B896] flex-shrink-0">
                    SD
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0C1E3D] dark:text-[#FEFAF6]">
                      Srinjoyee Dey
                    </h3>
                    <p className="text-xs sm:text-sm text-[#455A7A] dark:text-[#B8C9E0] font-semibold">
                      Lead Frontend Architect &amp; Full-Stack Contributor
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#24487A] text-[11px] font-bold text-[#0C1E3D] dark:text-[#FEFAF6]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Complete Frontend Architecture &amp; Backend Collaboration</span>
                    </div>
                  </div>
                </div>

                {/* Story / Engineering Focus */}
                <div className="space-y-2.5">
                  <h4 className="font-display font-bold text-sm sm:text-base text-[#0C1E3D] dark:text-[#FEFAF6]">
                    Complete Frontend Architecture &amp; Full-Stack Contribution
                  </h4>
                  <p className="text-xs sm:text-sm text-[#1B2D4B] dark:text-[#EADBC8] leading-relaxed font-medium">
                    Architected and built the entire frontend application from scratch from the ground up. Engineered the responsive React 19 &amp; TypeScript workspace, real-time Server-Sent Events (SSE) token streaming UX, interactive source citations inspection drawers, and fluid light/dark design token system. In addition to owning 100% of the frontend engineering, actively assisted and contributed to the backend integration, API endpoints, and full-stack workflow.
                  </p>
                </div>

                {/* Tech Stack Chips */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#455A7A] dark:text-[#B8C9E0] block">
                    Core Technical Stack &amp; Tooling:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Complete Frontend Engineering',
                      'React 19 & TypeScript',
                      'Vite & TailwindCSS System',
                      'Real-Time SSE Streaming',
                      'Responsive Mobile & Desktop UX',
                      'FastAPI Integration & Backend Support',
                      'Full-Stack Collaboration',
                    ].map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#F5EBE1] dark:bg-[#102C57] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A] text-[11px] font-bold shadow-2xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-[#D4B896]/40 dark:border-[#1E3E62]/60">
                <button
                  type="button"
                  onClick={onEnterWorkspace}
                  className="px-4 py-2 rounded-xl bg-[#0C1E3D] hover:bg-[#15386B] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#0C1E3D] font-extrabold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href="https://www.linkedin.com/in/srinjoyee-dey/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#F5EBE1] hover:bg-[#EADBC8] dark:bg-[#102C57] dark:hover:bg-[#15386B] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A] font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn Profile</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ENTERPRISE FAQ (EXPANDABLE ACCORDIONS)                                 */}
      {/* ========================================================================= */}
      <section id="faq" className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0C1E3D] dark:text-[#FEFAF6]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#455A7A] dark:text-[#B8C9E0] font-semibold">
            Common queries regarding strict document grounding and provenance verification.
          </p>
        </div>

        <div className="space-y-3.5">
          {[
            {
              q: "Why is document-only RAG superior to a regular AI chatbot?",
              a: "Standard chatbots will synthesize answers even when they don't know the exact answer, which is dangerous in enterprise environments. Wise Wolves RAG guarantees that every sentence is backed by an exact chunk retrieved from your verified vector corpus."
            },
            {
              q: "How does the interactive citation inspector work?",
              a: "Whenever the AI cites a source, clicking that badge slides open the right-side inspector drawer displaying the exact PDF page, raw chunk excerpt, cosine similarity metric, and document metadata."
            },
            {
              q: "Can I configure similarity thresholds and retrieval parameters?",
              a: "Yes. The Settings modal provides instant presets (Balanced, Strict Enterprise, Fast Brief) plus a developer drawer with granular sliders for cosine thresholds, top-K chunks, and model selection."
            },
            {
              q: "Is my uploaded document data kept private?",
              a: "Yes. All vectors are stored locally in your dedicated PostgreSQL pgvector instance. No uploaded document contents are used to train public LLM weights."
            }
          ].map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#24487A] overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#EADBC8]/40 dark:hover:bg-[#15386B]/40 transition-colors"
                >
                  <h4 className="font-bold text-sm sm:text-base text-[#0C1E3D] dark:text-[#FEFAF6]">
                    {faq.q}
                  </h4>
                  <ChevronDown
                    className={`w-4 h-4 text-[#0C1E3D] dark:text-[#FEFAF6] flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#1B2D4B] dark:text-[#EADBC8] leading-relaxed font-medium border-t border-[#D4B896]/50 dark:border-[#24487A]/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CONVERTING FOOTER                                                     */}
      {/* ========================================================================= */}
      <footer className="py-12 bg-[#F5EBE1] dark:bg-[#102C57] border-t border-[#D4B896] dark:border-[#1E3E62] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-display font-black text-base text-[#0C1E3D] dark:text-[#FEFAF6]">
                Wise Wolves RAG
              </span>
              <span className="text-xs text-[#D4B896] dark:text-[#B8C9E0]/60">•</span>
              <span className="text-xs font-bold text-[#455A7A] dark:text-[#B8C9E0]">
                Designed &amp; Built by Raghaw Shukla &amp; Srinjoyee Dey
              </span>
            </div>
            <p className="text-xs text-[#455A7A] dark:text-[#B8C9E0]/80 font-medium">
              Submitted for TCS Hackathon 2026. Built with PostgreSQL pgvector, LangGraph & React.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {currentUser && !currentUser.isGuest ? (
              <button
                type="button"
                onClick={onEnterWorkspace}
                className="px-5 py-2.5 rounded-xl bg-[#0C1E3D] hover:bg-[#15386B] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#0C1E3D] font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="px-4 py-2.5 rounded-xl bg-[#FEFAF6] dark:bg-[#0B192C] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:bg-[#EADBC8]"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Try as Guest</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 py-2.5 rounded-xl bg-[#0C1E3D] hover:bg-[#15386B] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#0C1E3D] font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <span>Sign Up Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
