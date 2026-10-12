import Link from "next/link";
import { LayoutDashboard, FolderTree, BookOpen, Users, Settings, Rocket } from "lucide-react";
import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    redirect('/login');
  }

  return (
    <div className="space-y-6 text-[#1B2E26]">
      <div className="pb-4 border-b border-[#E9DFCC]">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Academic Administration</span>
        <h1 className="font-serif text-3xl font-bold text-[#1B2E26] tracking-tight">Faculty & Course Console</h1>
        <p className="text-[#556960] text-sm mt-0.5">Manage academic curricula, discipline categories, and live cohort schedules.</p>
      </div>

      {/* Admin Navigation */}
      <div className="flex space-x-2 border-b border-[#E9DFCC] pb-2 overflow-x-auto">
        <Link href="/admin" className="flex items-center space-x-2 px-4 py-2.5 bg-[#24483C] text-[#F8F4EC] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm">
          <LayoutDashboard size={15} />
          <span>Overview</span>
        </Link>
        <Link href="/admin/categories" className="flex items-center space-x-2 px-4 py-2.5 hover:bg-[#FAF7F0] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-[#556960] hover:text-[#1B2E26] border border-transparent hover:border-[#E9DFCC]">
          <FolderTree size={15} />
          <span>Categories</span>
        </Link>
        <Link href="/admin/courses" className="flex items-center space-x-2 px-4 py-2.5 hover:bg-[#FAF7F0] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-[#556960] hover:text-[#1B2E26] border border-transparent hover:border-[#E9DFCC]">
          <BookOpen size={15} />
          <span>Curricula</span>
        </Link>
        {user.role === 'superadmin' && (
          <>
            <Link href="/superadmin/users" className="flex items-center space-x-2 px-4 py-2.5 hover:bg-[#FAF7F0] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-[#556960] hover:text-[#1B2E26] border border-transparent hover:border-[#E9DFCC]">
              <Users size={15} />
              <span>Users & Sales</span>
            </Link>
            <Link href="/superadmin/settings" className="flex items-center space-x-2 px-4 py-2.5 hover:bg-[#FAF7F0] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-[#556960] hover:text-[#1B2E26] border border-transparent hover:border-[#E9DFCC]">
              <Settings size={15} />
              <span>Settings</span>
            </Link>
          </>
        )}
        <Link href="/admin/launches" className="flex items-center space-x-2 px-4 py-2.5 hover:bg-[#FAF7F0] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-[#556960] hover:text-[#1B2E26] border border-transparent hover:border-[#E9DFCC]">
          <Rocket size={15} />
          <span>Cohort Launches</span>
        </Link>
      </div>

      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}
