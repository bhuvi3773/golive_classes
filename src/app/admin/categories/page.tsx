"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export default function CategoriesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      
      if (res.ok) {
        setShowForm(false);
        setName("");
        setDescription("");
        fetchCategories(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-teal-400" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Manage Sections (Categories)</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-sm bg-teal-500 hover:bg-teal-400 text-slate-900 px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Plus size={16} />
          {showForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 border border-white/10 rounded-xl bg-slate-900/50 shadow-2xl">
          <form onSubmit={handleCreate} className="space-y-4 max-w-xl">
            <div>
              <label className="text-sm font-medium text-slate-400">Category Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Data Science"
                className="w-full mt-1 bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={2}
                className="w-full mt-1 bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500 text-white"
              />
            </div>
            <button disabled={saving} type="submit" className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-2 px-6 rounded-lg transition-colors">
              {saving ? "Saving..." : "Save Category"}
            </button>
          </form>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-slate-500">No categories created yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="glass-card p-6 flex flex-col justify-between rounded-xl border border-white/10 bg-slate-900/40 hover:bg-slate-800/50 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                </div>
                <p className="text-sm text-slate-400">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
