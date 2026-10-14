export default function GlobalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in space-y-4 text-[#1B2E26]">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-[#E9DFCC] rounded-full"></div>
        <div className="absolute w-12 h-12 border-3 border-[#24483C] rounded-full border-t-transparent animate-spin"></div>
        <div className="w-3 h-3 bg-[#C96F4A] rounded-full animate-pulse"></div>
      </div>
      <p className="text-[#556960] text-xs font-semibold uppercase tracking-widest">Accessing Academic Curriculum...</p>
    </div>
  );
}
