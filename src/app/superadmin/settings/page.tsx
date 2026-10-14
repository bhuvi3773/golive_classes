"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Settings, DollarSign, Globe, Mail } from "lucide-react";

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (res.ok) {
        setMessage("Academy parameters saved successfully.");
      } else {
        setMessage("Failed to save academy parameters.");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    }
    
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-[#24483C]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl animate-in fade-in text-[#1B2E26] w-full">
      <div className="mb-6 sm:mb-8 pb-4 border-b border-[#E9DFCC]">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">System Configuration</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2E26] flex items-center gap-2.5 sm:gap-3">
          <Settings className="text-[#24483C] shrink-0" size={26} />
          <span>Global Academy Parameters</span>
        </h1>
        <p className="text-[#556960] text-xs sm:text-sm mt-1">Configure platform identity, faculty tuition share, and institutional protocols.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Config */}
        <div className="bg-[#FAF7F0] border border-[#E9DFCC] rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
          <h2 className="font-serif text-base sm:text-lg font-bold text-[#1B2E26] flex items-center gap-2 mb-4 sm:mb-6 pb-3 border-b border-[#E9DFCC]">
            <Globe className="text-[#C96F4A] shrink-0" size={18} />
            Institutional Identity & Communication
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-1.5">Academy Title</label>
              <input
                type="text"
                value={settings?.siteName || ''}
                onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2.5 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-1.5 flex items-center gap-1.5">
                <Mail size={14} className="text-[#556960]" />
                Registrar & Support Dispatch
              </label>
              <input
                type="email"
                value={settings?.contactEmail || ''}
                onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2.5 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Business Config */}
        <div className="bg-[#FAF7F0] border border-[#E9DFCC] rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
          <h2 className="font-serif text-base sm:text-lg font-bold text-[#1B2E26] flex items-center gap-2 mb-4 sm:mb-6 pb-3 border-b border-[#E9DFCC]">
            <DollarSign className="text-[#24483C] shrink-0" size={18} />
            Tuition & Faculty Commission
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-1.5">Academy Retained Commission (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings?.commissionRate || 0}
                  onChange={e => setSettings({ ...settings, commissionRate: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-4 py-2.5 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C] transition-colors"
                />
                <span className="text-[#556960] font-bold text-sm">%</span>
              </div>
              <p className="text-[11px] text-[#556960] mt-1.5">Portion allocated toward institutional platform operations.</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-1.5">Open Faculty Onboarding</label>
              <label className="flex items-center gap-3 mt-2 cursor-pointer">
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={settings?.allowInstructorRegistration || false}
                    onChange={e => setSettings({ ...settings, allowInstructorRegistration: e.target.checked })}
                  />
                  <div className={`block w-12 h-7 rounded-full transition-colors border ${settings?.allowInstructorRegistration ? 'bg-[#24483C] border-[#24483C]' : 'bg-[#E9DFCC] border-[#E9DFCC]'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${settings?.allowInstructorRegistration ? 'transform translate-x-5' : ''}`}></div>
                </div>
                <span className="text-xs font-medium text-[#1B2E26]">
                  {settings?.allowInstructorRegistration ? 'Unrestricted (Open Application)' : 'Invitation Only'}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#FAF7F0] p-4 sm:p-6 rounded-2xl border border-[#E9DFCC] shadow-sm">
          <p className={`text-xs font-bold ${message.includes('success') ? 'text-[#24483C]' : 'text-[#8B381A]'}`}>
            {message}
          </p>
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Parameters"}
          </button>
        </div>
      </form>
    </div>
  );
}
