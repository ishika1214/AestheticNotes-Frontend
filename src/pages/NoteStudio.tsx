import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import BookView from "../components/notes/BookView";
import {
  Pin,
  Globe,
  Lock,
  Palette,
  X,
  Trash2,
  ChevronLeft,
  CloudCheck,
  Sparkles,
  Plus
} from "lucide-react";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RichTextEditor } from "../components/editor/RichTextEditor";
import AIActions from "../components/ai/AIActions";
import api from "../api/axios";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = [
  { name: "Default", value: "bg-white/70 dark:bg-[#4a2d5a]/20 backdrop-blur-xl border-black/5 dark:border-white/10" },
  { name: "Rose", value: "bg-rose-50/70 dark:bg-rose-950/30 backdrop-blur-xl border-rose-100/50 dark:border-rose-900/40" },
  { name: "Amber", value: "bg-amber-50/70 dark:bg-amber-950/30 backdrop-blur-xl border-amber-100/50 dark:border-amber-900/40" },
  { name: "Emerald", value: "bg-emerald-50/70 dark:bg-emerald-950/30 backdrop-blur-xl border-emerald-100/50 dark:border-emerald-900/40" },
  { name: "Blue", value: "bg-blue-50/70 dark:bg-blue-950/30 backdrop-blur-xl border-blue-100/50 dark:border-blue-900/40" },
  { name: "Indigo", value: "bg-indigo-50/70 dark:bg-indigo-950/30 backdrop-blur-xl border-indigo-100/50 dark:border-indigo-900/40" },
  { name: "Violet", value: "bg-violet-50/70 dark:bg-violet-950/30 backdrop-blur-xl border-violet-100/50 dark:border-violet-900/40" },
];

interface NoteStudioProps {
  isNew?: boolean;
}

