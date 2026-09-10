import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Lock,
  Clock,
  Sparkles
} from 'lucide-react';
import type { ConversationSummary } from '../api';

interface LeftChatHistoryPanelProps {
  conversations: ConversationSummary[];
  activeThreadId?: string;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  onDeleteThread: (threadId: string) => void;
  onRenameThread: (threadId: string, newTitle: string) => void;
  isGuest: boolean;
  onOpenAuth: (mode?: 'signup' | 'signin') => void;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export const LeftChatHistoryPanel: React.FC<LeftChatHistoryPanelProps> = ({
  conversations,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  onRenameThread,
  isGuest,
  onOpenAuth,
  isMobileDrawer = false,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startRenaming = (e: React.MouseEvent, thread: ConversationSummary) => {
    e.stopPropagation();
    setEditingThreadId(thread.id);
    setEditingTitle(thread.title);
  };

  const saveRenaming = (e: React.MouseEvent | React.FormEvent, threadId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingTitle.trim()) {
      onRenameThread(threadId, editingTitle.trim());
    }
    setEditingThreadId(null);
  };

  const cancelRenaming = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingThreadId(null);
  };

  const handleDelete = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    onDeleteThread(threadId);
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <aside
      className={`${
        isMobileDrawer
          ? 'w-full h-full'
          : 'w-72 lg:w-80 border-r border-[#D4B896] dark:border-[#1E3E62] h-full flex-shrink-0 shadow-xs'
      } bg-[#F5EBE1] dark:bg-[#102C57] flex flex-col justify-between select-none p-3.5 sm:p-4 gap-3 transition-colors duration-200`}
    >
      {/* Top Header with New Chat Button */}
      <div className="space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between border-b border-[#D4B896]/70 dark:border-[#1E3E62] pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0C1E3D] dark:text-[#FEFAF6]" />
            <h3 className="font-display font-black text-[#0C1E3D] dark:text-[#FEFAF6] text-sm">
              Chat History
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {!isGuest && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FEFAF6] dark:bg-[#0B192C] text-[#0C1E3D] dark:text-[#FEFAF6] border border-[#D4B896] dark:border-[#24487A]">
                {conversations.length} saved
              </span>
            )}
            {isMobileDrawer && onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded-lg hover:bg-[#EADBC8]/60 dark:hover:bg-[#15386B] text-[#0C1E3D] dark:text-[#FEFAF6] transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Primary "+ New Chat" Action Button */}
        <button
          type="button"
          onClick={onNewChat}
          className="w-full bg-[#0C1E3D] hover:bg-[#15386B] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#0C1E3D] font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-[#0C1E3D] dark:border-[#D4B896] shadow-sm transition-all active:scale-[0.98] text-xs sm:text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Search Input for Conversations (Members only) */}
        {!isGuest && conversations.length > 0 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#455A7A] dark:text-[#B8C9E0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chat history..."
              className="w-full bg-[#FEFAF6] dark:bg-[#0B192C] text-xs text-[#0C1E3D] dark:text-[#FEFAF6] placeholder-[#455A7A]/70 dark:placeholder-[#B8C9E0]/60 pl-8.5 pr-3 py-1.5 rounded-xl border border-[#D4B896] dark:border-[#24487A] focus:outline-none focus:border-[#0C1E3D] dark:focus:border-[#FEFAF6] font-medium"
            />
          </div>
        )}
      </div>

      {/* Guest Locked State vs Member Chat History List */}
      <div className="flex-1 min-h-0 flex flex-col">
        {isGuest ? (
          /* GUEST PROMPT CARD */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#D4B896] dark:border-[#24487A] space-y-3.5 my-auto shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#EADBC8] dark:bg-[#102C57] text-[#0C1E3D] dark:text-[#EADBC8] flex items-center justify-center shadow-xs border border-[#D4B896]/70">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-black text-xs sm:text-sm text-[#0C1E3D] dark:text-[#FEFAF6]">
                Chat History for Members
              </h4>
              <p className="text-xs text-[#455A7A] dark:text-[#B8C9E0] leading-relaxed font-medium">
                Sign up to save, rename, and resume your conversation threads across browser sessions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="w-full py-2.5 px-3.5 bg-[#0C1E3D] hover:bg-[#15386B] dark:bg-[#EADBC8] dark:hover:bg-[#FEFAF6] text-[#FEFAF6] dark:text-[#0C1E3D] rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
              <span>Sign Up to Unlock</span>
            </button>
          </div>
        ) : (
          /* MEMBER THREADS LIST */
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar min-h-0">
            {filteredConversations.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-xs text-[#455A7A] dark:text-[#B8C9E0] font-medium">
                <MessageSquare className="w-6 h-6 text-[#D4B896] dark:text-[#24487A] mb-1.5" />
                <span>{searchTerm ? 'No matching chats' : 'No saved conversations yet'}</span>
              </div>
            ) : (
              filteredConversations.map((thread) => {
                const isActive = thread.id === activeThreadId;
                const isEditing = editingThreadId === thread.id;

                return (
                  <div
                    key={thread.id}
                    onClick={() => !isEditing && onSelectThread(thread.id)}
                    className={`group relative rounded-xl px-3 py-2 transition-all cursor-pointer flex items-center justify-between gap-2 text-xs ${
                      isActive
                        ? 'bg-[#FEFAF6] dark:bg-[#0B192C] text-[#0C1E3D] dark:text-[#FEFAF6] font-bold border border-[#0C1E3D] dark:border-[#FEFAF6] shadow-xs'
                        : 'text-[#1B2D4B] dark:text-[#EADBC8] hover:bg-[#EADBC8]/40 dark:hover:bg-[#15386B] border border-transparent font-medium'
                    }`}
                  >
                    {/* Thread Title or Inline Rename Input */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-[#0C1E3D] dark:text-[#EADBC8]" />
                      {isEditing ? (
                        <form
                          onSubmit={(e) => saveRenaming(e, thread.id)}
                          className="flex items-center gap-1 min-w-0 flex-1"
                        >
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            autoFocus
                            className="w-full bg-[#FEFAF6] dark:bg-[#0B192C] border border-[#0C1E3D] dark:border-[#FEFAF6] rounded px-1.5 py-0.5 text-xs text-[#0C1E3D] dark:text-[#FEFAF6] focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            type="button"
                            onClick={(e) => saveRenaming(e, thread.id)}
                            className="p-1 text-emerald-600 hover:text-emerald-700 rounded"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelRenaming}
                            className="p-1 text-[#455A7A] hover:text-[#0C1E3D] rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </form>
                      ) : (
                        <div className="truncate min-w-0 flex-1">
                          <span className="truncate block" title={thread.title}>
                            {thread.title}
                          </span>
                          <span className="text-[10px] text-[#455A7A] dark:text-[#B8C9E0] block font-mono">
                            {formatTimestamp(thread.updated_at)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions on Hover: Rename + Delete */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => startRenaming(e, thread)}
                          className="p-1 text-[#455A7A] hover:text-[#0C1E3D] dark:text-[#B8C9E0] dark:hover:text-[#FEFAF6] rounded transition-colors"
                          title="Rename chat"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, thread.id)}
                          className="p-1 text-red-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer Info Pill */}
      <div className="pt-2 border-t border-[#D4B896]/70 dark:border-[#1E3E62] flex-shrink-0 text-center">
        <span className="text-[10px] font-bold text-[#455A7A] dark:text-[#B8C9E0]">
          Wise Wolves Strict pgvector RAG
        </span>
      </div>
    </aside>
  );
};
