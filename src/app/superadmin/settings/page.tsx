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
        setMessage("Settings saved successfully.");
      } else {
        setMessage("Failed to save settings.");
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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-red-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="text-red-500" size={32} />
          Platform Settings
        </h1>
        <p className="text-slate-500 mt-2">Configure global platform behavior, branding, and fees.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Core Config */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <Globe className="text-slate-400" size={20} />
            Branding & Core
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Site Name</label>
              <input
                type="text"
                value={settings?.siteName || ''}
                onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Mail size={16} className="text-slate-400" />
                Support Email
              </label>
              <input
                type="email"
                value={settings?.contactEmail || ''}
                onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Business Config */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <DollarSign className="text-slate-400" size={20} />
            Business & Financial
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Platform Commission Rate (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings?.commissionRate || 0}
                  onChange={e => setSettings({ ...settings, commissionRate: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
                <span className="text-slate-500 text-sm">%</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Percentage deducted from instructor course sales.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Allow Instructor Registration</label>
              <label className="flex items-center gap-3 mt-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={settings?.allowInstructorRegistration || false}
                    onChange={e => setSettings({ ...settings, allowInstructorRegistration: e.target.checked })}
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${settings?.allowInstructorRegistration ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings?.allowInstructorRegistration ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <span className="text-sm font-medium text-slate-600">
                  {settings?.allowInstructorRegistration ? 'Enabled (Open)' : 'Disabled (Invite Only)'}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}
