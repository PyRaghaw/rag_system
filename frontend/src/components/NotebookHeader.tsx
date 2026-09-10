import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Settings,
  Sparkles,
  Sun,
  Moon,
  Shield,
  Key,
  LogOut,
  ChevronRight,
  Copy,
  Check,
  Database,
  User,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { ThemeSwitch } from './ThemeSwitch';
import type { UserAccount } from '../types/rag';

interface NotebookHeaderProps {
  onOpenSettings: () => void;
  onOpenPipelineVisualizer: () => void;
  onNewChat?: () => void;
  onOpenCommandPalette?: () => void;
  backendConnected?: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onBackToLanding?: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  documentsCount?: number;
  queriesCount?: number;
}

export const NotebookHeader: React.FC<NotebookHeaderProps> = ({
  onOpenSettings,
  onOpenPipelineVisualizer,
  onNewChat,
  onOpenCommandPalette,
  backendConnected = false,
  theme,
  onToggleTheme,
  onBackToLanding,
  currentUser,
  onOpenAuth,
  onLogout,
  documentsCount = 0,
  queriesCount = 0,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [signOutNotif, setSignOutNotif] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('tcs_rag_live_98a7f12e9b04c8');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSignOut = () => {
    setSignOutNotif(true);
    setTimeout(() => {
      setSignOutNotif(false);
      setIsProfileOpen(false);
      onLogout();
    }, 800);
  };

  const isGuest = !currentUser || currentUser.isGuest;
  const userInitials = isGuest
    ? 'G'
    : (currentUser.name || 'User')
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U';

  return (
    <header className="h-16 bg-[#FEFAF6] dark:bg-[#0B192C] border-b border-[#D4B896] dark:border-[#1E3E62] px-4 sm:px-6 flex items-center justify-between z-30 flex-shrink-0 select-none transition-colors duration-200 sticky top-0 shadow-2xs">
      {/* Left: Brand Icon & System Title */}
      <div className="flex items-center gap-3">
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5EBE1] dark:bg-[#102C57] hover:bg-[#EADBC8] dark:hover:bg-[#15386B] border border-[#D4B896] dark:border-[#24487A] text-xs text-[#0C1E3D] dark:text-[#FEFAF6] font-bold transition-all shadow-2xs cursor-pointer"
            title="Return to Product Landing Page"
          >
            <span>←</span>
            <span className="hidden sm:inline">Product Page</span>
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-xl bg-[#0C1E3D] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#0C1E3D] flex items-center justify-center font-display font-black text-xs shadow-xs border border-[#D4B896]">
            WW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm sm:text-base text-[#0C1E3D] dark:text-[#FEFAF6] leading-none">
                Wise Wolves RAG
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-[#F5EBE1] dark:bg-[#102C57] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A]">
                Notebook
              </span>
            </div>
            <p className="text-[10px] text-[#455A7A] dark:text-[#B8C9E0] font-semibold hidden sm:block leading-tight">
              Strict pgvector Grounded Workspace
            </p>
          </div>
        </div>

        {/* Backend Connected Pill */}
        {backendConnected && (
          <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F5EBE1] dark:bg-[#102C57] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AI Connected</span>
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Guest Mode Notice Pill */}
        {isGuest && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs font-bold transition-all cursor-pointer"
            title="Chat history is not saved in Guest Mode. Click to create an account."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Guest Mode (History Not Saved)</span>
            <UserPlus className="w-3.5 h-3.5 ml-0.5" />
          </button>
        )}

        {/* Quick Command Palette Button */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5EBE1] dark:bg-[#102C57] hover:bg-[#EADBC8] dark:hover:bg-[#15386B] border border-[#D4B896] dark:border-[#24487A] text-xs text-[#0C1E3D] dark:text-[#FEFAF6] font-bold transition-all shadow-2xs cursor-pointer"
            title="Quick search & actions (⌘K)"
          >
            <span className="text-xs font-bold">Quick Search</span>
            <kbd className="text-[10px] font-mono bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#D4B896] px-1.5 py-0.5 rounded text-[#0C1E3D] dark:text-[#FEFAF6] ml-1">⌘K</kbd>
          </button>
        )}

        {/* New Chat Quick Button */}
        {onNewChat && (
          <button
            type="button"
            onClick={onNewChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#0C1E3D] hover:bg-[#15386B] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#0C1E3D] border border-[#0C1E3D] dark:border-[#D4B896] shadow-2xs transition-all cursor-pointer"
            title="Start New Chat Thread"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}

        {/* RAG Pipeline Flowchart Button */}
        <button
          type="button"
          onClick={onOpenPipelineVisualizer}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#F5EBE1] dark:bg-[#102C57] hover:bg-[#EADBC8] dark:hover:bg-[#15386B] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A] shadow-2xs transition-colors cursor-pointer"
          title="View RAG Architecture & Flowchart"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0C1E3D] dark:text-[#FEFAF6]" />
          <span>RAG Workflow</span>
        </button>

        {/* Dynamic Morphing Theme Toggle */}
        <div className="flex items-center px-2.5 py-1 rounded-full bg-[#F5EBE1] dark:bg-[#102C57] border border-[#D4B896] dark:border-[#24487A] shadow-2xs">
          <ThemeSwitch theme={theme} onToggleTheme={onToggleTheme} id="header-theme-switch" />
        </div>

        {/* Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 text-[#0C1E3D] dark:text-[#FEFAF6] rounded-full hover:bg-[#F5EBE1] dark:hover:bg-[#102C57] border border-transparent hover:border-[#D4B896] dark:hover:border-[#24487A] transition-all cursor-pointer"
          title="RAG Governance & Calibration"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Profile Avatar Button with Interactive Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="w-9 h-9 rounded-full bg-[#0C1E3D] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#0C1E3D] font-bold text-xs flex items-center justify-center border-2 border-[#D4B896] shadow-sm hover:scale-105 transition-all cursor-pointer relative active:scale-95"
            title={isGuest ? 'Guest User (Click to Sign Up)' : `${currentUser?.name || 'User'} Profile`}
            aria-expanded={isProfileOpen}
          >
            {isGuest ? (
              <User className="w-4 h-4" />
            ) : (
              <span>{userInitials}</span>
            )}
            {/* Active Status Indicator */}
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-[#FEFAF6] dark:border-[#0B192C] rounded-full ${
                isGuest ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            ></span>
          </button>

          {/* User Profile Dropdown Card */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-88 bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#D4B896] dark:border-[#24487A] rounded-2xl shadow-2xl z-50 overflow-hidden font-sans select-none animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Card Header */}
              <div className="p-4 bg-[#F5EBE1] dark:bg-[#102C57] border-b border-[#D4B896] dark:border-[#24487A]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0C1E3D] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#0C1E3D] border border-[#D4B896]/50 font-bold text-base flex items-center justify-center shadow-sm flex-shrink-0">
                    {isGuest ? <User className="w-6 h-6" /> : userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#0C1E3D] dark:text-[#FEFAF6] text-sm truncate">
                        {isGuest ? 'Guest Explorer' : currentUser?.name}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0C1E3D] dark:text-[#FEFAF6] bg-[#FEFAF6] dark:bg-[#0B192C] px-2 py-0.5 rounded-full border border-[#D4B896]">
                        <span className={`w-1.5 h-1.5 rounded-full ${isGuest ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                        {isGuest ? 'Guest' : 'Active'}
                      </span>
                    </div>
                    <p className="text-xs text-[#455A7A] dark:text-[#B8C9E0] truncate">
                      {isGuest ? 'Temporary Session (Not Saved)' : currentUser?.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#0C1E3D] dark:text-[#FEFAF6] font-semibold">
                      <Shield className="w-3 h-3 text-[#0C1E3D] dark:text-[#EADBC8]" />
                      <span>{isGuest ? 'Ephemeral Access' : (currentUser?.role || 'Enterprise Member')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Warning / CTA Banner */}
              {isGuest && (
                <div className="p-3.5 bg-amber-500/10 dark:bg-amber-950/30 border-b border-amber-300 dark:border-amber-800 space-y-2">
                  <div className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <p className="leading-snug font-medium">
                      Chat history & saved threads are disabled in Guest Mode. Create an account to save your sessions permanently.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#0C1E3D] text-[#FEFAF6] dark:bg-[#EADBC8] dark:text-[#0C1E3D] font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer hover:opacity-90 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Free Account / Sign In</span>
                  </button>
                </div>
              )}

              {/* Real Workspace Stats */}
              <div className="p-4 space-y-2.5 border-b border-[#D4B896]/60 dark:border-[#24487A] text-xs">
                <div className="flex items-center justify-between text-[#455A7A] dark:text-[#B8C9E0]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Database className="w-3.5 h-3.5" /> Indexed Documents:
                  </span>
                  <span className="font-bold text-[#0C1E3D] dark:text-[#FEFAF6]">
                    {documentsCount} Docs in pgvector
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#455A7A] dark:text-[#B8C9E0]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5" /> Active Queries:
                  </span>
                  <span className="font-bold text-[#0C1E3D] dark:text-[#FEFAF6]">
                    {queriesCount} in current session
                  </span>
                </div>
              </div>

              {/* Theme Quick Segment in Profile */}
              <div className="p-3 border-b border-[#D4B896]/60 dark:border-[#24487A] bg-[#F5EBE1]/60 dark:bg-[#102C57] flex items-center justify-between">
                <span className="text-xs font-bold text-[#0C1E3D] dark:text-[#FEFAF6]">Theme</span>
                <div className="flex items-center bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#D4B896] dark:border-[#24487A] rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (theme !== 'light') onToggleTheme();
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      theme === 'light'
                        ? 'bg-[#0C1E3D] text-[#FEFAF6] shadow-xs'
                        : 'text-[#455A7A] dark:text-[#B8C9E0] hover:text-[#0C1E3D] dark:hover:text-[#FEFAF6]'
                    }`}
                  >
                    <Sun className="w-3 h-3 text-[#D4B896]" />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (theme !== 'dark') onToggleTheme();
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-[#EADBC8] text-[#0C1E3D] shadow-xs'
                        : 'text-[#455A7A] dark:text-[#B8C9E0] hover:text-[#0C1E3D] dark:hover:text-[#FEFAF6]'
                    }`}
                  >
                    <Moon className="w-3 h-3 text-[#D4B896]" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Action Links */}
              <div className="p-2 space-y-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#0C1E3D] dark:text-[#FEFAF6] hover:bg-[#F5EBE1] dark:hover:bg-[#102C57] font-semibold transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#455A7A] dark:text-[#B8C9E0]" />
                    <span>RAG Governance & Calibration</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4B896]" />
                </button>

                <button
                  type="button"
                  onClick={handleCopyApiKey}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#0C1E3D] dark:text-[#FEFAF6] hover:bg-[#F5EBE1] dark:hover:bg-[#102C57] font-semibold transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#455A7A] dark:text-[#B8C9E0]" />
                    <span>Copy API Key</span>
                  </span>
                  {copiedKey ? (
                    <span className="text-[11px] font-bold text-[#0C1E3D] dark:text-[#FEFAF6] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#D4B896]" />
                  )}
                </button>
              </div>

              {/* Sign Out / Exit Session Button */}
              <div className="p-2 border-t border-[#D4B896]/60 dark:border-[#24487A] bg-[#F5EBE1]/40 dark:bg-[#0B192C]">
                {signOutNotif ? (
                  <div className="text-center py-1.5 text-xs font-bold text-[#0C1E3D] dark:text-[#FEFAF6]">
                    ✓ Signed out successfully
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-[#F5EBE1] dark:hover:bg-[#102C57] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isGuest ? 'Exit Session & Return Home' : 'Sign Out'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
