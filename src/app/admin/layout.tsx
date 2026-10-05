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
        <p className="text-gray-400">Manage courses, categories, and users.</p>
      </div>

      {/* Admin Navigation */}
      <div className="flex space-x-2 border-b border-white/10 pb-2 overflow-x-auto">
        <Link href="/admin" className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-t-lg transition-colors text-white border-b-2 border-blue-500">
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </Link>
        <Link href="/admin/categories" className="flex items-center space-x-2 px-4 py-2 hover:bg-white/5 rounded-t-lg transition-colors text-gray-400 hover:text-white">
          <FolderTree size={18} />
          <span>Categories</span>
        </Link>
        <Link href="/admin/courses" className="flex items-center space-x-2 px-4 py-2 hover:bg-white/5 rounded-t-lg transition-colors text-gray-400 hover:text-white">
          <BookOpen size={18} />
          <span>Courses</span>
        </Link>
        <Link href="/admin/users" className="flex items-center space-x-2 px-4 py-2 hover:bg-white/5 rounded-t-lg transition-colors text-gray-400 hover:text-white">
          <Users size={18} />
          <span>Users & Sales</span>
        </Link>
      </div>

      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}
