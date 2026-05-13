import { motion } from 'motion/react';
import { Search, Brain, Globe, FileText, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const STEPS = [
  { id: 'search', text: 'Searching knowledge base...', icon: Globe },
  { id: 'analyze', text: 'Analyzing sources...', icon: Search },
  { id: 'think', text: 'Synthesizing response...', icon: Brain },
  { id: 'write', text: 'Finalizing...', icon: FileText },
];

export default function ThinkingIndicator() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Search size={16} className="text-zinc-400" />
          </motion.div>
        </div>
        <span className="text-sm font-medium text-zinc-300">Searching...</span>
      </div>

      <div className="ml-11 flex flex-col gap-2">
        {STEPS.map((step, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;

          if (index > currentStep) return null;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              {isDone ? (
                <CheckCircle2 size={12} className="text-emerald-500" />
              ) : (
                <step.icon size={12} className="text-zinc-500 animate-pulse" />
              )}
              <span className={`text-[11px] ${isDone ? 'text-zinc-500' : 'text-zinc-300'}`}>
                {step.text}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
