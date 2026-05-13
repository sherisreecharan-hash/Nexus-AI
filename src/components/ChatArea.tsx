import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Paperclip, Image as ImageIcon, X, ArrowDown, Sparkles, Menu } from 'lucide-react';
import { Message as MessageType, ModelId } from '../types';
import Message from './Message';
import ModelSelector from './ModelSelector';
import ThinkingIndicator from './ThinkingIndicator';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ChatAreaProps {
  messages: MessageType[];
  isGenerating: boolean;
  onSendMessage: (content: string, attachments: string[]) => void;
  selectedModel: ModelId;
  onModelChange: (id: ModelId) => void;
  onOpenSidebar?: () => void;
}

export default function ChatArea({
  messages,
  isGenerating,
  onSendMessage,
  selectedModel,
  onModelChange,
  onOpenSidebar
}: ChatAreaProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isAtBottom);
  };

  const handleSend = () => {
    if ((input.trim() || attachments.length > 0) && !isGenerating) {
      onSendMessage(input, attachments);
      setInput('');
      setAttachments([]);
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Check if it's mobile to allow multi-line Enter or send
      if (window.innerWidth > 768) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0D0D0D] relative overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-[#262626] flex items-center justify-between px-3 sm:px-4 shrink-0 bg-[#0D0D0D]/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400"
          >
            <Menu size={20} />
          </button>
          <ModelSelector 
            selectedId={selectedModel} 
            onSelect={onModelChange} 
            disabled={messages.length > 0} 
          />
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
        </div>
      </header>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/20">
              <Sparkles size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">How can I help you today?</h1>
            <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
              Experience the power of Gemini 3.1 Pro. Ask me anything, analyze images, or write code with precision.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full pt-8">
              {[
                "Write a technical blog post about React 19",
                "Explain quantum computing like I'm five",
                "Debug this complex TypeScript interface",
                "Create a high-energy workout plan"
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left hover:border-zinc-700 hover:bg-zinc-800 transition-all text-sm text-zinc-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="pb-32">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isGenerating && (messages.length === 0 || messages[messages.length - 1].role !== 'assistant' || !messages[messages.length - 1].content) && (
              <ThinkingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Scroll Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={scrollToBottom}
            className="absolute bottom-32 right-8 p-2 rounded-full bg-zinc-800/80 backdrop-blur border border-zinc-700 text-white shadow-xl hover:bg-zinc-700 transition-all z-30"
          >
            <ArrowDown size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D] to-transparent z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="relative group">
            {/* Attachment Preview */}
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-4 flex flex-wrap gap-2 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl"
                >
                  {attachments.map((att, i) => (
                    <div key={i} className="relative group/att">
                      <img src={att} alt="" className="w-20 h-20 object-cover rounded-lg border border-zinc-700" />
                      <button
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover/att:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative rounded-3xl bg-zinc-900 border border-zinc-800 focus-within:border-zinc-500 transition-all shadow-2xl overflow-hidden px-4 pt-4 pb-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Message Nexus..."
                className="w-full bg-transparent border-none focus:ring-0 resize-none text-zinc-100 placeholder-zinc-500 py-1 max-h-[200px]"
                rows={1}
              />
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50">
                <div className="flex items-center gap-1">
                  <label className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 cursor-pointer transition-colors">
                    <input type="file" onChange={onFileChange} multiple hidden accept="image/*" />
                    <Paperclip size={18} />
                  </label>
                  <label className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 cursor-pointer transition-colors">
                    <input type="file" onChange={onFileChange} multiple hidden accept="image/*" />
                    <ImageIcon size={18} />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-zinc-500 font-medium hidden sm:block">Press Enter to send</span>
                  <button
                    onClick={handleSend}
                    disabled={(!input.trim() && attachments.length === 0) || isGenerating}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      (input.trim() || attachments.length > 0) && !isGenerating
                        ? "bg-white text-black hover:scale-105 active:scale-95"
                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    )}
                  >
                    <SendHorizontal size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-center text-zinc-600 font-medium uppercase tracking-widest">
            Nexus AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
