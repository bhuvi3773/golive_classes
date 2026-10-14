"use client";

import { useState, useEffect } from "react";
import { Bookmark, Plus, Trash2, Clock } from "lucide-react";

interface CourseNotesProps {
  courseId: string;
  lectureId: number;
  getCurrentTime: () => number;
  onSeek: (time: number) => void;
}

export default function CourseNotes({ courseId, lectureId, getCurrentTime, onSeek }: CourseNotesProps) {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [courseId, lectureId]);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/notes?lectureId=${lectureId}`);
      const data = await res.json();
      if (Array.isArray(data)) setNotes(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSaving(true);
    
    const timestamp = getCurrentTime();

    try {
      const res = await fetch(`/api/courses/${courseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureId, text: newNote, timestamp })
      });
      if (res.ok) {
        setNewNote("");
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
    setIsSaving(false);
  };

  const handleDelete = async (noteId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/notes?noteId=${noteId}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== noteId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) return <div className="p-6 text-[#556960] text-sm">Loading scholar notes...</div>;

  return (
    <div className="p-6 text-[#1B2E26]">
      <div className="flex items-center gap-2 mb-6">
        <Bookmark size={20} className="text-[#24483C]" />
        <h3 className="font-serif text-xl font-bold text-[#1B2E26]">
          Personal Study Notes
        </h3>
      </div>

      <form onSubmit={handleSave} className="mb-8">
        <div className="relative">
          <textarea
            placeholder="Record an annotation or key insight. It will be indexed to the current playback timestamp."
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            rows={3}
            className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#24483C] text-[#1B2E26] placeholder:text-[#556960]/60 resize-none shadow-sm"
          ></textarea>
          <button 
            type="submit" 
            disabled={isSaving || !newNote.trim()}
            className="absolute bottom-3 right-3 bg-[#24483C] hover:bg-[#1B2E26] disabled:opacity-50 text-[#F8F4EC] p-2 rounded-lg transition-colors shadow-sm"
            title="Index note at current playback timestamp"
          >
            <Plus size={16} />
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-[#556960] bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl text-sm">
            You haven't recorded any notes for this lecture yet.
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl p-4 flex gap-4 shadow-sm hover:border-[#24483C]/30 transition-all group">
              <button 
                onClick={() => onSeek(note.timestamp)}
                className="flex items-center justify-center gap-1.5 bg-[#DCE6D8] text-[#24483C] hover:bg-[#24483C] hover:text-[#F8F4EC] px-3 py-1.5 rounded-lg text-xs font-mono font-bold h-fit shrink-0 transition-colors"
              >
                <Clock size={13} />
                {formatTime(note.timestamp)}
              </button>
              <p className="text-[#1B2E26] text-xs flex-1 whitespace-pre-wrap leading-relaxed mt-0.5">{note.text}</p>
              <button 
                onClick={() => handleDelete(note.id)}
                className="text-[#556960] hover:text-[#8B381A] opacity-0 group-hover:opacity-100 transition-opacity p-1 h-fit"
                title="Remove note"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
