import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl bg-white/60 backdrop-blur-xl border border-white shadow-2xl rounded-3xl p-12">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center shadow-inner mb-8 transform -rotate-6 border border-white">
          <Compass size={48} className="text-emerald-600" />
        </div>
        
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 mb-4 tracking-tight">
          404
        </h1>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Looks like you're lost
        </h2>
        
        <p className="text-lg text-slate-500 mb-10 max-w-md">
          The page or course you are looking for doesn't exist, has been removed, or you don't have access to it.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              <Home size={18} />
              Return Home
            </button>
          </Link>
          <Link href="/courses">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border-2 border-emerald-500 text-emerald-700 px-8 py-4 rounded-xl font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
              <Search size={18} />
              Browse Courses
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
