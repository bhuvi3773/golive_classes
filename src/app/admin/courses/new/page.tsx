"use client";

import { Upload, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewCoursePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch categories to populate dropdown
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setCategory(data[0].name);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          category,
          thumbnail,
          status: 'published',
          instructor: 'Admin', // In real app, from user session
        }),
      });

      if (res.ok) {
        router.push('/admin/courses');
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create course");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Create New Course</h2>
          <p className="text-gray-400 mt-1">Fill in the details below to publish a new course.</p>
        </div>
        <Link href="/admin/courses">
          <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <X size={16} /> Cancel
          </button>
        </Link>
      </div>

      {error && <div className="text-red-400 bg-red-500/10 p-3 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-8">
        {/* Basic Info */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Basic Information</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Course Title</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="e.g., Complete Python Bootcamp"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Course Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="What will students learn?"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
                className="w-full bg-[#1e2130] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
              >
                {categories.length === 0 && <option value="">Loading categories...</option>}
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Price ($)</label>
              <input 
                type="number" 
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="49.99"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Thumbnail Image URL</label>
            <input 
              type="url" 
              value={thumbnail}
              onChange={e => setThumbnail(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4 border-t border-white/10 pt-6">
          <Link href="/admin/courses">
            <button type="button" className="px-6 py-2 rounded-lg font-medium text-gray-300 hover:text-white transition-colors">
              Save as Draft
            </button>
          </Link>
          <button disabled={saving} type="submit" className="btn-primary py-2 px-8">
            {saving ? "Publishing..." : "Publish Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
