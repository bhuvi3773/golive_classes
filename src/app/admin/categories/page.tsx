"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, FolderTree } from "lucide-react";

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
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#24483C]" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in text-[#1B2E26]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-[#E9DFCC]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Taxonomy Configuration</span>
          <h2 className="font-serif text-2xl font-bold text-[#1B2E26]">Academic Disciplines & Departments</h2>
          <p className="text-[#556960] text-xs mt-0.5">Organize course curricula into specialized knowledge tracks.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-xs uppercase tracking-wider bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={15} />
          {showForm ? "Cancel Creation" : "Create Discipline"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#FAF7F0] p-6 border border-[#E9DFCC] rounded-2xl shadow-sm">
          <form onSubmit={handleCreate} className="space-y-4 max-w-xl">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C]">Discipline Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Distributed Computing"
                className="w-full mt-1.5 bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#24483C] text-[#1B2E26] placeholder:text-[#556960]/60"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C]">Departmental Scope / Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="Describe the disciplinary scope of this category..."
                className="w-full mt-1.5 bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#24483C] text-[#1B2E26] placeholder:text-[#556960]/60 resize-none"
              />
            </div>
            <button 
              disabled={saving} 
              type="submit" 
              className="bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] text-xs font-semibold uppercase tracking-wider py-2.5 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? "Registering..." : "Save Academic Category"}
            </button>
          </form>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-[#556960] text-sm">No academic disciplines registered yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-[#FAF7F0] p-6 flex flex-col justify-between rounded-2xl border border-[#E9DFCC] hover:border-[#24483C]/30 shadow-sm transition-all">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#DCE6D8] text-[#24483C] flex items-center justify-center">
                    <FolderTree size={16} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#1B2E26]">{cat.name}</h3>
                </div>
                <p className="text-xs text-[#556960] leading-relaxed mt-2">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
