import { Video, Calendar, Users } from "lucide-react";

export default function LiveClassesPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Video className="text-red-500" />
          Live Classes
        </h1>
        <p className="text-gray-400 mt-2">Join expert-led sessions in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Main Featured Live Class */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="h-64 bg-gradient-to-br from-red-900/50 to-blue-900/50 relative flex items-center justify-center">
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              LIVE NOW
            </div>
            <PlayButton />
          </div>
          <div className="p-6 space-y-4 flex-1">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold px-2 py-1 bg-blue-500/20 text-blue-400 rounded">DevOps</span>
              <div className="flex items-center text-sm text-gray-400 gap-1">
                <Users size={16} /> 1.2k watching
              </div>
            </div>
            <h2 className="text-2xl font-bold">AWS Cloud Practitioner Certification Q&A</h2>
            <p className="text-gray-400">Join our lead instructor for an open Q&A session covering the toughest topics on the AWS exam.</p>
            <button className="w-full btn-primary py-3 mt-4">Join Session</button>
          </div>
        </div>

        {/* Upcoming Classes List */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="text-blue-400" />
            Upcoming Schedule
          </h3>
          
          <div className="space-y-4 flex-1">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                <div className="flex flex-col items-center justify-center w-16 h-16 bg-[#1e2130] rounded-lg shrink-0">
                  <span className="text-xs font-bold text-blue-400 uppercase">OCT</span>
                  <span className="text-xl font-bold">1{item}</span>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Advanced System Design</h4>
                  <p className="text-sm text-gray-400">Starts at 6:00 PM EST • 2 hrs</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function PlayButton() {
  return (
    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all hover:scale-110">
      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1"></div>
    </div>
  );
}
