import { Video, Calendar, Users, Clock, PlayCircle, BookOpen, Megaphone } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function LiveClassesPage() {
  const launches = await prisma.upcomingLaunch.findMany({
    where: {
      status: { in: ['scheduled', 'live'] }
    },
    orderBy: { launchDate: 'asc' }
  });

  const liveSessions = launches.filter((l: any) => l.status === 'live');
  const scheduledSessions = launches.filter((l: any) => l.status === 'scheduled');
  
  const featuredLive = liveSessions.length > 0 ? liveSessions[0] : null;
  const remainingLive = liveSessions.length > 0 ? liveSessions.slice(1) : [];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen size={16} className="text-blue-500" />;
      case 'webinar': return <Video size={16} className="text-purple-500" />;
      case 'announcement': return <Megaphone size={16} className="text-orange-500" />;
      default: return <Video size={16} className="text-emerald-500" />;
    }
  };

  const getMonthStr = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('default', { month: 'short' }).toUpperCase();
  };
  
  const getDayStr = (dateStr: string) => {
    return new Date(dateStr).getDate();
  };

  const getTimeStr = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3 text-slate-900">
          <Video className="text-red-500" size={36} />
          Live Classes & Events
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Join expert-led sessions in real-time or catch upcoming course drops.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Featured Live Class or Next Up */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {featuredLive ? (
             <div className="bg-white rounded-3xl overflow-hidden border border-red-200 shadow-xl shadow-red-500/10 flex flex-col">
               <div className="h-72 bg-slate-900 relative flex items-center justify-center group overflow-hidden">
                 {featuredLive.thumbnail ? (
                   <img src={featuredLive.thumbnail} alt={featuredLive.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                 ) : (
                   <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-slate-900"></div>
                 )}
                 <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full animate-pulse flex items-center gap-2 shadow-lg">
                   <div className="w-2 h-2 bg-white rounded-full"></div>
                   LIVE NOW
                 </div>
                 {featuredLive.link ? (
                   <a href={featuredLive.link} target="_blank" rel="noreferrer" className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:bg-white hover:scale-110 transition-all shadow-2xl group/btn">
                     <PlayCircle size={48} className="text-white group-hover/btn:text-red-500" />
                   </a>
                 ) : (
                   <div className="relative z-10 text-white font-bold bg-black/50 px-6 py-3 rounded-full backdrop-blur-sm border border-white/20">Check Dashboard for Link</div>
                 )}
               </div>
               <div className="p-8 space-y-4">
                 <div className="flex justify-between items-start">
                   <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full">{featuredLive.category}</span>
                   <div className="flex items-center text-sm text-red-500 font-bold gap-1 bg-red-50 px-3 py-1.5 rounded-full">
                     <Users size={16} /> Happening right now
                   </div>
                 </div>
                 <h2 className="text-3xl font-extrabold text-slate-900">{featuredLive.title}</h2>
                 <p className="text-slate-600 text-lg">{featuredLive.description}</p>
                 <div className="flex items-center gap-2 text-slate-500 font-medium">
                   <span>Instructor:</span> <span className="text-slate-900">{featuredLive.instructorName}</span>
                 </div>
                 {featuredLive.link && (
                   <a href={featuredLive.link} target="_blank" rel="noreferrer" className="inline-block w-full text-center bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/30 mt-4">
                     Join Session Now
                   </a>
                 )}
               </div>
             </div>
          ) : scheduledSessions.length > 0 ? (
             <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col">
               <div className="h-72 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                 {scheduledSessions[0].thumbnail ? (
                   <img src={scheduledSessions[0].thumbnail} alt={scheduledSessions[0].title} className="w-full h-full object-cover opacity-50" />
                 ) : (
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-emerald-900"></div>
                 )}
                 <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                   NEXT UP
                 </div>
                 <div className="relative z-10 flex flex-col items-center">
                   <div className="text-white/80 font-semibold mb-2">Starts in</div>
                   <div className="text-4xl md:text-5xl font-extrabold text-white bg-black/40 px-6 py-4 rounded-2xl backdrop-blur-md border border-white/10">
                     {getTimeStr(scheduledSessions[0].launchDate.toString())}
                   </div>
                   <div className="text-emerald-300 font-bold mt-4">{new Date(scheduledSessions[0].launchDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                 </div>
               </div>
               <div className="p-8 space-y-4">
                 <div className="flex items-center gap-2">
                   {getIconForType(scheduledSessions[0].type)}
                   <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{scheduledSessions[0].type.replace('-', ' ')}</span>
                 </div>
                 <h2 className="text-3xl font-extrabold text-slate-900">{scheduledSessions[0].title}</h2>
                 <p className="text-slate-600 text-lg leading-relaxed">{scheduledSessions[0].description}</p>
                 <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                   <div className="flex items-center gap-2 text-slate-500">
                     <span className="text-slate-900 font-bold">{scheduledSessions[0].instructorName}</span>
                   </div>
                   <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full">{scheduledSessions[0].category}</span>
                 </div>
               </div>
             </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center h-[500px]">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 text-slate-300">
                <Calendar size={48} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Upcoming Events</h2>
              <p className="text-slate-500 max-w-md">Our instructors are currently planning the next set of live classes and course drops. Check back soon!</p>
              <Link href="/courses">
                <button className="mt-8 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-slate-900/20">
                  Explore Pre-Recorded Courses
                </button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Upcoming Classes List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl shadow-slate-200/50 sticky top-24">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2 text-slate-900">
              <Calendar className="text-emerald-600" />
              Schedule
            </h3>
            
            <div className="space-y-4">
              {remainingLive.map((item: any) => (
                <div key={item.id.toString()} className="flex gap-4 p-4 rounded-2xl bg-red-50 border border-red-100 hover:border-red-200 transition-colors group">
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-xl shrink-0 shadow-sm border border-red-100 group-hover:scale-105 transition-transform">
                    <span className="text-[10px] font-extrabold text-red-500 uppercase">LIVE</span>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mt-1"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 mb-1 truncate">{item.title}</h4>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                      {getIconForType(item.type)} {item.type.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              ))}

              {scheduledSessions.map((item: any, idx: number) => {
                if (idx === 0 && !featuredLive) return null; // Skip the one shown in hero
                return (
                  <div key={item.id.toString()} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-50 rounded-xl shrink-0 border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase group-hover:text-emerald-600">{getMonthStr(item.launchDate)}</span>
                      <span className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700">{getDayStr(item.launchDate)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 mb-1 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">{item.title}</h4>
                      <div className="flex items-center text-xs text-slate-500 gap-2 mt-2">
                        <span className="flex items-center gap-1"><Clock size={12}/> {getTimeStr(item.launchDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {remainingLive.length === 0 && scheduledSessions.length === 0 && featuredLive && (
                <div className="text-center p-6 text-sm text-slate-500">
                  No other scheduled events.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
