import { useRef } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "../../lib/utils";

interface Section {
  title: string;
  content: string;
  date?: string;
  _id?: string;
}

interface BookViewProps {
  type: 'novel' | 'diary';
  sections: Section[];
  onUpdateSection: (index: number, updates: Partial<Section>) => void;
  onAddSection: () => void;
  onRemoveSection: (index: number) => void;
  isEditing?: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function BookView({ 
  type, 
  sections, 
  onUpdateSection, 
  isEditing = true,
  currentPage,
  onPageChange
}: BookViewProps) {

  // Ensure there's at least one section
  const safeSections = sections.length > 0 ? sections : [{ title: "Untitled", content: "" }];
  const totalPages = safeSections.length;

  const nextPage = () => onPageChange(Math.min(currentPage + 1, totalPages - 1));
  const prevPage = () => onPageChange(Math.max(currentPage - 1, 0));

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[3/4] sm:aspect-[4/5] perspective-1000 group">
      {/* BOOK SPINE/SHADOW EFFECT - THE COVER */}
      <div className={cn(
        "absolute inset-0 rounded-[4px] shadow-2xl transform-style-3d border-8 transition-colors duration-700",
        type === 'diary' 
          ? "bg-[#2d1b1b] dark:bg-[#1a0f0f] border-[#3d2525] dark:border-[#2a1a1a]" 
          : "bg-stone-200 dark:bg-stone-800 border-stone-800/20 dark:border-white/5" 
      )} />
      
      {/* THE PAGE (Centered) */}
      <div className="absolute inset-4 sm:inset-8 bg-white dark:bg-[#1a1a1f] shadow-inner rounded-[2px] overflow-hidden flex flex-col items-center">
        <div className="w-full flex-1 p-6 sm:p-12 relative flex flex-col max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8 opacity-40">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] font-serif italic text-[var(--accent)]">{type}</span>
            <span className="text-[10px] font-black tracking-widest">Page {currentPage + 1} / {totalPages}</span>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-hidden h-full scrollbar-hide"
            >
              <SectionRenderer 
                section={safeSections[currentPage]} 
                index={currentPage}
                onUpdate={onUpdateSection}
                isEditing={isEditing}
                type={type}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="absolute inset-x-0 bottom-[-80px] flex items-center justify-center gap-12">
        <button 
          onClick={prevPage}
          disabled={currentPage === 0}
          className="p-4 bg-white dark:bg-stone-900 shadow-xl rounded-2xl border border-black/5 dark:border-white/10 disabled:opacity-20 transition-all hover:scale-110 active:scale-90"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center">
            <div className="flex gap-1.5 mb-2">
              {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => (
                 <div 
                   key={i} 
                   className={cn(
                     "h-1 transition-all rounded-full",
                     currentPage === i ? "w-8 bg-[var(--accent)]" : "w-1.5 bg-stone-300 dark:bg-stone-700"
                   )} 
                 />
              ))}
              {totalPages > 10 && <span className="text-[8px] font-bold opacity-30">...</span>}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Spread {currentPage + 1} of {totalPages}</span>
         </div>

        <button 
          onClick={nextPage}
          disabled={currentPage >= totalPages - 1}
          className="p-4 bg-white dark:bg-stone-900 shadow-xl rounded-2xl border border-black/5 dark:border-white/10 disabled:opacity-20 transition-all hover:scale-110 active:scale-90"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

function SectionRenderer({ section, index, onUpdate, isEditing, type }: { 
  section: Section, 
  index: number, 
  onUpdate: (i: number, up: any) => void,
  isEditing: boolean,
  type: string
}) {
  const textRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className={cn(
      "h-full flex flex-col relative overflow-hidden",
      type === 'diary' && "bg-[linear-gradient(transparent_27px,#f1f1f1_28px)] dark:bg-[linear-gradient(transparent_27px,#333_28px)] bg-[length:100%_28px] leading-[28px]"
    )}>
       <div className="mb-0 group/title relative">
         {isEditing ? (
           <input 
             value={section.title}
             onChange={(e) => onUpdate(index, { title: e.target.value })}
             placeholder={type === 'diary' ? "Dear Diary..." : "Chapter Title..."}
             className={cn(
               "w-full bg-transparent border-none outline-none font-serif italic placeholder:text-stone-300 dark:placeholder:text-stone-600",
               type === 'diary' ? "text-4xl text-emerald-700 dark:text-emerald-400 mb-2" : "text-2xl text-stone-800 dark:text-stone-100"
             )}
           />
         ) : (
           <h2 className={cn(
             "font-serif italic",
             type === 'diary' ? "text-4xl text-emerald-700 dark:text-emerald-400 mb-2" : "text-2xl text-stone-800 dark:text-stone-100"
           )}>{section.title}</h2>
         )}
         {type !== 'diary' && <div className="h-[1px] w-24 bg-[var(--accent)] mt-2 opacity-50" />}
       </div>
       
       <div className="flex items-center gap-4 mb-8">
          <div className={cn(
            "p-2 rounded-lg flex flex-col items-center justify-center min-w-14",
            type === 'diary' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "opacity-30"
          )}>
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {type === 'diary' && section.date ? format(new Date(section.date), 'MMM') : 'Chapter'}
            </span>
            <span className="text-xl font-black">
              {type === 'diary' && section.date ? format(new Date(section.date), 'dd') : index + 1}
            </span>
          </div>
          <div className="h-4 w-px bg-stone-200 dark:bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
              {type === 'diary' && section.date ? format(new Date(section.date), 'EEEE') : 'Volume One'}
            </span>
            <span className="text-[10px] font-bold opacity-30">
               Automated Chronology
            </span>
          </div>
       </div>

       {isEditing ? (
         <textarea 
           ref={textRef}
           value={section.content}
           onChange={(e) => {
             onUpdate(index, { content: e.target.value });
           }}
           placeholder="Begin your masterpiece..."
           className={cn(
             "flex-1 w-full bg-transparent border-none outline-none resize-none leading-relaxed text-stone-600 dark:text-stone-400 placeholder:text-stone-300 dark:placeholder:text-stone-700 m-0 p-0 scrollbar-hide overflow-hidden",
             type === 'diary' ? "font-serif text-lg tracking-wide" : "font-medium"
           )}
         />
       ) : (
         <p className={cn(
           "flex-1 leading-relaxed text-stone-600 dark:text-stone-400 whitespace-pre-wrap scrollbar-hide overflow-hidden",
           type === 'diary' ? "font-serif text-lg tracking-wide" : "font-medium"
         )}>
           {section.content}
         </p>
       )}
    </div>
  );
}
