"use client";

import { useState, useEffect } from "react";
import { Users, Ban, Trash2, CheckCircle, Search } from "lucide-react";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this user?`)) return;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !currentStatus })
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !currentStatus } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("CRITICAL WARNING: Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">View, block, or delete students and teachers across the platform.</p>
      </div>

      <div className="bg-[#12141f] rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 whitespace-nowrap">
            <Users className="text-blue-500" /> Platform Members
          </h2>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          user.role === 'admin' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {user.role === 'admin' ? 'Teacher' : 'Learner'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isBlocked ? (
                          <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><Ban size={12}/> Suspended</span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-400 text-xs font-bold"><CheckCircle size={12}/> Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleToggleBlock(user._id, !!user.isBlocked)}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
                              user.isBlocked ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-yellow-600 hover:bg-yellow-500 text-white'
                            }`}
                          >
                            <Ban size={14} /> {user.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          <button 
                            onClick={() => handleDelete(user._id)}
                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 rounded text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
