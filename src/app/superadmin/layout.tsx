import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, BookOpen, Users, Settings } from "lucide-react";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();

  if (!user || user.role !== 'superadmin') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-[#0a0c16] overflow-hidden">
      {/* Super Admin Sidebar */}
      <aside className="w-64 bg-[#12141f] border-r border-white/10 hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/superadmin">
            <span className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-red-500" /> GoLive<span className="text-red-500">HQ</span>
            </span>
          </Link>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">Super Admin</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link
            href="/superadmin"
            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white bg-red-500/10 text-red-400 rounded-lg transition-colors border border-red-500/20"
          >
            <BookOpen size={20} />
            <span>Course Reviews</span>
          </Link>

          <Link
            href="/superadmin/users"
            className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Users size={20} />
            <span>User Management</span>
          </Link>

          <Link
            href="#"
            className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-not-allowed opacity-50"
          >
            <Settings size={20} />
            <span>Platform Settings</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/10">
           <Link href="/courses" className="flex items-center justify-center space-x-2 text-sm text-gray-500 hover:text-white py-2">
             <span>Back to Main Site</span>
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
