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
    const url = currentLaunch ? `/api/launches/${currentLaunch._id}` : '/api/launches';
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

  if (loading) return <div>Loading launches...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Upcoming Launches & Live Classes</h2>
          <p className="text-slate-500">Manage your scheduled events and new course drops.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} /> Add New Launch
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-600">Event</th>
                <th className="px-6 py-3 font-semibold text-slate-600">Type / Category</th>
                <th className="px-6 py-3 font-semibold text-slate-600">Date & Time</th>
                <th className="px-6 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {launches.map(launch => (
                <tr key={launch._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-normal min-w-[200px]">
                    <div className="font-bold text-slate-900">{launch.title}</div>
                    <div className="text-slate-500 text-xs truncate max-w-xs">{launch.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      {getIconForType(launch.type)}
                      <span className="capitalize font-medium">{launch.type.replace('-', ' ')}</span>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{launch.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(launch.launchDate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                      launch.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                      launch.status === 'live' ? 'bg-red-100 text-red-700 animate-pulse' :
                      launch.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {launch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(launch)} className="text-blue-600 hover:text-blue-800 p-2">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(launch._id)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {launches.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No launches scheduled yet. Click "Add New Launch" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold">{currentLaunch ? 'Edit Launch' : 'Create New Launch'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea required rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                  <input required type="datetime-local" value={formData.launchDate} onChange={e => setFormData({...formData, launchDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input required type="text" placeholder="e.g. Frontend Development" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2">
                    <option value="live-session">Live Session</option>
                    <option value="course">New Course Drop</option>
                    <option value="webinar">Webinar</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2">
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live Now</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Instructor Name</label>
                  <input type="text" value={formData.instructorName} onChange={e => setFormData({...formData, instructorName: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">External Link (Zoom/YouTube)</label>
                  <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="https://" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail Image URL</label>
                  <input type="url" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="https://" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-medium hover:bg-slate-800 rounded-lg">Save Launch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
