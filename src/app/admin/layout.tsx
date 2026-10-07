import Link from "next/link";
import { LayoutDashboard, FolderTree, BookOpen, Users } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-500">Manage courses, categories, and users.</p>
      </div>

      {/* Admin Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <Link href="/admin" className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-t-lg transition-colors text-slate-900 border-b-2 border-blue-500">
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </Link>
        <Link href="/admin/categories" className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100 rounded-t-lg transition-colors text-slate-500 hover:text-slate-900">
          <FolderTree size={18} />
          <span>Categories</span>
        </Link>
        <Link href="/admin/courses" className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100 rounded-t-lg transition-colors text-slate-500 hover:text-slate-900">
          <BookOpen size={18} />
          <span>Courses</span>
        </Link>
        {user.role === 'superadmin' && (
          <Link href="/superadmin/users" className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100 rounded-t-lg transition-colors text-slate-500 hover:text-slate-900">
            <Users size={18} />
            <span>Users & Sales</span>
          </Link>
        )}
        <Link href="/admin/launches" className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100 rounded-t-lg transition-colors text-slate-500 hover:text-slate-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rocket"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
          <span>Launches</span>
        </Link>
      </div>

      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}
