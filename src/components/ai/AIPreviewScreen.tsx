import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AIPreviewScreenProps {
  action: string;
  original: {
    title: string;
    content: string;
    tags: string[];
  };
  result: any;
}

export default function AIPreviewScreen({ action, original, result }: AIPreviewScreenProps) {
  const getComparisonData = () => {
    switch (action) {
      case 'title':
        return {
          label: 'Title Suggestion',
          left: original.title || 'Untitled Thought',
          right: typeof result === 'string' ? result : result.title || result,
          isFullWidth: true
        };
      case 'tags':
        return {
          label: 'Suggested Tags',
          left: original.tags.join(', ') || 'No tags',
          right: Array.isArray(result) ? result.join(', ') : result,
          isFullWidth: true
        };
      case 'summarize':
        return {
          label: 'Summary Preview',
          left: original.content,
          right: result.summary || result,
          type: 'content'
        };
      case 'professional':
        return {
          label: 'Polished Version',
          left: original.content,
          right: result.content || result,
          type: 'content'
        };
      case 'tasks':
        return {
          label: 'Extracted Tasks',
          left: original.content,
          right: result,
          type: 'content'
        };
      case 'format':
        return {
          label: 'Formatted Draft',
          left: original.content,
          right: result,
          type: 'content'
        };
      default:
        return {
          label: 'AI Suggestion',
          left: original.content,
          right: result,
          type: 'content'
        };
    }
  };

  const data = getComparisonData();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="mb-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-1">
          Review Transformation
        </h4>
        <p className="text-[14px] font-serif italic text-stone-600 dark:text-stone-300">
          {data.label}
        </p>
      </div>

      <div className={cn(
        "flex-1 grid gap-6 min-h-0",
        data.isFullWidth ? "grid-rows-2" : "grid-cols-2"
      )}>
        {/* ORIGINAL SIDE */}
        <div className="flex flex-col min-h-0 bg-stone-50 dark:bg-black/20 rounded-3xl border border-black/5 dark:border-white/5 p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-4 opacity-40">
            <span className="text-[9px] font-black uppercase tracking-widest">Original Draft</span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {action === 'title' ? (
              <p className="text-xl font-bold text-stone-400">
                {original.title || 'Untitled Thought'}
              </p>
            ) : action === 'tags' ? (
              <div className="text-sm text-stone-400">
                {original.tags.join(', ') || 'No tags'}
              </div>
            ) : (
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none opacity-60 text-stone-500 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: original.content }}
                />
            )}
          </div>
        </div>

        {/* TRANSITION ICON (only in side-by-side mode) */}
        {!data.isFullWidth && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-stone-900 rounded-full border border-black/5 dark:border-white/5 flex items-center justify-center shadow-xl">
            <ArrowRight className="w-4 h-4 text-[var(--accent)]" />
          </div>
        )}

        {/* SUGGESTED SIDE */}
        <div className="flex flex-col min-h-0 bg-white dark:bg-[#1a1a1f] rounded-3xl border border-[var(--accent)]/20 p-6 overflow-hidden relative shadow-2xl shadow-[var(--accent)]/5">
          <div className="absolute top-0 right-0 p-4">
            <Sparkles className="w-4 h-4 text-[var(--accent)] opacity-20" />
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">AI Suggestion</span>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide">
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
             >
                {action === 'title' ? (
                  <p className="text-xl font-bold text-stone-800 dark:text-stone-100 italic font-serif">
                    {typeof result === 'string' ? result : result.title || result}
                  </p>
                ) : action === 'tags' ? (
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(result) ? result : [result]).map((tag: string) => (
                      <span key={tag} className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black uppercase tracking-widest rounded-lg border border-[var(--accent)]/20 shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary Section */}
                    {(result.summary || typeof result === 'string') && (
                      <div>
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
                          <span className="w-4 h-px bg-stone-300 dark:bg-stone-700" />
                          The Essence
                        </h5>
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none text-stone-800 dark:text-stone-100 leading-relaxed font-serif text-[15px]"
                          dangerouslySetInnerHTML={{ __html: result.summary || (typeof result === 'string' ? result : '') }}
                        />
                      </div>
                    )}

                    {/* Key Points Section */}
                    {Array.isArray(result.keyPoints) && result.keyPoints.length > 0 && (
                      <div>
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
                          <span className="w-4 h-px bg-stone-300 dark:bg-stone-700" />
                          Core Insights
                        </h5>
                        <ul className="space-y-3">
                          {result.keyPoints.map((point: string, i: number) => (
                            <li key={i} className="flex gap-3 text-[13px] text-stone-600 dark:text-stone-300 leading-snug">
                               <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 opacity-40" />
                               {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Items Section */}
                    {Array.isArray(result.actionItems) && result.actionItems.length > 0 && (
                      <div>
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] mb-3 flex items-center gap-2">
                          <span className="w-4 h-px bg-[var(--accent)]/30" />
                          Missions
                        </h5>
                        <ul className="space-y-2">
                          {result.actionItems.map((item: string, i: number) => (
                            <li key={i} className="flex gap-3 text-[13px] font-medium text-stone-800 dark:text-stone-100 leading-snug p-3 bg-white dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5">
                               <span className="shrink-0 text-[var(--accent)] font-bold">✓</span>
                               {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* RAW FALLBACK — only if nothing else matched */}
                    {!result.summary && !Array.isArray(result.keyPoints) && typeof result !== 'string' && (
                      <div className="p-4 bg-stone-100 dark:bg-black/40 rounded-2xl overflow-x-auto">
                        <pre className="text-[10px] text-stone-500 font-mono">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
             </motion.div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[var(--accent)]/5 rounded-2xl border border-[var(--accent)]/10">
        <p className="text-[9px] font-bold text-center text-[var(--accent)] uppercase tracking-widest leading-relaxed">
          The AI has processed your request. Review the changes above and click "Apply" to merge them into your official masterpiece.
        </p>
      </div>
    </div>
  );
}
