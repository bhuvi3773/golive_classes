"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Calendar, Video, BookOpen, Megaphone, X } from "lucide-react";
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
        alert("Failed to save launch");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this launch event?')) {
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
      case 'course': return <BookOpen size={15} className="text-[#24483C]" />;
      case 'webinar': return <Video size={15} className="text-[#C96F4A]" />;
      case 'announcement': return <Megaphone size={15} className="text-[#C96F4A]" />;
      default: return <Calendar size={15} className="text-[#24483C]" />;
    }
  };

  if (loading) return <div className="text-[#556960] p-8 text-sm">Loading academic launch schedules...</div>;

  return (
    <div className="space-y-6 animate-in fade-in text-[#1B2E26]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-[#E9DFCC]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Cohorts & Broadcasts</span>
          <h2 className="font-serif text-2xl font-bold text-[#1B2E26]">Upcoming Launches & Live Masterclasses</h2>
          <p className="text-[#556960] text-xs mt-0.5">Coordinate live broadcast sessions, guest symposia, and new course unveilings.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} /> Schedule Launch
        </button>
      </div>

      <div className="bg-[#FAF7F0] rounded-2xl border border-[#E9DFCC] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-max">
            <thead className="bg-[#F8F4EC] border-b border-[#E9DFCC] text-[#3D5A4C]">
              <tr>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Event Details</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Format / Discipline</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DFCC]/60 text-[#1B2E26]">
              {launches.map(launch => (
                <tr key={launch.id} className="hover:bg-[#F8F4EC] transition-colors">
                  <td className="px-6 py-4 whitespace-normal min-w-[200px]">
                    <div className="font-serif font-bold text-sm text-[#1B2E26]">{launch.title}</div>
                    <div className="text-[#556960] text-xs truncate max-w-xs mt-0.5">{launch.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 mb-1 text-[#1B2E26] font-medium">
                      {getIconForType(launch.type)}
                      <span className="capitalize">{launch.type.replace('-', ' ')}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F8F4EC] border border-[#E9DFCC] text-[#24483C] px-2 py-0.5 rounded-md">{launch.category}</span>
                  </td>
                  <td className="px-6 py-4 text-[#1B2E26] font-mono text-xs">
                    {new Date(launch.launchDate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border tracking-wider ${
                      launch.status === 'scheduled' ? 'bg-[#E9DFCC] text-[#556960] border-[#E9DFCC]' :
                      launch.status === 'live' ? 'bg-[#C96F4A]/10 text-[#8B381A] border-[#C96F4A]/30 animate-pulse' :
                      launch.status === 'completed' ? 'bg-[#DCE6D8] text-[#24483C] border-[#24483C]/30' : 'bg-[#E9DFCC] text-[#556960] border-[#E9DFCC]'
                    }`}>
                      {launch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button onClick={() => handleOpenModal(launch)} className="text-[#556960] hover:text-[#24483C] p-1.5 transition-colors" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(launch.id)} className="text-[#556960] hover:text-[#8B381A] p-1.5 transition-colors" title="Delete">
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {launches.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#556960]">
                    No launches currently scheduled. Click &quot;Schedule Launch&quot; to plan an event.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#FAF7F0] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#E9DFCC] shadow-xl text-[#1B2E26]">
            <div className="p-6 border-b border-[#E9DFCC] flex justify-between items-center sticky top-0 bg-[#FAF7F0] z-10">
              <h3 className="font-serif text-xl font-bold text-[#1B2E26]">{currentLaunch ? 'Edit Launch Event' : 'Create Launch Event'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[#556960] hover:text-[#1B2E26] transition-colors p-1"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-[#3D5A4C] mb-1">Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2.5 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]" />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-[#3D5A4C] mb-1">Description</label>
                  <textarea required rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2.5 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C] resize-none"></textarea>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#3D5A4C] mb-1">Date & Time</label>
                  <input required type="datetime-local" value={formData.launchDate} onChange={e => setFormData({...formData, launchDate: e.target.value})} className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]" />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#3D5A4C] mb-1">Discipline Category</label>
                  <input required type="text" placeholder="e.g. Distributed Computing" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]" />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#3D5A4C] mb-1">Event Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]">
                    <option value="live-session">Live Masterclass</option>
                    <option value="course">New Course Release</option>
                    <option value="webinar">Academic Colloquium</option>
                    <option value="announcement">Official Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#3D5A4C] mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]">
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live Now</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#3D5A4C] mb-1">Lead Faculty / Speaker</label>
                  <input type="text" value={formData.instructorName} onChange={e => setFormData({...formData, instructorName: e.target.value})} className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]" />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#3D5A4C] mb-1">Broadcast Link (Zoom/YouTube/Meet)</label>
                  <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]" placeholder="https://" />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-[#3D5A4C] mb-1">Cover Artwork URL</label>
                  <input type="url" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]" placeholder="https://" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[#E9DFCC]">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-[#556960] hover:text-[#1B2E26] font-semibold uppercase tracking-wider rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-[#24483C] text-[#F8F4EC] font-semibold uppercase tracking-wider hover:bg-[#1B2E26] rounded-xl transition-colors shadow-sm">Save Launch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
