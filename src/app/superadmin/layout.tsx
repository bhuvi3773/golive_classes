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
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-[#F8F4EC] md:overflow-hidden text-[#1B2E26] w-full">
      {/* Mobile Superadmin Header & Navigation (< 768px) */}
      <div className="md:hidden bg-[#24483C] text-[#F8F4EC] border-b border-[#1B2E26] px-4 py-3 shrink-0 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <Link href="/superadmin">
            <span className="font-serif text-lg font-bold text-[#F8F4EC] flex items-center gap-1.5">
              <ShieldCheck className="text-[#C96F4A] w-5 h-5" /> GoLive<span className="text-[#C96F4A]">HQ</span>
            </span>
          </Link>
          <Link href="/courses" className="text-[10px] font-bold uppercase tracking-wider text-[#DCE6D8]/80 hover:text-white px-2 py-1 rounded bg-white/10">
            Public Academy →
          </Link>
        </div>
        <nav className="flex space-x-2 overflow-x-auto pb-1 text-xs">
          <Link
            href="/superadmin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider bg-white/15 text-[#F8F4EC] shrink-0 whitespace-nowrap hover:bg-white/20 transition-colors"
          >
            <BookOpen size={14} />
            <span>Audits</span>
          </Link>
          <Link
            href="/superadmin/users"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider bg-white/15 text-[#F8F4EC] shrink-0 whitespace-nowrap hover:bg-white/20 transition-colors"
          >
            <Users size={14} />
            <span>Scholars</span>
          </Link>
          <Link
            href="/superadmin/settings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider bg-white/15 text-[#F8F4EC] shrink-0 whitespace-nowrap hover:bg-white/20 transition-colors"
          >
            <Settings size={14} />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* Desktop Super Admin Sidebar (>= 768px) */}
      <aside className="w-64 bg-[#24483C] border-r border-[#1B2E26] hidden md:flex flex-col text-[#F8F4EC] shrink-0">
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
      <main className="flex-1 min-w-0 w-full overflow-y-auto bg-[#F8F4EC]">
        {children}
      </main>
    </div>
  );
}
