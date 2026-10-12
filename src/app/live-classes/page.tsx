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
      case 'course': return <BookOpen size={16} className="text-[#24483C]" />;
      case 'webinar': return <Video size={16} className="text-[#C96F4A]" />;
      case 'announcement': return <Megaphone size={16} className="text-[#C96F4A]" />;
      default: return <Video size={16} className="text-[#24483C]" />;
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
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#C96F4A]">Real-Time Cohorts</span>
        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3 text-[#1B2E26] mt-1">
          <Video className="text-[#24483C]" size={36} />
          Live Classes & Masterclasses
        </h1>
        <p className="text-[#4A5E54] mt-2 text-base md:text-lg">Participate in live architectural reviews, coding sessions, and upcoming module releases.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Featured Live Class or Next Up */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {featuredLive ? (
             <div className="editorial-card rounded-2xl overflow-hidden bg-[#FFFFFF] flex flex-col">
               <div className="h-72 bg-[#19332A] relative flex items-center justify-center group overflow-hidden">
                 {featuredLive.thumbnail ? (
                   <img src={featuredLive.thumbnail} alt={featuredLive.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                 ) : (
                   <div className="absolute inset-0 bg-[#24483C]/80"></div>
                 )}
                 <div className="absolute top-4 left-4 bg-[#C96F4A] text-[#FFFFFF] text-xs font-extrabold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                   <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                   LIVE BROADCAST
                 </div>
                 {featuredLive.link ? (
                   <a href={featuredLive.link} target="_blank" rel="noreferrer" className="relative z-10 w-16 h-16 bg-[#FFFFFF]/90 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-md group/btn">
                     <PlayCircle size={36} className="text-[#24483C]" />
                   </a>
                 ) : (
                   <div className="relative z-10 text-[#F8F4EC] font-bold bg-[#19332A]/80 px-6 py-2.5 rounded-full backdrop-blur-sm border border-[#2E5B4C] text-sm">Session link will appear at start</div>
                 )}
               </div>
               <div className="p-8 space-y-4">
                 <div className="flex justify-between items-start">
                   <span className="text-xs font-bold px-3 py-1 bg-[#EEF3EC] text-[#24483C] rounded-full border border-[#DCE6D8]">{featuredLive.category}</span>
                   <div className="flex items-center text-xs text-[#C96F4A] font-bold gap-1.5 bg-[#C96F4A]/10 px-3 py-1 rounded-full border border-[#C96F4A]/20">
                     <Users size={14} /> Active Session
                   </div>
                 </div>
                 <h2 className="text-2xl md:text-3xl font-extrabold text-[#1B2E26]">{featuredLive.title}</h2>
                 <p className="text-[#4A5E54] text-base leading-relaxed">{featuredLive.description}</p>
                 <div className="flex items-center gap-2 text-sm text-[#4A5E54] pt-2 border-t border-[#E9DFCC]">
                   <span>Lead Instructor:</span> <span className="text-[#1B2E26] font-bold">{featuredLive.instructorName}</span>
                 </div>
                 {featuredLive.link && (
                   <a href={featuredLive.link} target="_blank" rel="noreferrer" className="inline-block w-full text-center bg-[#24483C] hover:bg-[#19332A] text-[#F8F4EC] font-bold py-3.5 rounded-xl transition-all shadow-sm mt-3">
                     Join Live Classroom
                   </a>
                 )}
               </div>
             </div>
          ) : scheduledSessions.length > 0 ? (
             <div className="editorial-card rounded-2xl overflow-hidden bg-[#FFFFFF] flex flex-col">
               <div className="h-72 bg-[#24483C] relative flex items-center justify-center overflow-hidden">
                 {scheduledSessions[0].thumbnail ? (
                   <img src={scheduledSessions[0].thumbnail} alt={scheduledSessions[0].title} className="w-full h-full object-cover opacity-50" />
                 ) : (
                   <div className="absolute inset-0 bg-[#24483C]"></div>
                 )}
                 <div className="absolute top-4 left-4 bg-[#FFFFFF]/20 backdrop-blur-md text-[#F8F4EC] text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                   NEXT UPCOMING
                 </div>
                 <div className="relative z-10 flex flex-col items-center">
                   <div className="text-[#DCE6D8] font-medium text-xs uppercase tracking-wider mb-2">Scheduled Commencement</div>
                   <div className="text-3xl md:text-4xl font-extrabold text-[#FFFFFF] bg-[#19332A]/70 px-6 py-3 rounded-xl backdrop-blur-md border border-[#2E5B4C]">
                     {getTimeStr(scheduledSessions[0].launchDate.toString())}
                   </div>
                   <div className="text-[#DCE6D8] font-bold mt-3 text-sm">{new Date(scheduledSessions[0].launchDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                 </div>
               </div>
               <div className="p-8 space-y-4">
                 <div className="flex items-center gap-2">
                   {getIconForType(scheduledSessions[0].type)}
                   <span className="text-xs font-bold text-[#72857C] uppercase tracking-wider">{scheduledSessions[0].type.replace('-', ' ')}</span>
                 </div>
                 <h2 className="text-2xl md:text-3xl font-extrabold text-[#1B2E26]">{scheduledSessions[0].title}</h2>
                 <p className="text-[#4A5E54] text-base leading-relaxed">{scheduledSessions[0].description}</p>
                 <div className="pt-4 flex items-center justify-between border-t border-[#E9DFCC]">
                   <div className="flex items-center gap-2 text-sm text-[#4A5E54]">
                     <span>Faculty:</span>
                     <span className="text-[#1B2E26] font-bold">{scheduledSessions[0].instructorName}</span>
                   </div>
                   <span className="text-xs font-bold px-3 py-1 bg-[#EEF3EC] text-[#24483C] rounded-full border border-[#DCE6D8]">{scheduledSessions[0].category}</span>
                 </div>
               </div>
             </div>
          ) : (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E9DFCC] flex flex-col items-center justify-center p-12 text-center h-[450px]">
              <div className="w-16 h-16 bg-[#EEF3EC] rounded-full flex items-center justify-center mb-4 text-[#24483C]">
                <Calendar size={32} />
              </div>
              <h2 className="text-xl font-bold text-[#1B2E26] mb-2">No Live Sessions Currently Scheduled</h2>
              <p className="text-[#4A5E54] text-sm max-w-md">Our instructors are organizing the next schedule of live lectures and masterclasses.</p>
              <Link href="/courses">
                <button className="mt-6 bg-[#24483C] hover:bg-[#19332A] text-[#F8F4EC] font-semibold py-2.5 px-6 rounded-lg transition-all text-sm shadow-sm">
                  Explore Pre-Recorded Catalog
                </button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Upcoming Classes List */}
        <div className="lg:col-span-1">
          <div className="editorial-card rounded-2xl p-6 bg-[#FFFFFF] sticky top-24">
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#1B2E26] border-b border-[#E9DFCC] pb-3">
              <Calendar className="text-[#24483C]" size={20} />
              Upcoming Schedule
            </h3>
            
            <div className="space-y-3.5">
              {remainingLive.map((item: any) => (
                <div key={item.id.toString()} className="flex gap-3.5 p-3.5 rounded-xl bg-[#FDFCF9] border border-[#E9DFCC] group">
                  <div className="flex flex-col items-center justify-center w-14 h-14 bg-[#C96F4A]/10 text-[#C96F4A] rounded-lg shrink-0 font-bold border border-[#C96F4A]/20">
                    <span className="text-[10px] tracking-wider">LIVE</span>
                    <div className="w-1.5 h-1.5 bg-[#C96F4A] rounded-full animate-pulse mt-0.5"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#1B2E26] text-sm mb-1 truncate">{item.title}</h4>
                    <p className="text-xs text-[#72857C] truncate flex items-center gap-1">
                      {getIconForType(item.type)} {item.type.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              ))}

              {scheduledSessions.map((item: any, idx: number) => {
                if (idx === 0 && !featuredLive) return null;
                return (
                  <div key={item.id.toString()} className="flex gap-3.5 p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E9DFCC] hover:border-[#24483C] transition-all cursor-pointer group">
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-[#F4EFE6] rounded-lg shrink-0 border border-[#E9DFCC] group-hover:bg-[#EEF3EC] group-hover:border-[#DCE6D8] transition-colors">
                      <span className="text-[10px] font-bold text-[#72857C] uppercase">{getMonthStr(item.launchDate)}</span>
                      <span className="text-lg font-extrabold text-[#1B2E26] group-hover:text-[#24483C]">{getDayStr(item.launchDate)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#1B2E26] text-sm mb-1 line-clamp-2 leading-snug group-hover:text-[#24483C] transition-colors">{item.title}</h4>
                      <div className="flex items-center text-xs text-[#72857C] gap-2 mt-1">
                        <span className="flex items-center gap-1"><Clock size={12}/> {getTimeStr(item.launchDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {remainingLive.length === 0 && scheduledSessions.length === 0 && featuredLive && (
                <div className="text-center p-6 text-xs text-[#72857C]">
                  No other scheduled sessions.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
