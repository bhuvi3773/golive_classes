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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-2xl glass-card-light p-8 md:p-12 space-y-8 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">Complete Your Profile</h2>
          <p className="text-slate-500">Tell us a bit about yourself so we can personalize your experience.</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg text-sm text-center relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Avatar Upload (Simulated for MVP with URL) */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden relative group">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={40} className="text-slate-400" />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={24} className="text-slate-900" />
              </div>
            </div>
            <div className="w-full max-w-sm">
              <input 
                type="url" 
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                placeholder="Paste an Image URL here" 
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900 text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Phone size={16} className="text-slate-500" /> Phone Number
              </label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210" 
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Briefcase size={16} className="text-slate-500" /> Professional Headline
              </label>
              <input 
                type="text" 
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g. Aspiring Full Stack Developer" 
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <FileText size={16} className="text-slate-500" /> About You
            </label>
            <textarea 
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              placeholder="What are your goals? What technologies do you love?" 
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <FaGithub size={16} className="text-slate-500" /> GitHub URL
              </label>
              <input 
                type="url" 
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username" 
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <FaLinkedin size={16} className="text-slate-500" /> LinkedIn URL
              </label>
              <input 
                type="url" 
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username" 
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900"
              />
            </div>
          </div>

          <div className="pt-6">
            <button disabled={loading} type="submit" className="btn-primary w-full py-3 text-lg group">
              {loading ? "Saving Profile..." : "Complete Setup"}
            </button>
          </div>
          
          <div className="text-center">
            <button type="button" onClick={() => router.push('/')} className="text-sm text-slate-400 hover:text-gray-300 transition-colors">
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
