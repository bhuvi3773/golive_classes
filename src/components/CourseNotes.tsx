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
        setNotes(notes.filter(n => n._id !== noteId));
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

  if (loading) return <div className="p-6 text-slate-500">Loading notes...</div>;

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
        <Bookmark size={20} className="text-emerald-600" />
        My Notes
      </h3>

      <form onSubmit={handleSave} className="mb-8">
        <div className="relative">
          <textarea
            placeholder="Type a new note here. It will be saved at the current video time."
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            rows={3}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 shadow-sm"
          ></textarea>
          <button 
            type="submit" 
            disabled={isSaving || !newNote.trim()}
            className="absolute bottom-3 right-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
            title="Save Note at Current Time"
          >
            <Plus size={18} />
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
            You don't have any notes for this lecture yet.
          </div>
        ) : (
          notes.map(note => (
            <div key={note._id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow group">
              <button 
                onClick={() => onSeek(note.timestamp)}
                className="flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-bold h-fit shrink-0 transition-colors"
              >
                <Clock size={14} />
                {formatTime(note.timestamp)}
              </button>
              <p className="text-slate-700 text-sm flex-1 whitespace-pre-wrap mt-0.5">{note.text}</p>
              <button 
                onClick={() => handleDelete(note._id)}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-fit"
                title="Delete note"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
