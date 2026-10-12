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
    <div className="flex h-screen bg-[#F8F4EC] overflow-hidden text-[#1B2E26]">
      {/* Super Admin Sidebar */}
      <aside className="w-64 bg-[#24483C] border-r border-[#1B2E26] hidden md:flex flex-col text-[#F8F4EC]">
        <div className="p-6 border-b border-white/10">
          <Link href="/superadmin">
            <span className="font-serif text-2xl font-bold text-[#F8F4EC] flex items-center gap-2">
              <ShieldCheck className="text-[#C96F4A]" /> GoLive<span className="text-[#C96F4A]">HQ</span>
            </span>
          </Link>
          <p className="text-[10px] text-[#DCE6D8] mt-1 uppercase tracking-widest font-bold">Provost & Executive Console</p>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          <Link
            href="/superadmin"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-white/10 text-[#DCE6D8]"
          >
            <BookOpen size={18} />
            <span>Curriculum Audits</span>
          </Link>

          <Link
            href="/superadmin/users"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-white/10 text-[#DCE6D8]"
          >
            <Users size={18} />
            <span>Scholar Management</span>
          </Link>

          <Link
            href="/superadmin/settings"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-white/10 text-[#DCE6D8]"
          >
            <Settings size={18} />
            <span>Academy Settings</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/10">
           <Link href="/courses" className="flex items-center justify-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#DCE6D8]/70 hover:text-[#F8F4EC] py-2 transition-colors">
             <span>Return to Public Academy</span>
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#F8F4EC]">
        {children}
      </main>
    </div>
  );
}
