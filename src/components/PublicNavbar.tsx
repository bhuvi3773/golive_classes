import Link from "next/link";

export default function PublicNavbar({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <nav className="fixed w-full z-50 top-0 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href={isAuthenticated ? "/my-learning" : "/"} className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="GoLive Classes" className="h-12 md:h-14 w-auto object-contain drop-shadow-xl hover:scale-105 transition-transform" />
        </Link>
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <Link href="/" className="hover:text-slate-900 transition-colors text-slate-900">Home</Link>
          <Link href="/courses" className="hover:text-slate-900 transition-colors">Courses</Link>
          <Link href="/recommendations" className="hover:text-slate-900 transition-colors flex items-center gap-1">
            Recommendations
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/my-learning" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-slate-900/20">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors hidden sm:block">
                Login
              </Link>
              <Link href="/register" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
