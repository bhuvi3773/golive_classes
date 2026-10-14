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
        setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !currentStatus } : u));
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
        setUsers(users.filter(u => u.id !== userId));
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 text-[#1B2E26] w-full">
      <div className="pb-4 border-b border-[#E9DFCC]">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Registry Administration</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2E26] tracking-tight">Scholar & Faculty Registry</h1>
        <p className="text-[#556960] text-xs sm:text-sm mt-0.5">Audit account standing, manage credentials, and administer access permissions.</p>
      </div>

      <div className="bg-[#FAF7F0] rounded-2xl border border-[#E9DFCC] overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-[#E9DFCC] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF7F0]">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1B2E26] flex items-center gap-2 whitespace-nowrap">
            <Users className="text-[#24483C]" size={20} /> Academy Members
          </h2>
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#556960]" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email address..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C] transition-colors placeholder:text-[#556960]/60 shadow-inner"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 sm:p-12 text-center text-[#556960] flex flex-col items-center">
            <div className="w-8 h-8 border-3 border-[#24483C] border-t-transparent rounded-full animate-spin mb-3"></div>
            Loading scholar records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[580px]">
              <thead className="bg-[#F8F4EC] border-b border-[#E9DFCC] text-[#3D5A4C]">
                <tr>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Member Details</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Academic Role</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Standing</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DFCC]/60 text-[#1B2E26]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[#556960]">No records match your query.</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-[#F8F4EC] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-serif font-bold text-sm text-[#1B2E26]">{user.name}</p>
                          <p className="text-xs text-[#556960] font-mono">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          user.role === 'admin' ? 'bg-[#DCE6D8] text-[#24483C] border-[#24483C]/20' : 'bg-[#E9DFCC] text-[#556960] border-[#E9DFCC]'
                        }`}>
                          {user.role === 'admin' ? 'Faculty' : 'Scholar'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isBlocked ? (
                          <span className="flex items-center gap-1.5 text-[#8B381A] text-xs font-semibold"><Ban size={14}/> Suspended</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[#24483C] text-xs font-semibold"><CheckCircle size={14}/> Good Standing</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleToggleBlock(user.id, !!user.isBlocked)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 border shadow-sm ${
                              user.isBlocked 
                                ? 'bg-[#DCE6D8] hover:bg-[#24483C] hover:text-[#F8F4EC] text-[#24483C] border-[#24483C]/30' 
                                : 'bg-[#FAF7F0] hover:bg-[#E9DFCC]/50 text-[#556960] border-[#E9DFCC]'
                            }`}
                          >
                            <Ban size={13} /> {user.isBlocked ? 'Restore' : 'Suspend'}
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="px-3 py-1.5 bg-[#C96F4A]/10 hover:bg-[#C96F4A]/20 text-[#8B381A] border border-[#C96F4A]/30 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                          >
                            <Trash2 size={13} /> Expel
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
