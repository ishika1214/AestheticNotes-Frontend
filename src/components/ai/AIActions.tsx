import { 
  Sparkles, 
  AlignLeft, 
  Type, 
  Hash, 
  CheckSquare, 
  RefreshCw, 
  Zap,
  ArrowLeft,
  Check,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { aiService } from '../../services/aiService';
import AILoading from './AILoading';
import AIPreviewScreen from './AIPreviewScreen';
import { useState, useEffect } from 'react';

interface AIActionsProps {
  content: string;
  original: {
    title: string;
    content: string;
    tags: string[];
  };
  onUpdate: (updates: {
    title?: string;
    content?: string;
    tags?: string[];
    summary?: string;
  }) => void;
  onPreviewChange: (isExpanded: boolean) => void;
}

export default function AIActions({ content, original, onUpdate, onPreviewChange }: AIActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  useEffect(() => {
    onPreviewChange(!!previewResult);
  }, [previewResult, onPreviewChange]);

  const handleAI = async (actionId: string, actionLabel: string, fn: () => Promise<any>) => {
    try {
      setIsLoading(true);
      setLoadingMsg(actionLabel);
      const result = await fn();
      if (actionId === 'summarize') {
        let finalResult = result;
        // Secondary safety: if result is a string, try to parse it as JSON
        if (typeof result === 'string') {
          try {
            const start = result.indexOf('{');
            const end = result.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
              finalResult = JSON.parse(result.substring(start, end + 1));
            }
          } catch (e) {
            console.error("Frontend JSON recovery failed:", e);
          }
        }
        setPreviewResult(finalResult);
        setActiveAction(actionId);
      } else {
        if (result) {
          setPreviewResult(result);
          setActiveAction(actionId);
        }
      }
    } catch (error) {
      console.error(`AI Error (${actionLabel}):`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!previewResult) return;
    
    if (typeof previewResult === 'string') {
      if (activeAction === 'title') {
        onUpdate({ title: previewResult });
      } else {
        onUpdate({ content: previewResult });
      }
    } else if (Array.isArray(previewResult)) {
      onUpdate({ tags: previewResult });
    } else if (typeof previewResult === 'object') {
     if (activeAction === 'title') {
          onUpdate({ title: previewResult.title || previewResult });
      } else if (activeAction === 'summarize') {
          // Construct formatted HTML for the full summary result
          const summaryHtml = `
            <h2>Summary</h2>
            <p>${previewResult.summary || ''}</p>
            ${previewResult.keyPoints?.length ? `
              <h2>Key Insights</h2>
              <ul>
                ${previewResult.keyPoints.map((p: string) => `<li>${p}</li>`).join('')}
              </ul>
            ` : ''}
            ${previewResult.actionItems?.length ? `
              <h2>Action Items</h2>
              <ul>
                ${previewResult.actionItems.map((a: string) => `<li>${a}</li>`).join('')}
              </ul>
            ` : ''}
          `.trim();
          
          onUpdate({ summary: previewResult.summary, content: summaryHtml });
      } else {
          onUpdate({ content: previewResult.content || JSON.stringify(previewResult) });
      }
    }
    
    setPreviewResult(null);
    setActiveAction(null);
  };

  const handleDiscard = () => {
    setPreviewResult(null);
    setActiveAction(null);
  };

  const actions = [
    { 
      id: 'summarize', 
      label: 'Summarize', 
      description: 'Condense your notes into key points',
      icon: <AlignLeft className="w-5 h-5" />, 
      gradient: "from-blue-500 to-cyan-400 shadow-blue-500/20",
      handler: () => handleAI('summarize', "Summarizing...", () => aiService.summarize(content)) 
    },
    { 
      id: 'title', 
      label: 'Generate Title', 
      description: 'Find the perfect headline',
      icon: <Type className="w-5 h-5" />, 
      gradient: "from-purple-500 to-pink-500 shadow-purple-500/20",
      handler: () => handleAI('title', "Generating Title...", () => aiService.generateTitle(content)) 
    },
    { 
      id: 'tags', 
      label: 'Intelli-Tags', 
      description: 'Auto-categorize with smart tags',
      icon: <Hash className="w-5 h-5" />, 
      gradient: "from-indigo-500 to-violet-500 shadow-indigo-500/20",
      handler: () => handleAI('tags', "Suggesting Tags...", () => aiService.generateTags(content)) 
    },
    { 
      id: 'professional', 
      label: 'Professional Polish', 
      description: 'Elevate the tone of your writing',
      icon: <RefreshCw className="w-5 h-5" />, 
      gradient: "from-emerald-400 to-teal-500 shadow-emerald-500/20",
      handler: () => handleAI('professional', "Rewriting...", () => aiService.rewrite(content, 'professional')) 
    },
    { 
      id: 'tasks', 
      label: 'Extract Tasks', 
      description: 'Turn your notes into action items',
      icon: <CheckSquare className="w-5 h-5" />, 
      gradient: "from-rose-500 to-red-400 shadow-rose-500/20",
      handler: () => handleAI('tasks', "Extracting Tasks...", () => aiService.extractTasks(content)) 
    },
    { 
      id: 'format', 
      label: 'Deep Cleanup', 
      description: 'Fix formatting and structure',
      icon: <Zap className="w-5 h-5" />, 
      gradient: "from-amber-400 to-orange-500 shadow-amber-500/20",
      handler: () => handleAI('format', "Formatting...", () => aiService.format(content)) 
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl flex items-center justify-center rounded-3xl"
          >
            <AILoading message={loadingMsg} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {previewResult ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={handleDiscard}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Tools
              </button>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDiscard}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-500 hover:bg-stone-200 dark:hover:bg-white/10 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  Discard
                </button>
                <button 
                  onClick={handleApply}
                  className="flex items-center gap-2 px-6 py-2 bg-[var(--accent)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--accent)]/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Check className="w-3 h-3" />
                  Apply Changes
                </button>
              </div>
            </div>

            <AIPreviewScreen 
              action={activeAction || ''}
              original={original}
              result={previewResult}
            />
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col h-full"
          >
            <div className="mb-8 space-y-2">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-[var(--neon-purple)]/10 rounded-xl">
                    <Sparkles className="w-5 h-5 text-[var(--neon-purple)]" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">
                   Note Studio AI
                 </span>
              </div>
              <p className="text-stone-400 dark:text-stone-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Enhance your thoughts with generative intelligence.
              </p>
            </div>

            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide"
            >
              {actions.map((action) => (
                <motion.button
                  key={action.id}
                  variants={item}
                  onClick={action.handler}
                  disabled={isLoading}
                  className="group relative flex items-center gap-4 p-4 rounded-[24px] bg-white dark:bg-stone-900/40 border border-black/5 dark:border-white/5 hover:border-[var(--neon-purple)]/30 transition-all hover:shadow-xl hover:shadow-black/5 text-left disabled:opacity-50"
                >
                  <div className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-stone-700 dark:text-stone-200 mb-0.5">
                      {action.label}
                    </h4>
                    <p className="text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-tight">
                      {action.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
            
            <div className="mt-auto pt-8">
              <div className="p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10">
                <p className="text-[9px] font-bold text-center text-stone-400 uppercase tracking-[0.2em]">
                  Select an action to transform the current draft
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
