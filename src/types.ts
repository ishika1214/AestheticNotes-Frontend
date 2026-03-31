export interface Note {
  _id: string;
  title: string;
  content: string;
  emoji: string;
  color: string;
  is_public: boolean;
  is_pinned: boolean;
  cover_image: string | null;
  tags: string[];
  type: 'note' | 'novel' | 'diary';
  sections: { title: string; content: string; date?: string; _id?: string }[];
  created_at: string;
  updated_at: string;
}

export type NoteUpdate = Partial<Omit<Note, '_id' | 'created_at' | 'updated_at'>>;