export default function NoteStudio({ isNew = false }: NoteStudioProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [color, setColor] = useState(COLORS[0].value);
  const [isPublic, setIsPublic] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const { search } = useLocation();
  const queryType = new URLSearchParams(search).get('type') as 'note' | 'novel' | 'diary' | null;

  const [type, setType] = useState<'note' | 'novel' | 'diary'>(queryType || 'note');
  const [sections, setSections] = useState<{ title: string; content: string; date?: string; _id?: string }[]>(
    (queryType === 'novel' || queryType === 'diary') ? [{ title: "Chapter 1", content: "" }] : []
  );
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  // NEW — AI Studio Panel State
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isAIExpanded, setIsAIExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const justCreatedRef = useRef(false);

  useEffect(() => {
    if (!isNew && id && !justCreatedRef.current) {
      fetchNote();
    }
  }, [id, isNew]);

  const fetchNote = async () => {
    try {
      const { data } = await api.get(`/notes`);
      const note = data.find((n: any) => n._id === id);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setEmoji(note.emoji);
        setColor(note.color);
        setIsPublic(note.is_public);
        setIsPinned(note.is_pinned);
        setTags(note.tags);
        setType(note.type || 'note');
        setSections(note.sections || []);
        setCoverUrl(note.cover_image || "");
        setUpdatedAt(note.updated_at);
        // Always open at the last entry/page
        if (note.sections && note.sections.length > 0) {
          setCurrentPage(note.sections.length - 1);
        }
      }
    } catch (error) {
      console.error("Failed to fetch note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const hasSectionsContent = sections.some(s => s.title.trim() || s.content.trim());
    if (!title.trim() && !content.trim() && !hasSectionsContent) return;

    setIsSaving(true);
    try {
      const payload = {
        title,
        content,
        emoji,
        color,
        is_public: isPublic,
        is_pinned: isPinned,
        tags,
        type,
        sections,
        cover_image: coverUrl || null
      };

      if (isNew) {
        const { data } = await api.post("/notes", payload);
        justCreatedRef.current = true;

        navigate(`/note/${data._id}`, { replace: true });
        toast.success("New Masterpiece Persisted ✨");
      } else {
        await api.put(`/notes/${id}`, payload);
        toast.success("Masterpiece Updated ✨");
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Creative block! Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNote = async () => {
    if (!confirm("Delete this masterpiece?")) return;

    try {
      await api.delete(`/notes/${id}`);
      toast.success("Artifact Erased 🗑️");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to erase this artifact.");
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const handleSplitPage = (index: number, keep: string, move: string) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], content: keep };
    
    const newSection = { 
      title: type === 'diary' ? `Entry ${index + 2}` : `Chapter ${index + 2}`, 
      content: move,
      date: new Date().toISOString()
    };
    
    newSections.splice(index + 1, 0, newSection);
    setSections(newSections);
    
    // Calculate new spread index for BookView
    const newSpread = Math.floor((index + 1) / 2);
    setCurrentPage(newSpread);
  };

  // Aggregated content for AI actions
  const aggregatedContent = type === 'note' 
    ? content 
    : sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n');

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-stone-50 dark:bg-black">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/20" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
            Loading Workspace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-screen w-full flex flex-col relative overflow-hidden transition-colors duration-700",
        color
      )}
    >


      {/* HEADER */}
      <header className="relative z-20 h-16 flex items-center justify-between px-6 bg-white/30 dark:bg-black/20 backdrop-blur-2xl border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-6">
          <button
            onClick={async () => {
              if (isNew) {
                if (title.trim() || content.trim()) {
                  await handleSave(); // handleSave handles navigation for new notes
                } else {
                  navigate("/");
                }
              } else {
                await handleSave();
                navigate("/");
              }
            }}
            className="group flex items-center gap-2 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 text-stone-500 group-hover:text-stone-900 dark:group-hover:text-stone-100" />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200">
              Workspace
            </span>
          </button>

          <div className="h-6 w-px bg-black/5 dark:bg-white/10" />

          <div className="flex items-center gap-2">
            {[
              { icon: <Pin className="w-4 h-4" />, active: isPinned, onClick: () => setIsPinned(!isPinned) },
              { icon: isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />, active: isPublic, onClick: () => setIsPublic(!isPublic) }
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                className={cn(
                  "p-2.5 rounded-xl transition-all active:scale-90",
                  btn.active ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" : "hover:bg-black/5 dark:hover:bg-white/5 text-stone-500"
                )}
              >
                {btn.icon}
              </button>
            ))}

            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-stone-500"
              >
                <Palette className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-full left-0 mt-3 p-3 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 flex gap-2"
                  >
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setColor(c.value);
                          setShowColorPicker(false);
                        }}
                        className={cn(
                          "w-8 h-8 rounded-full border border-black/5 transition-all hover:scale-110",
                          c.value,
                          color === c.value && "ring-2 ring-[var(--accent)] ring-offset-2 dark:ring-offset-black"
                        )}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all active:scale-95 group/ai relative overflow-hidden",
                isAIPanelOpen 
                  ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30 border border-white/10" 
                  : "bg-white/50 dark:bg-white/5 hover:bg-[var(--accent)]/10 border border-black/5 dark:border-white/5"
              )}
              title="AI Study Panel"
            >
              <Sparkles className={cn("w-4 h-4 transition-transform group-hover/ai:rotate-12 text-[var(--accent)]", isAIPanelOpen ? "text-white animate-pulse" : "text-[var(--accent)]")} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest leading-none transition-colors",
                isAIPanelOpen ? "text-white" : "text-[var(--accent)]"
              )}>
                AI Studio
              </span>
              {!isAIPanelOpen && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/ai:translate-x-full transition-transform duration-1000" />
              )}
            </button>

            {/* ENTRY CONTROLS (Top Right Outside Book) */}
            {(type === 'diary' || type === 'novel') && (
              <div className="flex items-center gap-2 bg-stone-100/50 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                <button
                  onClick={() => handleSplitPage(currentPage, sections[currentPage].content.slice(0, Math.floor(sections[currentPage].content.length / 2)), sections[currentPage].content.slice(Math.floor(sections[currentPage].content.length / 2)))}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white dark:hover:bg-stone-900 rounded-xl transition-all active:scale-95 text-stone-600 dark:text-stone-300 group/split"
                  title="Split into New Page"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Add Page</span>
                </button>
                <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                <button
                  onClick={() => {
                    const newIndex = sections.length;
                    setSections([...sections, { title: type === 'diary' ? `Entry ${newIndex + 1}` : `Chapter ${newIndex + 1}`, content: "", date: new Date().toISOString() }]);
                    setCurrentPage(newIndex);
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white dark:hover:bg-stone-900 rounded-xl transition-all active:scale-95 text-stone-600 dark:text-stone-300 group/add"
                  title="Start Fresh Chapter"
                >
                  <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Add Chapter</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-100/50 dark:bg-white/5 px-4 py-2 rounded-full">
            <CloudCheck className="w-3.5 h-3.5 text-emerald-500" />
            {isSaving ? "Saving..." : "Saved"}
          </div>
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-stone-900 dark:bg-stone-50 text-white dark:text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
          >
            {isNew ? "Save New Note" : "Save Note"}
          </button>

          {!isNew && (
            <button
              onClick={deleteNote}
              className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm border border-red-500/10"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* MAIN CANVAS */}
        <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide flex flex-col items-center border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5">
        <div className="w-full max-w-4xl px-4 sm:px-12 py-6 sm:py-8 flex flex-col flex-1">
          {/* HEADER — EMOJI + TITLE */}
          <div className="group relative mb-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="relative group/emoji">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-5xl md:text-6xl hover:scale-110 transition-transform active:scale-90"
                >
                  {emoji}
                </button>

                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute top-full left-0 mt-4 z-50"
                    >
                      <EmojiPicker
                        onEmojiClick={(data: EmojiClickData) => {
                          setEmoji(data.emoji);
                          setShowEmojiPicker(false);
                        }}
                        theme={document.documentElement.classList.contains("dark") ? Theme.DARK : Theme.LIGHT}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input
                type="text"
                placeholder="Untitled Thought"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 text-2xl md:text-4xl font-black bg-transparent border-none outline-none placeholder:text-stone-300 dark:placeholder:text-stone-800 tracking-tighter leading-tight"
              />
            </div>

            {/* TAGS */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5"
                >
                  #{tag}
                  <button
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                placeholder="+ Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={addTag}
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-24 placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* MAIN EDITOR / BOOK VIEW */}
          <div className="flex-1 min-h-[500px] w-full">
            {type === 'note' ? (
              <RichTextEditor value={content} onChange={setContent} />
            ) : (
              <BookView 
                type={type as 'novel' | 'diary'} 
                sections={sections}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onUpdateSection={(index, updates) => {
                  const newSections = [...sections];
                  newSections[index] = { ...newSections[index], ...updates };
                  setSections(newSections);
                }}
                onAddSection={() => {
                  setSections([...sections, { title: "New Chapter", content: "" }]);
                }}
                onRemoveSection={(index) => {
                  setSections(sections.filter((_, i) => i !== index));
                }}
              />
            )}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="w-full max-w-4xl px-12 pb-12">
          <div className="h-px w-full bg-black/5 dark:bg-white/5 mb-6" />

          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 italic">
              {isNew
                ? "A new concept takes shape"
                : `Refining ideas since ${format(
                    new Date(updatedAt || Date.now()),
                    "PPPP"
                  )}`}
            </div>

            <p className="text-[9px] font-black uppercase tracking-tight text-stone-300">
              Aesthetic Notes Pro // Creative Studio v1.1
            </p>
          </div>
        </footer>
      </main>

      {/* PERSISTENT AI STUDIO PANEL */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isAIPanelOpen ? (window.innerWidth < 768 ? '100%' : (isAIExpanded ? 850 : 420)) : 0,
          opacity: isAIPanelOpen ? 1 : 0,
          x: isAIPanelOpen ? 0 : (window.innerWidth < 768 ? '100%' : 0)
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "h-full bg-white/70 dark:bg-stone-950/40 backdrop-blur-3xl overflow-hidden flex flex-col border-l border-black/5 dark:border-white/5 z-50",
          "fixed md:relative top-0 right-0 shadow-2xl md:shadow-none"
        )}
      >
        <div className={cn(
          "h-full p-6 sm:p-8 flex flex-col overflow-hidden transition-all duration-500",
          isAIExpanded ? "w-full md:w-[850px]" : "w-full md:w-[420px]"
        )}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">Note AI Studio</h3>
            <button
               onClick={() => setIsAIPanelOpen(false)}
               className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-stone-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <AIActions
            content={aggregatedContent}
            original={{ title, content: aggregatedContent, tags }}
            onUpdate={(u) => {
              if (u.title) setTitle(u.title);
              if (u.content) {
                if (type === 'note') {
                  setContent(u.content);
                } else {
                   // For novels/diaries, we apply the AI update to the current chapter
                   const newSections = [...sections];
                   newSections[currentPage] = { 
                     ...newSections[currentPage], 
                     content: u.content 
                   };
                   setSections(newSections);
                }
              }
              if (u.tags) setTags([...new Set([...tags, ...u.tags])]);
            }}
            onPreviewChange={setIsAIExpanded}
          />
        </div>
      </motion.aside>
     </div>
    </div>
  );
}