"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Calendar, Video, BookOpen, Megaphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLaunchesPage() {
  const [launches, setLaunches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentLaunch, setCurrentLaunch] = useState<any>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    launchDate: '',
    category: '',
    type: 'live-session',
    status: 'scheduled',
    instructorName: '',
    link: '',
    thumbnail: ''
  });

  useEffect(() => {
    fetchLaunches();
  }, []);

  const fetchLaunches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/launches?admin=true');
      const data = await res.json();
      setLaunches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleOpenModal = (launch: any = null) => {
    if (launch) {
      setCurrentLaunch(launch);
      setFormData({
        title: launch.title,
        description: launch.description,
        launchDate: new Date(launch.launchDate).toISOString().slice(0, 16),
        category: launch.category,
        type: launch.type,
        status: launch.status,
        instructorName: launch.instructorName || '',
        link: launch.link || '',
        thumbnail: launch.thumbnail || ''
      });
    } else {
      setCurrentLaunch(null);
      setFormData({
        title: '',
        description: '',
        launchDate: new Date().toISOString().slice(0, 16),
        category: '',
        type: 'live-session',
        status: 'scheduled',
        instructorName: '',
        link: '',
        thumbnail: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = currentLaunch ? `/api/launches/${currentLaunch.id}` : '/api/launches';
    const method = currentLaunch ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchLaunches();
      } else {
        alert("Failed to save");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this launch?')) {
      try {
        const res = await fetch(`/api/launches/${id}`, { method: 'DELETE' });
        if (res.ok) fetchLaunches();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen size={16} className="text-blue-500" />;
      case 'webinar': return <Video size={16} className="text-purple-500" />;
      case 'announcement': return <Megaphone size={16} className="text-orange-500" />;
      default: return <Calendar size={16} className="text-emerald-500" />;
    }
  };

  if (loading) return <div className="text-slate-400 p-8">Loading launches...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Upcoming Launches & Live Classes</h2>
          <p className="text-slate-400">Manage your scheduled events and new course drops.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Plus size={18} /> Add New Launch
        </button>
      </div>

      <div className="glass-card rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Event</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Type / Category</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Date & Time</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-900/40">
              {launches.map(launch => (
                <tr key={launch.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-normal min-w-[200px]">
                    <div className="font-bold text-white">{launch.title}</div>
                    <div className="text-slate-400 text-xs truncate max-w-xs mt-1">{launch.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1.5 text-slate-200">
                      {getIconForType(launch.type)}
                      <span className="capitalize font-medium">{launch.type.replace('-', ' ')}</span>
                    </div>
                    <span className="text-xs bg-slate-800 border border-white/10 text-slate-300 px-2 py-0.5 rounded-full">{launch.category}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-medium">
                    {new Date(launch.launchDate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border ${
                      launch.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      launch.status === 'live' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' :
                      launch.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}>
                      {launch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(launch)} className="text-teal-400 hover:text-teal-300 p-2 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(launch.id)} className="text-red-400 hover:text-red-300 p-2 transition-colors">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {launches.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No launches scheduled yet. Click "Add New Launch" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="glass-card bg-slate-900/90 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
              <h3 className="text-xl font-bold text-white">{currentLaunch ? 'Edit Launch' : 'Create New Launch'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                  <textarea required rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Date & Time</label>
                  <input required type="datetime-local" value={formData.launchDate} onChange={e => setFormData({...formData, launchDate: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                  <input required type="text" placeholder="e.g. Frontend Development" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 placeholder:text-slate-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Event Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500">
                    <option value="live-session">Live Session</option>
                    <option value="course">New Course Drop</option>
                    <option value="webinar">Webinar</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500">
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live Now</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Instructor Name</label>
                  <input type="text" value={formData.instructorName} onChange={e => setFormData({...formData, instructorName: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">External Link (Zoom/YouTube)</label>
                  <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 placeholder:text-slate-600" placeholder="https://" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Thumbnail Image URL</label>
                  <input type="url" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 placeholder:text-slate-600" placeholder="https://" />
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-300 font-medium hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-teal-500 text-slate-900 font-bold hover:bg-teal-400 rounded-lg transition-colors shadow-lg shadow-teal-500/20">Save Launch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
