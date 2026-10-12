import Link from "next/link";
import { Compass, Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative text-[#1B2E26]">
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg bg-[#FAF7F0] border border-[#E9DFCC] shadow-sm rounded-2xl p-10 md:p-12">
        <div className="w-20 h-20 bg-[#DCE6D8] rounded-2xl flex items-center justify-center text-[#24483C] shadow-sm mb-6 border border-[#24483C]/20">
          <Compass size={40} />
        </div>
        
        <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A] mb-2">Error 404</span>
        <h1 className="font-serif text-5xl font-bold text-[#24483C] mb-3">
          Uncharted Path
        </h1>
        <h2 className="font-serif text-xl font-bold text-[#1B2E26] mb-3">
          Page or Lecture Not Found
        </h2>
        
        <p className="text-sm text-[#556960] mb-8 leading-relaxed max-w-sm">
          The requested curriculum module, syllabus section, or account record does not exist or has been archived.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link href="/">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm">
              <Home size={15} />
              Return Home
            </button>
          </Link>
          <Link href="/courses">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FAF7F0] hover:bg-[#E9DFCC]/50 border border-[#E9DFCC] text-[#24483C] px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm">
              <BookOpen size={15} />
              Browse Catalogue
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
