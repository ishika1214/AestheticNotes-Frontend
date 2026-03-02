import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Moon,
  Sun,
  LayoutGrid,
  List as ListIcon,
  Hash,
  Pin,
  LogOut,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logout } from "../store/slices/authSlice";
import {
  fetchNotes,
  fetchTags,
  createNote,
  updateNote,
  deleteNote,
} from "../store/slices/noteSlice";
import NoteCard from "../components/notes/NoteCard";
import NoteEditor from "../components/notes/NoteEditor";
import type { Note, NoteUpdate } from "../types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { notes, tags: allTags } = useAppSelector((state) => state.notes);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function getInitialTheme() {
    const savedTheme = localStorage.getItem("theme");

    return (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  }
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    dispatch(fetchNotes());
    dispatch(fetchTags());
  }, [dispatch]);
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleCreateNote = async () => {
    const newNote: NoteUpdate = {
      title: "",
      content: "",
      emoji: "📝",
      color: "bg-white dark:bg-stone-900",
      is_public: false,
      is_pinned: false,
      tags: [],
    };
    const resultAction = await dispatch(createNote(newNote));
    if (createNote.fulfilled.match(resultAction)) {
      setEditingNote(resultAction.payload);
      setIsEditorOpen(true);
    }
  };

  const handleUpdateNote = (id: string, updates: NoteUpdate) => {
    dispatch(updateNote({ id, updates }));
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Are you sure?")) {
      dispatch(deleteNote(id));
      if (editingNote?._id === id) setIsEditorOpen(false);
    }
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => n.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned);
  const otherNotes = filteredNotes.filter((n) => !n.is_pinned);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Plus className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">
              Aesthetic Notes
            </h1>
          </div>

          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search notes, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-200/50 dark:bg-stone-800/50 border-none rounded-full focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              {viewMode === "grid" ? (
                <ListIcon className="w-5 h-5" />
              ) : (
                <LayoutGrid className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => dispatch(logout())}
              className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors text-red-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedTags([])}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                selectedTags.length === 0
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
              )}
            >
              All Notes
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1",
                  selectedTags.includes(tag)
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
                )}
              >
                <Hash className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>
        )}

        {pinnedNotes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
              <Pin className="w-3 h-3" /> Pinned
            </h2>
            <div
              className={cn(
                "grid gap-4",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1",
              )}
            >
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  viewMode={viewMode}
                  onClick={() => {
                    setEditingNote(note);
                    setIsEditorOpen(true);
                  }}
                  onPin={() =>
                    handleUpdateNote(note._id, { is_pinned: !note.is_pinned })
                  }
                />
              ))}
            </div>
          </section>
        )}

        <section>
          {pinnedNotes.length > 0 && (
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
              Others
            </h2>
          )}
          <div
            className={cn(
              "grid gap-4",
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1",
            )}
          >
            {otherNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                viewMode={viewMode}
                onClick={() => {
                  setEditingNote(note);
                  setIsEditorOpen(true);
                }}
                onPin={() =>
                  handleUpdateNote(note._id, { is_pinned: !note.is_pinned })
                }
              />
            ))}
          </div>
        </section>
      </main>

      <button
        onClick={handleCreateNote}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      <AnimatePresence>
        {isEditorOpen && editingNote && (
          <NoteEditor
            note={editingNote}
            onClose={() => setIsEditorOpen(false)}
            onUpdate={(updates) => handleUpdateNote(editingNote._id, updates)}
            onDelete={() => handleDeleteNote(editingNote._id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
