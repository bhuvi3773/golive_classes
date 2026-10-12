import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRepository } from "@/lib/repositories/user.repository";
import { LogOut, Edit, Briefcase, Mail, Phone } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const sessionUser = await getUserFromCookie();

  if (!sessionUser) {
    redirect("/login");
  }

  const user = await UserRepository.findById(sessionUser.userId);

  if (!user) {
    redirect("/login");
  }

  const handleSignOut = async () => {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    redirect('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 md:pb-8 text-[#1B2E26]">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Academic Record</span>
          <h1 className="font-serif text-3xl font-bold text-[#1B2E26]">My Scholar Profile</h1>
        </div>
        <Link 
          href="/profile-setup" 
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FAF7F0] hover:bg-[#E9DFCC]/50 border border-[#E9DFCC] rounded-xl text-xs font-semibold uppercase tracking-wider text-[#24483C] transition-colors shadow-sm"
        >
          <Edit size={14} /> Edit Profile
        </Link>
      </div>

      <div className="bg-[#FAF7F0] border border-[#E9DFCC] shadow-sm rounded-2xl overflow-hidden">
        {/* Editorial Banner */}
        <div className="h-32 bg-[#24483C] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F8F4EC_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute bottom-3 right-6 text-xs text-[#DCE6D8]/80 font-mono tracking-wider uppercase">
            GoLive Academy • ID: #{user.id.substring(0, 8).toUpperCase()}
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="p-8 relative">
          <div className="absolute -top-16 left-8 w-28 h-28 rounded-2xl border-4 border-[#FAF7F0] bg-[#DCE6D8] overflow-hidden flex items-center justify-center shadow-md">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-3xl font-bold text-[#24483C]">{user.name.charAt(0)}</span>
            )}
          </div>

          <div className="mt-14 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-serif text-2xl font-bold text-[#1B2E26]">
                  {user.name}
                </h2>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#DCE6D8] text-[#24483C] uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <p className="text-[#556960] mt-1 text-sm flex items-center gap-2">
                <Briefcase size={15} className="text-[#C96F4A]" /> {user.headline || "Passionate Scholar & Lifelong Learner"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#E9DFCC]">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C]">Contact Details</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-3 text-[#1B2E26]">
                    <Mail size={16} className="text-[#556960]" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-3 text-[#1B2E26]">
                    <Phone size={16} className="text-[#556960]" />
                    {user.phone || "No phone added"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C]">Academic & Professional Links</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-3 text-[#1B2E26]">
                    <FaGithub size={16} className="text-[#556960]" />
                    {user.github ? (
                      <a href={user.github} target="_blank" rel="noreferrer" className="text-[#C96F4A] hover:underline font-medium">GitHub Repository</a>
                    ) : <span className="text-[#556960]">Not provided</span>}
                  </div>
                  <div className="flex items-center gap-3 text-[#1B2E26]">
                    <FaLinkedin size={16} className="text-[#556960]" />
                    {user.linkedin ? (
                      <a href={user.linkedin} target="_blank" rel="noreferrer" className="text-[#C96F4A] hover:underline font-medium">LinkedIn Profile</a>
                    ) : <span className="text-[#556960]">Not provided</span>}
                  </div>
                </div>
              </div>
            </div>

            {user.bio && (
              <div className="pt-6 border-t border-[#E9DFCC]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-2">Scholar Statement</h3>
                <p className="text-sm text-[#556960] leading-relaxed bg-[#F8F4EC] p-4 rounded-xl border border-[#E9DFCC]/70">{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {user.purchasedCourses && user.purchasedCourses.length > 0 && (
        <div className="bg-[#FAF7F0] border border-[#E9DFCC] shadow-sm rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C96F4A]">Tuition Records</span>
              <h3 className="font-serif text-xl font-bold text-[#1B2E26]">Enrolled Courses & Invoices</h3>
            </div>
          </div>
          <div className="space-y-3">
            {user.purchasedCourses.map((course: any, idx: number) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl hover:border-[#24483C]/30 transition-colors gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#DCE6D8] rounded-lg flex items-center justify-center shrink-0 text-[#24483C]">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1B2E26] line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-[#556960] font-mono">Invoice Reference: #ORD-{course.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-serif font-bold text-lg text-[#1B2E26]">${course.price || '99.00'}</span>
                  <button className="px-4 py-2 bg-[#FAF7F0] hover:bg-[#E9DFCC] border border-[#E9DFCC] text-[#24483C] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap shadow-sm">
                    Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Security */}
      <div className="bg-[#FAF7F0] border border-[#E9DFCC] shadow-sm rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#1B2E26]">Account Security</h3>
          <p className="text-sm text-[#556960]">Terminate active session and log out of the academy securely.</p>
        </div>
        <form action={handleSignOut}>
          <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-[#C96F4A]/10 hover:bg-[#C96F4A]/20 border border-[#C96F4A]/30 text-[#8B381A] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors">
            <LogOut size={16} /> Secure Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
