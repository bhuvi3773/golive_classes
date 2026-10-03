import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { LogOut, Edit, MapPin, Briefcase, Mail, Phone } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const sessionUser = await getUserFromCookie();

  if (!sessionUser) {
    redirect("/login");
  }

  await connectToDatabase();
  const user = await User.findById(sessionUser.userId);

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
    <div className="max-w-4xl mx-auto space-y-8 pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <Link href="/profile-setup">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
            <Edit size={16} /> Edit Profile
          </button>
        </Link>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600/30 to-violet-600/30 relative"></div>
        
        {/* Profile Info */}
        <div className="p-8 relative">
          <div className="absolute -top-16 left-8 w-32 h-32 rounded-full border-4 border-[#1e2130] bg-[#1e2130] overflow-hidden flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-blue-400">{user.name.charAt(0)}</span>
            )}
          </div>

          <div className="mt-16 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {user.name}
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 uppercase tracking-wide">
                  {user.role}
                </span>
              </h2>
              <p className="text-gray-400 mt-1 flex items-center gap-2">
                <Briefcase size={16} /> {user.headline || "Passionate Learner"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail size={18} className="text-gray-500" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone size={18} className="text-gray-500" />
                    {user.phone || "No phone added"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Social Links</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <FaGithub size={18} className="text-gray-500" />
                    {user.github ? (
                      <a href={user.github} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">GitHub Profile</a>
                    ) : "Not added"}
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <FaLinkedin size={18} className="text-gray-500" />
                    {user.linkedin ? (
                      <a href={user.linkedin} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn Profile</a>
                    ) : "Not added"}
                  </div>
                </div>
              </div>
            </div>

            {user.bio && (
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">About Me</h3>
                <p className="text-gray-300 leading-relaxed">{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Account Security</h3>
          <p className="text-sm text-gray-400">Manage your session and log out of your account securely.</p>
        </div>
        <form action={handleSignOut}>
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg font-medium transition-colors">
            <LogOut size={18} /> Secure Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
