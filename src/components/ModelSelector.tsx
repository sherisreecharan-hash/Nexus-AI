import { Zap, Sparkles, Cpu, ChevronDown } from 'lucide-react';
import { ModelId } from '../types';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const MODELS = [
  {
    id: 'gemini-3.1-pro-preview' as ModelId,
    name: 'Gemini 1.5 Pro',
    description: 'Google\'s most capable model for complex reasoning.',
    icon: Sparkles,
    color: 'text-purple-400'
  },
  {
    id: 'gpt-4o' as ModelId,
    name: 'GPT-4o',
    description: 'OpenAI\'s flagship multimodal model.',
    icon: Sparkles,
    color: 'text-emerald-400'
  },
  {
    id: 'claude-3-5-sonnet' as ModelId,
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic\'s most intelligent and fastest model.',
    icon: Sparkles,
    color: 'text-orange-400'
  },
  {
    id: 'llama-3.1-405b' as ModelId,
    name: 'Llama 3.1 405B',
    description: 'Meta\'s powerful open-weights flagship.',
    icon: Cpu,
    color: 'text-blue-400'
  },
  {
    id: 'mistral-large' as ModelId,
    name: 'Mistral Large',
    description: 'Mistral\'s top-tier reasoning model.',
    icon: Zap,
    color: 'text-red-400'
  },
  {
    id: 'gemini-3-flash-preview' as ModelId,
    name: 'Gemini Flash',
    description: 'Fast and responsive for everyday tasks.',
    icon: Zap,
    color: 'text-yellow-400'
  }
];

interface ModelSelectorProps {
  selectedId: ModelId;
  onSelect: (id: ModelId) => void;
  disabled?: boolean;
}

export default function ModelSelector({ selectedId, onSelect, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModel = MODELS.find(m => m.id === selectedId) || MODELS[0];

  return (
    <div className="relative">
      <button
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#262626] bg-[#0D0D0D] hover:bg-[#1A1A1A] transition-all text-sm font-medium text-zinc-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <selectedModel.icon size={16} className={selectedModel.color} />
        <span>{selectedModel.name}</span>
        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-64 bg-[#0D0D0D] border border-[#262626] rounded-xl shadow-2xl p-1 z-50 overflow-hidden"
            >
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelect(model.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all hover:bg-[#1A1A1A]",
                    selectedId === model.id ? "bg-[#1A1A1A]" : ""
                  )}
                >
                  <div className={cn("mt-0.5", model.color)}>
                    <model.icon size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{model.name}</div>
                    <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{model.description}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
