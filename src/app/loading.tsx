export default function GlobalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-16 h-16 border-4 border-slate-100 rounded-full"></div>
        <div className="absolute w-16 h-16 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="w-6 h-6 bg-emerald-500 rounded-full animate-pulse"></div>
      </div>
      <p className="text-slate-500 font-medium">Loading content...</p>
    </div>
  );
}
