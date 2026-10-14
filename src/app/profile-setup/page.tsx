"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, Phone, Briefcase, FileText, Camera } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    avatar: "",
    phone: "",
    headline: "",
    bio: "",
    github: "",
    linkedin: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/profile-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save profile.");
        setLoading(false);
        return;
      }

      // Profile is set up! Go to homepage/dashboard
      if (data.user && data.user.role === 'admin') {
        router.push("/admin/courses");
      } else {
        router.push("/my-learning");
      }
    } catch (err) {
      setError("An error occurred connecting to the server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 relative">
      <div className="w-full max-w-2xl bg-[#FAF7F0] border border-[#E9DFCC] shadow-sm rounded-2xl p-5 sm:p-8 md:p-12 space-y-8 relative z-10 text-[#1B2E26]">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Scholar Onboarding</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2E26]">Complete Your Academy Profile</h2>
          <p className="text-[#556960] text-sm">Tell us about your learning journey so mentors and peers can collaborate with you.</p>
        </div>

        {error && (
          <div className="bg-[#C96F4A]/10 border border-[#C96F4A]/30 text-[#8B381A] p-3 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-2xl bg-[#DCE6D8] border border-[#E9DFCC] flex items-center justify-center overflow-hidden relative group shadow-sm">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={36} className="text-[#24483C]" />
              )}
              <div className="absolute inset-0 bg-[#24483C]/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[#F8F4EC]">
                <Camera size={22} />
              </div>
            </div>
            <div className="w-full max-w-sm">
              <input 
                type="url" 
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                placeholder="Paste avatar image URL" 
                className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2.5 text-xs text-center focus:outline-none focus:border-[#24483C] text-[#1B2E26] placeholder:text-[#556960]/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5A4C] flex items-center gap-1.5">
                <Phone size={14} className="text-[#C96F4A]" /> Phone Number
              </label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210" 
                className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#24483C] text-[#1B2E26] placeholder:text-[#556960]/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5A4C] flex items-center gap-1.5">
                <Briefcase size={14} className="text-[#C96F4A]" /> Professional Headline
              </label>
              <input 
                type="text" 
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g. Aspiring Full Stack Engineer" 
                className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#24483C] text-[#1B2E26] placeholder:text-[#556960]/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5A4C] flex items-center gap-1.5">
              <FileText size={14} className="text-[#C96F4A]" /> Academic Statement / Bio
            </label>
            <textarea 
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              placeholder="What are your learning objectives? What domains excite you?" 
              className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#24483C] text-[#1B2E26] placeholder:text-[#556960]/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5A4C] flex items-center gap-1.5">
                <FaGithub size={14} className="text-[#556960]" /> GitHub Profile URL
              </label>
              <input 
                type="url" 
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username" 
                className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#24483C] text-[#1B2E26] placeholder:text-[#556960]/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5A4C] flex items-center gap-1.5">
                <FaLinkedin size={14} className="text-[#556960]" /> LinkedIn Profile URL
              </label>
              <input 
                type="url" 
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username" 
                className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#24483C] text-[#1B2E26] placeholder:text-[#556960]/50"
              />
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <button 
              disabled={loading} 
              type="submit" 
              className="w-full py-3.5 font-medium text-base rounded-xl transition-all shadow-sm bg-[#24483C] text-[#F8F4EC] hover:bg-[#1B2E26] disabled:opacity-50"
            >
              {loading ? "Saving Profile..." : "Complete Academy Setup"}
            </button>
            
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => router.push('/')} 
                className="text-xs font-semibold uppercase tracking-wider text-[#556960] hover:text-[#24483C] transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
