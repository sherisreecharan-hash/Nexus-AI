import React from 'react';
import { Plus, MessageSquare, Trash2, Settings2, X } from 'lucide-react';
import { ChatSession } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onClose
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "fixed inset-y-0 left-0 w-72 bg-[#0D0D0D] border-r border-[#262626] flex flex-col z-[100] transition-transform duration-300 transform lg:static lg:translate-x-0 lg:w-64",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#262626] hover:bg-[#1A1A1A] transition-all text-sm font-medium text-white group"
          >
            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-black group-hover:scale-110 transition-transform">
              <Plus size={14} strokeWidth={3} />
            </div>
            New Chat
          </button>
          
          <button
            onClick={onClose}
            className="lg:hidden ml-2 p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <X size={20} />
          </button>
        </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <AnimatePresence initial={false}>
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                currentSessionId === session.id 
                  ? "bg-[#1A1A1A] text-white" 
                  : "text-zinc-400 hover:text-white hover:bg-[#1A1A1A]/50"
              )}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare size={16} className="shrink-0" />
              <span className="truncate flex-1 text-sm">{session.title || "Untitled Chat"}</span>
              
              <button
                onClick={(e) => onDeleteSession(e, session.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-[#262626]">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <Settings2 size={18} />
          <span>Settings</span>
        </button>
      </div>
      </div>
    </>
  );
}
