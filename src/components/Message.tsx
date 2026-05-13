import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Sparkles, Copy, Check } from 'lucide-react';
import { Message as MessageType } from '../types';
import { cn, formatTime } from '../lib/utils';
import { useState } from 'react';
import { motion } from 'motion/react';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group flex w-full max-w-4xl mx-auto px-4 py-8 gap-4 sm:gap-6",
        isAssistant ? "bg-zinc-900/10" : ""
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 shadow-sm",
        isAssistant 
          ? "bg-gradient-to-br from-purple-500 to-blue-600 text-white" 
          : "bg-zinc-800 text-zinc-400"
      )}>
        {isAssistant ? <Sparkles size={16} /> : <User size={16} />}
      </div>

      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {isAssistant ? "Nexus AI" : "You"}
          </span>
          <span className="text-[10px] text-zinc-600 tabular-nums">
            {formatTime(message.timestamp)}
          </span>
        </div>

        <div className="prose prose-invert max-w-none prose-sm sm:prose-base prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
            {message.attachments.map((base64, i) => (
              <img 
                key={i} 
                src={base64} 
                alt="attachment" 
                className="aspect-square w-full object-cover rounded-xl border border-zinc-800 shadow-lg"
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-lg bg-zinc-800/50 lg:bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-1.5 text-[10px] sm:text-xs font-medium"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
