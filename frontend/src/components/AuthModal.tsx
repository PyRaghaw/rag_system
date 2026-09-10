import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  Zap,
  AlertCircle
} from 'lucide-react';
import type { UserAccount } from '../types/rag';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
  onContinueAsGuest: () => void;
  initialMode?: 'signup' | 'signin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onContinueAsGuest,
  initialMode = 'signup',
}) => {
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    const userName = mode === 'signup' ? name.trim() : (email.split('@')[0] || 'Enterprise User');
    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      name: userName,
      email: email.trim(),
      role: 'Enterprise Member',
      isGuest: false,
    };

    localStorage.setItem('rag_user', JSON.stringify(newUser));
    onSuccess(newUser);
  };

  const handleGuest = () => {
    const guestUser: UserAccount = {
      id: `guest_${Date.now()}`,
      name: 'Guest User',
      email: 'guest@ephemeral.session',
      role: 'Guest Explorer',
      isGuest: true,
    };
    // Don't save guest permanently in rag_user so they remain guest
    sessionStorage.setItem('rag_guest', JSON.stringify(guestUser));
    onContinueAsGuest();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102C57]/40 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-md bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#DAC0A3] dark:border-[#24487A] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-[#EADBC8] dark:bg-[#102C57] px-6 py-5 border-b border-[#DAC0A3] dark:border-[#24487A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#102C57] dark:bg-[#EADBC8] text-[#FEFAF6] dark:text-[#102C57] flex items-center justify-center font-display font-black text-sm shadow-xs">
              WW
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#102C57] dark:text-[#FEFAF6] leading-snug">
                {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-[11px] text-[#102C57]/70 dark:text-[#DAC0A3] font-medium">
                {mode === 'signup' ? 'Access persistent chat history & vector stores' : 'Sign in to your enterprise workspace'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#102C57]/60 hover:text-[#102C57] dark:text-[#DAC0A3] dark:hover:text-[#FEFAF6] hover:bg-[#DAC0A3]/30 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#DAC0A3]/60 dark:border-[#24487A] bg-[#FEFAF6] dark:bg-[#0B192C]">
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold transition-all text-center border-b-2 cursor-pointer ${
              mode === 'signup'
                ? 'border-[#102C57] dark:border-[#FEFAF6] text-[#102C57] dark:text-[#FEFAF6] bg-[#EADBC8]/30 dark:bg-[#102C57]/30'
                : 'border-transparent text-[#102C57]/60 dark:text-[#DAC0A3] hover:text-[#102C57]'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold transition-all text-center border-b-2 cursor-pointer ${
              mode === 'signin'
                ? 'border-[#102C57] dark:border-[#FEFAF6] text-[#102C57] dark:text-[#FEFAF6] bg-[#EADBC8]/30 dark:bg-[#102C57]/30'
                : 'border-transparent text-[#102C57]/60 dark:text-[#DAC0A3] hover:text-[#102C57]'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#102C57] dark:text-[#DAC0A3]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full bg-[#FEFAF6] dark:bg-[#071322] border border-[#DAC0A3] dark:border-[#24487A] rounded-xl px-3.5 py-2.5 text-xs text-[#102C57] dark:text-[#FEFAF6] placeholder-[#102C57]/40 dark:placeholder-[#DAC0A3]/50 focus:outline-none focus:ring-2 focus:ring-[#102C57] dark:focus:ring-[#FEFAF6]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#102C57] dark:text-[#DAC0A3]" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@enterprise.com"
              className="w-full bg-[#FEFAF6] dark:bg-[#071322] border border-[#DAC0A3] dark:border-[#24487A] rounded-xl px-3.5 py-2.5 text-xs text-[#102C57] dark:text-[#FEFAF6] placeholder-[#102C57]/40 dark:placeholder-[#DAC0A3]/50 focus:outline-none focus:ring-2 focus:ring-[#102C57] dark:focus:ring-[#FEFAF6]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#102C57] dark:text-[#FEFAF6] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#102C57] dark:text-[#DAC0A3]" />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FEFAF6] dark:bg-[#071322] border border-[#DAC0A3] dark:border-[#24487A] rounded-xl px-3.5 py-2.5 text-xs text-[#102C57] dark:text-[#FEFAF6] placeholder-[#102C57]/40 dark:placeholder-[#DAC0A3]/50 focus:outline-none focus:ring-2 focus:ring-[#102C57] dark:focus:ring-[#FEFAF6]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#102C57] hover:bg-[#1E3E62] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#102C57] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer transform active:scale-[0.99]"
          >
            <span>{mode === 'signup' ? 'Create Free Account & Enter' : 'Sign In & Enter Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Guest Mode Divider */}
        <div className="px-6 pb-6 pt-2 border-t border-[#DAC0A3]/60 dark:border-[#24487A] bg-[#EADBC8]/30 dark:bg-[#102C57]/20 space-y-3">
          <div className="flex items-center gap-2 text-center my-1">
            <div className="flex-1 h-px bg-[#DAC0A3]/60 dark:bg-[#24487A]"></div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#102C57]/60 dark:text-[#DAC0A3]">
              or skip registration
            </span>
            <div className="flex-1 h-px bg-[#DAC0A3]/60 dark:bg-[#24487A]"></div>
          </div>

          <button
            type="button"
            onClick={handleGuest}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FEFAF6] dark:bg-[#0B192C] hover:bg-[#EADBC8] dark:hover:bg-[#16386D] text-[#102C57] dark:text-[#FEFAF6] border border-[#DAC0A3] dark:border-[#24487A] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
          >
            <Zap className="w-3.5 h-3.5 text-[#102C57] dark:text-[#DAC0A3] group-hover:scale-110 transition-transform" />
            <span>Continue as Guest</span>
          </button>

          <p className="text-[10px] text-[#102C57]/70 dark:text-[#DAC0A3] text-center leading-relaxed">
            Note: In <strong>Guest Mode</strong>, questions and chat sessions are temporary and will not be saved across browser sessions.
          </p>
        </div>
      </div>
    </div>
  );
};
